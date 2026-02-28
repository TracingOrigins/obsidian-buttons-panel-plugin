/**
 * IconInputSuggest - 图标输入建议
 * 样式文件: IconInputSuggest.css
 */
import type { App } from 'obsidian';
import { AbstractInputSuggest, getIconIds, setIcon } from 'obsidian';

/**
 * IconInputSuggest 为图标输入框提供基于图标 ID 的下拉建议。
 */
export class IconInputSuggest extends AbstractInputSuggest<string> {
    private readonly allIconIds: string[];
    /** 单次最多渲染的建议数量（避免一次性加载全部图标导致卡顿） */
    private readonly maxResults: number = 200;

    constructor(app: App, inputEl: HTMLInputElement) {
        super(app, inputEl);
        this.allIconIds = getIconIds?.() ?? [];
        // 限制一次渲染的建议数量（Obsidian 内置支持）
        this.limit = this.maxResults;
    }

    protected async getSuggestions(query: string): Promise<string[]> {
        const normalized = query.trim().toLowerCase();
        // 空查询：只返回前 maxResults 个，避免一次性列出全部
        if (!normalized) {
            return this.allIconIds.slice(0, this.maxResults);
        }

        // 懒加载式过滤：匹配到 maxResults 条后就停止遍历
        const results: string[] = [];
        for (const id of this.allIconIds) {
            if (id && id.toLowerCase().includes(normalized)) {
                results.push(id);
                if (results.length >= this.maxResults) break;
            }
        }
        return results;
    }

    renderSuggestion(iconId: string, el: HTMLElement): void {
        el.addClass('buttons-panel');
        const container = el.createDiv({
            cls: 'icon-suggestion',
        });
        container.createSpan({ cls: 'icon-suggestion__icon' });
        if (iconId) {
            setIcon(container, iconId);
        }
        container.createSpan({ text: iconId, cls: 'icon-suggestion__label' });
    }
}


