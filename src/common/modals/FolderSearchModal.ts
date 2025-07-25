import { App, Modal, TextComponent } from 'obsidian';
import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { t } from '@/common/utils/i18n';

/**
 * FolderSearchModal 文件夹搜索模态框类。
 * 用于搜索并选择当前库中的文件夹，支持输入过滤、键盘导航、回车选择。
 */
export class FolderSearchModal extends Modal {
    /** 插件主类实例 */
    plugin: ButtonsPanelPlugin;
    /** 选择文件夹后的回调函数，参数为文件夹路径 */
    onSelect: (folder: string) => void;

    /**
     * 构造函数，初始化模态框。
     * @param app Obsidian应用实例
     * @param plugin 插件主类实例
     * @param onSelect 选择文件夹后的回调
     */
    constructor(app: App, plugin: ButtonsPanelPlugin, onSelect: (folder: string) => void) {
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
        contentEl.addClass('folder-search-modal');

        // 搜索框区域
        const inputWrapper = contentEl.createDiv({ cls: 'search-input-wrapper' });
        const input = new TextComponent(inputWrapper)
            .setPlaceholder(t('search_folders'))
            .setValue('');
        input.inputEl.classList.add('search-input');

        // 建议列表容器
        const suggestions = contentEl.createDiv({ cls: 'folder-suggestions-container' });
        let filteredFolders: string[] = [];
        let selectedSuggestionIndex = 0;

        /**
         * 获取所有文件夹路径（包括空文件夹）。
         */
        const getAllFolders = (): string[] => {
            const folders: string[] = [];
            const traverse = (folder: any) => {
                // TFolder 类型
                if (folder && folder.path !== undefined) {
                    folders.push(folder.path);
                }
                if (folder && folder.children) {
                    for (const child of folder.children) {
                        // 只递归 TFolder
                        if (child.children) {
                            traverse(child);
                        }
                    }
                }
            };
            traverse(this.app.vault.getRoot());
            return folders.sort();
        };

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
            if (filteredFolders.length === 0) {
                suggestions.createDiv({
                    text: t('no_folders_available'),
                    cls: 'suggestion-item',
                });
                return;
            }
            filteredFolders.forEach((folder, idx) => {
                const item = suggestions.createDiv({
                    cls: 'suggestion-item' + (idx === selectedSuggestionIndex ? ' is-active' : ''),
                });
                item.createDiv({
                    text: folder,
                });
                item.onclick = () => {
                    this.onSelect(folder);
                    this.close();
                };
            });
            if (selectedSuggestionIndex >= 0) {
                scrollToSelected();
            }
        };

        /**
         * 根据输入内容过滤文件夹列表。
         */
        const updateFilter = () => {
            const query = input.getValue().trim().toLowerCase();
            const allFolders = getAllFolders();
            filteredFolders = allFolders.filter((folder) => folder.toLowerCase().includes(query));
            selectedSuggestionIndex = 0;
            renderSuggestions();
        };

        // 输入时实时过滤
        input.inputEl.addEventListener('input', updateFilter);

        // 键盘导航与选择
        input.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
            if (filteredFolders.length === 0) return;
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    selectedSuggestionIndex =
                        (selectedSuggestionIndex + 1) % filteredFolders.length;
                    renderSuggestions();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    selectedSuggestionIndex =
                        (selectedSuggestionIndex - 1 + filteredFolders.length) %
                        filteredFolders.length;
                    renderSuggestions();
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (selectedSuggestionIndex > -1) {
                        const folder = filteredFolders[selectedSuggestionIndex];
                        this.onSelect(folder);
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
