import type { App, TAbstractFile } from 'obsidian';
import { AbstractInputSuggest, TFolder } from 'obsidian';

/**
 * FolderInputSuggest 为文件夹路径输入框提供基于 AbstractInputSuggest 的下拉建议。
 */
export class FolderInputSuggest extends AbstractInputSuggest<string> {
    constructor(app: App, inputEl: HTMLInputElement) {
        super(app, inputEl);
    }

    private getAllFolders(): string[] {
        const folders: string[] = [];
        const traverse = (folder: TFolder) => {
            folders.push(folder.path);
            const children: TAbstractFile[] = folder.children ?? [];
            for (const child of children) {
                if (child instanceof TFolder) {
                    traverse(child);
                }
            }
        };
        const root = this.app.vault.getRoot();
        if (root instanceof TFolder) {
            traverse(root);
        }
        return folders.sort();
    }

    protected async getSuggestions(query: string): Promise<string[]> {
        const allFolders = this.getAllFolders();
        const normalized = query.trim().toLowerCase();
        if (!normalized) return allFolders;
        return allFolders.filter((folder) => folder.toLowerCase().includes(normalized));
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


