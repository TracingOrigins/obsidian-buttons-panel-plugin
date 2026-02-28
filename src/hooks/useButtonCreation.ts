import { useCallback } from 'react';
import { usePluginContext } from '@/contexts/PluginContext';
import { useRefresh } from './useRefresh';
import { ButtonCreateModal } from '@/components/modal/ButtonCreateModal';
import type { CategoryConfig } from '@/types';

/**
 * useButtonCreation Hook
 * 
 * 封装按钮创建的业务逻辑，提供统一的创建接口。
 * 
 * @returns 按钮创建函数
 */
export function useButtonCreation() {
    const { plugin, app } = usePluginContext();
    const { refresh } = useRefresh();

    /**
     * 创建新按钮（显示创建对话框）
     * @param category 按钮所属的分类
     * @param onCreated 创建成功后的回调
     */
    const createButton = useCallback(
        (category: CategoryConfig, onCreated?: () => void) => {
            new ButtonCreateModal(app, plugin, category, () => {
                void plugin.saveSettings();
                refresh();
                if (onCreated) {
                    onCreated();
                }
            }).open();
        },
        [plugin, app, refresh]
    );

    return {
        createButton,
    };
}

