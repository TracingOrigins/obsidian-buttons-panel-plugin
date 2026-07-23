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
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import { ScrollAwarePointerSensor } from '@/sensors/ScrollAwarePointerSensor';
import { ScrollAwareTouchSensor } from '@/sensors/ScrollAwareTouchSensor';
import {
    MOBILE_LONG_PRESS_DELAY_MS,
    SCROLL_CANCEL_DISTANCE_PX,
} from '@/utils/touchScrollActivation';
import { isCoarsePointerDevice } from '@/utils/isCoarsePointerDevice';
import { setPanelTouchDragLock } from '@/utils/touchDragLock';
import { setIcon, type App } from 'obsidian';
import type { ButtonConfig, CategoryConfig } from '@/types';
import type { ButtonsPanelPlugin } from '@/types/plugin';
import { usePluginContext } from '@/contexts/PluginContext';
import { SimpleButton } from '@/components/button/Button';
import { CategoryListDragPreview } from '@/components/buttons-panel/CategoryListDragPreview';
import { CategoryFolderTile } from '@/components/buttons-panel/CategoryFolderTile';
import {
    applyDragOverToItems,
    buildButtonDragItems,
    findContainerForButtonId,
    getOrderedButtonsFromAllCategories,
    itemsShallowEqual,
    resolveOverContainerId,
    TAB_PREFIX,
    type ButtonDragItems,
} from '@/utils/buttonDragItems';
import {
    applyCategoryDragOver,
    buildCategoryDragIds,
    categoryIdsEqual,
    categorySortableId,
    CATEGORY_SORT_PREFIX,
    getOrderedCategoriesFromIds,
    parseCategorySortableId,
} from '@/utils/categoryDragItems';
import {
    createPanelDragCollisionDetection,
    type CategoryDragLayout,
} from '@/utils/panelDragCollision';
import { snapCenterToCursor } from '@/utils/dndModifiers';
import { PANEL_AUTO_SCROLL_OPTIONS } from '@/utils/panelAutoScroll';
import '@/components/buttons-panel/DragTouchAction.css';
import '@/components/buttons-panel/ButtonDrag.css';
import '@/components/buttons-panel/CategoryDrag.css';

const DESKTOP_LONG_PRESS_DELAY_MS = 400;
const DESKTOP_LONG_PRESS_TOLERANCE_PX = 6;
/** 标签视图：悬停目标标签满此时长后才视为可放置位置 */
const CATEGORY_TAB_DROP_HOVER_MS = 400;

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
    activeCategoryId: string | null;
    categoryIds: string[];
    /** 标签视图：悬停满 0.4s 后确认的目标分类 id（用于高亮） */
    categoryTabDropTargetId: string | null;
    getOrderedCategories: (categories: CategoryConfig[]) => CategoryConfig[];
    setListCategoryOpenById: (openByCategoryId: Map<string, boolean>) => void;
    getListCategoryOpen: (categoryId: string) => boolean;
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
    activeCategoryId: null,
    categoryIds: [],
    categoryTabDropTargetId: null,
    getOrderedCategories: (categories) =>
        [...categories].sort((a, b) => a.order - b.order),
    setListCategoryOpenById: () => {},
    getListCategoryOpen: () => true,
};

export type CategoryDragOverlayVariant = 'list' | 'tabs' | 'folder';

interface ButtonDragProviderProps {
    categories: CategoryConfig[];
    enabled: boolean;
    displayStyle: 'default' | 'icon_top';
    enableAnimation: boolean;
    categoryDragOverlayVariant?: CategoryDragOverlayVariant;
    categoryDragLayout?: CategoryDragLayout;
    children: React.ReactNode;
}

/** 统一面板拖拽：按钮与分类共用一个 DndContext */
export const ButtonDragProvider: React.FC<ButtonDragProviderProps> = ({
    categories,
    enabled,
    displayStyle,
    enableAnimation,
    categoryDragOverlayVariant = 'list',
    categoryDragLayout = 'vertical',
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
    const [categoryTabDropTargetId, setCategoryTabDropTargetId] = useState<string | null>(
        null
    );
    const [categoryListDragOpen, setCategoryListDragOpen] = useState(true);
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
    const listCategoryOpenByIdRef = useRef<Map<string, boolean>>(new Map());
    const categoryTabDragStartIdsRef = useRef<string[]>([]);
    /** 列表视图：拖拽开始时的分类顺序，用于对比是否变更 */
    const categoryListDragStartIdsRef = useRef<string[]>([]);
    const categoryTabHoverOverIdRef = useRef<string | null>(null);
    const categoryTabCommittedOverIdRef = useRef<string | null>(null);
    const categoryTabHoverTimerRef = useRef<number | null>(null);

    itemsRef.current = items;
    categoryIdsRef.current = categoryIds;

    const isCategoryDragActive = activeCategoryId !== null;
    const isButtonDragActive = activeButtonId !== null;

    const collisionDetection = useMemo(
        () => createPanelDragCollisionDetection(categoryDragLayout),
        [categoryDragLayout]
    );

    const cancelDragOverFrame = useCallback(() => {
        if (dragOverFrameRef.current !== null) {
            cancelAnimationFrame(dragOverFrameRef.current);
            dragOverFrameRef.current = null;
        }
        pendingDragOverRef.current = null;
    }, []);

    const useCoarseTouchOnly = isCoarsePointerDevice();

    const sensors = useSensors(
        ...(useCoarseTouchOnly
            ? []
            : [
                  useSensor(ScrollAwarePointerSensor, {
                      activationConstraint: {
                          delay: DESKTOP_LONG_PRESS_DELAY_MS,
                          tolerance: DESKTOP_LONG_PRESS_TOLERANCE_PX,
                      },
                  }),
              ]),
        useSensor(ScrollAwareTouchSensor, {
            activationConstraint: {
                delay: MOBILE_LONG_PRESS_DELAY_MS,
                tolerance: SCROLL_CANCEL_DISTANCE_PX,
            },
        })
    );

    useEffect(() => {
        if (activeButtonId) return;
        const next = buildButtonDragItems(categories);
        setItems((prev) => (itemsShallowEqual(prev, next) ? prev : next));
    }, [categories, activeButtonId, enabled]);

    useEffect(() => {
        if (activeCategoryId) return;
        const next = buildCategoryDragIds(categories);
        setCategoryIds((prev) => (categoryIdsEqual(prev, next) ? prev : next));
    }, [categories, activeCategoryId, enabled]);

    useEffect(() => () => cancelDragOverFrame(), [cancelDragOverFrame]);

    useEffect(() => {
        if (isButtonDragActive || isCategoryDragActive) {
            setPanelTouchDragLock(true);
            return;
        }
        setPanelTouchDragLock(false);
    }, [isButtonDragActive, isCategoryDragActive]);

    useEffect(() => () => setPanelTouchDragLock(false), []);

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

    const setListCategoryOpenById = useCallback((openByCategoryId: Map<string, boolean>) => {
        listCategoryOpenByIdRef.current = openByCategoryId;
    }, []);

    const getListCategoryOpen = useCallback((categoryId: string) => {
        return listCategoryOpenByIdRef.current.get(categoryId) ?? true;
    }, []);

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

    const clearCategoryTabHoverTimer = useCallback(() => {
        if (categoryTabHoverTimerRef.current !== null) {
            window.clearTimeout(categoryTabHoverTimerRef.current);
            categoryTabHoverTimerRef.current = null;
        }
    }, []);

    const resetCategoryTabDragHoverState = useCallback(() => {
        clearCategoryTabHoverTimer();
        categoryTabHoverOverIdRef.current = null;
        categoryTabCommittedOverIdRef.current = null;
        setCategoryTabDropTargetId(null);
    }, [clearCategoryTabHoverTimer]);

    const scheduleCategoryTabDropTarget = useCallback(
        (overSortableId: string) => {
            if (categoryTabHoverOverIdRef.current === overSortableId) {
                return;
            }
            clearCategoryTabHoverTimer();
            categoryTabHoverOverIdRef.current = overSortableId;
            categoryTabCommittedOverIdRef.current = null;
            setCategoryTabDropTargetId(null);

            categoryTabHoverTimerRef.current = window.setTimeout(() => {
                categoryTabHoverTimerRef.current = null;
                categoryTabCommittedOverIdRef.current = overSortableId;
                const categoryId = parseCategorySortableId(overSortableId);
                setCategoryTabDropTargetId(categoryId);
            }, CATEGORY_TAB_DROP_HOVER_MS);
        },
        [clearCategoryTabHoverTimer]
    );

    useEffect(
        () => () => {
            clearCategoryTabHoverTimer();
        },
        [clearCategoryTabHoverTimer]
    );

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
            dragOverFrameRef.current = window.requestAnimationFrame(flushButtonDragOver);
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
                    categoryTabDragStartIdsRef.current = [...categoryIdsRef.current];
                    resetCategoryTabDragHoverState();
                    const initial = event.active.rect.current.initial;
                    setCategoryTabOverlayWidth(initial?.width ?? null);
                } else {
                    categoryListDragStartIdsRef.current = [...categoryIdsRef.current];
                    setCategoryListDragOpen(getListCategoryOpen(categoryId));
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
        [
            categoryDragOverlayVariant,
            getListCategoryOpen,
            resetButtonDragHoverState,
            resetCategoryTabDragHoverState,
        ]
    );

    const handleDragOver = useCallback(
        (event: DragOverEvent) => {
            const { active, over } = event;
            const activeId = String(active.id);

            if (parseCategorySortableId(activeId)) {
                if (!over || active.id === over.id) {
                    if (categoryDragOverlayVariant === 'tabs') {
                        clearCategoryTabHoverTimer();
                        categoryTabHoverOverIdRef.current = null;
                    }
                    return;
                }

                const overId = String(over.id);
                if (!parseCategorySortableId(overId)) return;

                if (categoryDragOverlayVariant === 'tabs') {
                    scheduleCategoryTabDropTarget(overId);
                    return;
                }

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
            const overIdStr = String(over.id);

            // 按钮拖到文件夹磁贴上：派发事件供 FolderModeContent 做自动展开
            if (overIdStr.startsWith(TAB_PREFIX) || overIdStr.startsWith(CATEGORY_SORT_PREFIX)) {
                const categoryId = overIdStr.startsWith(TAB_PREFIX)
                    ? overIdStr.slice(TAB_PREFIX.length)
                    : overIdStr.slice(CATEGORY_SORT_PREFIX.length);
                activeDocument.dispatchEvent(
                    new CustomEvent('buttons-panel-folder-hover', { detail: { categoryId } })
                );
            } else {
                activeDocument.dispatchEvent(
                    new CustomEvent('buttons-panel-folder-hover', { detail: { categoryId: null } })
                );
            }

            scheduleButtonDragOver(activeId, overIdStr);
        },
        [
            categoryDragOverlayVariant,
            clearCategoryTabHoverTimer,
            scheduleButtonDragOver,
            scheduleCategoryTabDropTarget,
        ]
    );

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;
            const activeId = String(active.id);

            if (parseCategorySortableId(activeId)) {
                const isTabsVariant = categoryDragOverlayVariant === 'tabs';
                const baseline = isTabsVariant
                    ? categoryTabDragStartIdsRef.current
                    : categoryListDragStartIdsRef.current.length > 0
                      ? categoryListDragStartIdsRef.current
                      : buildCategoryDragIds(categories);

                let finalIds: string[];
                if (isTabsVariant) {
                    finalIds = baseline;
                    const committedOverId =
                        categoryTabCommittedOverIdRef.current ??
                        (categoryTabDropTargetId
                            ? categorySortableId(categoryTabDropTargetId)
                            : null);
                    if (committedOverId) {
                        finalIds = applyCategoryDragOver(baseline, activeId, committedOverId);
                    }
                } else {
                    // 列表/文件夹视图：categoryIdsRef 已在 handleDragOver 中累积为正确顺序
                    finalIds = categoryIdsRef.current;
                }

                categoryIdsRef.current = finalIds;
                setCategoryIds(finalIds);
                setActiveCategoryId(null);
                lastAppliedCategoryDragOverRef.current = null;
                categoryListDragStartIdsRef.current = [];
                setCategoryTabOverlayWidth(null);
                resetCategoryTabDragHoverState();
                setCategoryListDragOpen(true);

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
            categoryDragOverlayVariant,
            categoryTabDropTargetId,
            persistCategoryOrder,
            persistItems,
            plugin,
            resetButtonDragHoverState,
            resetCategoryTabDragHoverState,
        ]
    );

    const handleDragCancel = useCallback(() => {
        cancelDragOverFrame();
        setActiveButtonId(null);
        setActiveCategoryId(null);
        lastAppliedCategoryDragOverRef.current = null;
        setCategoryTabOverlayWidth(null);
        resetCategoryTabDragHoverState();
        setCategoryListDragOpen(true);
        resetButtonDragHoverState();
        const buttonBaseline = buildButtonDragItems(categories);
        const categoryBaseline =
            categoryListDragStartIdsRef.current.length > 0
                ? categoryListDragStartIdsRef.current
                : categoryTabDragStartIdsRef.current.length > 0
                  ? categoryTabDragStartIdsRef.current
                  : buildCategoryDragIds(categories);
        categoryListDragStartIdsRef.current = [];
        itemsRef.current = buttonBaseline;
        categoryIdsRef.current = categoryBaseline;
        setItems(buttonBaseline);
        setCategoryIds(categoryBaseline);
    }, [cancelDragOverFrame, categories, resetButtonDragHoverState, resetCategoryTabDragHoverState]);

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
            activeCategoryId,
            categoryIds,
            categoryTabDropTargetId:
                categoryDragOverlayVariant === 'tabs' ? categoryTabDropTargetId : null,
            getOrderedCategories,
            setListCategoryOpenById,
            getListCategoryOpen,
        }),
        [
            categoryEnabled,
            isCategoryDragActive,
            activeCategoryId,
            categoryIds,
            categoryDragOverlayVariant,
            categoryTabDropTargetId,
            getOrderedCategories,
            setListCategoryOpenById,
            getListCategoryOpen,
        ]
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
                    collisionDetection={collisionDetection}
                    autoScroll={PANEL_AUTO_SCROLL_OPTIONS}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={(e) => void handleDragEnd(e)}
                    onDragCancel={handleDragCancel}
                >
                    {children}
                    <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
                        {activeCategory ? (
                            <CategoryDragOverlay
                                category={activeCategory}
                                orderedButtons={getOrderedButtons(activeCategory)}
                                variant={categoryDragOverlayVariant}
                                tabOverlayWidth={categoryTabOverlayWidth}
                                displayStyle={displayStyle}
                                plugin={plugin}
                                app={app}
                                listCategoryOpen={categoryListDragOpen}
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
    category: CategoryConfig;
    orderedButtons: ButtonConfig[];
    variant: CategoryDragOverlayVariant;
    tabOverlayWidth: number | null;
    displayStyle: 'default' | 'icon_top';
    plugin: ButtonsPanelPlugin;
    app: App;
    listCategoryOpen: boolean;
}> = ({
    category,
    orderedButtons,
    variant,
    tabOverlayWidth,
    displayStyle,
    plugin,
    app,
    listCategoryOpen,
}) => {
    const { plugin: pluginCtx } = usePluginContext();
    const iconRef = React.useRef<HTMLSpanElement>(null);
    const isActiveTab =
        variant === 'tabs' && pluginCtx.activeTabCategoryId === category.id;

    React.useEffect(() => {
        if (iconRef.current && variant === 'tabs') {
            setIcon(iconRef.current, 'layout-grid');
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
                <span className="tab-label">{category.name}</span>
            </div>
        );
    }

    if (variant === 'folder') {
        return (
            <div className="category-drag-overlay-folder">
                <CategoryFolderTile
                    category={category}
                    previewButtons={orderedButtons}
                />
            </div>
        );
    }

    const categoryClassName = [
        'buttons-panel-category',
        listCategoryOpen ? 'list-category-open' : 'list-category-closed',
    ].join(' ');

    return (
        <CategoryListDragPreview
            category={category}
            orderedButtons={orderedButtons}
            isOpen={listCategoryOpen}
            displayStyle={displayStyle}
            plugin={plugin}
            app={app}
            categoryClassName={categoryClassName}
            titleClassName="buttons-panel-category-title is-collapsible"
            className="category-drag-overlay-list"
        />
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
