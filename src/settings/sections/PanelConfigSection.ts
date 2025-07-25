// PanelConfigSection.ts
// 用于在设置界面配置按钮面板的显示、样式、动画等参数。
import { Setting } from 'obsidian';
import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { t } from '@/common/utils/i18n';

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
    // 新增：卡片包裹，风格与按钮管理一致
    const card = containerEl.createDiv('settings-card-group');

    new Setting(card)
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

    new Setting(card)
        .setName(t('show_title'))
        .setDesc(t('show_title_desc'))
        .addToggle((toggle) =>
            toggle.setValue(plugin.settings.panelConfig.showTitle).onChange(async (value) => {
                plugin.settings.panelConfig.showTitle = value;
                await plugin.saveSettings();
            })
        );

    new Setting(card)
        .setName(t('panel_height'))
        .setDesc(t('panel_height_desc'))
        .addText((text) =>
            text
                .setPlaceholder(t('auto'))
                .setValue(plugin.settings.panelConfig.panelHeight)
                .onChange(async (value) => {
                    let v = value.trim();
                    if (/^\d+$/.test(v)) {
                        v = v + 'px';
                    }
                    plugin.settings.panelConfig.panelHeight = v;
                    await plugin.saveSettings();
                })
        );

    new Setting(card)
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
                    onDisplayRefresh?.();
                });
        });

    new Setting(card)
        .setName(t('button_display_style'))
        .setDesc(t('button_display_style_desc'))
        .addDropdown((dropdown) => {
            dropdown
                .addOption('default', t('icon_text_same_line'))
                .addOption('icon_top', t('icon_top_text_bottom'))
                .setValue(plugin.settings.panelConfig.displayStyle || 'default')
                .onChange(async (value: 'default' | 'icon_top') => {
                    plugin.settings.panelConfig.displayStyle = value;
                    await plugin.saveSettings();
                    onDisplayRefresh?.();
                });
        });

    new Setting(card)
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

    new Setting(card)
        .setName(t('enable_edit_mode') || '启用编辑模式')
        .setDesc(t('enable_edit_mode_desc') || '开启后可在按钮面板进行分类和按钮的编辑、移动等操作')
        .addToggle((toggle) =>
            toggle
                .setValue(plugin.settings.panelConfig.enableEditMode ?? false)
                .onChange(async (value) => {
                    plugin.settings.panelConfig.enableEditMode = value;
                    await plugin.saveSettings();
                    onDisplayRefresh?.();
                })
        );

    // 新增：显示顶部导航栏开关
    new Setting(card)
        .setName('显示顶部导航栏')
        .setDesc('控制顶部三个功能图标的显示/隐藏')
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
