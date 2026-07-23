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
    help.createEl('span', { cls: 'help-title', text: t('help_title') });

    // 列表
    const ul = help.createEl('ul', { cls: 'help-list' });
    ul.createEl('li', { text: t('help_panel_config') });
    ul.createEl('li', { text: t('help_icon_picker') });
    ul.createEl('li', { text: t('help_data_storage') });

    const li4 = ul.createEl('li', { text: t('help_tab_scroll') });
    const subUl = li4.createEl('ul', { cls: 'help-sub-list' });
    subUl.createEl('li', { text: t('help_tab_scroll_pc') });
    subUl.createEl('li', { text: t('help_tab_scroll_mobile') });

    // 推荐图标库
    const li6 = ul.createEl('li');
    li6.appendText(t('help_icon_library_recommend') + ' ');
    li6.createEl('a', {
        text: t('help_icon_library_iconfont'),
        href: 'https://www.iconfont.cn/',
        attr: { target: '_blank', rel: 'noopener' },
    });

    // 推荐图标库的子级提示
    const iconSubUl = li6.createEl('ul', { cls: 'help-sub-list' });
    iconSubUl.createEl('li', { text: t('help_icon_library_suggestion') });
}
