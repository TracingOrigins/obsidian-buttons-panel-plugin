// plugin.ts
// 插件主类接口类型扩展，约束插件主类结构。
import type { Plugin, SettingTab, WorkspaceLeaf } from 'obsidian';
import { ButtonsPanelPluginSettings } from '@/types';

/**
 * ButtonsPanelPlugin 插件主类接口类型扩展。
 * 用于类型提示和类型安全，约束插件主类的结构。
 */
export interface ButtonsPanelPlugin extends Plugin {
    /** 加载设置方法，异步（从持久化存储读取并合并默认值） */
    loadSettings(): Promise<void>;

    /** 插件设置对象 */
    settings: ButtonsPanelPluginSettings;
    /** 设置页签对象（类型可自定义） */
	settingTab: SettingTab;

    /** 动作调度器实例（暴露最小可用表面，具体结构由实现类决定） */
    actionDispatcher: unknown;

    /** 保存设置方法，异步 */
    saveSettings(): Promise<void>;

    /** 分类展开状态（运行时状态，不持久化） */
    categoryOpenState: Record<string, boolean>;

	/**
	 * 记录最后一个激活的内容视图叶子（非按钮面板），用于在执行命令、脚本等动作前恢复焦点。
	 * 运行时状态，不持久化。
	 */
	lastActiveContentLeaf?: WorkspaceLeaf | null;
}
