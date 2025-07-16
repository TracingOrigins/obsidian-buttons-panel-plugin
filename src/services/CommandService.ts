import { App, Notice } from 'obsidian';
import { ButtonsPanelPlugin } from '@/types/plugin';
import { t } from '@/utils/i18n';
import { ButtonAction, CommandActionParams } from '@/types/action';

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

            // 类型断言：现在 TypeScript 知道这是命令动作
            const commandParams = action.parameters as CommandActionParams;

            // 作用域支持：如果 scope 为 current-editor，则聚焦到最后激活的 markdown 标签页（如有）
            if (commandParams?.scope === 'current-editor') {
                const currentEditor = this.plugin?.lastActiveMarkdownLeaf;
                if (currentEditor) {
                    this.app.workspace.setActiveLeaf(currentEditor, { focus: true });
                }
            }

            // 执行命令
            await (this.app as any).commands.executeCommandById(commandParams.commandId);
        } catch (error) {
            console.error('执行命令时出错:', error);
            const commandParams = action.parameters as CommandActionParams;
            new Notice(
                t('command_execution_failed', this.plugin) +
                    `: ${commandParams.commandId} - ${error.message}`
            );
        }
    }
}
