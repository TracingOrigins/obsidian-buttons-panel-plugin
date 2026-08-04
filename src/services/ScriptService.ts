import * as obsidian from 'obsidian';
import { ButtonAction } from '@/types/action';
import { ButtonsPanelPlugin } from '@/types/plugin';
import { t, tWithParams, getCurrentLang } from '@/utils/i18n';
import { getSafeLastContentLeaf } from '@/utils/obsidian';
import type {
    LocalizedText,
    ScriptContext,
    ScriptEntry,
    ScriptMeta,
    ScriptThis,
} from '@/types/script';

/**
 * 脚本动作服务类，负责处理用户自定义脚本执行。
 *
 * 脚本按 CommonJS 惯用写法导出：
 * module.exports = { entry, name, description, tags }
 * 入口函数内通过 `this.$context` 获取运行上下文。
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

    /** 脚本元数据缓存：以脚本文件完整路径为 key，避免重复解析。 */
    private metaCache: Map<string, ScriptMeta | null> = new Map();

    /**
     * 运行用户自定义的脚本文件。
     *
     * 支持用户通过按钮一键运行库中的 JS 脚本，实现自定义自动化、批量处理等高级功能。
     * 脚本需通过 module.exports = { entry, name, description, tags } 导出，
     * 入口函数内使用 `this.$context` 访问 app / plugin / obsidian / requestUrl / notice。
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
            const scriptContent = await this.readScriptContent(scriptFilePath);
            if (!scriptContent) {
                return;
            }

            // 求值脚本模块，得到 module.exports
            const module = await this.evaluateModule(scriptContent);

            // 执行导出的入口函数
            await this.executeEntry(module, scriptFileName);
        } catch (error) {
            // 捕获并通知脚本运行异常
            const errorMessage = error instanceof Error ? error.message : String(error);
            new obsidian.Notice(t('script_run_failed') + `: ${errorMessage}`);
        }
    }

    /**
     * 从脚本文件读取结构化元数据（module.exports = { entry, name, description, tags }）。
     * 仅在文件作用域内声明函数、赋值 module.exports，不会触发入口函数的实际逻辑（无副作用）。
     * 读取结果会按文件路径缓存。
     *
     * @param file 脚本文件
     * @returns 解析到的 ScriptMeta；解析失败或格式不符的脚本返回 null
     */
    async getScriptMeta(file: obsidian.TFile): Promise<ScriptMeta | null> {
        const cacheKey = file.path;
        if (this.metaCache.has(cacheKey)) {
            return this.metaCache.get(cacheKey) ?? null;
        }

        let meta: ScriptMeta | null = null;
        try {
            const scriptContent = await this.app.vault.read(file);
            if (scriptContent) {
                const module = await this.evaluateModule(scriptContent);
                meta = this.parseMetaFromExports(module.exports);
            }
        } catch {
            meta = null;
        }
        this.metaCache.set(cacheKey, meta);
        return meta;
    }

    /**
     * 从多语言文本或普通字符串中，按当前语言取出展示文本。
     * 回退顺序：当前语言 → en → zh → 第一个有值 → 兜底 fallback。
     *
     * @param text 本地化文本对象或普通字符串
     * @param fallback 取不到时的兜底文本
     * @returns 当前语言下的展示文本
     */
    resolveLocalizedText(
        text: LocalizedText | string | undefined,
        fallback = ''
    ): string {
        if (!text) return fallback;
        if (typeof text === 'string') return text || fallback;
        const lang = getCurrentLang();
        return (
            text[lang] ||
            text.en ||
            text.zh ||
            Object.values(text).find((v) => !!v) ||
            fallback
        );
    }

    /**
     * 构建脚本运行上下文，作为脚本访问宿主能力的唯一入口。
     * @returns 脚本上下文对象
     */
    private createContext(): ScriptContext {
        return {
            app: this.app,
            plugin: this.plugin,
            obsidian,
            requestUrl: obsidian.requestUrl,
            notice: (message: string, duration?: number) =>
                new obsidian.Notice(message, duration),
        };
    }

    /**
     * 从 module.exports 中解析脚本元数据。
     * @param exports module.exports 的内容
     * @returns 提取到的 ScriptMeta，或 null
     */
    private parseMetaFromExports(exports: unknown): ScriptMeta | null {
        if (!exports || typeof exports !== 'object') return null;
        const obj = exports as Record<string, unknown>;
        if (typeof obj.entry !== 'function') return null;
        return {
            entry: obj.entry as ScriptEntry,
            name: obj.name as ScriptMeta['name'],
            description: obj.description as ScriptMeta['description'],
            tags: Array.isArray(obj.tags)
                ? obj.tags.filter((tag): tag is string => typeof tag === 'string')
                : undefined,
        };
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
     * @returns 脚本内容字符串，如果文件不存在则返回 null
     */
    private async readScriptContent(
        scriptFilePath: string
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
     * 在 CommonJS 风格的沙箱作用域内求值脚本，得到模块导出。
     * 只注入 module / exports，其余能力统一由入口函数的 `this.$context` 提供。
     *
     * @param scriptContent 脚本内容字符串
     * @returns 模块对象（含 exports）
     */
    private async evaluateModule(
        scriptContent: string
    ): Promise<{ exports: unknown }> {
        const module: { exports: unknown } = { exports: {} };

        type AsyncFunctionConstructor = new (...args: string[]) => (
            ...args: unknown[]
        ) => Promise<unknown>;
        const asyncFunctionPrototype = Object.getPrototypeOf(
            async function () {}
        ) as { constructor: AsyncFunctionConstructor };
        const AsyncFunctionConstructor = asyncFunctionPrototype.constructor;

        // 动态构造异步函数，仅注入 module 与 exports
        const fn: (...args: unknown[]) => Promise<unknown> = new AsyncFunctionConstructor(
            'module',
            'exports',
            scriptContent
        );

        // 执行脚本内容。脚本内部通过 module.exports = { ... } 覆盖导出对象。
        await fn.call(undefined, module, module.exports);

        return module;
    }

    /**
     * 执行模块导出的入口函数，并注入 `this.$context`。
     * @param module 模块对象
     * @param scriptFileName 脚本文件名（用于错误提示）
     */
    private async executeEntry(
        module: { exports: unknown },
        scriptFileName: string
    ): Promise<void> {
        const meta = this.parseMetaFromExports(module.exports);

        if (!meta) {
            // 未正确使用 module.exports = { entry, ... } 格式，弹出通知
            new obsidian.Notice(tWithParams('script_invalid_export', { scriptFileName }));
            return;
        }

        const scriptThis: ScriptThis = { $context: this.createContext() };
        await meta.entry.call(scriptThis);
    }
}
