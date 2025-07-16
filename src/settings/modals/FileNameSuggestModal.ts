import { App, Modal, TextComponent } from 'obsidian';
import { ButtonsPanelPlugin } from '@/types/plugin';
import { t } from '@/utils/i18n';

/**
 * FileNameSuggestModal 文件名格式建议模态框类。
 * 用于选择或输入常用的日期格式作为新建文件名模板，支持键盘导航和预览。
 */
export class FileNameSuggestModal extends Modal {
    /** 插件主类实例 */
    plugin: ButtonsPanelPlugin;
    /** 选择格式后的回调函数，参数为格式字符串 */
    onSelect: (format: string) => void;

    /**
     * 构造函数，初始化模态框。
     * @param app Obsidian应用实例
     * @param plugin 插件主类实例
     * @param onSelect 选择格式后的回调
     */
    constructor(app: App, plugin: ButtonsPanelPlugin, onSelect: (format: string) => void) {
        super(app);
        this.plugin = plugin;
        this.onSelect = onSelect;
    }

    /**
     * 打开模态框时自动调用，渲染界面。
     */
    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('buttons-panel-plugin');
        contentEl.addClass('filename-suggest-modal');

        // 搜索框区域
        const inputWrapper = contentEl.createDiv({ cls: 'search-input-wrapper' });
        const input = new TextComponent(inputWrapper)
            .setPlaceholder(t('search_date_variables', this.plugin))
            .setValue('');
        input.inputEl.classList.add('search-input');

        // 建议列表容器
        const suggestions = contentEl.createDiv({ cls: 'filename-suggestions-container' });
        let selectedSuggestionIndex = 0;

        // 预定义的日期格式列表
        const dateFormats = [
            { format: 'YYYY-MM-DD' },
            { format: 'YYYY-MM-DD-HH-mm' },
            { format: 'YYYY-MM-DD-HH-mm-ss' },
            { format: 'YYYYMMDD' },
            { format: 'YYYYMMDDHHmm' },
            { format: 'YYYYMMDDHHmmss' },
            { format: 'YYMMDD' },
            { format: 'gggg-[W]WW' },
        ];

        /**
         * 滚动到当前选中的建议项。
         */
        const scrollToSelected = () => {
            const activeItem = suggestions.querySelector(
                '.suggestion-item.is-active'
            ) as HTMLElement;
            if (activeItem) {
                activeItem.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth',
                });
            }
        };

        /**
         * 渲染建议列表。
         */
        const renderSuggestions = () => {
            suggestions.empty();
            const query = input.getValue().trim().toLowerCase();
            // 过滤匹配的格式
            const filteredFormats = dateFormats.filter((f) =>
                f.format.toLowerCase().includes(query)
            );

            if (filteredFormats.length === 0) {
                suggestions.createDiv({
                    text: t('no_format_match', this.plugin),
                    cls: 'suggestion-item',
                });
                return;
            }

            filteredFormats.forEach((f, idx) => {
                const suggestionEl = suggestions.createDiv({
                    cls: 'suggestion-item' + (idx === selectedSuggestionIndex ? ' is-active' : ''),
                });
                // 显示格式
                suggestionEl.createDiv({ text: `{{DATE:${f.format}}}` });
                // 显示预览
                suggestionEl.createDiv({
                    text: window.moment ? window.moment().format(f.format) + '.md' : '',
                    cls: 'format-preview',
                });

                suggestionEl.onclick = () => {
                    this.onSelect(`{{DATE:${f.format}}}`);
                    this.close();
                };
            });
            if (selectedSuggestionIndex >= 0) {
                scrollToSelected();
            }
        };

        // 输入时实时渲染建议
        input.inputEl.addEventListener('input', renderSuggestions);

        // 键盘导航
        input.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
            const query = input.getValue().trim().toLowerCase();
            const filteredFormats = dateFormats.filter((f) =>
                f.format.toLowerCase().includes(query)
            );
            if (filteredFormats.length === 0) return;
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    selectedSuggestionIndex =
                        (selectedSuggestionIndex + 1) % filteredFormats.length;
                    renderSuggestions();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    selectedSuggestionIndex =
                        (selectedSuggestionIndex - 1 + filteredFormats.length) %
                        filteredFormats.length;
                    renderSuggestions();
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (selectedSuggestionIndex > -1) {
                        const format = filteredFormats[selectedSuggestionIndex];
                        this.onSelect(`{{DATE:${format.format}}}`);
                        this.close();
                    }
                    break;
                case 'Escape':
                    this.close();
                    break;
            }
        });

        // 初始化显示
        renderSuggestions();
    }

    /**
     * 关闭模态框时自动调用，清理内容。
     */
    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}
