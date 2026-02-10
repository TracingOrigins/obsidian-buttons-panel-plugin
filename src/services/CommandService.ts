import { App, Notice, WorkspaceLeaf } from 'obsidian';
import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { t } from '@/common/utils/i18n';
import { ButtonAction, CommandActionParams } from '@/common/types/action';
import { getLastActiveContentLeaf } from '@/common/utils/obsidian';

/**
 * 命令动作服务类，负责处理 Obsidian 命令的执行。
 * 该服务用于根据按钮配置，调用 Obsidian 的命令系统执行指定命令。
 */
export class CommandService {
    /**
     * 构造函数，初始化 app 和插件实例。
     * @param app Obsidian 应用实例
     * @param plugin 插件主类实例（可选）
     */
    constructor(
        private app: App,
        private plugin?: ButtonsPanelPlugin
    ) {}

    /**
     * 执行 Obsidian 命令。
     * @param action 按钮动作配置对象，需包含 type: 'command' 及参数
     */
    async executeCommand(action: ButtonAction): Promise<void> {
        try {
            // 类型守卫：确保这是命令动作
            if (action.type !== 'command') {
                throw new Error('Invalid action type for command execution');
            }

            // 在 ButtonAction 类型中，parameters 在 type === 'command' 时是 CommandActionParams
            // 这里通过类型断言收窄，便于后续安全访问 commandId
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            const commandParams = action.parameters as CommandActionParams;

            // 动作执行前，自动激活最后激活的内容标签页（排除按钮面板）
            const safeLastLeaf =
                this.plugin?.lastActiveContentLeaf instanceof WorkspaceLeaf
                    ? this.plugin.lastActiveContentLeaf
                    : null;
            const lastContentLeaf = getLastActiveContentLeaf(
                this.app,
                'buttons-panel-view',
                safeLastLeaf
            );
            if (lastContentLeaf) {
                this.app.workspace.setActiveLeaf(lastContentLeaf, { focus: true });
            }

            // 执行命令
            // 注意：不能将 executeCommandById 解构出来单独调用，否则会丢失 this 上下文，
            // 在 Obsidian 内部实现中会导致类似 "Cannot read properties of undefined (reading 'findCommand')" 的错误。
            const commandsApi = (this.app as unknown as {
                commands?: { executeCommandById?: (id: string) => boolean | void };
            }).commands;

            if (
                commandsApi &&
                typeof commandsApi.executeCommandById === 'function'
            ) {
                // 直接通过对象调用以确保 this 绑定正确
                commandsApi.executeCommandById(commandParams.commandId);
            } else {
                throw new Error('commands.executeCommandById is not available');
            }
		} catch (error) {
            console.error('执行命令时出错:', error);
            // 这里同样收窄为 CommandActionParams 以便读取 commandId
            const commandParams = action.parameters as CommandActionParams;
            const errorMessage = error instanceof Error ? error.message : String(error);
            new Notice(
				t('command_execution_failed') +
					`: ${commandParams.commandId} - ${errorMessage}`
            );
        }
    }
}
