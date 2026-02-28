import React from 'react';
import { useMoveModeContext } from '@/contexts/MoveModeContext';
import { useConfigContext } from '@/contexts/ConfigContext';
import { safeSetSVG } from '@/utils/dom';

/**
 * MoveIndicatorLayer
 * 按钮移动模式下的悬浮移动指示器（跟随鼠标的小按钮预览）。
 * 复用原有的全局样式：.buttons-panel-plugin.button-move-indicator.icon-left / icon-top
 */
export const MoveIndicatorLayer: React.FC = () => {
    const { state, exitMoveMode } = useMoveModeContext();
    const { panelConfig } = useConfigContext();

    React.useEffect(() => {
        if (state.type !== 'button') {
            return;
        }

        const button = state.button;

        // 创建指示器元素
        const indicator = document.createElement('button');
        indicator.className = 'buttons-panel-plugin button-move-indicator';
        indicator.setAttribute('data-button-id', button.id);

        // 根据 displayStyle 添加布局类名（与旧版样式保持一致）
        if (panelConfig.displayStyle === 'icon_top') {
            indicator.classList.add('icon-top');
        } else {
            indicator.classList.add('icon-left');
        }

        // 添加图标
        if (button.icon) {
            const iconEl = document.createElement('span');
            iconEl.className = 'button-icon';

            if (button.icon.trim().startsWith('<svg')) {
                safeSetSVG(iconEl, button.icon);
            } else {
                iconEl.textContent = button.icon;
            }

            indicator.appendChild(iconEl);
        }

        // 添加按钮文字
        const textEl = document.createElement('span');
        textEl.className = 'button-text';
        textEl.textContent = button.name;
        indicator.appendChild(textEl);

        document.body.appendChild(indicator);

        const handleMouseMove = (e: MouseEvent) => {
            indicator.style.left = `${e.clientX + 10}px`;
            indicator.style.top = `${e.clientY + 10}px`;
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                exitMoveMode();
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('keydown', handleKeyDown);
            indicator.remove();
        };
    }, [state, panelConfig.displayStyle, exitMoveMode]);

    return null;
};


