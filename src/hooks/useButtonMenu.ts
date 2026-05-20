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
 */
export function useButtonMenu(button: ButtonConfig, category: CategoryConfig) {
    const { plugin, app } = usePluginContext();
    const { copyButton, deleteButton } = useButtonOperations();

    const handleContextMenu = useCallback(
        (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const menu = new Menu();

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

            menu.addItem((item: MenuItem) => {
                item.setTitle(t('copy') || '复制')
                    .setIcon('copy')
                    .onClick(() => {
                        void copyButton(button, category);
                    });
            });

            menu.addItem((item: MenuItem) => {
                item.setTitle(t('delete') || '删除')
                    .setIcon('trash')
                    .onClick(() => {
                        deleteButton(button, category);
                    });
            });

            menu.showAtMouseEvent(e);
        },
        [button, category, plugin, app, copyButton, deleteButton]
    );

    return handleContextMenu;
}
