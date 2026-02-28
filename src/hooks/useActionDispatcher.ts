import { useMemo } from 'react';
import { ActionDispatcher } from '@/services/ActionDispatcher';
import { usePluginContext } from '@/contexts/PluginContext';
import type { ButtonAction } from '@/types';

/**
 * useActionDispatcher Hook
 * 
 * 封装 ActionDispatcher 的使用，提供类型安全的动作执行接口。
 * 从 PluginContext 中获取 app 和 plugin，创建或复用 ActionDispatcher 实例。
 * 
 * @returns ActionDispatcher 实例的 executeActions 方法
 */
export function useActionDispatcher() {
    const { plugin, app } = usePluginContext();

    // 使用 useMemo 缓存 ActionDispatcher 实例，避免重复创建
    const dispatcher = useMemo(() => {
        // 如果 plugin 已经有 actionDispatcher，优先使用（保持向后兼容）
        const existingDispatcher = plugin.actionDispatcher as ActionDispatcher | null | undefined;
        if (existingDispatcher && typeof existingDispatcher.executeActions === 'function') {
            return existingDispatcher;
        }
        // 否则创建新实例
        return new ActionDispatcher(app, plugin);
    }, [app, plugin]);

    /**
     * 执行按钮动作序列
     * @param actions 按钮动作数组
     * @param executionMode 执行模式（'sequential' 顺序，'parallel' 并行）
     * @param stopOnError 是否遇到错误时中断（仅顺序模式有效）
     * @param delayBetweenActions 动作间延迟（毫秒，仅顺序模式有效）
     */
    const executeActions = useMemo(
        () =>
            async (
                actions: ButtonAction[],
                executionMode: 'sequential' | 'parallel' = 'sequential',
                stopOnError: boolean = true,
                delayBetweenActions: number = 100
            ) => {
                await dispatcher.executeActions(actions, executionMode, stopOnError, delayBetweenActions);
            },
        [dispatcher]
    );

    return {
        executeActions,
        dispatcher,
    };
}

