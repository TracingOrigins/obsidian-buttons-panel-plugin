import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { tabDroppableId } from '@/utils/buttonDragItems';
import { categorySortableId } from '@/utils/categoryDragItems';
import { useButtonDragOptional } from '@/contexts/ButtonDragContext';
import { useCategoryDragOptional } from '@/contexts/ButtonDragContext';

/** 拖拽时悬停标签满此时长后才切换激活标签（按钮跨分类拖拽） */
const TAB_HOVER_ACTIVATE_MS = 400;

interface SortableCategoryTabProps {
    categoryId: string;
    className: string;
    onClick: () => void;
    onDragTabHoverActivate?: (categoryId: string) => void;
    innerRef?: React.Ref<HTMLDivElement>;
    children: React.ReactNode;
}

/**
 * 标签视图：分类标签可排序（支持多行换行），同时保留按钮跨标签拖放的 droppable。
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

    const {
        attributes,
        listeners,
        setNodeRef: setSortableRef,
        transform,
        transition,
        isDragging: isCategoryDragging,
    } = useSortable({
        id: categorySortableId(categoryId),
        disabled: !categorySortableEnabled,
        animateLayoutChanges: () => false,
    });

    const { setNodeRef: setDroppableRef, isOver: isButtonDropOver } = useDroppable({
        id: tabDroppableId(categoryId),
        disabled: !buttonSortableEnabled || panelCategoryDragging,
    });

    const innerRefRef = React.useRef(innerRef);
    innerRefRef.current = innerRef;

    const setNodeRef = React.useCallback(
        (node: HTMLDivElement | null) => {
            setSortableRef(node);
            setDroppableRef(node);
            const inner = innerRefRef.current;
            if (typeof inner === 'function') {
                inner(node);
            } else if (inner) {
                (inner as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }
        },
        [setSortableRef, setDroppableRef]
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

    const wrapperStyle: React.CSSProperties = {
        transform:
            isCategoryDragging || !transform
                ? undefined
                : CSS.Translate.toString(transform),
        transition: panelCategoryDragging ? undefined : transition,
    };

    const classNames = [
        className,
        'sortable-category-tab',
        categorySortableEnabled ? 'category-drag-handle' : '',
        isCategoryDragging ? 'sortable-category-tab--dragging' : '',
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
            style={wrapperStyle}
            className="sortable-category-tab-wrapper"
            data-category-tab-id={categoryId}
        >
            <div
                className={classNames}
                onClick={handleClick}
                {...(isCategoryDragging ? {} : attributes)}
                {...(isCategoryDragging ? {} : listeners)}
            >
                {children}
            </div>
        </div>
    );
};
