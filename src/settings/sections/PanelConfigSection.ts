// PanelConfigSection.ts
// 用于在设置界面配置按钮面板的显示、样式、动画等参数。
import { Setting } from 'obsidian';
import { ButtonsPanelPlugin } from '@/types/plugin';
import { t } from '@/utils/i18n';

/**
 * createPanelConfigSection 创建面板设置区域。
 * 用于在设置界面配置按钮面板的显示、样式、动画等参数。
 * @param containerEl 容器元素
 * @param plugin 插件实例
 * @param onDisplayRefresh 刷新显示的回调函数
 */
export function createPanelConfigSection(
    containerEl: HTMLElement,
    plugin: ButtonsPanelPlugin,
    onDisplayRefresh?: () => void
): void {
    const panel = containerEl.createDiv('settings-panel');

    // 显示标题开关
    new Setting(panel)
        .setName(t('show_title'))
        .setDesc(t('show_title_desc'))
        .addToggle((toggle) =>
            toggle.setValue(plugin.settings.panelConfig.showTitle).onChange(async (value) => {
                plugin.settings.panelConfig.showTitle = value;
                await plugin.saveSettings();
                // 更新面板标题设置的显示状态
                updatePanelTitleSettingVisibility();
            })
        );

    // 面板标题设置
    const panelTitleSetting = new Setting(panel)
        .setName(t('panel_title_setting'))
        .setDesc(t('panel_title_desc'))
        .addText((text) =>
            text
                .setPlaceholder(t('panel_title_setting'))
                .setValue(plugin.settings.panelConfig.title)
                .onChange(async (value) => {
                    plugin.settings.panelConfig.title = value;
                    await plugin.saveSettings();
                })
        );

    // 更新面板标题设置显示状态的函数
    const updatePanelTitleSettingVisibility = () => {
        const isTitleHidden = !plugin.settings.panelConfig.showTitle;
        if (isTitleHidden) {
            panelTitleSetting.settingEl.addClass('is-disabled');
            panelTitleSetting.settingEl.addClass('is-hidden');
        } else {
            panelTitleSetting.settingEl.removeClass('is-disabled');
            panelTitleSetting.settingEl.removeClass('is-hidden');
        }
    };

    // 初始化显示状态
    updatePanelTitleSettingVisibility();

    new Setting(panel)
        .setName(t('button_panel_view'))
        .setDesc(t('button_panel_view_desc'))
        .addDropdown((dropdown) => {
            dropdown
                .addOption('list', t('list_view'))
                .addOption('tabs', t('tabs_view'))
                .setValue(plugin.settings.panelConfig.panelViewType || 'list')
                .onChange(async (value: 'list' | 'tabs') => {
                    plugin.settings.panelConfig.panelViewType = value;
                    await plugin.saveSettings();
                    // 更新标签页自动换行选项的显示状态
                    updateTabsWrapSettingVisibility();
                    // 更新列表视图自动折叠选项的显示状态
                    updateAutoCollapseListViewSettingVisibility();
                    onDisplayRefresh?.();
                });
        });

    // 列表视图：自动折叠设置（仅在 list 视图显示）
    const autoCollapseListViewSetting = new Setting(panel)
        .setName(t('auto_collapse_list_view'))
        .setDesc(t('auto_collapse_list_view_desc'))
        .addToggle((toggle) =>
            toggle
                .setValue(plugin.settings.panelConfig.autoCollapseListView ?? false)
                .onChange(async (value) => {
                    plugin.settings.panelConfig.autoCollapseListView = value;
                    await plugin.saveSettings();
                })
        );

    const updateAutoCollapseListViewSettingVisibility = () => {
        const isListView = plugin.settings.panelConfig.panelViewType === 'list';
        if (!isListView) {
            autoCollapseListViewSetting.settingEl.addClass('is-disabled');
            autoCollapseListViewSetting.settingEl.addClass('is-hidden');
        } else {
            autoCollapseListViewSetting.settingEl.removeClass('is-disabled');
            autoCollapseListViewSetting.settingEl.removeClass('is-hidden');
        }
    };

    // 标签页自动换行设置
    const tabsWrapSetting = new Setting(panel)
        .setName(t('tabs_wrap'))
        .setDesc(t('tabs_wrap_desc'))
        .addToggle((toggle) =>
            toggle
                .setValue(plugin.settings.panelConfig.tabsWrap ?? false)
                .onChange(async (value) => {
                    plugin.settings.panelConfig.tabsWrap = value;
                    await plugin.saveSettings();
                    onDisplayRefresh?.();
                })
        );

    // 更新标签页自动换行选项显示状态的函数
    const updateTabsWrapSettingVisibility = () => {
        const isTabsView = plugin.settings.panelConfig.panelViewType === 'tabs';
        if (!isTabsView) {
            tabsWrapSetting.settingEl.addClass('is-disabled');
            tabsWrapSetting.settingEl.addClass('is-hidden');
        } else {
            tabsWrapSetting.settingEl.removeClass('is-disabled');
            tabsWrapSetting.settingEl.removeClass('is-hidden');
        }
    };

    // 初始化显示状态
    updateTabsWrapSettingVisibility();
    updateAutoCollapseListViewSettingVisibility();

    new Setting(panel)
        .setName(t('button_display_style'))
        .setDesc(t('button_display_style_desc'))
        .addDropdown((dropdown) => {
            dropdown
                .addOption('default', t('icon_left'))
                .addOption('icon_top', t('icon_top'))
                .setValue(plugin.settings.panelConfig.displayStyle || 'default')
                .onChange(async (value: 'default' | 'icon_top') => {
                    plugin.settings.panelConfig.displayStyle = value;
                    await plugin.saveSettings();
                    onDisplayRefresh?.();
                });
        });

    new Setting(panel)
        .setName(t('enable_button_animation'))
        .setDesc(t('enable_button_animation_desc'))
        .addToggle((toggle) =>
            toggle
                .setValue(plugin.settings.panelConfig.enableAnimation ?? true)
                .onChange(async (value) => {
                    plugin.settings.panelConfig.enableAnimation = value;
                    await plugin.saveSettings();
                })
        );

    new Setting(panel)
        .setName(t('interaction_mode'))
        .setDesc(t('interaction_mode_desc'))
        .addDropdown((dropdown) =>
            dropdown
                .addOption('locked', t('interaction_locked'))
                .addOption('sort', t('interaction_sort'))
                .addOption('edit', t('interaction_edit'))
                .setValue(plugin.settings.panelConfig.interactionMode ?? 'sort')
                .onChange(async (value: 'locked' | 'sort' | 'edit') => {
                    plugin.settings.panelConfig.interactionMode = value;
                    await plugin.saveSettings();
                    onDisplayRefresh?.();
                })
        );

    // 新增：显示顶部导航栏开关
    new Setting(panel)
        .setName(t('show_top_nav_bar'))
        .setDesc(t('show_top_nav_bar_desc'))
        .addToggle((toggle) =>
            toggle
                .setValue(plugin.settings.panelConfig.showTopNavBar ?? true)
                .onChange(async (value) => {
                    plugin.settings.panelConfig.showTopNavBar = value;
                    await plugin.saveSettings();
                    onDisplayRefresh?.();
                })
        );
}
