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

    new Setting(panel)
        .setName(t('button_panel_view'))
        .setDesc(t('button_panel_view_desc'))
        .addDropdown((dropdown) => {
            dropdown
                .addOption('list', t('list_view'))
                .addOption('tabs', t('tabs_view'))
                .addOption('folder', t('folder_view'))
                .setValue(plugin.settings.panelConfig.panelViewType || 'list')
                .onChange(async (value: string) => {
                    plugin.settings.panelConfig.panelViewType = value as 'list' | 'tabs' | 'folder';
                    await plugin.saveSettings();
                    updateTabsWrapSettingVisibility();
                    updateAutoCollapseListViewSettingVisibility();
                    updateFolderSettingsVisibility();
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

    // ---- 文件夹视图专有设置 ----

    // 文件夹视图：名称可编辑
    const folderNameEditableSetting = new Setting(panel)
        .setName(t('folder_name_editable'))
        .setDesc(t('folder_name_editable_desc'))
        .addToggle((toggle) =>
            toggle
                .setValue(plugin.settings.panelConfig.folderDetailNameEditable ?? true)
                .onChange(async (value) => {
                    plugin.settings.panelConfig.folderDetailNameEditable = value;
                    await plugin.saveSettings();
                })
        );

    // 文件夹视图：显示按钮个数
    const folderShowBtnCountSetting = new Setting(panel)
        .setName(t('folder_show_btn_count'))
        .setDesc(t('folder_show_btn_count_desc'))
        .addToggle((toggle) =>
            toggle
                .setValue(plugin.settings.panelConfig.folderShowBtnCount ?? true)
                .onChange(async (value) => {
                    plugin.settings.panelConfig.folderShowBtnCount = value;
                    await plugin.saveSettings();
                    onDisplayRefresh?.();
                })
        );

    // 文件夹视图：点击空白处关闭
    const folderCloseOnBlankClickSetting = new Setting(panel)
        .setName(t('folder_close_on_blank'))
        .setDesc(t('folder_close_on_blank_desc'))
        .addToggle((toggle) =>
            toggle
                .setValue(plugin.settings.panelConfig.folderCloseOnBlankClick ?? false)
                .onChange(async (value) => {
                    plugin.settings.panelConfig.folderCloseOnBlankClick = value;
                    await plugin.saveSettings();
                })
        );

    const updateFolderSettingsVisibility = () => {
        const isFolderView = plugin.settings.panelConfig.panelViewType === 'folder';
        const method = isFolderView ? 'removeClass' : 'addClass';
        folderNameEditableSetting.settingEl[method]('is-disabled');
        folderNameEditableSetting.settingEl[method]('is-hidden');
        folderShowBtnCountSetting.settingEl[method]('is-disabled');
        folderShowBtnCountSetting.settingEl[method]('is-hidden');
        folderCloseOnBlankClickSetting.settingEl[method]('is-disabled');
        folderCloseOnBlankClickSetting.settingEl[method]('is-hidden');
    };

    updateFolderSettingsVisibility();

    new Setting(panel)
        .setName(t('button_display_style'))
        .setDesc(t('button_display_style_desc'))
        .addDropdown((dropdown) => {
            dropdown
                .addOption('default', t('icon_left'))
                .addOption('icon_top', t('icon_top'))
                .setValue(plugin.settings.panelConfig.displayStyle || 'default')
                .onChange(async (value: string) => {
                    plugin.settings.panelConfig.displayStyle = value as 'default' | 'icon_top';
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
                .onChange(async (value: string) => {
                    plugin.settings.panelConfig.interactionMode = value as 'locked' | 'sort' | 'edit';
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
