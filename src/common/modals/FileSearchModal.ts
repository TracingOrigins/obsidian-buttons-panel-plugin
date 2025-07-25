import { App, Modal, TextComponent } from 'obsidian';
import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { t } from '@/common/utils/i18n';

/**
 * FileSearchModal 文件搜索模态框类。
 * 用于搜索并选择当前库中的Markdown文件，支持输入过滤、键盘导航、回车选择。
 */
export class FileSearchModal extends Modal {
    /** 插件主类实例 */
    plugin: ButtonsPanelPlugin;
    /** 选择文件后的回调函数，参数为文件对象 */
    onSelect: (file: any) => void;
    rootFolder?: string;
    fileExts: string[];
    showFileNameOnly: boolean;

    /**
     * 构造函数，初始化模态框。
     * @param app Obsidian应用实例
     * @param plugin 插件主类实例
     * @param onSelect 选择文件后的回调
     * @param options 可选参数，支持 rootFolder 和 fileExts
     */
    constructor(
        app: App,
        plugin: ButtonsPanelPlugin,
        onSelect: (file: any) => void,
        options?: { rootFolder?: string; fileExts?: string[]; showFileNameOnly?: boolean }
    ) {
        super(app);
        this.plugin = plugin;
        this.onSelect = onSelect;
        this.rootFolder = options?.rootFolder;
        this.fileExts = options?.fileExts ?? [];
        this.showFileNameOnly = options?.showFileNameOnly ?? false;
    }

    /**
     * 打开模态框时自动调用，渲染界面。
     */
    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('buttons-panel-plugin');
        contentEl.addClass('file-search-modal');

        // 搜索框区域
        const inputWrapper = contentEl.createDiv({ cls: 'search-input-wrapper' });
        const input = new TextComponent(inputWrapper)
            .setPlaceholder(t('search_files'))
            .setValue('');
        input.inputEl.classList.add('search-input');

        // 建议列表容器
        const suggestions = contentEl.createDiv({ cls: 'file-suggestions-container' });
        let filteredFiles: any[] = [];
        let selectedSuggestionIndex = 0;

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
            if (filteredFiles.length === 0) {
                suggestions.createDiv({
                    text: t('no_files_available'),
                    cls: 'suggestion-item',
                });
                return;
            }
            filteredFiles.forEach((file, idx) => {
                const item = suggestions.createDiv({
                    cls: 'suggestion-item' + (idx === selectedSuggestionIndex ? ' is-active' : ''),
                });
                if (this.showFileNameOnly) {
                    item.createDiv({ text: file.name });
                } else {
                    item.createDiv({ text: file.path });
                }
                item.onclick = () => {
                    this.onSelect(file);
                    this.close();
                };
            });
            if (selectedSuggestionIndex >= 0) {
                scrollToSelected();
            }
        };

        /**
         * 根据输入内容过滤文件列表。
         */
        const updateFilter = () => {
            const query = input.getValue().trim().toLowerCase();
            let files = this.app.vault.getFiles();
            if (this.fileExts && this.fileExts.length > 0) {
                files = files.filter((file) => this.fileExts.includes(file.extension));
            }
            if (this.rootFolder) {
                const root = this.rootFolder.replace(/^\/+|\/+$/g, '');
                files = files.filter((file) => file.path.startsWith(root + '/'));
            }
            filteredFiles = files.filter(
                (file) =>
                    file.path.toLowerCase().includes(query) ||
                    file.basename.toLowerCase().includes(query)
            );
            selectedSuggestionIndex = 0;
            renderSuggestions();
        };

        // 输入时实时过滤
        input.inputEl.addEventListener('input', updateFilter);

        // 键盘导航与选择
        input.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
            if (filteredFiles.length === 0) return;
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    selectedSuggestionIndex = (selectedSuggestionIndex + 1) % filteredFiles.length;
                    renderSuggestions();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    selectedSuggestionIndex =
                        (selectedSuggestionIndex - 1 + filteredFiles.length) % filteredFiles.length;
                    renderSuggestions();
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (selectedSuggestionIndex > -1) {
                        const file = filteredFiles[selectedSuggestionIndex];
                        this.onSelect(file);
                        this.close();
                    }
                    break;
                case 'Escape':
                    this.close();
                    break;
            }
        });

        // 初始化显示
        updateFilter();
    }

    /**
     * 关闭模态框时自动调用，清理内容。
     */
    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}
