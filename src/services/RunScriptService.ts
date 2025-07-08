import {App, Notice, TFile, normalizePath} from 'obsidian';
import {ButtonAction} from '../types';
import {ButtonsPanelPlugin} from '../types/plugin';
import {t, tWithParams} from '../utils/i18n';

/**
 * 脚本动作服务类，负责处理用户自定义脚本执行
 */
export class RunScriptService {
	constructor(private app: App, private plugin?: ButtonsPanelPlugin) {}

	/**
	 * 运行用户自定义的脚本文件
	 *   - 支持用户通过按钮一键运行库中的 JS 脚本，实现自定义自动化、批量处理等高级功能。
	 *   - 支持 QuickAdd 脚本格式（即 module.exports = async function(...) { ... }）。
	 *   - 支持 Components 脚本格式（即 exports.default = { entry: async function(...) { ... } }）。
	 *   - 支持脚本通过 notice(msg) 反馈信息到 Obsidian 通知栏。
	 *   - 若脚本导出为函数，则自动调用并传递参数。
	 *
	 * @param action 按钮动作配置对象
	 */
	async runScript(action: ButtonAction): Promise<void> {
		try {
			// 作用域支持：如果scope为current-editor，则聚焦到最后激活的markdown标签页（如有）
			if (action.parameters?.scope === 'current-editor') {
				const currentEditor = this.plugin?.lastActiveMarkdownLeaf;
				if (currentEditor) {
					this.app.workspace.setActiveLeaf(currentEditor, { focus: true });
				}
			}

			const scriptFileName = action.value;
			// 获取脚本文件夹路径（从插件设置中读取）
			let scriptFolderPath = this.plugin?.settings?.pathConfig?.scriptFolderPath ?? '';
			// 清理路径，去除首尾斜杠，防止拼接出错
			scriptFolderPath = scriptFolderPath.replace(/^\/+/g, '').replace(/\/+$/g, '').replace(/^\/+/g, '').replace(/\/+$/g, '');
			// 拼接完整脚本文件路径
			let scriptFilePath = scriptFolderPath ? `${scriptFolderPath}/${scriptFileName}` : scriptFileName;
			scriptFilePath = normalizePath(scriptFilePath);
			
			// 查找脚本文件对象
			const scriptFile = this.app.vault.getAbstractFileByPath(scriptFilePath);
			if (!scriptFile || !(scriptFile instanceof TFile)) {
				// 未找到脚本文件，弹出通知
				new Notice(t('script_file_not_found', this.plugin) + `: ${scriptFilePath}`);
				return;
			}
			
			// 读取脚本内容（文本）
			const scriptContent = await this.app.vault.read(scriptFile);

			// 构造脚本执行环境
			const module: { exports: any } = {exports: {undefined}};
			const AsyncFunction = Object.getPrototypeOf(async function () {
			}).constructor;

			// 动态构造异步函数，注入上述变量
			const fn = new AsyncFunction('module', 'exports', 'require', 'app', 'plugin', 'notice', 'params', scriptContent);
			// 定义可选参数 params
			let params = action.parameters ?? undefined;
			
			// 执行脚本内容，让 module.exports 被赋值为脚本导出的函数
			await fn.call(
				{app: this.app, plugin: this.plugin},
				module,
				module.exports,
				require,
				this.app,
				this.plugin,
				(msg: string) => new Notice(msg),
				params
			);
			
			// 若脚本导出为函数 或 导出对象的 default.entry 是函数，则自动调用
			if (typeof module.exports === 'function') {
				await module.exports.call(
					{app: this.app, plugin: this.plugin},
					params,
					this.app,
					this.plugin,
					(msg: string) => new Notice(msg)
				);
			} else if (
				module.exports &&
				typeof module.exports === 'object' &&
				module.exports.default &&
				typeof module.exports.default.entry === 'function'
			) {
				await module.exports.default.entry.call(
					{app: this.app, plugin: this.plugin},
					params,
					this.app,
					this.plugin,
					(msg: string) => new Notice(msg)
				);
			} else {
				// 未正确导出函数，弹出通知
				new Notice(tWithParams('script_invalid_export', {scriptFileName}, this.plugin));
			}
		} catch (error) {
			// 捕获并通知脚本运行异常
			new Notice(t('script_run_failed', this.plugin) + `: ${error.message}`);
		}
	}
} 