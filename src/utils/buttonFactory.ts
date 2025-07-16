// buttonFactory.ts
// 按钮工厂函数，生成默认按钮配置对象。
import { ButtonConfig } from '@/types';

/**
 * 创建一个默认的按钮配置对象。
 * @returns ButtonConfig 默认按钮配置
 */
export function createDefaultButtonConfig(): ButtonConfig {
    return {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        name: '',
        icon: '',
        actions: [] as ButtonConfig['actions'],
        order: 0,
        executionMode: 'sequential',
        stopOnError: true,
        delayBetweenActions: 0,
    };
}
