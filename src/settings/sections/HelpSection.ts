import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { t } from '@/common/utils/i18n';

/**
 * createHelpSection 创建帮助说明区域。
 * 用于在设置界面展示插件的帮助信息和使用说明。
 * @param containerEl 帮助内容容器
 * @param plugin 插件实例
 */
export function createHelpSection(containerEl: HTMLElement, plugin: ButtonsPanelPlugin): void {
    const card = containerEl.createDiv('settings-card-group');
    const helpDiv = card.createDiv({ cls: 'help-content' });

    // 标题
    const titleSpan = helpDiv.createEl('span', { cls: 'help-title' });
    titleSpan.textContent = t('help_title');

    // 列表
    const ul = helpDiv.createEl('ul', { cls: 'help-list' });

    const li1 = ul.createEl('li');
    li1.textContent = t('help_panel_config');

    const li2 = ul.createEl('li');
    li2.textContent = t('help_button_management');

    const li3 = ul.createEl('li');
    li3.textContent = t('help_icon_picker');

    const li4 = ul.createEl('li');
    li4.textContent = t('help_data_storage');

    const li5 = ul.createEl('li');
    li5.textContent = t('help_tab_scroll');

    const subUl = li5.createEl('ul', { cls: 'help-sub-list' });

    const subLi1 = subUl.createEl('li');
    subLi1.textContent = t('help_tab_scroll_pc');
    const subLi2 = subUl.createEl('li');
    subLi2.textContent = t('help_tab_scroll_mobile');
}
