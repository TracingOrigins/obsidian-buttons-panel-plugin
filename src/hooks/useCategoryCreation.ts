import { useCallback } from 'react';
import { usePluginContext } from '@/contexts/PluginContext';
import { useRefresh } from './useRefresh';
import { CategoryCreateModal } from '@/components/modal/CategoryCreateModal';
import type { CategoryConfig } from '@/types';

/**
 * useCategoryCreation Hook
 * 
 * 封装分类创建的业务逻辑，提供统一的创建接口。
 * 
 * @returns 分类创建函数
 */
export function useCategoryCreation() {
    const { plugin, app } = usePluginContext();
    const { refresh } = useRefresh();

    /**
     * 创建新分类（显示创建对话框）
     * @param onCreated 创建成功后的回调
     */
    const createCategory = useCallback(
        (onCreated?: (category: CategoryConfig) => void) => {
            new CategoryCreateModal(app, plugin, (categoryName: string) => {
                void (async () => {
                    const newCategory: CategoryConfig = {
                        id: Date.now().toString(),
                        name: categoryName,
                        order: plugin.settings.categories.length,
                        buttons: [],
                    };
                    plugin.settings.categories.push(newCategory);
                    await plugin.saveSettings();
                    refresh();
                    if (onCreated) {
                        onCreated(newCategory);
                    }
                })();
            }).open();
        },
        [plugin, app, refresh]
    );

    return {
        createCategory,
    };
}

