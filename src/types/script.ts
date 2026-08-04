/**
 * 脚本元数据与运行上下文的类型定义。
 *
 * 用户自定义脚本（位于脚本文件夹）按 CommonJS 惯用写法导出：
 *
 * module.exports = {
 *     entry: main,
 *     name: { zh: '...', en: '...', ru: '...' },
 *     description: { zh: '...', en: '...', ru: '...' },
 *     tags: ['file', 'batch'],
 * };
 *
 * async function main() {
 *     const { app, obsidian, notice } = this.$context;
 *     // ...
 * }
 *
 * 入口函数通过 `this.$context` 获取运行上下文，不再依赖函数参数与模块级注入变量。
 */

import type * as obsidian from 'obsidian';
import type { ButtonsPanelPlugin } from '@/types/plugin';

/** 多语言文本，键为语言代码，值为对应语言的文本。 */
export type LocalizedText = {
    zh: string;
    en: string;
    ru: string;
    [lang: string]: string;
};

/** 脚本入口函数类型。运行时通过 `this.$context` 获取上下文。 */
export type ScriptEntry = (this: ScriptThis) => unknown;

/**
 * 脚本运行上下文。
 * 入口函数内通过 `this.$context` 获取，是脚本访问宿主能力的唯一入口。
 */
export interface ScriptContext {
    /** 运行中的 Obsidian App 实例（不是类，不能 new）。 */
    app: obsidian.App;
    /** 按钮面板插件实例。 */
    plugin?: ButtonsPanelPlugin;
    /** obsidian 模块命名空间，可解构 Notice / TFile / Modal 等。 */
    obsidian: typeof obsidian;
    /** 发起 HTTP 请求（等价于 obsidian.requestUrl），规避 CORS。 */
    requestUrl: typeof obsidian.requestUrl;
    /** 弹出通知，等价于 new obsidian.Notice(message)。 */
    notice: (message: string, duration?: number) => obsidian.Notice;
}

/** 入口函数的 this 绑定对象。 */
export interface ScriptThis {
    /** 脚本运行上下文。 */
    $context: ScriptContext;
}

/** 脚本元数据结构。name/description 支持本地化对象或普通字符串。 */
export interface ScriptMeta {
    /** 脚本入口函数（必填）。 */
    entry: ScriptEntry;
    /** 脚本名称（可本地化，或普通字符串）。 */
    name?: LocalizedText | string;
    /** 脚本描述（可本地化，或普通字符串）。 */
    description?: LocalizedText | string;
    /** 脚本标签，用于分类与检索。 */
    tags?: string[];
}

/** 脚本模块导出形态：module.exports = ScriptMeta。 */
export type ScriptModuleExports = ScriptMeta;
