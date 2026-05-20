import React from 'react';
import type { ButtonConfig, CategoryConfig } from '@/types';
import type { ButtonsPanelPlugin } from '@/types/plugin';
import type { App } from 'obsidian';
import { SimpleButton } from './Button';
import { useButtonClickHandler } from '@/hooks/useButtonClickHandler';

interface ButtonItemProps {
    button: ButtonConfig;
    category: CategoryConfig;
    index: number;
    displayStyle: 'default' | 'icon_top';
    enableAnimation: boolean;
    enableEditMode: boolean;
    plugin: ButtonsPanelPlugin;
    app: App;
}

export const ButtonItem: React.FC<ButtonItemProps> = React.memo(
    ({
        button,
        category,
        displayStyle,
        enableAnimation,
        enableEditMode,
        plugin,
        app,
    }) => {
        const handleButtonClick = useButtonClickHandler(button);

        return (
            <SimpleButton
                button={button}
                category={category}
                displayStyle={displayStyle}
                enableAnimation={enableAnimation}
                enableEditMode={enableEditMode}
                plugin={plugin}
                app={app}
                onClick={handleButtonClick}
            />
        );
    },
    (prevProps, nextProps) =>
        prevProps.button.id === nextProps.button.id &&
        prevProps.button.name === nextProps.button.name &&
        prevProps.button.icon === nextProps.button.icon &&
        prevProps.category.id === nextProps.category.id &&
        prevProps.displayStyle === nextProps.displayStyle &&
        prevProps.enableAnimation === nextProps.enableAnimation &&
        prevProps.enableEditMode === nextProps.enableEditMode
);

ButtonItem.displayName = 'ButtonItem';
