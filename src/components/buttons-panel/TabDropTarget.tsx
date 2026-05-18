import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { tabDroppableId } from '@/utils/buttonDragItems';
import { useButtonDragOptional } from '@/contexts/ButtonDragContext';

/** 拖拽时悬停标签满此时长后才切换激活标签 */
const TAB_HOVER_ACTIVATE_MS = 400;

interface TabDropTargetProps {
    categoryId: string;
    className: string;
    onClick: () => void;
    /** 悬停满 {@link TAB_HOVER_ACTIVATE_MS} 后激活该标签 */
    onDragTabHoverActivate?: (categoryId: string) => void;
    children: React.ReactNode;
}

export const TabDropTarget: React.FC<TabDropTargetProps> = ({
    categoryId,
    className,
    onClick,
    onDragTabHoverActivate,
    children,
}) => {
    const buttonDrag = useButtonDragOptional();
    const sortableEnabled = buttonDrag?.enabled ?? false;

    const { setNodeRef, isOver } = useDroppable({
        id: tabDroppableId(categoryId),
        disabled: !sortableEnabled,
    });

    const wasOverRef = React.useRef(false);
    const activateTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearActivateTimer = React.useCallback(() => {
        if (activateTimerRef.current !== null) {
            clearTimeout(activateTimerRef.current);
            activateTimerRef.current = null;
        }
    }, []);

    React.useEffect(() => {
        if (!sortableEnabled || !buttonDrag?.isDragging) {
            wasOverRef.current = false;
            clearActivateTimer();
            return;
        }

        if (isOver) {
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
        isOver,
        categoryId,
        sortableEnabled,
        buttonDrag?.isDragging,
        onDragTabHoverActivate,
        clearActivateTimer,
    ]);

    React.useEffect(() => () => clearActivateTimer(), [clearActivateTimer]);

    const classNames = [
        className,
        sortableEnabled && buttonDrag?.isDragging && isOver ? 'button-drag-tab-over' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div ref={setNodeRef} className={classNames} onClick={onClick} style={{ cursor: 'pointer' }}>
            {children}
        </div>
    );
};
