import type { App } from 'obsidian';
import { AbstractInputSuggest, moment } from 'obsidian';

/**
 * FileNameInputSuggest 为文件名输入框提供日期变量格式的下拉建议。
 */
export class FileNameInputSuggest extends AbstractInputSuggest<string> {
    private readonly dateFormats: string[] = [
        'YYYY-MM-DD',
        'YYYY-MM-DD-HH-mm',
        'YYYY-MM-DD-HH-mm-ss',
        'YYYYMMDD',
        'YYYYMMDDHHmm',
        'YYYYMMDDHHmmss',
        'YYMMDD',
        'gggg-[W]WW',
    ];

    constructor(app: App, inputEl: HTMLInputElement) {
        super(app, inputEl);
    }

    protected async getSuggestions(query: string): Promise<string[]> {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return this.dateFormats;
        return this.dateFormats.filter((format) => format.toLowerCase().includes(normalized));
    }

    /**
     * 将选中的格式写入输入框，使用 {{DATE:...}} 语法。
     */
    override selectSuggestion(format: string, evt: MouseEvent | KeyboardEvent): void {
        const value = `{{DATE:${format}}}`;
        this.setValue(value);
        super.selectSuggestion(format, evt);
    }

    /**
     * 渲染每一条日期格式建议（包含预览）。
     */
    renderSuggestion(format: string, el: HTMLElement): void {
        const preview = moment().format(format);
        const container = el.createDiv({ cls: 'buttons-panel-filename-suggestion' });
        container.createDiv({ text: `{{DATE:${format}}}` });
        container.createDiv({
            text: `${preview}.md`,
            cls: 'format-preview',
        });
    }

    /**
     * 覆盖 getValue / setValue，可在外部按需使用。
     */
    getDisplayValue(format: string): string {
        const preview = moment().format(format);
        return `{{DATE:${format}}} — ${preview}.md`;
    }
}


