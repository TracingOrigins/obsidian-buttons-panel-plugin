// plugin.ts
// 插件主类接口类型扩展，约束插件主类结构。
import { Plugin } from 'obsidian';
import { ButtonsPanelPluginSettings } from '@/common/types';

/**
 * ButtonsPanelPlugin 插件主类接口类型扩展。
 * 用于类型提示和类型安全，约束插件主类的结构。
 */
export interface ButtonsPanelPlugin extends Plugin {
    /** 插件设置对象 */
    settings: ButtonsPanelPluginSettings;
    /** 设置页签对象（类型可自定义） */
    settingTab: any;

    /** 动作调度器实例（暴露最小可用表面） */
    ActionDispatcher: {
        scriptService?: {
            runScript: (action: unknown) => Promise<void>;
        };
        // 其他 service 如有需要可按需补充
        [key: string]: unknown;
    };

    /** 保存设置方法，异步 */
    saveSettings(): Promise<void>;

    /** 分类展开状态（运行时状态，不持久化） */
    categoryOpenState: Record<string, boolean>;
}
