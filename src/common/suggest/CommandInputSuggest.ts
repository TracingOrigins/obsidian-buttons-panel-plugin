import type { App, Command } from 'obsidian';
import { AbstractInputSuggest } from 'obsidian';

/**
 * CommandInputSuggest 为命令输入框提供基于 Obsidian AbstractInputSuggest 的下拉建议。
 * 直接挂载在输入框上，输入时在下方悬浮展示匹配的命令列表。
 */
export class CommandInputSuggest extends AbstractInputSuggest<Command> {
    constructor(app: App, inputEl: HTMLInputElement) {
        super(app, inputEl);
    }

    protected async getSuggestions(query: string): Promise<Command[]> {
        const anyApp = this.app as unknown as {
            commands?: {
                listCommands?: () => Command[];
                // 内部字段，作为兼容兜底
                commands?: Record<string, Command>;
            };
        };

        let allCommands: Command[] = [];

        if (anyApp.commands && typeof anyApp.commands.listCommands === 'function') {
            // 注意要保留 this 绑定，不能把 listCommands 单独取出来调用
            allCommands = anyApp.commands.listCommands() ?? [];
        }

        // 兼容兜底：某些版本下可以直接从内部 commands 映射中取值
        if (!allCommands.length && anyApp.commands && anyApp.commands.commands) {
            allCommands = Object.values(anyApp.commands.commands);
        }

        if (!allCommands.length) {
            // 如果仍然拿不到命令列表，至少保证不会抛错
            console.warn('[Buttons Panel] 无法获取 Obsidian 命令列表，命令建议为空。');
            return [];
        }

        const normalized = query.trim().toLowerCase();
        if (!normalized) return allCommands;

        return allCommands.filter(
            (cmd) =>
                cmd.name?.toLowerCase().includes(normalized) ||
                cmd.id.toLowerCase().includes(normalized)
        );
    }

    /**
     * 渲染每一条命令建议。
     */
    renderSuggestion(cmd: Command, el: HTMLElement): void {
        const name = cmd?.name || cmd.id;
        el.createDiv({
            text: `${name} (${cmd.id})`,
            cls: 'buttons-panel-command-suggestion',
        });
    }
}


