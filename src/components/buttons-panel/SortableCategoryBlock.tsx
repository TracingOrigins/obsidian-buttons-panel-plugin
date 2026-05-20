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

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: categorySortableId(categoryId),
        animateLayoutChanges: () => false,
    });

    const style: React.CSSProperties = {
        transform:
            isDragging || !transform ? undefined : CSS.Translate.toString(transform),
        transition: panelDragging ? undefined : transition,
    };

    const blockClassName = [
        ...(isDragging ? [] : [className]),
        'sortable-category-item',
        'category-drag-handle',
        isDragging ? 'sortable-category-item--dragging' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={blockClassName}
            onClick={onClick}
            {...(isDragging ? {} : attributes)}
            {...(isDragging ? {} : listeners)}
        >
            {isDragging ? (
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
