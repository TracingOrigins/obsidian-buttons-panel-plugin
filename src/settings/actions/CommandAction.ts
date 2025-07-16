import { IButtonAction } from './IButtonAction';
import { Setting } from 'obsidian';
import { t } from '@/utils/i18n';
import { CommandInput, ScopeDropdown } from '@/settings/components';

/**
 * “执行命令”动作类，实现按钮动作表单的渲染、数据管理、校验和序列化。
 */
export class CommandAction implements IButtonAction {
    type = 'command';
    commandId: string;
    args?: any[];
    scope?: string;
    private commandInput: CommandInput | null = null;

    /**
     * 构造函数，初始化命令参数。
     */
    constructor(params: { commandId: string; args?: any[]; scope?: string }) {
        this.commandId = params.commandId;
        this.args = params.args;
        this.scope = params.scope ?? 'global';
    }

    /**
     * 渲染表单控件，绑定数据双向同步。
     */
    render(container: HTMLElement, context: any) {
        // 使用可复用的命令输入组件
        this.commandInput = new CommandInput(
            container,
            {
                name: t('command', context.plugin),
                description: t('command_desc', context.plugin),
                placeholder: t('command_id_placeholder', context.plugin),
                searchTooltip: t('search_commands_tooltip', context.plugin),
            },
            { app: context.app, plugin: context.plugin },
            (value: string) => {
                this.commandId = value;
            }
        );

        // 使用可复用的作用域下拉组件
        const scopeDropdown = new ScopeDropdown(
            container,
            {
                name: t('action_scope', context.plugin),
                description: t('action_scope_desc', context.plugin),
                onScopeChange: (value: string) => {
                    this.scope = value;
                },
            },
            { app: context.app, plugin: context.plugin }
        );

        // 设置初始值
        this.commandInput.setValue(this.commandId || '');
        scopeDropdown.setValue(this.scope || 'global');
    }

    /**
     * 校验表单数据有效性。
     */
    validate() {
        return !!(this.commandId && this.commandId.trim());
    }

    setError(message: string): void {
        this.commandInput?.setError(message);
    }

    clearError(): void {
        this.commandInput?.clearError();
    }

    /**
     * 序列化为 JSON 数据。
     */
    toJSON() {
        return {
            type: this.type,
            parameters: {
                commandId: this.commandId,
                args: this.args,
                scope: this.scope ?? 'global',
            },
        };
    }
}
