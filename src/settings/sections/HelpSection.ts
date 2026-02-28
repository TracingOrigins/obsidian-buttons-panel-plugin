import { ButtonsPanelPlugin } from '@/types/plugin';
import { t } from '@/utils/i18n';

/**
 * createHelpSection 创建帮助说明区域。
 * 用于在设置界面展示插件的帮助信息和使用说明。
 * @param containerEl 帮助内容容器
 * @param plugin 插件实例
 */
export function createHelpSection(containerEl: HTMLElement, _plugin: ButtonsPanelPlugin): void {
    const help = containerEl.createDiv({ cls: 'settings-help' });

    // 标题
    const titleSpan = help.createEl('span', { cls: 'help-title' });
    titleSpan.textContent = t('help_title');

    // 列表
    const ul = help.createEl('ul', { cls: 'help-list' });

    const li1 = ul.createEl('li');
    li1.textContent = t('help_panel_config');

    const li2 = ul.createEl('li');
    li2.textContent = t('help_icon_picker');

    const li3 = ul.createEl('li');
    li3.textContent = t('help_data_storage');

    const li4 = ul.createEl('li');
    li4.textContent = t('help_tab_scroll');

    const subUl = li4.createEl('ul', { cls: 'help-sub-list' });

    const subLi1 = subUl.createEl('li');
    subLi1.textContent = t('help_tab_scroll_pc');
    const subLi2 = subUl.createEl('li');
    subLi2.textContent = t('help_tab_scroll_mobile');

    // 推荐图标库
    const li6 = ul.createEl('li');
    li6.appendText(t('help_icon_library_recommend') + ' ');
    li6.createEl('a', {
        text: t('help_icon_library_iconfont'),
        href: 'https://www.iconfont.cn/',
        attr: {
            target: '_blank',
            rel: 'noopener',
        },
    });

    // 推荐图标库的子级提示
    const iconSubUl = li6.createEl('ul', { cls: 'help-sub-list' });
    const iconSubLi = iconSubUl.createEl('li');
    iconSubLi.textContent = t('help_icon_library_suggestion');
}
