import React from 'react';
import type { ButtonConfig, CategoryConfig } from '@/types';
import type { ButtonsPanelPlugin } from '@/types/plugin';
import type { App } from 'obsidian';
import { safeSetSVG } from '@/utils/dom';
import { useButtonMenu } from '@/hooks';

interface SimpleButtonProps {
    button: ButtonConfig;
    category: CategoryConfig;
    displayStyle?: 'icon_left' | 'icon_top';
    enableAnimation?: boolean;
    enableEditMode?: boolean;
    plugin: ButtonsPanelPlugin;
    app: App;
    onClick?: () => void;
    className?: string;
}

/**
 * SimpleButton
 * 最小版本的按钮展示组件，用于验证 React 渲染和样式拆分是否正常工作。
 * 后续会在此基础上逐步扩展为完整的 Button 组件。
 */
export const SimpleButton: React.FC<SimpleButtonProps> = ({
    button,
    category,
    displayStyle = 'icon_top',
    enableAnimation,
    enableEditMode = false,
    plugin,
    app,
    onClick,
    className,
}) => {
    const iconRef = React.useRef<HTMLSpanElement>(null);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    // 使用 useEffect 在 DOM 挂载后设置 SVG 图标
    React.useEffect(() => {
        if (iconRef.current && button.icon) {
            // 检查是否为 SVG 代码
            if (button.icon.trim().startsWith('<svg')) {
                safeSetSVG(iconRef.current, button.icon);
            } else {
                // 普通文本图标
                iconRef.current.textContent = button.icon;
            }
        }
    }, [button.icon]);

    // 使用 hook 获取右键菜单处理函数
    const handleContextMenu = useButtonMenu(button, category);

    // 绑定右键菜单
    React.useEffect(() => {
        if (!enableEditMode || !buttonRef.current) return;

        buttonRef.current.addEventListener('contextmenu', handleContextMenu);
        return () => {
            if (buttonRef.current) {
                buttonRef.current.removeEventListener('contextmenu', handleContextMenu);
            }
        };
    }, [enableEditMode, handleContextMenu]);

    // 使用 useMemo 缓存类名计算，避免每次渲染都重新计算
    const classNames = React.useMemo(() => {
        const layoutClass = displayStyle === 'icon_top' ? 'icon-top' : 'icon-left';
        const names = ['buttons-panel-simple-button', layoutClass];
        if (enableAnimation) {
            names.push('with-animation');
        }
        if (className) {
            names.push(className);
        }
        return names.join(' ');
    }, [displayStyle, enableAnimation, className]);

    return (
        <button
            ref={buttonRef}
            type="button"
            className={classNames}
            data-button-id={button.id}
            onClick={onClick}
        >
            {button.icon && (
                <span
                    ref={iconRef}
                    className="button-icon"
                />
            )}
            <span className="button-text">{button.name}</span>
        </button>
    );
};

