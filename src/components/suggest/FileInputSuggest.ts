/**
 * FileInputSuggest - 文件输入建议
 * 样式文件: FileInputSuggest.css
 */
import type { App, TFile } from 'obsidian';
import { AbstractInputSuggest, normalizePath } from 'obsidian';

export interface FileInputSuggestOptions {
    rootFolder?: string;
    fileExts?: string[];
    /**
     * 建议列表中是否只显示文件名（不含路径）。
     * - 默认 false：显示完整 path
     * - ScriptInput 等场景可传 true，只显示文件名
     */
    showFileNameOnly?: boolean;
}

/**
 * FileInputSuggest 为文件输入框提供基于 AbstractInputSuggest 的文件下拉建议。
 * - 限制最多返回 50 条建议，防止列表过长
 */
export class FileInputSuggest extends AbstractInputSuggest<TFile> {
    private readonly options: FileInputSuggestOptions;
    /** 预加载并缓存的文件列表（已按 path 排序，并应用 root/fileExts 过滤） */
    private files: TFile[] = [];

    constructor(app: App, inputEl: HTMLInputElement, options: FileInputSuggestOptions) {
        super(app, inputEl);
        this.options = options;
        this.loadFiles();
    }

    /**
     * 从 vault 中加载所有符合条件的文件并排序。
     */
    private loadFiles(): void {
        let files = this.app.vault.getFiles();

        if (this.options.fileExts && this.options.fileExts.length > 0) {
            files = files.filter((file) => this.options.fileExts!.includes(file.extension));
        }

        if (this.options.rootFolder) {
            const root = normalizePath(this.options.rootFolder);
            const prefix = root.endsWith('/') ? root : root + '/';
            files = files.filter((file) => file.path.startsWith(prefix));
        }

        files.sort((a, b) => a.path.localeCompare(b.path));
        this.files = files;
    }

    protected async getSuggestions(query: string): Promise<TFile[]> {
        const normalized = query.trim().toLowerCase();

        // 输入为空时，返回前 50 个文件作为默认建议
        if (!normalized) {
            return this.files.slice(0, 50);
        }

        const matches = this.files.filter(
            (file) =>
                file.path.toLowerCase().includes(normalized) ||
                file.basename.toLowerCase().includes(normalized)
        );

        // 限制最多返回 50 条建议
        return matches.slice(0, 50);
    }

    /**
     * 渲染每一条文件建议。
     */
    renderSuggestion(file: TFile, el: HTMLElement): void {
        const text = this.options.showFileNameOnly ? file.name : file.path;
        el.createDiv({
            text,
            cls: 'buttons-panel-file-suggestion',
        });
    }
}


