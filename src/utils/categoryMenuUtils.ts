import { Menu, MenuItem, App } from 'obsidian';
import { CategoryEditModal } from '@/components/modal/CategoryEditModal';
import { CategoryDeleteModal } from '@/components/modal/CategoryDeleteModal';
import { t } from '@/utils/i18n';
import type { CategoryConfig, ButtonsPanelPlugin } from '@/types';

/**
 * 创建分类右键菜单处理函数
 * 
 * 封装分类右键菜单的创建逻辑，避免在多个组件中重复代码。
 * 
 * @param category 分类配置对象
 * @param categories 所有分类数组（用于复制时计算 order）
 * @param plugin 插件实例
 * @param app Obsidian 应用实例
 * @param moveMode 移动模式上下文
 * @returns 右键菜单事件处理函数
 */
export function createCategoryMenuHandler(
    category: CategoryConfig,
    categories: CategoryConfig[],
    plugin: ButtonsPanelPlugin,
    app: App,
    moveMode: { state: { type: string }; enterCategoryMoveMode: (category: CategoryConfig) => void }
): (e: MouseEvent) => void {
    return (e: MouseEvent) => {
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
                        activeDocument.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
                    }).open();
                });
        });

        // 复制选项
        menu.addItem((item: MenuItem) => {
            item.setTitle(t('copy') || '复制')
                .setIcon('copy')
                .onClick(() => {
                    // 注意：这里不能直接使用 hook，因为这是一个普通函数
                    // 复制逻辑保持内联，但可以考虑将来重构为接受操作函数作为参数
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
                        activeDocument.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
                    })();
                });
        });

        // 删除选项
        menu.addItem((item: MenuItem) => {
            item.setTitle(t('delete') || '删除')
                .setIcon('trash')
                .onClick(() => {
                    new CategoryDeleteModal(app, plugin, category, () => {
                        activeDocument.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
                    }).open();
                });
        });

        menu.showAtMouseEvent(e);
    };
}

