import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ButtonConfig, CategoryConfig } from '@/types';
import type { ButtonsPanelPlugin } from '@/types/plugin';
import type { App } from 'obsidian';
import { SimpleButton } from './Button';
import { useButtonClickHandler } from '@/hooks/useButtonClickHandler';
import { useButtonDragOptional } from '@/contexts/ButtonDragContext';

interface SortableButtonItemProps {
    button: ButtonConfig;
    category: CategoryConfig;
    index: number;
    displayStyle: 'default' | 'icon_top';
    enableAnimation: boolean;
    enableEditMode: boolean;
    plugin: ButtonsPanelPlugin;
    app: App;
}

export const SortableButtonItem: React.FC<SortableButtonItemProps> = React.memo(
    ({
        button,
        category,
        index,
        displayStyle,
        enableAnimation,
        enableEditMode,
        plugin,
        app,
    }) => {
        const buttonDrag = useButtonDragOptional();
        const handleButtonClick = useButtonClickHandler(button);

        const panelDragging = buttonDrag?.isDragging ?? false;

        const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
            useSortable({
                id: button.id,
                data: { type: 'button', categoryId: category.id },
                animateLayoutChanges: () => false,
            });

        const style: React.CSSProperties = {
            transform: transform ? CSS.Transform.toString(transform) : undefined,
            transition: panelDragging ? undefined : transition,
        };

        const handleClick = () => {
            if (buttonDrag?.isDragging) return;
            handleButtonClick();
        };

        const itemClassName = [
            'sortable-button-item',
            isDragging ? 'sortable-button-item--dragging' : '',
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <div
                ref={setNodeRef}
                style={style}
                className={itemClassName}
                {...attributes}
                {...listeners}
            >
                {isDragging ? (
                    <div className="button-drag-grid-placeholder" aria-hidden>
                        <SimpleButton
                            button={button}
                            category={category}
                            displayStyle={displayStyle}
                            enableAnimation={false}
                            enableEditMode={false}
                            plugin={plugin}
                            app={app}
                        />
                    </div>
                ) : (
                    <SimpleButton
                        button={button}
                        category={category}
                        displayStyle={displayStyle}
                        enableAnimation={enableAnimation}
                        enableEditMode={enableEditMode}
                        plugin={plugin}
                        app={app}
                        onClick={handleClick}
                    />
                )}
            </div>
        );
    }
);

SortableButtonItem.displayName = 'SortableButtonItem';
