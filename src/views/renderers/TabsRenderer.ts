// TabsRenderer.ts
// 标签页渲染器，负责渲染按钮面板的标签页视图。
import { App, ButtonComponent, Menu, setIcon } from 'obsidian';
import { ButtonConfig, CategoryConfig } from '@/common/types';
import { t } from '@/common/utils/i18n';
import { CategoryCreateModal } from '@/common/modals/CategoryCreateModal';
import { CategoryEditModal } from '@/common/modals/CategoryEditModal';
import { CategoryDeleteModal } from '@/common/modals/CategoryDeleteModal';
import { ButtonCreateModal } from '@/common/modals/ButtonCreateModal';
import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { ViewStateManager } from '@/views/managers/ViewStateManager';
import { CategoryMoveManager } from '@/views/managers/CategoryMoveManager';
import { ButtonRenderer } from '@/views/renderers/ButtonRenderer';

/**
 * TabsRenderer 标签页渲染器。
 * 负责渲染按钮面板的标签页视图，包括标签栏、标签内容、右键菜单、移动模式等。
 * 遵循单一职责原则，只负责标签页渲染。
 */
export class TabsRenderer {
    private plugin: ButtonsPanelPlugin;
    private stateManager: ViewStateManager;
    private categoryMoveManager: CategoryMoveManager;
    private buttonRenderer: ButtonRenderer;
    private app: any;
    private moveManager: any;
    private mainView: any; // 主视图引用

    /**
     * 构造函数，初始化渲染器依赖。
     * @param plugin 插件主类实例
     * @param stateManager 视图状态管理器
     * @param categoryMoveManager 分类移动管理器
     * @param buttonRenderer 按钮渲染器
     * @param app Obsidian应用实例
     * @param moveManager 按钮移动管理器
     * @param mainView 主视图实例
     */
    constructor(
        plugin: ButtonsPanelPlugin,
        stateManager: ViewStateManager,
        categoryMoveManager: CategoryMoveManager,
        buttonRenderer: ButtonRenderer,
        app: App,
        moveManager?: any,
        mainView?: any
    ) {
        this.plugin = plugin;
        this.stateManager = stateManager;
        this.categoryMoveManager = categoryMoveManager;
        this.buttonRenderer = buttonRenderer;
        this.app = app;
        this.moveManager = moveManager;
        this.mainView = mainView;
    }

    /**
     * 渲染标签页视图。
     * @param container 容器元素
     * @param groupedButtons 按分类分组的按钮
     * @param sortedCategories 排序后的分类数组
     * @param panelConfig 面板配置
     * @param onMoveStart 按钮移动回调
     * @param onRenderComplete 渲染完成回调
     */
    renderTabsView(
        container: HTMLElement,
        groupedButtons: Record<string, ButtonConfig[]>,
        sortedCategories: CategoryConfig[],
        panelConfig: any,
        onMoveStart?: (button: ButtonConfig, buttonEl: HTMLElement) => void,
        onRenderComplete?: () => void
    ): void {
        const tabsContainer = container.createDiv('buttons-panel-tab-bar-container');

        // 创建标签栏
        const tabBar = tabsContainer.createDiv('buttons-panel-tab-bar');

        // 设置默认激活标签
        this.setDefaultActiveTab(sortedCategories);

        // 渲染标签
        this.renderTabs(tabBar, sortedCategories, groupedButtons, panelConfig, onMoveStart);

        // 创建标签内容区域
        const tabContent = tabsContainer.createDiv('buttons-panel-tab-content');
        const activeTabId = this.stateManager.getActiveTabId();
        if (activeTabId) {
            this.renderTabContent(
                tabContent,
                groupedButtons[activeTabId],
                panelConfig,
                onMoveStart
            );
        }

        // 添加分类按钮
        this.addCategoryButton(tabBar, panelConfig);

        // 处理分类移动模式
        this.handleCategoryMoveMode(tabBar, sortedCategories);

        if (onRenderComplete) {
            onRenderComplete();
        }
    }

    /**
     * 设置默认激活标签。
     * @param sortedCategories 排序后的分类数组
     */
    private setDefaultActiveTab(sortedCategories: CategoryConfig[]): void {
        const activeTabId = this.stateManager.getActiveTabId();
        if (!activeTabId || !sortedCategories.some((cat) => cat.id === activeTabId)) {
            this.stateManager.setActiveTabId(sortedCategories[0]?.id || null);
        }
    }

    /**
     * 渲染标签栏中的所有标签。
     * @param tabBar 标签栏容器
     * @param sortedCategories 排序后的分类数组
     * @param groupedButtons 按分类分组的按钮
     * @param panelConfig 面板配置
     * @param onMoveStart 按钮移动回调
     */
    private renderTabs(
        tabBar: HTMLElement,
        sortedCategories: CategoryConfig[],
        groupedButtons: Record<string, ButtonConfig[]>,
        panelConfig: any,
        onMoveStart?: (button: ButtonConfig, buttonEl: HTMLElement) => void
    ): void {
        sortedCategories.forEach((category) => {
            const tabEl = tabBar.createDiv('buttons-panel-tab');

            // 渲染标签图标
            this.renderTabIcon(tabEl);

            // 渲染标签文字
            tabEl.createSpan({ text: category.name, cls: 'tab-lable' });

            // 设置激活状态
            const activeTabId = this.stateManager.getActiveTabId();
            tabEl.toggleClass('is-active', category.id === activeTabId);

            // 绑定点击事件
            this.bindTabClickEvent(tabEl, category, groupedButtons, panelConfig, onMoveStart);

            // 绑定右键菜单
            if (panelConfig.enableEditMode) {
                this.bindTabContextMenu(tabEl, category);
            }

            // 分类移动模式下高亮
            this.highlightMovingCategory(tabEl, category);
        });
    }

    /**
     * 渲染标签图标。
     * @param tabEl 标签元素
     */
    private renderTabIcon(tabEl: HTMLElement): void {
        const iconEl = tabEl.createSpan({ cls: 'tab-icon' });
        setIcon(iconEl, 'layout-grid');
    }

    /**
     * 绑定标签点击事件。
     * @param tabEl 标签元素
     * @param category 分类对象
     * @param groupedButtons 按分类分组的按钮
     * @param panelConfig 面板配置
     * @param onMoveStart 按钮移动回调
     */
    private bindTabClickEvent(
        tabEl: HTMLElement,
        category: CategoryConfig,
        groupedButtons: Record<string, ButtonConfig[]>,
        panelConfig: any,
        onMoveStart?: (button: ButtonConfig, buttonEl: HTMLElement) => void
    ): void {
        tabEl.addEventListener('click', () => {
            this.stateManager.setActiveTabId(category.id);

            // 更新标签激活状态
            tabEl.parentElement
                ?.querySelectorAll('.buttons-panel-tab')
                .forEach((tab) => tab.removeClass('is-active'));
            tabEl.addClass('is-active');

            // 重新渲染内容
            const tabContent = tabEl
                .closest('.buttons-panel-tab-bar-container')
                ?.querySelector('.buttons-panel-tab-content');
            if (tabContent) {
                this.renderTabContent(
                    tabContent as HTMLElement,
                    groupedButtons[category.id],
                    panelConfig,
                    onMoveStart
                );
            }
        });
    }

    /**
     * 绑定标签右键菜单。
     * @param tabEl 标签元素
     * @param category 分类对象
     */
    private bindTabContextMenu(tabEl: HTMLElement, category: CategoryConfig): void {
        tabEl.addEventListener('contextmenu', (e) => {
            if (!tabEl.hasClass('is-active')) return; // 仅激活标签可弹出菜单
            if (this.stateManager.isInAnyMoveMode()) return; // 移动模式下禁用

            e.preventDefault();
            e.stopPropagation();

            const menu = new Menu();

            // 移动选项
            menu.addItem((item: any) =>
                item
                    .setTitle(t('move'))
                    .setIcon('move')
                    .onClick(() => {
                        // 直接调用主视图的分类移动方法
                        if (
                            this.mainView &&
                            typeof this.mainView.handleCategoryMoveStart === 'function'
                        ) {
                            this.mainView.handleCategoryMoveStart(category);
                        }
                    })
            );

            // 编辑选项
            menu.addItem((item: any) =>
                item
                    .setTitle(t('edit'))
                    .setIcon('pencil')
                    .onClick(() => {
                        new CategoryEditModal(this.app, this.plugin, category, async () => {
                            await this.plugin.saveSettings();
                        }).open();
                    })
            );

            // 复制选项
            menu.addItem((item: any) =>
                item
                    .setTitle(t('copy'))
                    .setIcon('copy')
                    .onClick(async () => {
                        const newCategory = JSON.parse(JSON.stringify(category));
                        newCategory.id =
                            Date.now().toString() + Math.random().toString(36).substring(2, 9);
                        newCategory.name = category.name;
                        newCategory.buttons.forEach((btn: ButtonConfig) => {
                            btn.id =
                                Date.now().toString() + Math.random().toString(36).substring(2, 9);
                        });
                        this.plugin.settings.categories.push(newCategory);
                        await this.plugin.saveSettings();
                    })
            );

            // 删除选项
            menu.addItem((item: any) =>
                item
                    .setTitle(t('delete'))
                    .setIcon('trash')
                    .onClick(() => {
                        new CategoryDeleteModal(this.app, this.plugin, category, async () => {
                            await this.plugin.saveSettings();
                        }).open();
                    })
            );

            menu.showAtPosition({ x: e.clientX, y: e.clientY });
        });
    }

    /**
     * 高亮移动中的分类。
     * @param tabEl 标签元素
     * @param category 分类对象
     */
    private highlightMovingCategory(tabEl: HTMLElement, category: CategoryConfig): void {
        const moveCategoryState = this.stateManager.getMoveCategoryState();
        if (
            moveCategoryState.isMoving &&
            moveCategoryState.movingCategory &&
            category.id === moveCategoryState.movingCategory.id
        ) {
            tabEl.classList.add('moving-category');
        }
    }

    /**
     * 渲染标签内容。
     * @param container 标签内容容器
     * @param buttons 按钮数组
     * @param panelConfig 面板配置
     * @param onMoveStart 按钮移动回调
     */
    private renderTabContent(
        container: HTMLElement,
        buttons: ButtonConfig[],
        panelConfig: any,
        onMoveStart?: (button: ButtonConfig, buttonEl: HTMLElement) => void
    ): void {
        container.empty();

        // 渲染按钮网格时，自动添加 icon-top 或 icon-left 类
        const gridStyleClass = panelConfig.displayStyle === 'icon_top' ? 'icon-top' : 'icon-left';
        const buttonsContainer = container.createDiv('buttons-panel-grid ' + gridStyleClass);
        const isInMoveMode = this.stateManager.isInMoveMode();
        buttons.forEach((button) => {
            this.buttonRenderer.renderButton(
                buttonsContainer,
                button,
                panelConfig,
                onMoveStart,
                isInMoveMode,
                this.moveManager
            );
        });

        // 分类内加号按钮
        if (!this.stateManager.isInCategoryMoveMode() && panelConfig.enableEditMode) {
            const activeTabId = this.stateManager.getActiveTabId();
            const category = this.plugin.settings.categories.find((cat) => cat.id === activeTabId);
            if (category) {
                const addBtn = new ButtonComponent(buttonsContainer.createDiv('add-button-card'))
                    .setIcon('plus')
                    .setTooltip(t('add_button'))
                    .onClick(() => {
                        new ButtonCreateModal(this.app, this.plugin, category, async () => {
                            await this.plugin.saveSettings();
                            // 可选：刷新面板
                        }).open();
                    });
                addBtn.buttonEl.classList.add('add-button-btn');
            }
        }
    }

    /**
     * 添加分类按钮。
     * @param tabBar 标签栏容器
     * @param panelConfig 面板配置
     */
    private addCategoryButton(tabBar: HTMLElement, panelConfig: any): void {
        if (panelConfig.enableEditMode && !this.stateManager.isInCategoryMoveMode()) {
            const addTabBtn = new ButtonComponent(
                tabBar.createDiv('buttons-panel-tab add-category-card')
            )
                .setIcon('plus')
                .setTooltip(t('add_category'))
                .onClick(() => {
                    new CategoryCreateModal(this.app, this.plugin, async (categoryName: string) => {
                        const newCategory = {
                            id: Date.now().toString(),
                            name: categoryName,
                            order: this.plugin.settings.categories.length,
                            buttons: [],
                        };
                        this.plugin.settings.categories.push(newCategory);
                        await this.plugin.saveSettings();
                        if (this.mainView && typeof this.mainView.renderPanel === 'function') {
                            this.mainView.renderPanel();
                        }
                    }).open();
                });
            addTabBtn.buttonEl.classList.add('add-category-btn');
            // addTabBtn.buttonEl.classList.add('tab-icon');
        }
    }

    /**
     * 处理分类移动模式。
     * @param tabBar 标签栏容器
     * @param sortedCategories 排序后的分类数组
     */
    private handleCategoryMoveMode(tabBar: HTMLElement, sortedCategories: CategoryConfig[]): void {
        if (this.stateManager.isInCategoryMoveMode()) {
            // 所有标签高亮可点击
            tabBar.querySelectorAll('.buttons-panel-tab').forEach((tab, idx) => {
                tab.classList.add('move-category-target');

                // 移除旧事件并绑定新事件
                const newTab = tab as HTMLElement;
                const newTabClone = newTab.cloneNode(true) as HTMLElement;
                newTab.parentNode?.replaceChild(newTabClone, newTab);

                const targetCategory = sortedCategories[idx];
                newTabClone.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const moveCategoryState = this.stateManager.getMoveCategoryState();
                    if (!moveCategoryState.movingCategory) return;

                    this.categoryMoveManager.handleCategoryMoveClick(
                        moveCategoryState.movingCategory,
                        targetCategory
                    );
                });
            });

            // 分类移动模式下不再单独绑定 ESC，统一由主视图监听
        }
    }
}
