import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import type { CategoryConfig, ButtonConfig } from '@/types';
import type { ButtonsPanelPlugin } from '@/types/plugin';
import type { App } from 'obsidian';
import { SortableButtonItem } from '@/components/button/SortableButtonItem';
import { ButtonItem } from '@/components/button/ButtonItem';
import { containerDroppableId } from '@/utils/buttonDragItems';
import { useButtonDragOptional } from '@/contexts/ButtonDragContext';

interface CategoryButtonGridProps {
    category: CategoryConfig;
    orderedButtons: ButtonConfig[];
    contentClass: string;
    displayStyle: 'default' | 'icon_top';
    enableAnimation: boolean;
    enableEditMode: boolean;
    plugin: ButtonsPanelPlugin;
    app: App;
    sortableEnabled: boolean;
    onMoveStart?: (button: ButtonConfig) => void;
    isInButtonMoveMode?: boolean;
    movingButtonId?: string | null;
    onEmptyAreaClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    children?: React.ReactNode;
}

export const CategoryButtonGrid: React.FC<CategoryButtonGridProps> = ({
    category,
    orderedButtons,
    contentClass,
    displayStyle,
    enableAnimation,
    enableEditMode,
    plugin,
    app,
    sortableEnabled,
    onMoveStart,
    isInButtonMoveMode,
    movingButtonId,
    onEmptyAreaClick,
    children,
}) => {
    const buttonDrag = useButtonDragOptional();
    const { setNodeRef, isOver } = useDroppable({
        id: containerDroppableId(category.id),
        disabled: !sortableEnabled,
    });

    const buttonIds = orderedButtons.map((b) => b.id);
    const isDragging = buttonDrag?.isDragging ?? false;

    const gridClassName = [
        contentClass,
        sortableEnabled && isDragging && isOver ? 'button-drag-container-over' : '',
    ]
        .filter(Boolean)
        .join(' ');

    const renderButtons = () =>
        orderedButtons.map((button, index) => {
            const isMovingButton = isInButtonMoveMode && movingButtonId === button.id;

            if (sortableEnabled) {
                return (
                    <SortableButtonItem
                        key={button.id}
                        button={button}
                        category={category}
                        index={index}
                        displayStyle={displayStyle}
                        enableAnimation={enableAnimation && !isDragging}
                        enableEditMode={enableEditMode}
                        plugin={plugin}
                        app={app}
                    />
                );
            }

            return (
                <ButtonItem
                    key={button.id}
                    button={button}
                    category={category}
                    index={index}
                    displayStyle={displayStyle}
                    enableAnimation={enableAnimation}
                    enableEditMode={enableEditMode}
                    plugin={plugin}
                    app={app}
                    onMoveStart={onMoveStart}
                    isInButtonMoveMode={isInButtonMoveMode}
                    isMovingButton={isMovingButton}
                />
            );
        });

    if (!sortableEnabled) {
        return (
            <div className={contentClass} onClick={onEmptyAreaClick}>
                {orderedButtons.length === 0 ? (
                    children
                ) : (
                    <>
                        {renderButtons()}
                        {children}
                    </>
                )}
            </div>
        );
    }

    return (
        <div ref={setNodeRef} className={gridClassName} onClick={onEmptyAreaClick}>
            <SortableContext items={buttonIds} strategy={rectSortingStrategy}>
                {orderedButtons.length === 0 ? (
                    <div className="button-drag-empty-slot" />
                ) : (
                    renderButtons()
                )}
            </SortableContext>
            {!isDragging && children}
        </div>
    );
};
