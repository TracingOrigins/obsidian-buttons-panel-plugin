// PanelRenderer.ts
// 面板渲染器，负责渲染按钮面板的主体结构。
import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { ButtonConfig, PanelConfig } from '@/common/types';
import { t } from '@/common/utils/i18n';
import { setIcon } from 'obsidian';
import { TabsRenderer } from '@/views/renderers/TabsRenderer';
import { ListRenderer } from '@/views/renderers/ListRenderer';
import { ViewStateManager } from '@/views/managers/ViewStateManager';

/**
 * PanelRenderer 面板渲染器。
 * 负责渲染按钮面板的主体结构、标题、移动模式提示、主内容等。
 * 遵循单一职责原则，只负责面板主体渲染。
 */
export class PanelRenderer {
    private plugin: ButtonsPanelPlugin;
    private stateManager: ViewStateManager;
    private tabsRenderer: TabsRenderer;
    private listRenderer: ListRenderer;

    /**
     * 构造函数，初始化渲染器依赖。
     * @param plugin 插件主类实例
     * @param stateManager 视图状态管理器
     * @param tabsRenderer 标签页渲染器
     * @param listRenderer 列表渲染器
     */
    constructor(
        plugin: ButtonsPanelPlugin,
        stateManager: ViewStateManager,
        tabsRenderer: TabsRenderer,
        listRenderer: ListRenderer
    ) {
        this.plugin = plugin;
        this.stateManager = stateManager;
        this.tabsRenderer = tabsRenderer;
        this.listRenderer = listRenderer;
    }

    /**
     * 渲染面板主体。
     * @param container 容器元素
     * @param panelConfig 面板配置
     * @param onMoveStart 按钮移动回调
     * @param onRenderComplete 渲染完成回调
     */
    renderPanel(
        container: HTMLElement,
        panelConfig: PanelConfig,
        onMoveStart?: (button: ButtonConfig, buttonEl: HTMLElement) => void,
        onRenderComplete?: () => void
    ): void {
        try {
            container.empty();
            const panelEl = container.createDiv('buttons-panel-container');
            if (this.stateManager.isInCategoryMoveMode()) {
                this.renderMoveModeTip(panelEl);
                this.renderMainContent(panelEl, panelConfig, onMoveStart, onRenderComplete);
                return;
            }
            if (this.stateManager.isInMoveMode()) {
                this.renderMoveModeTip(panelEl);
                this.renderMainContent(panelEl, panelConfig, onMoveStart, onRenderComplete);
                return;
            }
            this.renderPanelTitle(panelEl, panelConfig);
            this.renderMoveModeTip(panelEl);
            this.renderMainContent(panelEl, panelConfig, onMoveStart, onRenderComplete);
        } catch (error) {
            console.error('渲染按钮面板时出错:', error);
        } finally {
            this.stateManager.setIsRendering(false);
        }
    }

    /**
     * 渲染面板标题。
     * @param panelEl 面板元素
     * @param panelConfig 面板配置
     */
    private renderPanelTitle(panelEl: HTMLElement, panelConfig: PanelConfig): void {
        if (panelConfig.showTitle) {
            const titleEl = panelEl.createEl('h2', { text: panelConfig.title });
            titleEl.addClass('buttons-panel-title');
        }
    }

    /**
     * 渲染移动模式提示。
     * @param panelEl 面板元素
     */
    private renderMoveModeTip(panelEl: HTMLElement): void {
        if (this.stateManager.isInMoveMode()) {
            const moveTip = panelEl.createDiv('move-mode-tip');
            const tipContainer = moveTip.createDiv();
            const titleEl = tipContainer.createEl('strong');
            titleEl.textContent = t('button_move_mode');
            tipContainer.createEl('br');
            const descEl = tipContainer.createEl('span');
            descEl.textContent = t('button_move_mode_desc');
            return;
        }
        if (this.stateManager.isInCategoryMoveMode()) {
            const moveTip = panelEl.createDiv('move-mode-tip');
            const tipContainer = moveTip.createDiv();
            const titleEl = tipContainer.createEl('strong');
            titleEl.textContent = t('category_move_mode');
            tipContainer.createEl('br');
            const descEl = tipContainer.createEl('span');
            descEl.textContent = t('category_move_mode_desc');
        }
    }

    /**
     * 渲染操作按钮（预留，暂未实现）。
     * @param panelEl 面板元素
     * @param panelConfig 面板配置
     */
    private renderActionButtons(_panelEl: HTMLElement, _panelConfig: PanelConfig): void {
        // 暂时跳过操作按钮的渲染，专注于主要内容
        // TODO: 后续优化操作按钮的渲染逻辑
    }

    /**
     * 创建视图切换按钮（预留，暂未实现）。
     * @param actionsGroup 操作按钮分组容器
     * @param panelConfig 面板配置
     */
    private createViewToggleButton(actionsGroup: HTMLElement, panelConfig: PanelConfig): void {
        const viewBtn = document.createElement('div');
        viewBtn.className = 'panel-action-btn view-btn clickable-icon nav-action-button';
        viewBtn.setAttr(
            'aria-label',
            panelConfig.panelViewType === 'tabs' ? t('list_view') : t('tabs_view')
        );
        setIcon(viewBtn, 'view');
        viewBtn.onclick = () => {
            panelConfig.panelViewType = panelConfig.panelViewType === 'tabs' ? 'list' : 'tabs';
            void this.plugin.saveSettings();
            // 触发重新渲染 - 通过事件通知
            document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
        };
        actionsGroup.appendChild(viewBtn);
    }

    /**
     * 创建样式切换按钮（预留，暂未实现）。
     * @param actionsGroup 操作按钮分组容器
     * @param panelConfig 面板配置
     */
    private createStyleToggleButton(actionsGroup: HTMLElement, panelConfig: PanelConfig): void {
        const styleBtn = document.createElement('div');
        styleBtn.className = 'panel-action-btn style-btn clickable-icon nav-action-button';
        styleBtn.setAttr(
            'aria-label',
            panelConfig.displayStyle === 'icon_top'
                ? t('icon_text_same_line')
                : t('icon_top_text_bottom')
        );
        setIcon(styleBtn, 'aperture');
        styleBtn.onclick = () => {
            panelConfig.displayStyle =
                panelConfig.displayStyle === 'icon_top' ? 'default' : 'icon_top';
            void this.plugin.saveSettings();
            // 触发重新渲染 - 通过事件通知
            document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
        };
        actionsGroup.appendChild(styleBtn);
    }

    /**
     * 创建设置按钮（预留，暂未实现）。
     * @param actionsGroup 操作按钮分组容器
     */
    private createSettingsButton(actionsGroup: HTMLElement): void {
        const settingsBtn = document.createElement('div');
        settingsBtn.className = 'panel-action-btn settings-btn clickable-icon nav-action-button';
        settingsBtn.setAttr('aria-label', t('buttons_panel_options'));
        setIcon(settingsBtn, 'settings');
        settingsBtn.onclick = () => {
            const pluginWithSettings = this.plugin as unknown as {
                activateSettingsView?: () => void;
            };
            pluginWithSettings.activateSettingsView?.();
        };
        actionsGroup.appendChild(settingsBtn);
    }

    /**
     * 渲染主要内容。
     * @param panelEl 面板元素
     * @param panelConfig 面板配置
     * @param onMoveStart 按钮移动回调
     * @param onRenderComplete 渲染完成回调
     */
    private renderMainContent(
        panelEl: HTMLElement,
        panelConfig: PanelConfig,
        onMoveStart?: (button: ButtonConfig, buttonEl: HTMLElement) => void,
        onRenderComplete?: () => void
    ): void {
        // 按分类分组按钮
        const groupedButtons = this.plugin.settings.categories.reduce(
            (acc, category) => {
                acc[category.id] = category.buttons;
                return acc;
            },
            {} as Record<string, ButtonConfig[]>
        );

        // 保证分类顺序与设置一致
        const sortedCategories = this.plugin.settings.categories.sort((a, b) => a.order - b.order);

        const panelViewType = panelConfig.panelViewType || 'list';

        if (!sortedCategories.length) {
            panelEl.createDiv({ text: '请先在设置中添加分类', cls: 'no-categories-warning' });
            return;
        }

        if (panelViewType === 'tabs') {
            this.tabsRenderer.renderTabsView(
                panelEl,
                groupedButtons,
                sortedCategories,
                panelConfig,
                onMoveStart,
                onRenderComplete
            );
        } else {
            this.listRenderer.renderListView(
                panelEl,
                groupedButtons,
                sortedCategories,
                panelConfig,
                onMoveStart,
                onRenderComplete
            );
        }
    }

    /**
     * 高亮移动模式（预留，暂未实现）。
     * @param panelEl 面板元素
     */
    private highlightMoveMode(panelEl: HTMLElement): void {
        if (panelEl) {
            if (
                this.stateManager.isInCategoryMoveMode() &&
                this.stateManager.getMoveCategoryState().movingCategory
            ) {
                panelEl.classList.add('category-move-mode');
            } else {
                panelEl.classList.remove('category-move-mode');
            }
        }
    }
}
