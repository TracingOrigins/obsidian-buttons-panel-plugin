import {App, Notice} from 'obsidian';
import {ButtonsPanelPlugin} from '../types/plugin';
import {t} from '../utils/i18n';

/**
 * 命令动作服务类，负责处理Obsidian命令执行
 */
export class ExecuteCommandService {
	constructor(private app: App, private plugin?: ButtonsPanelPlugin) {}

	/**
	 * 执行Obsidian命令
	 * @param commandId 命令ID
	 * @param parameters 可选参数
	 */
	async executeCommand(commandId: string, parameters?: Record<string, any>): Promise<void> {
		try {
			// 作用域支持：如果scope为current-editor，则聚焦到最后激活的markdown标签页（如有）
			if (parameters?.scope === 'current-editor') {
				const currentEditor = this.plugin?.lastActiveMarkdownLeaf;
				if (currentEditor) {
					this.app.workspace.setActiveLeaf(currentEditor, { focus: true });
				}
			}
			
			await (this.app as any).commands.executeCommandById(commandId);
		} catch (error) {
			console.error('执行命令时出错:', error);
			new Notice(t('command_execution_failed', this.plugin) + `: ${commandId} - ${error.message}`);
		}
	}
} 