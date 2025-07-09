import {Setting} from 'obsidian';
import {ButtonsPanelPlugin} from '../../types/plugin';
import {t} from '../../utils/i18n';

/**
 * 创建面板设置区域
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
		.setName(t('panel_title_setting', plugin))
		.setDesc(t('panel_title_desc', plugin))
		.addText(text => text
			.setPlaceholder(t('panel_title_setting', plugin))
			.setValue(plugin.settings.panelConfig.title)
			.onChange(async (value) => {
				plugin.settings.panelConfig.title = value;
				await plugin.saveSettings();
			}));

	new Setting(card)
		.setName(t('show_title', plugin))
		.setDesc(t('show_title_desc', plugin))
		.addToggle(toggle => toggle
			.setValue(plugin.settings.panelConfig.showTitle)
			.onChange(async (value) => {
				plugin.settings.panelConfig.showTitle = value;
				await plugin.saveSettings();
			}));

	new Setting(card)
		.setName(t('panel_height', plugin))
		.setDesc(t('panel_height_desc', plugin))
		.addText(text => text
			.setPlaceholder(t('auto', plugin))
			.setValue(plugin.settings.panelConfig.panelHeight)
			.onChange(async (value) => {
				let v = value.trim();
				if (/^\d+$/.test(v)) {
					v = v + 'px';
				}
				plugin.settings.panelConfig.panelHeight = v;
				await plugin.saveSettings();
			}));

	new Setting(card)
		.setName(t('button_panel_view', plugin))
		.setDesc(t('button_panel_view_desc', plugin))
		.addDropdown(dropdown => {
			dropdown
				.addOption('list', t('list_view', plugin))
				.addOption('tabs', t('tabs_view', plugin))
				.setValue(plugin.settings.panelConfig.panelViewType || 'list')
				.onChange(async (value: 'list' | 'tabs') => {
					plugin.settings.panelConfig.panelViewType = value;
					await plugin.saveSettings();
					onDisplayRefresh?.();
				});
		});

	new Setting(card)
		.setName(t('button_display_style', plugin))
		.setDesc(t('button_display_style_desc', plugin))
		.addDropdown(dropdown => {
			dropdown
				.addOption('default', t('icon_text_same_line', plugin))
				.addOption('icon_top', t('icon_top_text_bottom', plugin))
				.setValue(plugin.settings.panelConfig.displayStyle || 'default')
				.onChange(async (value: 'default' | 'icon_top') => {
					plugin.settings.panelConfig.displayStyle = value;
					await plugin.saveSettings();
					onDisplayRefresh?.();
				});
		});

	new Setting(card)
		.setName(t('enable_button_animation', plugin))
		.setDesc(t('enable_button_animation_desc', plugin))
		.addToggle(toggle => toggle
			.setValue(plugin.settings.panelConfig.enableAnimation ?? true)
			.onChange(async (value) => {
				plugin.settings.panelConfig.enableAnimation = value;
				await plugin.saveSettings();
			}));

	new Setting(card)
		.setName('启用按钮右键菜单')
		.setDesc('开启后，右侧按钮面板的按钮支持右键菜单（编辑/复制/删除）')
		.addToggle(toggle => toggle
			.setValue(plugin.settings.panelConfig.enableButtonContextMenu ?? false)
			.onChange(async (value) => {
				plugin.settings.panelConfig.enableButtonContextMenu = value;
				await plugin.saveSettings();
			}));
} 
