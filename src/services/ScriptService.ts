import * as obsidian from 'obsidian';
import { ButtonAction } from '@/types/action';
import { ButtonsPanelPlugin } from '@/types/plugin';
import { t, tWithParams } from '@/utils/i18n';
import { getSafeLastContentLeaf } from '@/utils/obsidian';

/**
 * 脚本动作服务类，负责处理用户自定义脚本执行。
 * 支持 QuickAdd/Components 脚本格式。
 */
export class ScriptService {
    /**
     * 构造函数，初始化 app 和插件实例。
     * @param app Obsidian 应用实例
     * @param plugin 插件主类实例（可选）
     */
    constructor(
        private app: obsidian.App,
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
            // 动作执行前，自动激活最后激活的内容标签页（排除按钮面板）
            const lastContentLeaf = getSafeLastContentLeaf(this.app, this.plugin);
            if (lastContentLeaf) {
                this.app.workspace.setActiveLeaf(lastContentLeaf, { focus: true });
            }

            // 解析脚本路径
            const { scriptFilePath, scriptFileName } = this.resolveScriptPath(action);

            // 读取脚本内容
            const scriptContent = await this.readScriptContent(scriptFilePath, scriptFileName);
            if (!scriptContent) {
                return;
            }

            // 创建异步函数并执行脚本模块导出
            const module = await this.createAsyncFunction(scriptContent, action.parameters);

            // 执行导出的函数
            await this.executeModuleExports(module, action.parameters, scriptFileName);
        } catch (error) {
            // 捕获并通知脚本运行异常
            const errorMessage = error instanceof Error ? error.message : String(error);
            new obsidian.Notice(t('script_run_failed') + `: ${errorMessage}`);
        }
    }

    /**
     * 解析脚本路径
     * @param action 按钮动作配置对象
     * @returns 脚本文件路径和文件名
     */
    private resolveScriptPath(action: ButtonAction): {
        scriptFilePath: string;
        scriptFileName: string;
    } {
        // 在 ButtonAction 类型中，parameters 在 type === 'script' 时已经拥有 scriptName 字段
        const scriptFileName =
            action.type === 'script' ? action.parameters.scriptName : '';

        // 获取脚本文件夹路径（从插件设置中读取）
        let scriptFolderPath = this.plugin?.settings?.pathConfig?.scriptFolderPath ?? '';
        // 使用 normalizePath 清理路径
        scriptFolderPath = obsidian.normalizePath(scriptFolderPath);

        // 拼接完整脚本文件路径
        let scriptFilePath = scriptFolderPath
            ? `${scriptFolderPath}/${scriptFileName}`
            : scriptFileName;
        scriptFilePath = obsidian.normalizePath(scriptFilePath);

        return { scriptFilePath, scriptFileName };
    }

    /**
     * 读取脚本文件内容
     * @param scriptFilePath 脚本文件路径
     * @param scriptFileName 脚本文件名（用于错误提示）
     * @returns 脚本内容字符串，如果文件不存在则返回 null
     */
    private async readScriptContent(
        scriptFilePath: string,
        scriptFileName: string
    ): Promise<string | null> {
        const scriptFile = this.app.vault.getFileByPath(scriptFilePath);
        if (!scriptFile) {
            // 未找到脚本文件，弹出通知
            new obsidian.Notice(t('script_file_not_found') + `: ${scriptFilePath}`);
            return null;
        }

        // 读取脚本内容（文本）
        return await this.app.vault.read(scriptFile);
    }

    /**
     * 创建异步函数并执行脚本模块导出
     * @param scriptContent 脚本内容字符串
     * @param params 脚本参数
     * @returns 模块导出对象
     */
    private async createAsyncFunction(
        scriptContent: string,
        params: unknown
    ): Promise<{ exports: unknown }> {
        const module: { exports: unknown } = { exports: undefined };

        type AsyncFunctionConstructor = new (...args: string[]) => (
            ...args: unknown[]
        ) => Promise<unknown>;
        const asyncFunctionPrototype = Object.getPrototypeOf(
            async function () {}
        ) as { constructor: AsyncFunctionConstructor };
        const AsyncFunctionConstructor = asyncFunctionPrototype.constructor;

        // 动态构造异步函数，注入上述变量
        const fn: (...args: unknown[]) => Promise<unknown> = new AsyncFunctionConstructor(
            'module',
            'exports',
            'require',
            'app',
            'plugin',
            'notice',
            'params',
            scriptContent
        );

        // 执行脚本内容，让 module.exports 被赋值为脚本导出的函数
        // 拦截 'obsidian' 走插件注入，其余回退 window.require（Node.js/Electron）
        const requireFromWindow = (
            window as unknown as { require?: (...args: unknown[]) => unknown }
        ).require;
        const customRequire = (moduleName: string) => {
            if (moduleName === 'obsidian') return obsidian;
            if (requireFromWindow) return requireFromWindow(moduleName);
            throw new Error(`Cannot find module '${moduleName}'`);
        };

        await fn.call(
            { app: this.app, plugin: this.plugin },
            module,
            module.exports,
            customRequire,
            this.app,
            this.plugin,
            (msg: string) => new obsidian.Notice(msg),
            params
        );

        return module;
    }

    /**
     * 执行模块导出的函数
     * @param module 模块对象
     * @param params 脚本参数
     * @param scriptFileName 脚本文件名（用于错误提示）
     */
    private async executeModuleExports(
        module: { exports: unknown },
        params: unknown,
        scriptFileName: string
    ): Promise<void> {
        // 如果脚本导出为函数或对象的 default.entry 是函数，则自动调用
        if (typeof module.exports === 'function') {
            const exportedFn = module.exports as (
                ...args: unknown[]
            ) => Promise<unknown> | void;
            await exportedFn.call(
                { app: this.app, plugin: this.plugin },
                params,
                this.app,
                this.plugin,
                (msg: string) => new obsidian.Notice(msg)
            );
        } else if (
            module.exports &&
            typeof module.exports === 'object' &&
            (module.exports as { default?: { entry?: unknown } }).default &&
            typeof (module.exports as { default?: { entry?: unknown } }).default?.entry ===
                'function'
        ) {
            const entry = (module.exports as {
                default?: { entry?: (...args: unknown[]) => unknown };
            }).default?.entry;
            await entry?.call(
                { app: this.app, plugin: this.plugin },
                params,
                this.app,
                this.plugin,
                (msg: string) => new obsidian.Notice(msg)
            );
        } else {
            // 未正确导出函数，弹出通知
            new obsidian.Notice(tWithParams('script_invalid_export', { scriptFileName }));
        }
    }
}
