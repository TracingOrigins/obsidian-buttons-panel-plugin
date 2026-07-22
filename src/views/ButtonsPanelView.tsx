// ButtonsPanelView.tsx
// 本文件定义了按钮面板主视图类 ButtonsPanelView，是 Obsidian 插件的核心 UI 视图之一。
// 该视图负责渲染和管理按钮面板的全部交互、展示、移动、分类、样式应用等功能，协调各个模块化组件，
// 遵循高内聚低耦合原则，极大提升了代码的可维护性和扩展性。
//
// 主要内容：
// - ButtonsPanelView 类：主视图类，继承自 Obsidian 的 ItemView
// - 构造函数与生命周期方法（onOpen/onClose）
// - 视图渲染、按钮/面板配置更新、移动模式、分类移动模式等核心逻辑
// - 详细参数、返回值、用途说明

import React from 'react';
import { ItemView, WorkspaceLeaf, debounce } from 'obsidian';
import { ButtonsPanelPlugin, CategoryConfig, PanelConfig } from '@/types';
import { t } from '@/utils/i18n';
import { NavigationBarRenderer } from '@/views/renderers/NavigationBarRenderer';
import { ReactRoot } from '@/utils/ReactRoot';
import { ButtonsPanelApp } from '@/components/buttons-panel/ButtonsPanelApp';

/**
 * 按钮面板主视图类
 * 负责渲染和管理按钮面板的全部交互、展示、移动、分类、样式应用等功能。
 * 通过组合多个模块化组件实现高内聚低耦合。
 */
export class ButtonsPanelView extends ItemView {
    /** 当前面板的分类数据 */
    private categories: CategoryConfig[] = [];
    /** 面板的显示设置 */
    private panelConfig: PanelConfig;
    /** 导航栏搜索关键字（仅内存状态，不写入设置） */
    private searchQuery: string = '';
    /** 插件主类实例 */
    private plugin: ButtonsPanelPlugin;
    // React 根节点管理器（替代原有 DOM 渲染器）
    private reactRoot: ReactRoot | null = null;
    /** 刷新事件处理函数句柄 */
    private handleRefreshEvent: (() => void) | null = null;
    /** 防抖渲染函数，使用 Obsidian API 的 debounce */
    private debouncedRender: () => void;
    /** 顶部导航栏渲染器（挂载在 Obsidian view-header 同级位置） */
    private navigationBarRenderer: NavigationBarRenderer | null = null;

    /**
     * 构造函数，初始化视图和所有模块化组件
     * @param leaf Obsidian 工作区叶子节点
     * @param plugin 插件主类实例
     * @param categories 分类配置数组
     * @param panelConfig 面板配置
     */
    constructor(
        leaf: WorkspaceLeaf,
        plugin: ButtonsPanelPlugin,
        categories: CategoryConfig[],
        panelConfig: PanelConfig
    ) {
        super(leaf);
        this.plugin = plugin;
        this.categories = categories;
        this.panelConfig = panelConfig;
        // 初始化防抖渲染函数（React 模式下主要用于触发重新挂载）
        this.debouncedRender = debounce(() => {
            this.renderPanel();
        }, 100, true);
        // 初始化顶部导航栏渲染器（挂在 Obsidian 的 view-header 上方，而不是 view-content 内部）
        this.navigationBarRenderer = new NavigationBarRenderer(this.plugin, this.panelConfig);

        // 添加主容器样式类
        this.containerEl.addClass('buttons-panel');
        // 确保容器可以接收焦点
        this.containerEl.setAttribute('tabindex', '-1');
    }

    /**
     * 设置事件监听器，监听面板刷新等自定义事件
     */
    private setupEventListeners(): void {
        // 监听面板刷新事件（直接触发渲染，不使用防抖，避免异步时序问题）
        this.handleRefreshEvent = () => {
            this.renderPanel();
        };
        // 使用视图的 registerDomEvent 注册自定义 DOM 事件
        this.registerDomEvent(activeDocument, 'buttons-panel-refresh', this.handleRefreshEvent);

        // 监听来自导航栏的搜索事件
        this.registerDomEvent(
            activeDocument,
            'buttons-panel-search',
            (event: Event) => {
                const customEvent = event as CustomEvent<{ query?: string }>;
                this.searchQuery = customEvent.detail?.query ?? '';
                this.debouncedRender();
            }
        );
    }

    /**
     * 获取视图类型字符串（用于 Obsidian 识别）
     * @returns 视图类型字符串
     */
    getViewType(): string {
        return 'buttons-panel-view';
    }

    /**
     * 获取视图图标（左侧边栏显示）
     * @returns 图标名称字符串
     */
    getIcon(): string {
        // return 'layout-grid';
        return 'mouse';
    }

    /**
     * 获取视图显示名称（顶部标题）
     * @returns 本地化后的视图名称
     */
    getDisplayText(): string {
        return t('buttons_panel');
    }

    /**
     * 视图打开时自动调用，渲染按钮面板
     * @returns Promise<void>
     */
    async onOpen(): Promise<void> {
        // 每次打开视图时从磁盘重新加载最新设置，
        // 以便官方同步或其他设备更新的配置能够生效
        try {
            await this.plugin.loadSettings();
            this.categories = this.plugin.settings.categories;
            this.panelConfig = this.plugin.settings.panelConfig;
        } catch (error) {
            console.warn('加载最新按钮面板设置时出错，将使用内存中的配置：', error);
        }

        // 同步 NavigationBarRenderer 的 panelConfig 引用，
        // 避免因 loadSettings 后引用不一致导致首次菜单点击无效
        this.navigationBarRenderer?.updatePanelConfig(this.panelConfig);

        // React 挂载（仅负责 view-content 内部的面板内容）
        this.reactRoot = new ReactRoot();
        const container = this.contentEl;
        container.empty();
        // 为 Obsidian 的 view-content 添加专用样式类，便于单独控制内边距等布局
        container.addClass('buttons-panel');
        this.reactRoot.mount(container, this.createAppElement());

        // 在 Obsidian 的 view-header 上方渲染顶部操作栏（视图切换 / 样式切换 / 编辑模式 / 设置按钮）
        this.navigationBarRenderer?.createNavigationBar(this.containerEl);

        // 仍然保留 refresh 事件监听，以后可以在 React 中桥接
        this.setupEventListeners();
    }

    /**
     * 视图关闭时自动调用，可用于资源清理
     * @returns Promise<void>
     */
    async onClose(): Promise<void> {
        // 卸载 React 应用并清理容器
        if (this.reactRoot) {
            this.reactRoot.unmount();
            this.reactRoot = null;
        } else {
            this.containerEl.empty();
        }
        // 事件监听器现在通过插件的事件注册系统自动清理
    }

    /**
     * 更新分类数据并重新渲染
     * @param categories 新的分类配置数组
     */
    updateCategories(categories: CategoryConfig[]): void {
        try {
            // 确保 categories 是有效的数组
            this.categories = Array.isArray(categories) ? categories : [];
            this.debouncedRender();
        } catch (error) {
            console.error('更新分类数据时出错:', error);
            // 如果更新失败，尝试重新挂载
            if (this.reactRoot && this.contentEl) {
                try {
                    this.reactRoot.unmount();
                    this.reactRoot = new ReactRoot();
                    this.reactRoot.mount(this.contentEl, this.createAppElement());
                } catch (remountError) {
                    console.error('重新挂载时出错:', remountError);
                }
            }
        }
    }

    /**
     * 从插件设置同步内存中的分类/面板配置
     */
    private syncDataFromPlugin(): void {
        this.categories = this.plugin.settings.categories;
        this.panelConfig = this.plugin.settings.panelConfig;
    }

    /**
     * 供 React 渲染用的分类列表：浅拷贝数组以触发依赖 categories 引用的子树更新，
     * 分类对象本身仍与 plugin.settings 共享，保证创建/编辑模态框写入正确数据。
     */
    private getCategoriesForRender(): CategoryConfig[] {
        this.syncDataFromPlugin();
        return [...this.categories];
    }

    private createAppElement(): React.ReactElement {
        return (
            <ButtonsPanelApp
                plugin={this.plugin}
                app={this.app}
                categories={this.getCategoriesForRender()}
                panelConfig={this.panelConfig}
                searchQuery={this.searchQuery}
            />
        );
    }

    /**
     * 更新面板设置并重新渲染
     * @param config 新的面板配置
     */
    updatePanelConfig(config: PanelConfig): void {
        try {
            this.panelConfig = config;
            // 同步更新顶部操作栏的配置，并重新渲染（保持与内容区状态一致）
            if (this.navigationBarRenderer) {
                this.navigationBarRenderer.updatePanelConfig(this.panelConfig);
                this.navigationBarRenderer.createNavigationBar(this.containerEl);
            }
            this.debouncedRender();
        } catch (error) {
            console.warn('更新面板设置时出错:', error);
        }
    }

    /**
     * 渲染面板 - 使用 React 根组件
     */
    public renderPanel(): void {
        // React 模式下，renderPanel 主要用于触发根组件更新
        if (!this.reactRoot) {
            // 如果 reactRoot 不存在，尝试重新初始化
            if (this.contentEl) {
                try {
                    this.reactRoot = new ReactRoot();
                    this.reactRoot.mount(this.contentEl, this.createAppElement());
                } catch (error) {
                    console.error('重新初始化 ReactRoot 时出错:', error);
                }
            }
            return;
        }

        try {
            this.reactRoot.update(this.createAppElement());
        } catch (error) {
            console.error('更新 React 组件时出错:', error);
            // 如果更新失败，尝试重新挂载
            if (this.contentEl) {
                try {
                    this.reactRoot.unmount();
                    this.reactRoot = new ReactRoot();
                    this.reactRoot.mount(this.contentEl, this.createAppElement());
                } catch (remountError) {
                    console.error('重新挂载时出错:', remountError);
                }
            }
        }
    }

}


