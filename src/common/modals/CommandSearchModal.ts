import { App, Modal, TextComponent } from 'obsidian';
import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { t } from '@/common/utils/i18n';

/**
 * CommandSearchModal 命令搜索模态框类。
 * 用于搜索并选择 Obsidian 命令，支持输入过滤、键盘导航、回车选择。
 */
export class CommandSearchModal extends Modal {
    /** 插件主类实例 */
    plugin: ButtonsPanelPlugin;
    /** 选择命令后的回调函数，参数为命令ID */
    onSelect: (commandId: string) => void;

    /**
     * 构造函数，初始化模态框。
     * @param app Obsidian应用实例
     * @param plugin 插件主类实例
     * @param onSelect 选择命令后的回调
     */
    constructor(app: App, plugin: ButtonsPanelPlugin, onSelect: (commandId: string) => void) {
        super(app);
        this.plugin = plugin;
        this.onSelect = onSelect;
    }

    /**
     * 打开模态框时自动调用，渲染搜索界面。
     */
    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('buttons-panel-plugin');
        contentEl.addClass('command-search-modal');

        // 搜索框区域
        const inputWrapper = contentEl.createDiv({ cls: 'search-input-wrapper' });
        const input = new TextComponent(inputWrapper)
            .setPlaceholder(t('search_commands'))
            .setValue('');
        input.inputEl.classList.add('search-input');

        // 建议列表容器
        const suggestions = contentEl.createDiv({ cls: 'command-suggestions-container' });
        let filteredCommands: any[] = [];
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
            if (filteredCommands.length === 0) {
                suggestions.createDiv({
                    text: t('no_commands_available'),
                    cls: 'suggestion-item',
                });
                return;
            }
            filteredCommands.forEach((cmd, idx) => {
                const item = suggestions.createDiv({
                    cls: 'suggestion-item' + (idx === selectedSuggestionIndex ? ' is-active' : ''),
                });
                item.createDiv({
                    text: `${cmd?.name || cmd.id} (${cmd.id})`,
                });
                item.onclick = () => {
                    this.onSelect(cmd.id);
                    this.close();
                };
            });
            if (selectedSuggestionIndex >= 0) {
                scrollToSelected();
            }
        };

        /**
         * 根据输入内容过滤命令列表。
         */
        const updateFilter = () => {
            const query = input.getValue().trim().toLowerCase();
            // 获取所有命令对象
            const allCommands = (this.app as any).commands?.commands || {};
            const commandList = Object.entries(allCommands).map(([id, cmd]: [string, any]) => ({
                id,
                name: cmd.name,
                ...cmd,
            }));

            filteredCommands = commandList.filter(
                (cmd) =>
                    cmd.name?.toLowerCase().includes(query) || cmd.id.toLowerCase().includes(query)
            );
            selectedSuggestionIndex = 0;
            renderSuggestions();
        };

        // 输入时实时过滤
        input.inputEl.addEventListener('input', updateFilter);

        // 键盘导航与选择
        input.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
            if (filteredCommands.length === 0) return;
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    selectedSuggestionIndex =
                        (selectedSuggestionIndex + 1) % filteredCommands.length;
                    renderSuggestions();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    selectedSuggestionIndex =
                        (selectedSuggestionIndex - 1 + filteredCommands.length) %
                        filteredCommands.length;
                    renderSuggestions();
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (selectedSuggestionIndex > -1) {
                        const cmd = filteredCommands[selectedSuggestionIndex];
                        this.onSelect(cmd.id);
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
