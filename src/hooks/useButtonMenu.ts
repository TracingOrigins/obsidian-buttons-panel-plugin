import { useCallback } from 'react';
import { Menu, MenuItem } from 'obsidian';
import { usePluginContext } from '@/contexts/PluginContext';
import { ButtonEditModal } from '@/components/modal/ButtonEditModal';
import { useButtonOperations } from './useButtonOperations';
import { t } from '@/utils/i18n';
import type { ButtonConfig, CategoryConfig } from '@/types';

/**
 * useButtonMenu Hook
 * 
 * 封装按钮右键菜单的业务逻辑，提供统一的菜单创建和事件处理。
 * 
 * @param button 按钮配置对象
 * @param category 分类配置对象
 * @param onMoveStart 移动按钮的回调函数
 * @returns 右键菜单事件处理函数
 */
export function useButtonMenu(
    button: ButtonConfig,
    category: CategoryConfig,
    onMoveStart?: (button: ButtonConfig) => void
) {
    const { plugin, app } = usePluginContext();
    const { copyButton, deleteButton } = useButtonOperations();

    /**
     * 创建并显示按钮右键菜单
     * @param e 鼠标事件
     */
    const handleContextMenu = useCallback(
        (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const menu = new Menu();

            // 移动选项
            menu.addItem((item: MenuItem) => {
                item.setTitle(t('move'))
                    .setIcon('move')
                    .onClick(() => {
                        if (onMoveStart) {
                            onMoveStart(button);
                        }
                    });
            });

            // 编辑选项
            menu.addItem((item: MenuItem) => {
                item.setTitle(t('edit'))
                    .setIcon('pencil')
                    .onClick(() => {
                        new ButtonEditModal(app, plugin, button, category, () => {
                            void plugin.saveSettings();
                            activeDocument.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
                        }).open();
                    });
            });

            // 复制选项
            menu.addItem((item: MenuItem) => {
                item.setTitle(t('copy') || '复制')
                    .setIcon('copy')
                    .onClick(() => {
                        void copyButton(button, category);
                    });
            });

            // 删除选项
            menu.addItem((item: MenuItem) => {
                item.setTitle(t('delete') || '删除')
                    .setIcon('trash')
                    .onClick(() => {
                        deleteButton(button, category);
                    });
            });

            menu.showAtMouseEvent(e);
        },
        [button, category, plugin, app, onMoveStart, copyButton, deleteButton]
    );

    return handleContextMenu;
}

