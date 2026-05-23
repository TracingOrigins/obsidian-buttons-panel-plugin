import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { tabDroppableId } from '@/utils/buttonDragItems';
import { categorySortableId } from '@/utils/categoryDragItems';
import { useButtonDragOptional } from '@/contexts/ButtonDragContext';
import { useCategoryDragOptional } from '@/contexts/ButtonDragContext';

/** 拖拽时悬停标签满此时长后才切换激活标签（按钮跨分类拖拽） */
const TAB_HOVER_ACTIVATE_MS = 400;

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
    if (typeof ref === 'function') {
        ref(value);
        return;
    }
    if (ref) {
        ref.current = value;
    }
}

interface SortableCategoryTabProps {
    categoryId: string;
    className: string;
    onClick: () => void;
    onDragTabHoverActivate?: (categoryId: string) => void;
    innerRef?: React.Ref<HTMLDivElement>;
    children: React.ReactNode;
}

/**
 * 标签视图：分类标签用 Draggable（非 Sortable），拖拽中不改变标签栏布局；
 * 悬停目标满 0.4s 松手后由 Context 统一换位。同时保留按钮跨标签拖放的 droppable。
 */
export const SortableCategoryTab: React.FC<SortableCategoryTabProps> = ({
    categoryId,
    className,
    onClick,
    onDragTabHoverActivate,
    innerRef,
    children,
}) => {
    const buttonDrag = useButtonDragOptional();
    const categoryDrag = useCategoryDragOptional();
    const buttonSortableEnabled = buttonDrag?.enabled ?? false;
    const panelCategoryDragging = categoryDrag?.isDragging ?? false;
    const categorySortableEnabled =
        ((categoryDrag?.enabled ?? false) || panelCategoryDragging) &&
        !(buttonDrag?.isDragging ?? false);

    const categoryDragId = categorySortableId(categoryId);

    const {
        attributes,
        listeners,
        setNodeRef: setDraggableRef,
    } = useDraggable({
        id: categoryDragId,
        disabled: !categorySortableEnabled,
    });

    /** 与 Draggable 同 id，供 pointerWithin 命中以驱动悬停 0.4s / 松手换位 */
    const { setNodeRef: setCategoryDropRef } = useDroppable({
        id: categoryDragId,
        disabled: !categorySortableEnabled,
    });

    /** 以 Context 为准，避免悬停确认放置后 useSortable.isDragging 提前结束导致占位消失 */
    const isDragSource =
        panelCategoryDragging && categoryDrag?.activeCategoryId === categoryId;

    const { setNodeRef: setDroppableRef, isOver: isButtonDropOver } = useDroppable({
        id: tabDroppableId(categoryId),
        disabled: !buttonSortableEnabled || panelCategoryDragging,
    });

    const innerRefRef = React.useRef(innerRef);
    innerRefRef.current = innerRef;

    const setNodeRef = React.useCallback(
        (node: HTMLDivElement | null) => {
            setDraggableRef(node);
            setCategoryDropRef(node);
            setDroppableRef(node);
            assignRef(innerRefRef.current, node);
        },
        [setDraggableRef, setCategoryDropRef, setDroppableRef]
    );

    const wasOverRef = React.useRef(false);
    const activateTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearActivateTimer = React.useCallback(() => {
        if (activateTimerRef.current !== null) {
            clearTimeout(activateTimerRef.current);
            activateTimerRef.current = null;
        }
    }, []);

    React.useEffect(() => {
        if (!buttonSortableEnabled || !buttonDrag?.isDragging || panelCategoryDragging) {
            wasOverRef.current = false;
            clearActivateTimer();
            return;
        }

        if (isButtonDropOver) {
            if (!wasOverRef.current) {
                wasOverRef.current = true;
                clearActivateTimer();
                activateTimerRef.current = setTimeout(() => {
                    activateTimerRef.current = null;
                    onDragTabHoverActivate?.(categoryId);
                }, TAB_HOVER_ACTIVATE_MS);
            }
            return;
        }

        if (wasOverRef.current) {
            wasOverRef.current = false;
            clearActivateTimer();
        }
    }, [
        isButtonDropOver,
        categoryId,
        buttonSortableEnabled,
        buttonDrag?.isDragging,
        panelCategoryDragging,
        onDragTabHoverActivate,
        clearActivateTimer,
    ]);

    React.useEffect(() => () => clearActivateTimer(), [clearActivateTimer]);

    const isCategoryTabDropTarget =
        panelCategoryDragging &&
        categoryDrag?.categoryTabDropTargetId === categoryId;

    const classNames = [
        className,
        'sortable-category-tab',
        categorySortableEnabled ? 'category-drag-handle' : '',
        isDragSource ? 'sortable-category-tab--dragging' : '',
        isCategoryTabDropTarget ? 'category-drag-tab-drop-target' : '',
        buttonSortableEnabled && buttonDrag?.isDragging && isButtonDropOver
            ? 'button-drag-tab-over'
            : '',
    ]
        .filter(Boolean)
        .join(' ');

    const handleClick = () => {
        if (categoryDrag?.isDragging || buttonDrag?.isDragging) return;
        onClick();
    };

    return (
        <div
            ref={setNodeRef}
            className="sortable-category-tab-wrapper"
            data-category-tab-id={categoryId}
            data-category-drag-source={isDragSource || undefined}
        >
            <div
                className={classNames}
                onClick={handleClick}
                {...(isDragSource ? {} : attributes)}
                {...(isDragSource ? {} : listeners)}
            >
                {isDragSource ? (
                    <div className="category-drag-tab-placeholder" aria-hidden>
                        {children}
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
};
