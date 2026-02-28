import { useCallback } from 'react';
import { usePluginContext } from '@/contexts/PluginContext';
import { useRefresh } from './useRefresh';
import { ButtonDeleteModal } from '@/components/modal/ButtonDeleteModal';
import type { ButtonConfig, CategoryConfig } from '@/types';

/**
 * useButtonOperations Hook
 * 
 * 封装按钮操作（复制、删除等）的业务逻辑，提供统一的操作接口。
 * 
 * @returns 按钮操作函数对象
 */
export function useButtonOperations() {
    const { plugin, app } = usePluginContext();
    const { refresh } = useRefresh();

    /**
     * 复制按钮
     * @param button 要复制的按钮
     * @param category 按钮所属的分类
     */
    const copyButton = useCallback(
        async (button: ButtonConfig, category: CategoryConfig) => {
            const newButton: ButtonConfig = {
                ...button,
                actions: button.actions?.map((action) => ({ ...action })) ?? [],
                id: Date.now().toString(),
                order: category.buttons.length,
            };
            category.buttons.push(newButton);
            await plugin.saveSettings();
            refresh();
        },
        [plugin, refresh]
    );

    /**
     * 删除按钮（显示确认对话框）
     * @param button 要删除的按钮
     * @param category 按钮所属的分类
     * @param onDelete 删除成功后的回调
     */
    const deleteButton = useCallback(
        (button: ButtonConfig, category: CategoryConfig, onDelete?: () => void) => {
            new ButtonDeleteModal(app, plugin, button, category, () => {
                void (async () => {
                    const index = category.buttons.findIndex((b) => b.id === button.id);
                    if (index !== -1) {
                        category.buttons.splice(index, 1);
                        await plugin.saveSettings();
                        refresh();
                    }
                    if (onDelete) {
                        onDelete();
                    }
                })();
            }).open();
        },
        [plugin, app, refresh]
    );

    return {
        copyButton,
        deleteButton,
    };
}

