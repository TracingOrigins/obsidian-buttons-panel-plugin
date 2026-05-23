import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { categorySortableId } from '@/utils/categoryDragItems';
import { useCategoryDragOptional } from '@/contexts/ButtonDragContext';

interface SortableCategoryBlockProps {
    categoryId: string;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    children: React.ReactNode;
    renderTitle: () => React.ReactNode;
    /** 拖动时整块占位预览（完整分类内容） */
    renderDragPreview?: () => React.ReactNode;
}

/**
 * 列表视图：整块分类可排序；长按分类任意非按钮区域触发拖拽（保留展开状态）。
 */
export const SortableCategoryBlock: React.FC<SortableCategoryBlockProps> = ({
    categoryId,
    className,
    onClick,
    children,
    renderTitle,
    renderDragPreview,
}) => {
    const categoryDrag = useCategoryDragOptional();
    const panelDragging = categoryDrag?.isDragging ?? false;

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: categorySortableId(categoryId),
        animateLayoutChanges: () => false,
    });

    /**
     * 以 Context 的 activeCategoryId 标识拖拽源（不用 useSortable.isDragging），
     * 并始终应用 sortable 的 transform，占位才能随 categoryIds 实时换位而移动。
     * 若 isDragging 时强制 transform:none，拖回去时占位会留在上次换位后的 DOM 位置（多在下方）。
     */
    const isDragSource =
        panelDragging && categoryDrag?.activeCategoryId === categoryId;

    const style: React.CSSProperties = {
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        transition: panelDragging ? undefined : transition,
    };

    const blockClassName = [
        ...(isDragSource ? [] : [className]),
        'sortable-category-item',
        'category-drag-handle',
        isDragSource ? 'sortable-category-item--dragging' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={blockClassName}
            data-category-drag-source={isDragSource || undefined}
            onClick={onClick}
            {...(isDragSource ? {} : attributes)}
            {...(isDragSource ? {} : listeners)}
        >
            {isDragSource ? (
                renderDragPreview ? (
                    renderDragPreview()
                ) : (
                    <>
                        {renderTitle()}
                        {children}
                    </>
                )
            ) : (
                <>
                    {renderTitle()}
                    {children}
                </>
            )}
        </div>
    );
};
