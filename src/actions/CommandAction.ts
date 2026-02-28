import type { App } from 'obsidian';
import { IButtonAction } from '@/actions/IButtonAction';
import { t } from '@/utils/i18n';
import { CommandInput } from '@/components/input';
import type { ButtonsPanelPlugin } from '@/types/plugin';

type ActionRenderContext = { app: App; plugin: ButtonsPanelPlugin };

/**
 * “执行命令”动作类，实现按钮动作表单的渲染、数据管理、校验和序列化。
 */
export class CommandAction implements IButtonAction {
    type = 'command';
    commandId: string;
    args?: unknown[];
    private commandInput: CommandInput | null = null;

    /**
     * 构造函数，初始化命令参数。
     */
    constructor(params: { commandId: string; args?: unknown[] }) {
        this.commandId = params.commandId;
        this.args = params.args;
    }

    /**
     * 渲染表单控件，绑定数据双向同步。
     */
    render(container: HTMLElement, context: ActionRenderContext) {
        // 使用可复用的命令输入组件
        this.commandInput = new CommandInput(
            container,
            {
                name: t('command'),
                description: t('command_desc'),
                placeholder: t('command_id_placeholder'),
                searchTooltip: t('search_commands_tooltip'),
            },
            { app: context.app, plugin: context.plugin },
            (value: string) => {
                this.commandId = value;
            }
        );

        // 设置初始值
        this.commandInput.setValue(this.commandId || '');
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
            },
        };
    }
}


