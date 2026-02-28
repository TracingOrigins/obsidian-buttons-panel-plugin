/**
 * FolderInputSuggest - 文件夹输入建议
 * 样式文件: FolderInputSuggest.css
 */
import type { App } from 'obsidian';
import { AbstractInputSuggest, TFolder } from 'obsidian';

/**
 * FolderInputSuggest 为文件夹路径输入框提供基于 AbstractInputSuggest 的下拉建议。
 */
export class FolderInputSuggest extends AbstractInputSuggest<string> {
    /** 预加载并缓存的文件夹路径列表（已排序） */
    private folders: string[] = [];

    constructor(app: App, inputEl: HTMLInputElement) {
        super(app, inputEl);
        this.loadFolders();
    }

    /**
     * 从 vault 中加载所有文件夹路径并排序。
     */
    private loadFolders(): void {
        const folders: string[] = [];
        const allFiles = this.app.vault.getAllLoadedFiles();
        for (const file of allFiles) {
            if (file instanceof TFolder) {
                folders.push(file.path.replace(/\/$/, ''));
            }
        }
        folders.sort((a, b) => a.localeCompare(b));
        this.folders = folders;
    }

    protected async getSuggestions(query: string): Promise<string[]> {
        const normalized = query.trim().toLowerCase();

        // 输入为空时，返回前 50 个文件夹作为默认建议
        if (!normalized) {
            return this.folders.slice(0, 50);
        }

        const matches = this.folders.filter((folderPath) =>
            folderPath.toLowerCase().includes(normalized)
        );

        // 限制最多返回 50 条建议
        return matches.slice(0, 50);
    }

    /**
     * 渲染每一条文件夹建议。
     */
    renderSuggestion(folder: string, el: HTMLElement): void {
        el.createDiv({
            text: folder,
            cls: 'buttons-panel-folder-suggestion',
        });
    }
}


