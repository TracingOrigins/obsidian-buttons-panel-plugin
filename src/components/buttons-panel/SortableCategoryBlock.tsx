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
    /** 分类标题行：仅标题携带拖拽监听器 */
    renderTitle: (dragHandleProps: {
        className: string;
        listeners?: ReturnType<typeof useSortable>['listeners'];
        attributes?: ReturnType<typeof useSortable>['attributes'];
    }) => React.ReactNode;
}

/**
 * 列表视图：整块分类容器可排序，长按标题行触发拖拽。
 */
export const SortableCategoryBlock: React.FC<SortableCategoryBlockProps> = ({
    categoryId,
    className,
    onClick,
    children,
    renderTitle,
}) => {
    const categoryDrag = useCategoryDragOptional();
    const panelDragging = categoryDrag?.isDragging ?? false;

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: categorySortableId(categoryId),
        animateLayoutChanges: () => false,
    });

    const style: React.CSSProperties = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition: panelDragging ? undefined : transition,
    };

    const blockClassName = [
        className,
        'sortable-category-item',
        isDragging ? 'sortable-category-item--dragging' : '',
    ]
        .filter(Boolean)
        .join(' ');

    const titleProps = {
        className: 'category-drag-handle',
        listeners: isDragging ? undefined : listeners,
        attributes: isDragging ? undefined : attributes,
    };

    return (
        <div ref={setNodeRef} style={style} className={blockClassName} onClick={onClick}>
            {isDragging ? (
                <div className="category-drag-list-placeholder" aria-hidden>
                    {renderTitle(titleProps)}
                </div>
            ) : (
                <>
                    {renderTitle(titleProps)}
                    {children}
                </>
            )}
        </div>
    );
};
