// i18n.ts
// 多语言国际化工具函数，支持中英文翻译。
import zh from '@/locales/zh.json';
import en from '@/locales/en.json';
import { ButtonsPanelPlugin } from '@/types/plugin';
import { getLanguage } from 'obsidian';

/**
 * 多语言词典映射，支持中英文。
 */
const locales: Record<string, Record<string, string>> = {
    zh,
    en,
};

/**
 * 获取当前语言设置。
 * 优先使用Obsidian官方的getLanguage方法，其次使用浏览器语言。
 * @returns 当前语言代码（zh或en）
 */
function getCurrentLang(): string {
    try {
        // 使用Obsidian官方的getLanguage方法获取语言设置
        const obsidianLang = getLanguage();
        // Obsidian支持的语言代码格式：zh-cn, zh-tw, en, en-gb等
        if (obsidianLang && obsidianLang.startsWith('zh')) {
            return 'zh';
        }
    } catch (error) {
        console.log('获取Obsidian语言设置失败:', error);
    }
    return 'en';
}

/**
 * 获取翻译文本。
 * @param key 翻译键名
 * @param plugin 插件实例（可选，保持向后兼容）
 * @returns 翻译后的文本，如果找不到则返回键名本身
 */
export function t(key: string, plugin?: ButtonsPanelPlugin): string {
    const lang = getCurrentLang();
    return locales[lang]?.[key] || locales['en']?.[key] || key;
}

/**
 * 获取带参数的翻译文本。
 * @param key 翻译键名
 * @param params 参数对象
 * @param plugin 插件实例（可选，保持向后兼容）
 * @returns 翻译后的文本，参数会被替换
 */
export function tWithParams(
    key: string,
    params: Record<string, string | number>,
    plugin?: ButtonsPanelPlugin
): string {
    let text = t(key, plugin);
    // 替换参数，格式：{paramName}
    Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
    });
    return text;
}
