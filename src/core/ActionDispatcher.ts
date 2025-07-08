import {App, Notice} from 'obsidian';
import {ButtonAction} from '../types';
import {ButtonsPanelPlugin} from '../types/plugin';
import {t} from '../utils/i18n';
import {OpenFileService} from '../services/OpenFileService';
import {CreateFileService} from '../services/CreateFileService';
import {ExecuteCommandService} from '../services/ExecuteCommandService';
import {OpenUrlService} from '../services/OpenUrlService';
import {RunScriptService} from '../services/RunScriptService';

/**
 * 按钮动作分发器，负责根据按钮配置将动作分发到相应的服务类。
 */
export class ActionDispatcher {
	private openFileService: OpenFileService;
	private createFileService: CreateFileService;
	private executeCommandService: ExecuteCommandService;
	private openUrlService: OpenUrlService;
	private runScriptService: RunScriptService;

	/** Obsidian应用实例 */
	constructor(private app: App, private plugin?: ButtonsPanelPlugin) {
		this.openFileService = new OpenFileService(app, plugin);
		this.createFileService = new CreateFileService(app, plugin);
		this.executeCommandService = new ExecuteCommandService(app, plugin);
		this.openUrlService = new OpenUrlService(app, plugin);
		this.runScriptService = new RunScriptService(app, plugin);
	}

	/**
	 * 执行按钮动作，根据类型分发到不同服务。
	 * @param action 按钮动作配置对象
	 */
	async executeAction(action: ButtonAction): Promise<void> {
		try {
			// 根据动作类型分发到不同的服务
			switch (action.type) {
				case 'file':
					await this.openFileService.openFile(action.value);
					break;
				case 'command':
					await this.executeCommandService.executeCommand(action.value, action.parameters);
					break;
				case 'url':
					await this.openUrlService.openUrl(action.value);
					break;
				case 'create_file':
					await this.createFileService.createFile(action.value, action.parameters);
					break;
				case 'script':
					await this.runScriptService.runScript(action);
					break;
				default:
					new Notice(t('unknown_action_type', this.plugin) + `: ${action.type}`);
			}
		} catch (error) {
			console.error('执行按钮动作时出错:', error);
			new Notice(t('action_execution_failed', this.plugin) + `: ${error.message}`);
		}
	}
} 