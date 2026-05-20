import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import { setIcon } from 'obsidian';
import type { ButtonConfig, CategoryConfig } from '@/types';
import type { ButtonsPanelPlugin } from '@/types/plugin';
import { usePluginContext } from '@/contexts/PluginContext';
import { SimpleButton } from '@/components/button/Button';
import {
    applyDragOverToItems,
    buildButtonDragItems,
    findContainerForButtonId,
    getOrderedButtonsFromAllCategories,
    itemsShallowEqual,
    resolveOverContainerId,
    type ButtonDragItems,
} from '@/utils/buttonDragItems';
import {
    applyCategoryDragOver,
    buildCategoryDragIds,
    categoryIdsEqual,
    getOrderedCategoriesFromIds,
    parseCategorySortableId,
} from '@/utils/categoryDragItems';
import { panelDragCollisionDetection } from '@/utils/panelDragCollision';
import { snapCenterToCursor } from '@/utils/dndModifiers';
import '@/components/buttons-panel/ButtonDrag.css';
import '@/components/buttons-panel/CategoryDrag.css';

const LONG_PRESS_DELAY_MS = 400;
const LONG_PRESS_TOLERANCE_PX = 6;

export interface ButtonDragContextValue {
    enabled: boolean;
    isDragging: boolean;
    activeButtonId: string | null;
    getOrderedButtons: (category: CategoryConfig) => ButtonConfig[];
    registerCategoryHover: (handler: ((categoryId: string) => void) | null) => void;
}

export interface CategoryDragContextValue {
    enabled: boolean;
    isDragging: boolean;
    categoryIds: string[];
    getOrderedCategories: (categories: CategoryConfig[]) => CategoryConfig[];
}

const ButtonDragContext = createContext<ButtonDragContextValue | null>(null);
const CategoryDragContext = createContext<CategoryDragContextValue | null>(null);

const disabledButtonContextValue: ButtonDragContextValue = {
    enabled: false,
    isDragging: false,
    activeButtonId: null,
    getOrderedButtons: (category) => [...category.buttons].sort((a, b) => a.order - b.order),
    registerCategoryHover: () => {},
};

const disabledCategoryContextValue: CategoryDragContextValue = {
    enabled: false,
    isDragging: false,
    categoryIds: [],
    getOrderedCategories: (categories) =>
        [...categories].sort((a, b) => a.order - b.order),
};

export type CategoryDragOverlayVariant = 'list' | 'tabs';

interface ButtonDragProviderProps {
    categories: CategoryConfig[];
    enabled: boolean;
    displayStyle: 'default' | 'icon_top';
    enableAnimation: boolean;
    categoryDragOverlayVariant?: CategoryDragOverlayVariant;
    children: React.ReactNode;
}

/** 统一面板拖拽：按钮与分类共用一个 DndContext */
export const ButtonDragProvider: React.FC<ButtonDragProviderProps> = ({
    categories,
    enabled,
    displayStyle,
    enableAnimation,
    categoryDragOverlayVariant = 'list',
    children,
}) => {
    const { plugin, app } = usePluginContext();
    const [items, setItems] = useState<ButtonDragItems>(() => buildButtonDragItems(categories));
    const [categoryIds, setCategoryIds] = useState<string[]>(() =>
        buildCategoryDragIds(categories)
    );
    const [activeButtonId, setActiveButtonId] = useState<string | null>(null);
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
    /** 标签视图：锁定拖拽预览宽度，避免脱离 tab-bar 后换行导致字形变化 */
    const [categoryTabOverlayWidth, setCategoryTabOverlayWidth] = useState<number | null>(
        null
    );
    const itemsRef = useRef(items);
    const categoryIdsRef = useRef(categoryIds);
    const categoryHoverRef = useRef<((categoryId: string) => void) | null>(null);
    const lastNotifiedHoverContainerRef = useRef<string | null>(null);
    const dragOverFrameRef = useRef<number | null>(null);
    const pendingDragOverRef = useRef<{ activeId: string; overId: string } | null>(null);
    const lastAppliedDragOverRef = useRef<{ activeId: string; overId: string } | null>(null);
    const lastAppliedCategoryDragOverRef = useRef<{ activeId: string; overId: string } | null>(
        null
    );

    itemsRef.current = items;
    categoryIdsRef.current = categoryIds;

    const isCategoryDragActive = activeCategoryId !== null;
    const isButtonDragActive = activeButtonId !== null;

    const cancelDragOverFrame = useCallback(() => {
        if (dragOverFrameRef.current !== null) {
            cancelAnimationFrame(dragOverFrameRef.current);
            dragOverFrameRef.current = null;
        }
        pendingDragOverRef.current = null;
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: LONG_PRESS_DELAY_MS,
                tolerance: LONG_PRESS_TOLERANCE_PX,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: LONG_PRESS_DELAY_MS,
                tolerance: LONG_PRESS_TOLERANCE_PX,
            },
        })
    );

    useEffect(() => {
        if (activeButtonId) return;
        const next = buildButtonDragItems(categories);
        setItems((prev) => (itemsShallowEqual(prev, next) ? prev : next));
    }, [categories, activeButtonId]);

    useEffect(() => {
        if (activeCategoryId) return;
        const next = buildCategoryDragIds(categories);
        setCategoryIds((prev) => (categoryIdsEqual(prev, next) ? prev : next));
    }, [categories, activeCategoryId]);

    useEffect(() => () => cancelDragOverFrame(), [cancelDragOverFrame]);

    const registerCategoryHover = useCallback(
        (handler: ((categoryId: string) => void) | null) => {
            categoryHoverRef.current = handler;
        },
        []
    );

    const getOrderedButtons = useCallback(
        (category: CategoryConfig) =>
            getOrderedButtonsFromAllCategories(category, categories, items),
        [categories, items]
    );

    const getOrderedCategories = useCallback(
        (source: CategoryConfig[]) => getOrderedCategoriesFromIds(source, categoryIds),
        [categoryIds]
    );

    const activeButton = useMemo(() => {
        if (!activeButtonId) return null;
        for (const category of categories) {
            const found = category.buttons.find((b) => b.id === activeButtonId);
            if (found) return found;
        }
        return null;
    }, [activeButtonId, categories]);

    const activeButtonCategory = useMemo(() => {
        if (!activeButtonId) return null;
        const containerId = findContainerForButtonId(activeButtonId, items);
        return categories.find((c) => c.id === containerId) ?? null;
    }, [activeButtonId, categories, items]);

    const activeCategory = useMemo(() => {
        if (!activeCategoryId) return null;
        return categories.find((c) => c.id === activeCategoryId) ?? null;
    }, [activeCategoryId, categories]);

    const notifyCategoryHover = useCallback((categoryId: string) => {
        if (lastNotifiedHoverContainerRef.current === categoryId) return;
        lastNotifiedHoverContainerRef.current = categoryId;
        categoryHoverRef.current?.(categoryId);
    }, []);

    const resetButtonDragHoverState = useCallback(() => {
        lastNotifiedHoverContainerRef.current = null;
        lastAppliedDragOverRef.current = null;
        cancelDragOverFrame();
    }, [cancelDragOverFrame]);

    const persistItems = useCallback(
        async (finalItems: ButtonDragItems, pluginInstance: ButtonsPanelPlugin) => {
            const allButtons = new Map<string, ButtonConfig>();
            for (const category of pluginInstance.settings.categories) {
                for (const button of category.buttons) {
                    allButtons.set(button.id, button);
                }
            }

            for (const category of pluginInstance.settings.categories) {
                const ids = finalItems[category.id];
                if (!ids) continue;
                category.buttons = ids
                    .map((id) => allButtons.get(id))
                    .filter((b): b is ButtonConfig => b !== undefined);
                category.buttons.forEach((btn, idx) => {
                    btn.order = idx;
                });
            }

            await pluginInstance.saveSettings();
            activeDocument.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
        },
        []
    );

    const persistCategoryOrder = useCallback(
        async (finalIds: string[], pluginInstance: ButtonsPanelPlugin) => {
            const orderedIds = finalIds
                .map((id) => parseCategorySortableId(id))
                .filter((id): id is string => id !== null);

            const byId = new Map(
                pluginInstance.settings.categories.map((c) => [c.id, c])
            );
            const reordered: CategoryConfig[] = [];
            for (const id of orderedIds) {
                const cat = byId.get(id);
                if (cat) reordered.push(cat);
            }
            for (const cat of pluginInstance.settings.categories) {
                if (!reordered.some((c) => c.id === cat.id)) {
                    reordered.push(cat);
                }
            }

            pluginInstance.settings.categories = reordered;
            reordered.forEach((cat, idx) => {
                cat.order = idx;
            });

            await pluginInstance.saveSettings();
            activeDocument.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
        },
        []
    );

    const flushButtonDragOver = useCallback(() => {
        dragOverFrameRef.current = null;
        const pending = pendingDragOverRef.current;
        pendingDragOverRef.current = null;
        if (!pending) return;

        const { activeId, overId } = pending;
        const last = lastAppliedDragOverRef.current;
        if (last?.activeId === activeId && last?.overId === overId) {
            return;
        }

        const prev = itemsRef.current;
        const hoverActiveContainer = findContainerForButtonId(activeId, prev);
        const hoverOverContainer = resolveOverContainerId(overId, prev);
        if (
            hoverActiveContainer &&
            hoverOverContainer &&
            hoverActiveContainer !== hoverOverContainer
        ) {
            notifyCategoryHover(hoverOverContainer);
        }

        const next = applyDragOverToItems(prev, activeId, overId);
        lastAppliedDragOverRef.current = { activeId, overId };
        if (next !== prev) {
            itemsRef.current = next;
            setItems(next);
        }
    }, [notifyCategoryHover]);

    const scheduleButtonDragOver = useCallback(
        (activeId: string, overId: string) => {
            pendingDragOverRef.current = { activeId, overId };
            if (dragOverFrameRef.current !== null) {
                return;
            }
            dragOverFrameRef.current = requestAnimationFrame(flushButtonDragOver);
        },
        [flushButtonDragOver]
    );

    const handleDragStart = useCallback(
        (event: DragStartEvent) => {
            const activeId = String(event.active.id);
            const categoryId = parseCategorySortableId(activeId);
            if (categoryId) {
                lastAppliedCategoryDragOverRef.current = null;
                if (categoryDragOverlayVariant === 'tabs') {
                    const initial = event.active.rect.current.initial;
                    setCategoryTabOverlayWidth(initial?.width ?? null);
                }
                setActiveCategoryId(categoryId);
                setActiveButtonId(null);
                return;
            }
            resetButtonDragHoverState();
            setActiveButtonId(activeId);
            setActiveCategoryId(null);
            setCategoryTabOverlayWidth(null);
        },
        [categoryDragOverlayVariant, resetButtonDragHoverState]
    );

    const handleDragOver = useCallback(
        (event: DragOverEvent) => {
            const { active, over } = event;
            const activeId = String(active.id);

            if (parseCategorySortableId(activeId)) {
                if (!over || active.id === over.id) return;

                const overId = String(over.id);
                if (!parseCategorySortableId(overId)) return;

                const last = lastAppliedCategoryDragOverRef.current;
                if (last?.activeId === activeId && last?.overId === overId) {
                    return;
                }

                const prev = categoryIdsRef.current;
                const next = applyCategoryDragOver(prev, activeId, overId);
                lastAppliedCategoryDragOverRef.current = { activeId, overId };
                if (next === prev) return;

                categoryIdsRef.current = next;
                setCategoryIds(next);
                return;
            }

            if (!over || active.id === over.id) return;
            scheduleButtonDragOver(activeId, String(over.id));
        },
        [scheduleButtonDragOver]
    );

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;
            const activeId = String(active.id);

            if (parseCategorySortableId(activeId)) {
                if (active && over && active.id !== over.id) {
                    const overId = String(over.id);
                    if (parseCategorySortableId(overId)) {
                        setCategoryIds((prev) => {
                            const next = applyCategoryDragOver(prev, activeId, overId);
                            categoryIdsRef.current = next;
                            return next;
                        });
                    }
                }

                const finalIds = categoryIdsRef.current;
                const baseline = buildCategoryDragIds(categories);
                setActiveCategoryId(null);
                lastAppliedCategoryDragOverRef.current = null;
                setCategoryTabOverlayWidth(null);

                if (!categoryIdsEqual(baseline, finalIds)) {
                    try {
                        await persistCategoryOrder(finalIds, plugin);
                    } catch (error) {
                        console.error('保存分类排序时出错:', error);
                        setCategoryIds(baseline);
                        categoryIdsRef.current = baseline;
                    }
                }
                return;
            }

            cancelDragOverFrame();
            if (active && over) {
                const overId = String(over.id);
                const prev = itemsRef.current;
                const next = applyDragOverToItems(prev, activeId, overId);
                if (next !== prev) {
                    itemsRef.current = next;
                    setItems(next);
                }
            }

            const finalItems = itemsRef.current;
            const baseline = buildButtonDragItems(categories);

            setActiveButtonId(null);
            resetButtonDragHoverState();

            if (!itemsShallowEqual(baseline, finalItems)) {
                try {
                    await persistItems(finalItems, plugin);
                } catch (error) {
                    console.error('保存按钮排序时出错:', error);
                    setItems(baseline);
                }
            }
        },
        [
            cancelDragOverFrame,
            categories,
            persistCategoryOrder,
            persistItems,
            plugin,
            resetButtonDragHoverState,
        ]
    );

    const handleDragCancel = useCallback(() => {
        cancelDragOverFrame();
        setActiveButtonId(null);
        setActiveCategoryId(null);
        lastAppliedCategoryDragOverRef.current = null;
        setCategoryTabOverlayWidth(null);
        resetButtonDragHoverState();
        const buttonBaseline = buildButtonDragItems(categories);
        const categoryBaseline = buildCategoryDragIds(categories);
        itemsRef.current = buttonBaseline;
        categoryIdsRef.current = categoryBaseline;
        setItems(buttonBaseline);
        setCategoryIds(categoryBaseline);
    }, [cancelDragOverFrame, categories, resetButtonDragHoverState]);

    const buttonEnabled = enabled && !isCategoryDragActive;
    const categoryEnabled = enabled && !isButtonDragActive;

    const buttonContextValue = useMemo<ButtonDragContextValue>(
        () => ({
            enabled: buttonEnabled,
            isDragging: isButtonDragActive,
            activeButtonId,
            getOrderedButtons,
            registerCategoryHover,
        }),
        [buttonEnabled, isButtonDragActive, activeButtonId, getOrderedButtons, registerCategoryHover]
    );

    const categoryContextValue = useMemo<CategoryDragContextValue>(
        () => ({
            enabled: categoryEnabled,
            isDragging: isCategoryDragActive,
            categoryIds,
            getOrderedCategories,
        }),
        [categoryEnabled, isCategoryDragActive, categoryIds, getOrderedCategories]
    );

    if (!enabled) {
        return (
            <ButtonDragContext.Provider value={disabledButtonContextValue}>
                <CategoryDragContext.Provider value={disabledCategoryContextValue}>
                    {children}
                </CategoryDragContext.Provider>
            </ButtonDragContext.Provider>
        );
    }

    return (
        <ButtonDragContext.Provider value={buttonContextValue}>
            <CategoryDragContext.Provider value={categoryContextValue}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={panelDragCollisionDetection}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={(e) => void handleDragEnd(e)}
                    onDragCancel={handleDragCancel}
                >
                    {children}
                    <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
                        {activeCategory ? (
                            <CategoryDragOverlay
                                name={activeCategory.name}
                                categoryId={activeCategory.id}
                                variant={categoryDragOverlayVariant}
                                tabOverlayWidth={categoryTabOverlayWidth}
                            />
                        ) : activeButton && activeButtonCategory ? (
                            <SimpleButton
                                button={activeButton}
                                category={activeButtonCategory}
                                displayStyle={displayStyle}
                                enableAnimation={false}
                                plugin={plugin}
                                app={app}
                                className="button-drag-overlay"
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </CategoryDragContext.Provider>
        </ButtonDragContext.Provider>
    );
};

const CategoryDragOverlay: React.FC<{
    name: string;
    categoryId: string;
    variant: CategoryDragOverlayVariant;
    tabOverlayWidth: number | null;
}> = ({ name, categoryId, variant, tabOverlayWidth }) => {
    const { plugin } = usePluginContext();
    const iconRef = React.useRef<HTMLSpanElement>(null);
    const isActiveTab =
        variant === 'tabs' && plugin.activeTabCategoryId === categoryId;

    React.useEffect(() => {
        if (iconRef.current) {
            setIcon(iconRef.current, variant === 'list' ? 'chevron-right' : 'layout-grid');
        }
    }, [variant]);

    if (variant === 'tabs') {
        const tabStyle: React.CSSProperties | undefined = tabOverlayWidth
            ? {
                  width: tabOverlayWidth,
                  minWidth: tabOverlayWidth,
                  boxSizing: 'border-box',
              }
            : undefined;

        return (
            <div
                className={[
                    'buttons-panel-tab',
                    'category-drag-overlay-tab',
                    isActiveTab ? 'is-active' : '',
                ]
                    .filter(Boolean)
                    .join(' ')}
                style={tabStyle}
            >
                <span className="tab-icon" ref={iconRef} />
                <span className="tab-label">{name}</span>
            </div>
        );
    }

    return (
        <div className="buttons-panel-category move-category-target category-drag-overlay-list">
            <div className="buttons-panel-category-title">
                <span className="category-icon" ref={iconRef} />
                {name}
            </div>
        </div>
    );
};

export function useButtonDrag(): ButtonDragContextValue {
    const ctx = useContext(ButtonDragContext);
    if (!ctx) {
        throw new Error('useButtonDrag must be used within ButtonDragProvider');
    }
    return ctx;
}

export function useButtonDragOptional(): ButtonDragContextValue | null {
    return useContext(ButtonDragContext);
}

export function useCategoryDragOptional(): CategoryDragContextValue | null {
    return useContext(CategoryDragContext);
}
