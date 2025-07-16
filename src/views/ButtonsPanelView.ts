// ButtonsPanelView.ts
// 本文件定义了按钮面板主视图类 ButtonsPanelView，是 Obsidian 插件的核心 UI 视图之一。
// 该视图负责渲染和管理按钮面板的全部交互、展示、移动、分类、样式应用等功能，协调各个模块化组件，
// 遵循高内聚低耦合原则，极大提升了代码的可维护性和扩展性。
//
// 主要内容：
// - ButtonsPanelView 类：主视图类，继承自 Obsidian 的 ItemView
// - 构造函数与生命周期方法（onOpen/onClose）
// - 视图渲染、按钮/面板配置更新、移动模式、分类移动模式等核心逻辑
// - 详细参数、返回值、用途说明
//
// 注释风格与 src/settings/components、modals、sections、types、utils、views/renderers 等目录下已确认文件保持一致。

import { ItemView, WorkspaceLeaf, Menu } from 'obsidian';
import { ButtonConfig, ButtonsPanelPlugin, CategoryConfig, PanelConfig } from '@/types';
import { t } from '@/utils/i18n';
import { ActionDispatcher } from '@/core/ActionDispatcher';
import { ViewStateManager } from '@/views/managers/ViewStateManager';
import { ButtonMoveManager } from '@/views/managers/ButtonMoveManager';
import { CategoryMoveManager } from '@/views/managers/CategoryMoveManager';
import { ButtonRenderer } from '@/views/renderers/ButtonRenderer';
import { TabsRenderer } from '@/views/renderers/TabsRenderer';
import { ListRenderer } from '@/views/renderers/ListRenderer';
import { PanelRenderer } from '@/views/renderers/PanelRenderer';
import { ButtonMoveModeRenderer } from '@/views/renderers/ButtonMoveModeRenderer';
import { CategoryMoveModeRenderer } from '@/views/renderers/CategoryMoveModeRenderer';
import { PanelActionsRenderer } from '@/views/renderers/PanelActionsRenderer';

/**
 * 按钮面板主视图类
 * 负责渲染和管理按钮面板的全部交互、展示、移动、分类、样式应用等功能。
 * 通过组合多个模块化组件实现高内聚低耦合。
 */
export class ButtonsPanelView extends ItemView {
    /** 当前面板的按钮数据 */
    private buttons: ButtonConfig[] = [];
    /** 面板的显示设置 */
    private panelConfig: PanelConfig;
    /** 插件主类实例 */
    private plugin: ButtonsPanelPlugin;
    /** 状态管理器，负责视图状态的统一管理 */
    private stateManager: ViewStateManager;
    /** 按钮移动管理器，处理按钮的拖拽与排序 */
    private moveManager: ButtonMoveManager;
    /** 分类移动管理器，处理分类的拖拽与排序 */
    private categoryMoveManager: CategoryMoveManager;
    /** 按钮渲染器，负责单个按钮的渲染 */
    private buttonRenderer: ButtonRenderer;
    /** 标签页渲染器，负责多分类标签页的渲染 */
    private tabsRenderer: TabsRenderer;
    /** 列表渲染器，负责按钮列表的渲染 */
    private listRenderer: ListRenderer;
    /** 面板渲染器，负责整个面板的结构渲染 */
    private panelRenderer: PanelRenderer;
    /** 按钮移动模式渲染器，负责移动模式下的 UI 渲染 */
    private moveModeRenderer: ButtonMoveModeRenderer;
    /** 分类移动模式渲染器，负责分类移动模式下的 UI 渲染 */
    private categoryMoveModeRenderer: CategoryMoveModeRenderer;
    /** 面板操作按钮渲染器，负责面板顶部操作按钮的渲染 */
    private panelActionsRenderer: PanelActionsRenderer;
    /** 刷新事件处理函数句柄 */
    private handleRefreshEvent: (() => void) | null = null;

    /**
     * 构造函数，初始化视图和所有模块化组件
     * @param leaf Obsidian 工作区叶子节点
     * @param plugin 插件主类实例
     * @param buttons 按钮配置数组
     * @param panelConfig 面板配置
     */
    constructor(
        leaf: WorkspaceLeaf,
        plugin: ButtonsPanelPlugin,
        buttons: ButtonConfig[],
        panelConfig: PanelConfig
    ) {
        super(leaf);
        this.plugin = plugin;
        this.buttons = buttons;
        this.panelConfig = panelConfig;
        // 初始化所有模块化组件
        this.initializeComponents();
        // 添加主容器样式类
        this.containerEl.addClass('buttons-panel-plugin');
    }

    /**
     * 初始化所有模块化组件，提升代码解耦性和可维护性
     */
    private initializeComponents(): void {
        // 初始化状态管理器
        this.stateManager = new ViewStateManager(this.plugin);

        // 初始化移动管理器
        this.moveManager = new ButtonMoveManager(this.plugin, this.stateManager);

        // 初始化分类移动管理器
        this.categoryMoveManager = new CategoryMoveManager(this.plugin, this.stateManager);

        // 初始化按钮渲染器
        this.buttonRenderer = new ButtonRenderer(this.plugin, this.app);

        // 初始化标签页渲染器
        this.tabsRenderer = new TabsRenderer(
            this.plugin,
            this.stateManager,
            this.categoryMoveManager,
            this.buttonRenderer,
            this.app,
            this.moveManager,
            this // 传入主视图实例
        );

        // 初始化列表渲染器
        this.listRenderer = new ListRenderer(
            this.plugin,
            this.stateManager,
            this.categoryMoveManager,
            this.buttonRenderer,
            this.app,
            this.moveManager,
            this // 传入主视图实例
        );

        // 初始化面板渲染器
        this.panelRenderer = new PanelRenderer(
            this.plugin,
            this.stateManager,
            this.tabsRenderer,
            this.listRenderer
        );

        // 初始化移动模式渲染器
        this.moveModeRenderer = new ButtonMoveModeRenderer(
            this.plugin,
            this.stateManager,
            this.moveManager,
            this.buttonRenderer
        );

        // 初始化分类移动模式渲染器
        this.categoryMoveModeRenderer = new CategoryMoveModeRenderer(
            this.plugin,
            this.stateManager,
            this.categoryMoveManager
        );

        // 初始化面板操作按钮渲染器
        this.panelActionsRenderer = new PanelActionsRenderer(this.plugin, this.panelConfig);

        // 监听刷新事件
        this.setupEventListeners();
    }

    /**
     * 设置事件监听器，监听面板刷新等自定义事件
     */
    private setupEventListeners(): void {
        // 监听面板刷新事件
        this.handleRefreshEvent = () => {
            this.debouncedRender();
        };
        document.addEventListener('buttons-panel-refresh', this.handleRefreshEvent);
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
        return t('buttons_panel', this.plugin);
    }

    /**
     * 视图打开时自动调用，渲染按钮面板
     * @returns Promise<void>
     */
    async onOpen(): Promise<void> {
        setTimeout(() => {
            this.contentEl.empty();
            this.renderPanel();
        }, 0);
    }

    /**
     * 视图关闭时自动调用，可用于资源清理
     * @returns Promise<void>
     */
    async onClose(): Promise<void> {
        console.log('onClose');
        this.containerEl.empty();
        // 移除事件监听器
        if (this.handleRefreshEvent) {
            document.removeEventListener('buttons-panel-refresh', this.handleRefreshEvent);
        }
    }

    /**
     * 防抖渲染，避免频繁重新渲染
     */
    private debouncedRender(): void {
        const timeout = this.stateManager.getRenderTimeout();
        if (timeout) {
            clearTimeout(timeout);
        }
        const newTimeout = window.setTimeout(() => {
            this.renderPanel();
        }, 100);
        this.stateManager.setRenderTimeout(newTimeout);
    }

    /**
     * 更新按钮数据并重新渲染
     * @param buttons 新的按钮配置数组
     */
    updateButtons(buttons: ButtonConfig[]): void {
        try {
            this.buttons = buttons;
            this.debouncedRender();
        } catch (error) {
            console.warn('更新按钮数据时出错:', error);
        }
    }

    /**
     * 更新面板设置并重新渲染
     * @param config 新的面板配置
     */
    updatePanelConfig(config: PanelConfig): void {
        try {
            this.panelConfig = config;
            // 同步更新面板操作按钮渲染器的配置
            this.panelActionsRenderer.updatePanelConfig(config);
            this.debouncedRender();
        } catch (error) {
            console.warn('更新面板设置时出错:', error);
        }
    }

    /**
     * 应用面板样式
     * @param panelEl 面板元素
     */
    private applyPanelStyles(panelEl: HTMLElement): void {
        if (this.panelConfig.panelHeight && this.panelConfig.panelHeight !== 'auto') {
            panelEl.style.height = this.panelConfig.panelHeight;
        }
    }

    /**
     * 渲染面板 - 使用模块化渲染器
     */
    private renderPanel(): void {
        try {
            if (this.stateManager.getIsRendering()) {
                return;
            }
            this.stateManager.setIsRendering(true);
            const container = this.contentEl;
            if (!container) {
                return;
            }

            // 渲染面板顶部的操作按钮
            this.panelActionsRenderer.createPanelActions(this.containerEl);

            // 恢复PanelRenderer调用
            this.panelRenderer.renderPanel(
                container,
                this.panelConfig,
                this.handleMoveStart.bind(this),
                () => {
                    // 渲染完成回调
                    // 应用面板样式
                    const panelEl = container.querySelector('.buttons-panel-container');
                    if (panelEl) {
                        this.applyPanelStyles(panelEl as HTMLElement);
                    }
                }
            );
        } catch (error) {
            console.error('渲染按钮面板时出错:', error);
        } finally {
            this.stateManager.setIsRendering(false);
        }
    }

    /**
     * 处理按钮移动开始事件，进入移动模式
     * @param button 当前被移动的按钮配置
     * @param buttonEl 按钮对应的 DOM 元素
     */
    private handleMoveStart(button: ButtonConfig, buttonEl: HTMLElement): void {
        this.moveManager.startMoveMode(button, buttonEl, this.panelConfig);
        this.moveModeRenderer.renderMoveModePanel(this.contentEl, this.panelConfig);
        document.addEventListener('keydown', this.handleMoveEscKey);
    }

    /**
     * 处理移动模式下的 ESC 键退出逻辑
     * @param e 键盘事件
     */
    private handleMoveEscKey = (e: KeyboardEvent): void => {
        if (e.key === 'Escape') {
            this.exitMoveMode();
        }
    };

    /**
     * 退出按钮移动模式，恢复正常视图
     */
    private exitMoveMode(): void {
        this.moveManager.endMoveMode();
        if (
            this.stateManager.isInCategoryMoveMode() &&
            typeof this.categoryMoveManager?.endCategoryMoveMode === 'function'
        ) {
            this.categoryMoveManager.endCategoryMoveMode();
        }
        document.removeEventListener('keydown', this.handleMoveEscKey);
        this.renderPanel();
    }

    /**
     * 处理分类移动开始事件，进入分类移动模式
     * @param category 当前被移动的分类配置
     */
    private handleCategoryMoveStart(category: CategoryConfig): void {
        this.categoryMoveManager.startCategoryMoveMode(category);
        this.categoryMoveModeRenderer.renderCategoryMoveModePanel(this.contentEl);
        document.addEventListener('keydown', this.handleMoveEscKey);
    }

    /**
     * 进入分类移动模式，绑定 ESC 监听
     */
    public enterCategoryMoveMode(): void {
        document.addEventListener('keydown', this.handleMoveEscKey);
    }
}
