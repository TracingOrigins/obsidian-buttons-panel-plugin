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
    onMoveStart?: (button: ButtonConfig) => void;
    isInButtonMoveMode?: boolean;
    isMovingButton?: boolean;
}

/**
 * ButtonItem
 * 封装按钮项，在组件内部调用 useButtonClickHandler Hook
 * 这样可以避免在循环中调用 Hook，符合 React 规则
 * 
 * 使用 React.memo 优化性能，避免不必要的重新渲染
 */
export const ButtonItem: React.FC<ButtonItemProps> = React.memo(({
    button,
    category,
    index,
    displayStyle,
    enableAnimation,
    enableEditMode,
    plugin,
    app,
    onMoveStart,
    isInButtonMoveMode,
    isMovingButton,
}) => {
    const handleButtonClick = useButtonClickHandler(button, category, index);

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
            onMoveStart={onMoveStart}
            isInButtonMoveMode={isInButtonMoveMode}
            isMovingButton={isMovingButton}
        />
    );
}, (prevProps, nextProps) => {
    // 自定义比较函数，只在关键属性变化时重新渲染
    return (
        prevProps.button.id === nextProps.button.id &&
        prevProps.button.name === nextProps.button.name &&
        prevProps.button.icon === nextProps.button.icon &&
        prevProps.category.id === nextProps.category.id &&
        prevProps.index === nextProps.index &&
        prevProps.displayStyle === nextProps.displayStyle &&
        prevProps.enableAnimation === nextProps.enableAnimation &&
        prevProps.enableEditMode === nextProps.enableEditMode &&
        prevProps.isInButtonMoveMode === nextProps.isInButtonMoveMode &&
        prevProps.isMovingButton === nextProps.isMovingButton
    );
});

ButtonItem.displayName = 'ButtonItem';

