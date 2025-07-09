import {ButtonsPanelPlugin} from '../../types/plugin';
import {t} from '../../utils/i18n';

/**
 * 创建帮助说明区域
 * @param containerEl 帮助内容容器
 * @param plugin 插件实例
 */
export function createHelpSection(containerEl: HTMLElement, plugin: ButtonsPanelPlugin): void {
	const card = containerEl.createDiv('settings-card-group');
	const helpDiv = card.createDiv({cls: 'help-content'});

// 	helpDiv.innerHTML = `
// 	<span style="font-weight: bold; color: var(--text-accent); font-size: 1.1em;">${t('help_title', plugin)}</span>
// 	<ul style="margin:0 0 0 1.5em;padding:0;">
// 		<li>${t('help_panel_config', plugin)}</li>
// 		<li>${t('help_button_management', plugin)}</li>
// 		<li>${t('help_icon_picker', plugin)}</li>
// 		<li>${t('help_data_storage', plugin)}</li>
// 		<li>${t('help_tab_scroll', plugin)}
// 			<ul style="margin:0 0 0 1.5em;padding:0;">
// 				<li>${t('help_tab_scroll_pc', plugin)}</li>
// 				<li>${t('help_tab_scroll_mobile', plugin)}</li>
// 			</ul>
// 		</li>
// 	</ul>
// `;

	// 将  innerHTML 替换为更安全的 DOM 操作方式
	// 标题
	const titleSpan = helpDiv.createEl('span', {cls: 'help-title'});
	titleSpan.textContent = t('help_title', plugin);

	// 列表
	const ul = helpDiv.createEl('ul', {cls: 'help-list'});

	const li1 = ul.createEl('li');
	li1.textContent = t('help_panel_config', plugin);

	const li2 = ul.createEl('li');
	li2.textContent = t('help_button_management', plugin);

	const li3 = ul.createEl('li');
	li3.textContent = t('help_icon_picker', plugin);

	const li4 = ul.createEl('li');
	li4.textContent = t('help_data_storage', plugin);

	const li5 = ul.createEl('li');
	li5.textContent = t('help_tab_scroll', plugin);

	const subUl = li5.createEl('ul', {cls: 'help-sub-list'});

	const subLi1 = subUl.createEl('li');
	subLi1.textContent = t('help_tab_scroll_pc', plugin);
	const subLi2 = subUl.createEl('li');
	subLi2.textContent = t('help_tab_scroll_mobile', plugin);
} 
