import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { titleDroppableId } from '@/utils/buttonDragItems';
import { useButtonDragOptional } from '@/contexts/ButtonDragContext';

interface CategoryTitleDropTargetProps extends React.HTMLAttributes<HTMLDivElement> {
    categoryId: string;
    disabled?: boolean;
    innerRef?: React.Ref<HTMLDivElement>;
}

/** 列表视图分类标题行：拖拽悬停时作为「插入到该分类末尾」的落点 */
export const CategoryTitleDropTarget: React.FC<CategoryTitleDropTargetProps> = ({
    categoryId,
    className,
    disabled = false,
    children,
    innerRef,
    ...rest
}) => {
    const buttonDrag = useButtonDragOptional();
    const { setNodeRef, isOver } = useDroppable({
        id: titleDroppableId(categoryId),
        disabled,
    });

    // innerRef 在父组件 map 中常为内联函数，若放入 useCallback 依赖会导致 setNodeRef
    // 每轮渲染都被重复调用，进而触发 dnd-kit 状态更新 → React #185 无限循环
    const innerRefRef = React.useRef(innerRef);
    innerRefRef.current = innerRef;

    const ref = React.useCallback(
        (node: HTMLDivElement | null) => {
            setNodeRef(node);
            const inner = innerRefRef.current;
            if (typeof inner === 'function') {
                inner(node);
            } else if (inner) {
                inner.current = node;
            }
        },
        [setNodeRef]
    );
    const isDragging = buttonDrag?.isDragging ?? false;
    const classNames = [
        className,
        !disabled && isDragging && isOver ? 'button-drag-title-over' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div ref={ref} className={classNames} {...rest}>
            {children}
        </div>
    );
};
