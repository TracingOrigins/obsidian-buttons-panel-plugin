import { useCallback } from 'react';
import { Menu, MenuItem } from 'obsidian';
import { usePluginContext } from '@/contexts/PluginContext';
import { useMoveModeContext } from '@/contexts/MoveModeContext';
import { CategoryEditModal } from '@/components/modal/CategoryEditModal';
import { CategoryDeleteModal } from '@/components/modal/CategoryDeleteModal';
import { t } from '@/utils/i18n';
import type { CategoryConfig } from '@/types';

/**
 * useCategoryMenu Hook
 * 
 * 封装分类右键菜单的业务逻辑，提供统一的菜单创建和事件处理。
 * 
 * @param category 分类配置对象
 * @param categories 所有分类数组（用于复制时计算 order）
 * @returns 右键菜单事件处理函数
 */
export function useCategoryMenu(category: CategoryConfig, categories: CategoryConfig[]) {
    const { plugin, app } = usePluginContext();
    const moveMode = useMoveModeContext();

    /**
     * 创建并显示分类右键菜单
     * @param e 鼠标事件
     */
    const handleContextMenu = useCallback(
        (e: MouseEvent) => {
            // 如果正在移动模式，不显示菜单
            if (moveMode.state.type !== 'none') return;

            e.preventDefault();
            e.stopPropagation();

            const menu = new Menu();

            // 移动选项
            menu.addItem((item: MenuItem) => {
                item.setTitle(t('move'))
                    .setIcon('move')
                    .onClick(() => {
                        moveMode.enterCategoryMoveMode(category);
                    });
            });

            // 编辑选项
            menu.addItem((item: MenuItem) => {
                item.setTitle(t('edit'))
                    .setIcon('pencil')
                    .onClick(() => {
                        new CategoryEditModal(app, plugin, category, () => {
                            void plugin.saveSettings();
                            document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
                        }).open();
                    });
            });

            // 复制选项
            menu.addItem((item: MenuItem) => {
                item.setTitle(t('copy') || '复制')
                    .setIcon('copy')
                    .onClick(() => {
                        void (async () => {
                            const newCategory: CategoryConfig = {
                                ...category,
                                id: Date.now().toString(),
                                name: `${category.name}`,
                                order: categories.length,
                                buttons: category.buttons.map((btn) => ({
                                    ...btn,
                                    id: Date.now().toString() + Math.random(),
                                    actions: btn.actions?.map((action) => ({ ...action })) ?? [],
                                })),
                            };
                            plugin.settings.categories.push(newCategory);
                            await plugin.saveSettings();
                            document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
                        })();
                    });
            });

            // 删除选项
            menu.addItem((item: MenuItem) => {
                item.setTitle(t('delete') || '删除')
                    .setIcon('trash')
                    .onClick(() => {
                        new CategoryDeleteModal(app, plugin, category, () => {
                            document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
                        }).open();
                    });
            });

            menu.showAtMouseEvent(e);
        },
        [category, categories, plugin, app, moveMode]
    );

    return handleContextMenu;
}

