// plugin.ts
// 插件主类接口类型扩展，约束插件主类结构。
import { Plugin } from 'obsidian';
import { ButtonsPanelPluginSettings } from '@/types';

/**
 * ButtonsPanelPlugin 插件主类接口类型扩展。
 * 用于类型提示和类型安全，约束插件主类的结构。
 */
export interface ButtonsPanelPlugin extends Plugin {
    /** 插件设置对象 */
    settings: ButtonsPanelPluginSettings;
    /** 设置页签对象（类型可自定义） */
    settingTab: any;

    /** 保存设置方法，异步 */
    saveSettings(): Promise<void>;

    /** 记录最后激活的markdown标签页（可选） */
    lastActiveMarkdownLeaf?: import('obsidian').WorkspaceLeaf | null;
    /** 分类展开状态（运行时状态，不持久化） */
    categoryOpenState: Record<string, boolean>;
}
