// i18n.ts
// 多语言国际化工具函数，支持中英俄语翻译。
import zh from '@/locales/zh.json';
import en from '@/locales/en.json';
import ru from '@/locales/ru.json';
import { getLanguage } from 'obsidian';

/**
 * 多语言词典映射。
 */
const locales: Record<string, Record<string, string>> = {
    zh,
    en,
    ru,
};

/**
 * 获取当前语言设置。
 * 优先使用Obsidian官方的getLanguage方法，其次使用浏览器语言。
 * @returns 当前语言代码（zh或en）
 */
function getCurrentLang(): string {
    try {
        const obsidianLang = getLanguage();
        if (obsidianLang && obsidianLang.startsWith('zh')) {
            return 'zh';
        }
        if (obsidianLang && obsidianLang.startsWith('ru')) {
            return 'ru';
        }
    } catch (error) {
        console.warn('获取Obsidian语言设置失败:', error);
    }
    return 'en';
}

/**
 * 获取翻译文本。
 * @param key 翻译键名
 * @returns 翻译后的文本，如果找不到则返回键名本身
 */
export function t(key: string): string {
    const lang = getCurrentLang();
    return locales[lang]?.[key] || locales['en']?.[key] || key;
}

/**
 * 获取带参数的翻译文本。
 * @param key 翻译键名
 * @param params 参数对象
 * @returns 翻译后的文本，参数会被替换
 */
export function tWithParams(key: string, params: Record<string, string | number>): string {
    let text = t(key);
    // 替换参数，格式：{paramName}
    Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
    });
    return text;
}
