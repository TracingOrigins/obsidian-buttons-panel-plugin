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
import { buttonDragCollisionDetection } from '@/utils/buttonDragCollision';
import { snapCenterToCursor } from '@/utils/dndModifiers';
import '@/components/buttons-panel/ButtonDrag.css';

const LONG_PRESS_DELAY_MS = 400;
const LONG_PRESS_TOLERANCE_PX = 6;

export interface ButtonDragContextValue {
    enabled: boolean;
    isDragging: boolean;
    activeButtonId: string | null;
    getOrderedButtons: (category: CategoryConfig) => ButtonConfig[];
    registerCategoryHover: (handler: ((categoryId: string) => void) | null) => void;
}

const ButtonDragContext = createContext<ButtonDragContextValue | null>(null);

const disabledContextValue: ButtonDragContextValue = {
    enabled: false,
    isDragging: false,
    activeButtonId: null,
    getOrderedButtons: (category) => [...category.buttons].sort((a, b) => a.order - b.order),
    registerCategoryHover: () => {},
};

interface ButtonDragProviderProps {
    categories: CategoryConfig[];
    enabled: boolean;
    displayStyle: 'default' | 'icon_top';
    enableAnimation: boolean;
    children: React.ReactNode;
}

export const ButtonDragProvider: React.FC<ButtonDragProviderProps> = ({
    categories,
    enabled,
    displayStyle,
    enableAnimation,
    children,
}) => {
    const { plugin, app } = usePluginContext();
    const [items, setItems] = useState<ButtonDragItems>(() => buildButtonDragItems(categories));
    const [activeButtonId, setActiveButtonId] = useState<string | null>(null);
    const itemsRef = useRef(items);
    const categoryHoverRef = useRef<((categoryId: string) => void) | null>(null);
    const lastNotifiedHoverContainerRef = useRef<string | null>(null);
    const dragOverFrameRef = useRef<number | null>(null);
    const pendingDragOverRef = useRef<{ activeId: string; overId: string } | null>(null);
    const lastAppliedDragOverRef = useRef<{ activeId: string; overId: string } | null>(null);

    itemsRef.current = items;

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

    const notifyCategoryHover = useCallback((categoryId: string) => {
        if (lastNotifiedHoverContainerRef.current === categoryId) return;
        lastNotifiedHoverContainerRef.current = categoryId;
        categoryHoverRef.current?.(categoryId);
    }, []);

    const resetDragHoverState = useCallback(() => {
        lastNotifiedHoverContainerRef.current = null;
        lastAppliedDragOverRef.current = null;
        cancelDragOverFrame();
    }, [cancelDragOverFrame]);

    const flushDragOver = useCallback(() => {
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

    const scheduleDragOver = useCallback(
        (activeId: string, overId: string) => {
            pendingDragOverRef.current = { activeId, overId };
            if (dragOverFrameRef.current !== null) {
                return;
            }
            dragOverFrameRef.current = requestAnimationFrame(flushDragOver);
        },
        [flushDragOver]
    );

    const handleDragStart = useCallback(
        (event: DragStartEvent) => {
            const activeId = String(event.active.id);
            resetDragHoverState();
            setActiveButtonId(activeId);
        },
        [resetDragHoverState]
    );

    const handleDragOver = useCallback(
        (event: DragOverEvent) => {
            const { active, over } = event;
            if (!over) return;
            scheduleDragOver(String(active.id), String(over.id));
        },
        [scheduleDragOver]
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

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            cancelDragOverFrame();
            const { active, over } = event;
            if (active && over) {
                const activeId = String(active.id);
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
            resetDragHoverState();

            if (!itemsShallowEqual(baseline, finalItems)) {
                try {
                    await persistItems(finalItems, plugin);
                } catch (error) {
                    console.error('保存按钮排序时出错:', error);
                    setItems(baseline);
                }
            }
        },
        [cancelDragOverFrame, categories, persistItems, plugin, resetDragHoverState]
    );

    const handleDragCancel = useCallback(() => {
        cancelDragOverFrame();
        setActiveButtonId(null);
        resetDragHoverState();
        const baseline = buildButtonDragItems(categories);
        itemsRef.current = baseline;
        setItems(baseline);
    }, [cancelDragOverFrame, categories, resetDragHoverState]);

    const contextValue = useMemo<ButtonDragContextValue>(
        () => ({
            enabled,
            isDragging: activeButtonId !== null,
            activeButtonId,
            getOrderedButtons,
            registerCategoryHover,
        }),
        [enabled, activeButtonId, getOrderedButtons, registerCategoryHover]
    );

    if (!enabled) {
        return (
            <ButtonDragContext.Provider value={disabledContextValue}>
                {children}
            </ButtonDragContext.Provider>
        );
    }

    return (
        <ButtonDragContext.Provider value={contextValue}>
            <DndContext
                sensors={sensors}
                collisionDetection={buttonDragCollisionDetection}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={(e) => void handleDragEnd(e)}
                onDragCancel={handleDragCancel}
            >
                {children}
                <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
                    {activeButton && activeButtonCategory ? (
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
        </ButtonDragContext.Provider>
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
