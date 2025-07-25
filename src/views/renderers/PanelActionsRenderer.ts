// PanelActionsRenderer.ts
// 面板操作按钮渲染器，负责渲染面板顶部的操作按钮区域。
import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { PanelConfig } from '@/common/types';
import { t } from '@/common/utils/i18n';
import { setIcon } from 'obsidian';
import { refreshAllSettingsViews } from '@/common/utils/obsidian';

/**
 * PanelActionsRenderer 面板操作按钮渲染器。
 * 负责渲染面板顶部的视图切换、样式切换、编辑模式、设置等操作按钮。
 * 遵循单一职责原则，只负责操作按钮的渲染。
 */
export class PanelActionsRenderer {
    private plugin: ButtonsPanelPlugin;
    private panelConfig: PanelConfig;

    /**
     * 构造函数，初始化渲染器依赖。
     * @param plugin 插件主类实例
     * @param panelConfig 面板配置
     */
    constructor(plugin: ButtonsPanelPlugin, panelConfig: PanelConfig) {
        this.plugin = plugin;
        this.panelConfig = panelConfig;
    }

    /**
     * 创建面板操作按钮区域。
     * @param containerEl 容器元素
     * @param onRenderComplete 渲染完成回调
     */
    createPanelActions(containerEl: HTMLElement, onRenderComplete?: () => void): void {
        // 在 .view-header 之前插入 .panel-actions（外层）和 .panel-actions-group（内层）
        let actionsWrapper = containerEl.querySelector('.panel-actions') as HTMLElement;
        let actionsGroup = containerEl.querySelector('.panel-actions-group') as HTMLElement;

        if (!actionsWrapper) {
            actionsWrapper = document.createElement('div');
            actionsWrapper.className = 'panel-actions nav-header';
            const viewContent = containerEl.querySelector('.view-header');
            if (viewContent) {
                viewContent.parentNode?.insertBefore(actionsWrapper, viewContent);
            } else {
                containerEl.prepend(actionsWrapper);
            }
        }

        if (!actionsGroup) {
            actionsGroup = document.createElement('div');
            actionsGroup.className = 'panel-actions-group nav-buttons-container';
            actionsWrapper.appendChild(actionsGroup);
        }

        // 保证 actionsGroup 在 actionsWrapper 内
        if (actionsGroup.parentElement !== actionsWrapper) {
            actionsWrapper.appendChild(actionsGroup);
        }

        // 清空操作按钮容器
        while (actionsGroup.firstChild) {
            actionsGroup.removeChild(actionsGroup.firstChild);
        }

        if (this.panelConfig.showTopNavBar) {
            // 切换视图按钮
            this.createViewToggleButton(actionsGroup);

            // 切换按钮样式按钮
            this.createStyleToggleButton(actionsGroup);

            // 编辑模式开关按钮
            this.createEditModeToggleButton(actionsGroup);

            // 打开设置按钮
            this.createSettingsButton(actionsGroup);

            actionsWrapper.classList.remove('is-hidden');
        } else {
            actionsWrapper.addClass('is-hidden');
        }

        if (onRenderComplete) {
            onRenderComplete();
        }
    }

    /**
     * 创建视图切换按钮。
     * @param actionsGroup 操作按钮分组容器
     */
    private createViewToggleButton(actionsGroup: HTMLElement): void {
        const viewBtn = document.createElement('div');
        viewBtn.className = 'panel-action-btn view-btn clickable-icon nav-action-button';
        viewBtn.setAttr(
            'aria-label',
            this.panelConfig.panelViewType === 'tabs' ? t('list_view') : t('tabs_view')
        );
        setIcon(viewBtn, 'view');
        viewBtn.onclick = () => {
            this.panelConfig.panelViewType =
                this.panelConfig.panelViewType === 'tabs' ? 'list' : 'tabs';
            this.plugin.saveSettings();
            // 触发视图刷新
            document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));

            // 如果当前有设置页面，刷新所有设置页面
            refreshAllSettingsViews(this.plugin.app);
        };
        actionsGroup.appendChild(viewBtn);
    }

    /**
     * 创建样式切换按钮。
     * @param actionsGroup 操作按钮分组容器
     */
    private createStyleToggleButton(actionsGroup: HTMLElement): void {
        const styleBtn = document.createElement('div');
        styleBtn.className = 'panel-action-btn style-btn clickable-icon nav-action-button';
        styleBtn.setAttr(
            'aria-label',
            this.panelConfig.displayStyle === 'icon_top'
                ? t('icon_text_same_line')
                : t('icon_top_text_bottom')
        );
        setIcon(styleBtn, 'aperture');
        styleBtn.onclick = () => {
            this.panelConfig.displayStyle =
                this.panelConfig.displayStyle === 'icon_top' ? 'default' : 'icon_top';
            this.plugin.saveSettings();
            // 触发视图刷新
            document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));

            // 如果当前有设置页面，刷新所有设置页面
            refreshAllSettingsViews(this.plugin.app);
        };
        actionsGroup.appendChild(styleBtn);
    }

    /**
     * 创建设置按钮。
     * @param actionsGroup 操作按钮分组容器
     */
    private createSettingsButton(actionsGroup: HTMLElement): void {
        const settingsBtn = document.createElement('div');
        settingsBtn.className = 'panel-action-btn settings-btn clickable-icon nav-action-button';
        settingsBtn.setAttr('aria-label', t('buttons_panel_settings'));
        setIcon(settingsBtn, 'settings');
        settingsBtn.onclick = () => {
            // @ts-ignore
            if (typeof this.plugin.activateSettingsView === 'function') {
                // @ts-ignore
                this.plugin.activateSettingsView();
            }
        };
        actionsGroup.appendChild(settingsBtn);
    }

    /**
     * 创建编辑模式开关按钮。
     * @param actionsGroup 操作按钮分组容器
     */
    private createEditModeToggleButton(actionsGroup: HTMLElement): void {
        const editBtn = document.createElement('div');
        editBtn.className = 'panel-action-btn edit-mode-btn clickable-icon nav-action-button';
        // 优化提示文字
        const isActive = !!this.panelConfig.enableEditMode;
        const label = isActive ? t('disable_edit_mode') || '关闭编辑模式' : t('enable_edit_mode');
        editBtn.setAttr('aria-label', label);
        setIcon(editBtn, 'edit');
        // 优化颜色：激活为蓝色，未激活为灰色（用CSS类控制）
        if (isActive) {
            editBtn.classList.add('is-active');
        } else {
            editBtn.classList.remove('is-active');
        }
        editBtn.onclick = () => {
            this.panelConfig.enableEditMode = !this.panelConfig.enableEditMode;
            this.plugin.saveSettings();
            // 触发视图刷新
            document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));

            // 如果当前有设置页面，刷新所有设置页面
            refreshAllSettingsViews(this.plugin.app);
        };
        actionsGroup.appendChild(editBtn);
    }

    /**
     * 更新面板配置。
     * @param panelConfig 新的面板配置
     */
    updatePanelConfig(panelConfig: PanelConfig): void {
        this.panelConfig = panelConfig;
    }
}
