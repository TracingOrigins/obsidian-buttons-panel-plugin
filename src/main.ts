// main.ts
// 本文件为 Obsidian 插件 obsidian-buttons-panel-plugin 的主入口，负责插件的初始化、激活、停用等生命周期管理。
// 包含主插件类 ButtonsPanelPlugin，注册各类视图、命令、设置页等核心功能。
//
// 主要内容：
// - ButtonsPanelPlugin 主插件类
// - onload、onunload 等生命周期方法
// - 插件初始化、资源注册、事件监听等关键逻辑
// - 详细参数、返回值、用途说明
//
// 注释风格与 src/settings/components、modals、sections、types、utils、views/renderers 等目录下已确认文件保持一致。
import { Plugin, WorkspaceLeaf, Editor, TFile, Notice } from 'obsidian';
import { ButtonsPanelView } from '@/views/ButtonsPanelView';
import { PanelSettingsView } from '@/views/PanelSettingsView';
import { ButtonsPanelSettingTab } from '@/settings/ButtonsPanelSettingTab';
import {
    DEFAULT_SETTINGS,
    ButtonsPanelPluginSettings,
    CategoryConfig,
    ButtonConfig,
} from '@/types';
import { t, tWithParams } from '@/utils/i18n';

// 视图类型常量
export const BUTTONS_PANEL_VIEW_TYPE = 'buttons-panel-view';
export const BUTTONS_PANEL_SETTINGS_VIEW_TYPE = 'buttons-panel-settings-view';

/**
 * 按钮面板插件主类，继承自 Obsidian 的 Plugin。
 * 负责插件的初始化、视图注册、命令注册、设置管理等核心功能。
 */
export default class ButtonsPanelPlugin extends Plugin {
    /** 插件设置数据对象 */
    settings: ButtonsPanelPluginSettings;
    /** 设置页签对象 */
    settingTab: ButtonsPanelSettingTab;
    /** 按钮动作执行器对象 */
    ActionDispatcher: any;
    /** 记录最后激活的markdown标签页 */
    lastActiveMarkdownLeaf: WorkspaceLeaf | null = null;
    /** 分类展开状态（运行时状态，不持久化） */
    categoryOpenState: Record<string, boolean> = {};

    /**
     * 插件加载时自动调用，完成初始化、视图注册、命令注册、设置页签注册等。
     */
    async onload() {
        await this.loadSettings();
        this.ActionDispatcher = new (await import('./core/ActionDispatcher')).ActionDispatcher(
            this.app,
            this
        );

        // 注册按钮面板视图（右侧边栏）
        this.registerView(
            BUTTONS_PANEL_VIEW_TYPE,
            (leaf: WorkspaceLeaf) =>
                new ButtonsPanelView(leaf, this, this.getAllButtons(), this.settings.panelConfig)
        );

        // 注册配置面板视图（主页面新标签页）
        this.registerView(
            BUTTONS_PANEL_SETTINGS_VIEW_TYPE,
            (leaf: WorkspaceLeaf) => new PanelSettingsView(leaf, this)
        );

        // 添加命令：打开按钮面板（右侧边栏）
        this.addCommand({
            id: 'open-buttons-panel',
            name: t('open_buttons_panel', this),
            callback: () => {
                this.activateView();
            },
        });

        // 添加命令：打开配置面板（主页面新标签页）
        this.addCommand({
            id: 'open-buttons-panel-settings',
            name: t('open_buttons_panel_settings', this),
            callback: () => {
                this.activateSettingsView();
            },
        });

        // 添加左侧ribbon图标，点击可快速打开按钮面板和设置
        this.addRibbonIcon('layout-grid', t('open_buttons_panel', this), () => {
            this.activateView();
            this.activateSettingsView();
        });

        // 添加设置标签页（Obsidian设置页）
        this.settingTab = new ButtonsPanelSettingTab(this.app, this);
        this.addSettingTab(this.settingTab);

        this.app.workspace.onLayoutReady(() => {
            registerScriptCommands(this);
        });

        // 监听标签页切换，记录最后激活的markdown标签页
        this.app.workspace.on('active-leaf-change', (leaf: WorkspaceLeaf | null) => {
            if (
                leaf &&
                leaf.view &&
                leaf.view.getViewType &&
                leaf.view.getViewType() === 'markdown'
            ) {
                this.lastActiveMarkdownLeaf = leaf;
            }
        });
    }

    /**
     * 插件卸载时自动调用。
     */
    onunload() {
        // 注销按钮面板视图和设置视图
        // this.app.workspace.detachLeavesOfType(BUTTONS_PANEL_VIEW_TYPE);
        // this.app.workspace.detachLeavesOfType(BUTTONS_PANEL_SETTINGS_VIEW_TYPE);
        // 不需要手动detach leaves，Obsidian会自动管理
        // 如有手动注册的事件或资源，请在此清理
    }

    /**
     * 加载插件设置（异步），合并默认设置和已保存设置。
     */
    async loadSettings() {
        const data = await this.loadData();
        this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
        // 只在初始化时重置运行时状态，避免重复调用时丢失状态
        if (Object.keys(this.categoryOpenState).length === 0) {
            this.categoryOpenState = {};
        }
    }

    /**
     * 保存插件设置（异步），保存前会自动排序按钮顺序，保证数据一致性。
     */
    async saveSettings() {
        try {
            // 在保存之前确保分类和按钮按照 order 值正确排序
            this.settings.categories.sort((a, b) => a.order - b.order);
            this.settings.categories.forEach((category) => {
                category.buttons.sort((a, b) => a.order - b.order);
            });

            await this.saveData(this.settings);
            this.updatePanels();
        } catch (error) {
            console.error('保存设置时出错:', error);
        }
    }

    /**
     * 更新所有已打开的按钮面板视图的设置（如面板样式等）。
     */
    updatePanels() {
        try {
            this.app.workspace.getLeavesOfType(BUTTONS_PANEL_VIEW_TYPE).forEach((leaf) => {
                try {
                    const view = leaf.view as ButtonsPanelView;
                    if (
                        view &&
                        typeof view.updateButtons === 'function' &&
                        typeof view.updatePanelConfig === 'function'
                    ) {
                        view.updateButtons(this.getAllButtons());
                        view.updatePanelConfig(this.settings.panelConfig);
                    }
                } catch (error) {
                    console.warn('更新按钮面板视图时出错:', error);
                }
            });
        } catch (error) {
            console.warn('更新按钮面板时出错:', error);
        }
    }

    /**
     * 更新所有已打开的设置页面视图。
     */
    updateSettingsViews() {
        try {
            this.app.workspace.getLeavesOfType(BUTTONS_PANEL_SETTINGS_VIEW_TYPE).forEach((leaf) => {
                try {
                    const view = leaf.view as PanelSettingsView;
                    if (view && typeof view.refreshSettings === 'function') {
                        view.refreshSettings();
                    }
                } catch (error) {
                    console.warn('更新设置页面视图时出错:', error);
                }
            });
        } catch (error) {
            console.warn('更新设置页面时出错:', error);
        }
    }

    /**
     * 更新所有相关视图（按钮面板和设置页面）。
     */
    updateAllViews() {
        this.updatePanels();
        this.updateSettingsViews();
    }

    /**
     * 激活（或创建）右侧按钮面板视图。
     * 若已存在则激活，否则新建。
     */
    private async activateView() {
        const { workspace } = this.app;

        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(BUTTONS_PANEL_VIEW_TYPE);

        if (leaves.length > 0) {
            // 如果面板已经存在，激活它
            leaf = leaves[0];
        } else {
            // 创建新的面板在右侧边栏
            leaf = workspace.getRightLeaf(false);
            if (leaf) {
                await leaf.setViewState({
                    type: BUTTONS_PANEL_VIEW_TYPE,
                    active: true,
                });
            }
        }

        if (leaf) {
            workspace.revealLeaf(leaf);
        }
    }

    /**
     * 激活（或创建）主页面的新标签页作为设置视图。
     * 若已存在则激活，否则新建。
     */
    private async activateSettingsView() {
        const { workspace } = this.app;
        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(BUTTONS_PANEL_SETTINGS_VIEW_TYPE);
        if (leaves.length > 0) {
            leaf = leaves[0];
        } else {
            // 创建新的配置面板在主页面新标签页
            leaf = workspace.getLeaf('tab');
            if (leaf) {
                await leaf.setViewState({
                    type: BUTTONS_PANEL_SETTINGS_VIEW_TYPE,
                    active: true,
                });
            }
        }
        if (leaf) {
            workspace.revealLeaf(leaf);
        }
    }

    /**
     * 更新所有已打开的按钮面板视图的按钮和设置。
     * 用于按钮数据或面板设置变更后刷新界面。
     */
    private updateActiveView() {
        const leaves = this.app.workspace.getLeavesOfType(BUTTONS_PANEL_VIEW_TYPE);
        leaves.forEach((leaf) => {
            const view = leaf.view as ButtonsPanelView;
            if (view) {
                view.updateButtons(this.getAllButtons());
                view.updatePanelConfig(this.settings.panelConfig);
            }
        });
    }

    /**
     * 获取所有按钮的扁平化数组。
     * 用于向后兼容和某些需要所有按钮的场景。
     * @returns 所有按钮的数组
     */
    private getAllButtons(): ButtonConfig[] {
        return this.settings.categories.flatMap((category) => category.buttons);
    }
}

// 在插件 onload 或初始化时注册脚本命令
async function registerScriptCommands(plugin: any) {
    let scriptFolder = plugin.settings.pathConfig?.scriptFolderPath;
    if (!scriptFolder) {
        return;
    }
    // 统一去掉首尾斜杠
    scriptFolder = scriptFolder.replace(/^\/+|\/+$/g, '').replace(/^\/|\/$/g, '');
    const allFiles = plugin.app.vault.getFiles();

    const files = allFiles.filter((f: TFile) => {
        return f.path.startsWith(scriptFolder + '/') && f.extension === 'js';
    });
    for (const file of files) {
        plugin.addCommand({
            id: `run-script:${file.name}`,
            name: t('script', this.plugin) + `:${file.name}`,
            callback: async () => {
                try {
                    // new Notice(tWithParams('script_command_run', { scriptName: file.name }, this.plugin));
                    await plugin.ActionDispatcher.runScript(file.name);
                } catch (e) {
                    // new Notice(t('script_run_failed', this.plugin) + `：${e.message}`);
                }
            },
        });
        // new Notice(tWithParams('script_command_registered', { scriptName: file.name }, this.plugin));
    }
}
