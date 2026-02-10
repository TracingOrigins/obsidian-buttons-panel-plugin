import type { App, TFile } from 'obsidian';
import { AbstractInputSuggest, normalizePath } from 'obsidian';

export interface FileInputSuggestOptions {
    rootFolder?: string;
    fileExts?: string[];
}

/**
 * FileInputSuggest 为文件输入框提供基于 AbstractInputSuggest 的文件下拉建议。
 */
export class FileInputSuggest extends AbstractInputSuggest<TFile> {
    private readonly options: FileInputSuggestOptions;

    constructor(app: App, inputEl: HTMLInputElement, options: FileInputSuggestOptions) {
        super(app, inputEl);
        this.options = options;
    }

    protected async getSuggestions(query: string): Promise<TFile[]> {
        let files = this.app.vault.getFiles();

        if (this.options.fileExts && this.options.fileExts.length > 0) {
            files = files.filter((file) => this.options.fileExts!.includes(file.extension));
        }

        if (this.options.rootFolder) {
            const root = normalizePath(this.options.rootFolder);
            files = files.filter((file) => file.path.startsWith(root + '/'));
        }

        const normalized = query.trim().toLowerCase();
        if (!normalized) return files;

        return files.filter(
            (file) =>
                file.path.toLowerCase().includes(normalized) ||
                file.basename.toLowerCase().includes(normalized)
        );
    }

    /**
     * 渲染每一条文件建议。
     */
    renderSuggestion(file: TFile, el: HTMLElement): void {
        el.createDiv({
            text: file.path,
            cls: 'buttons-panel-file-suggestion',
        });
    }
}


