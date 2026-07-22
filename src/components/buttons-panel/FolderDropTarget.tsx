import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { tabDroppableId } from '@/utils/buttonDragItems';
import { useButtonDragOptional } from '@/contexts/ButtonDragContext';

interface FolderDropTargetProps {
    categoryId: string;
    className?: string;
    onClick: () => void;
    buttonDropDisabled?: boolean;
    children: React.ReactNode;
}

/** 文件夹视图：不可排序时的文件夹磁贴，仍可作为按钮拖放目标。 */
export const FolderDropTarget: React.FC<FolderDropTargetProps> = ({
    categoryId,
    className,
    onClick,
    buttonDropDisabled = false,
    children,
}) => {
    const buttonDrag = useButtonDragOptional();
    const sortableEnabled = buttonDrag?.enabled ?? false;

    const { setNodeRef, isOver } = useDroppable({
        id: tabDroppableId(categoryId),
        disabled: buttonDropDisabled || !sortableEnabled,
    });

    const classNames = [
        className,
        sortableEnabled && buttonDrag?.isDragging && isOver ? 'button-drag-folder-over' : '',
    ]
        .filter(Boolean)
        .join(' ');

    const handleClick = () => {
        if (buttonDrag?.isDragging) return;
        onClick();
    };

    return (
        <div
            ref={setNodeRef}
            className={classNames}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                e.preventDefault();
                handleClick();
            }}
        >
            {children}
        </div>
    );
};
