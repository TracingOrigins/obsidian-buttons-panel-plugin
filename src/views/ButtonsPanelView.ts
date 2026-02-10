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

import { ItemView, WorkspaceLeaf, debounce } from 'obsidian';
import { ButtonConfig, ButtonsPanelPlugin, CategoryConfig, PanelConfig } from '@/common/types';
import { t } from '@/common/utils/i18n';
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
    /** 键盘事件是否已注册 */
    private keyboardEventsRegistered: boolean = false;
    /** 防抖渲染函数，使用 Obsidian API 的 debounce */
    private debouncedRender: () => void;

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
        // 初始化防抖渲染函数，使用 Obsidian API 的 debounce
        this.debouncedRender = debounce(() => {
            this.renderPanel();
        }, 100, true);
        // 添加主容器样式类
        this.containerEl.addClass('buttons-panel-plugin');
        // 确保容器可以接收焦点
        this.containerEl.setAttribute('tabindex', '-1');
    }

    /**
     * 初始化所有模块化组件，提升代码解耦性和可维护性
     */
    private initializeComponents(): void {
        // 初始化状态管理器
        this.stateManager = new ViewStateManager(this.plugin);

        // 初始化移动管理器
        this.moveManager = new ButtonMoveManager(this.plugin, this.stateManager, this);

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
        // 使用视图的 registerDomEvent 注册自定义 DOM 事件
        this.registerDomEvent(document, 'buttons-panel-refresh', this.handleRefreshEvent);
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
        this.containerEl.empty();
        // 事件监听器现在通过插件的事件注册系统自动清理
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
            panelEl.style.setProperty("--panel-height", this.panelConfig.panelHeight);
        }
    }

    /**
     * 渲染面板 - 使用模块化渲染器
     */
    public renderPanel(): void {
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
                this.handleMoveStart,
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
    private readonly handleMoveStart = (button: ButtonConfig, buttonEl: HTMLElement): void => {
        this.moveManager.startMoveMode(button, buttonEl, this.panelConfig);
        this.moveModeRenderer.renderMoveModePanel(this.contentEl, this.panelConfig);
        this.addKeyboardEventListener();
        
        // 确保视图获得焦点，以便 scope 能够接收键盘事件
        this.containerEl.focus();
    };

    /**
     * 处理移动模式下的 ESC 键退出逻辑
     * @param e 键盘事件
     */
    private handleMoveEscKeyBinding = (): void => {
        this.exitMoveMode();
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
        this.removeKeyboardEventListener();
        this.renderPanel();
    }

    /**
     * 处理分类移动开始事件，进入分类移动模式
     * @param category 当前被移动的分类配置
     */
    public handleCategoryMoveStart(category: CategoryConfig): void {
        this.categoryMoveManager.startCategoryMoveMode(category);
        this.categoryMoveModeRenderer.renderCategoryMoveModePanel(this.contentEl);
        this.addKeyboardEventListener();
    }

    /**
     * 进入分类移动模式，绑定 ESC 监听
     */
    public enterCategoryMoveMode(): void {
        this.addKeyboardEventListener();
    }

    /**
     * 添加键盘事件监听器，优先使用 Keymap Scope，不可用时回退到 DOM 事件
     */
    private addKeyboardEventListener(): void {
        if (!this.keyboardEventsRegistered) {
            // 优先使用 Keymap Scope，如果不可用则使用 DOM 事件
            if (this.scope) {
                // 使用 Keymap Scope 注册 ESC 键
                this.scope.register([], 'Escape', (evt) => {
                    evt.preventDefault();
                    evt.stopPropagation();
                    this.handleMoveEscKeyBinding();
                    return false;
                });
                this.keyboardEventsRegistered = true;
            } else {
                // 备选方案：使用 DOM 事件监听 ESC 键
                this.registerDomEvent(document, 'keydown', (evt: KeyboardEvent) => {
                    if (evt.key === 'Escape') {
                        evt.preventDefault();
                        evt.stopPropagation();
                        this.handleMoveEscKeyBinding();
                    }
                });
                this.keyboardEventsRegistered = true;
            }
        }
    }

    /**
     * 移除键盘事件监听器
     */
    private removeKeyboardEventListener(): void {
        if (this.keyboardEventsRegistered) {
            // scope.register 的绑定在视图卸载时会被框架清理
            this.keyboardEventsRegistered = false;
        }
    }
}
