import { App, Notice, TFile, normalizePath } from 'obsidian';
import { ButtonAction } from '@/common/types/action';
import { ButtonsPanelPlugin } from '@/common/types/plugin';
import { t, tWithParams } from '@/common/utils/i18n';

/**
 * 脚本动作服务类，负责处理用户自定义脚本执行。
 * 支持 QuickAdd/Components 脚本格式、参数传递、作用域切换等。
 */
export class ScriptService {
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
     * 运行用户自定义的脚本文件。
     * 支持多种脚本导出格式，自动注入 app、plugin、notice、params 等变量。
     *
     * 支持用户通过按钮一键运行库中的 JS 脚本，实现自定义自动化、批量处理等高级功能。
     * 支持 QuickAdd 脚本格式（即 module.exports = async function(...) { ... }）。
     * 支持 Components 脚本格式（即 exports.default = { entry: async function(...) { ... } }）。
     * 支持脚本通过 notice(msg) 反馈信息到 Obsidian 通知栏。
     * 若脚本导出为函数，则自动调用并传递参数。
     *
     * @param action 按钮动作配置对象，需包含 type: 'script' 及参数
     */
    async runScript(action: ButtonAction): Promise<void> {
        try {
            // 作用域支持：如 scope 为 current-editor，则聚焦到最后激活的 markdown 标签页（如有）
            if (action.type === 'script' && action.parameters.scope === 'current-editor') {
                const currentEditor = this.plugin?.lastActiveMarkdownLeaf;
                if (currentEditor) {
                    this.app.workspace.setActiveLeaf(currentEditor, { focus: true });
                }
            }

            const scriptFileName = action.type === 'script' ? action.parameters.scriptName : '';
            // 获取脚本文件夹路径（从插件设置中读取）
            let scriptFolderPath = this.plugin?.settings?.pathConfig?.scriptFolderPath ?? '';
            // 清理路径，防止拼接出错
            scriptFolderPath = scriptFolderPath
                .replace(/^\/+/g, '')
                .replace(/\/+$/g, '')
                .replace(/^\//, '')
                .replace(/\/$/, '');
            // 拼接完整脚本文件路径
            let scriptFilePath = scriptFolderPath
                ? `${scriptFolderPath}/${scriptFileName}`
                : scriptFileName;
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
            const module: { exports: any } = { exports: { undefined } };
            const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

            // 动态构造异步函数，注入上述变量
            const fn = new AsyncFunction(
                'module',
                'exports',
                'require',
                'app',
                'plugin',
                'notice',
                'params',
                scriptContent
            );
            // 定义可选参数 params
            let params = action.parameters ?? undefined;

            // 执行脚本内容，让 module.exports 被赋值为脚本导出的函数
            await fn.call(
                { app: this.app, plugin: this.plugin },
                module,
                module.exports,
                require,
                this.app,
                this.plugin,
                (msg: string) => new Notice(msg),
                params
            );

            // 如果脚本导出为函数或对象的 default.entry 是函数，则自动调用
            if (typeof module.exports === 'function') {
                await module.exports.call(
                    { app: this.app, plugin: this.plugin },
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
                    { app: this.app, plugin: this.plugin },
                    params,
                    this.app,
                    this.plugin,
                    (msg: string) => new Notice(msg)
                );
            } else {
                // 未正确导出函数，弹出通知
                new Notice(tWithParams('script_invalid_export', { scriptFileName }, this.plugin));
            }
        } catch (error) {
            // 捕获并通知脚本运行异常
            new Notice(t('script_run_failed', this.plugin) + `: ${error.message}`);
        }
    }
}
