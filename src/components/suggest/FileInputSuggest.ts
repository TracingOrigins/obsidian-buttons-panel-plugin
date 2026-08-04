/**
 * FileInputSuggest - 文件输入建议
 * 样式文件: FileInputSuggest.css
 */
import type { App, TFile } from 'obsidian';
import { AbstractInputSuggest, normalizePath } from 'obsidian';

/** 建议项中可附加的元数据（用于富展示：名称 + 描述）。 */
export interface SuggestionMeta {
    /** 展示名称（已按当前语言解析） */
    name?: string;
    /** 展示描述（已按当前语言解析） */
    description?: string;
}

export interface FileInputSuggestOptions {
    rootFolder?: string;
    fileExts?: string[];
    /**
     * 建议列表中是否只显示文件名（不含路径）。
     * - 默认 false：显示完整 path
     * - ScriptInput 等场景可传 true，只显示文件名
     */
    showFileNameOnly?: boolean;
    /**
     * 可选的元数据解析回调：给定文件返回名称/描述，用于富展示。
     * 返回 null/undefined 时回退到文件名展示。
     */
    getMeta?: (file: TFile) => SuggestionMeta | null | Promise<SuggestionMeta | null>;
    /** 是否展示描述行（第二行灰色小字）。默认 true（当 getMeta 返回 description 时生效）。 */
    showDescription?: boolean;
}

/**
 * FileInputSuggest 为文件输入框提供基于 AbstractInputSuggest 的文件下拉建议。
 * - 限制最多返回 50 条建议，防止列表过长
 */
export class FileInputSuggest extends AbstractInputSuggest<TFile> {
    private readonly options: FileInputSuggestOptions;
    /** 预加载并缓存的文件列表（已按 path 排序，并应用 root/fileExts 过滤） */
    private files: TFile[] = [];
    /** 元数据缓存：文件路径 -> SuggestionMeta，用于富展示。 */
    private metaCache: Map<string, SuggestionMeta | null> = new Map();

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
            const top = this.files.slice(0, 50);
            await this.prefetchMeta(top);
            return top;
        }

        const matches = this.files.filter(
            (file) =>
                file.path.toLowerCase().includes(normalized) ||
                file.basename.toLowerCase().includes(normalized)
        );

        const sliced = matches.slice(0, 50);
        await this.prefetchMeta(sliced);
        return sliced;
    }

    /**
     * 预取一批文件的元数据，供渲染时同步读取（避免 renderSuggestion 异步）。
     */
    private async prefetchMeta(files: TFile[]): Promise<void> {
        if (!this.options.getMeta) return;
        await Promise.all(
            files.map(async (file) => {
                if (this.metaCache.has(file.path)) return;
                try {
                    const meta = await this.options.getMeta!(file);
                    this.metaCache.set(file.path, meta ?? null);
                } catch {
                    this.metaCache.set(file.path, null);
                }
            })
        );
    }

    /**
     * 渲染每一条文件建议。
     * 若提供了 getMeta 且返回了有效元数据，则展示“名称 + 描述”两行；
     * 否则回退为仅显示文件名/路径。
     */
    renderSuggestion(file: TFile, el: HTMLElement): void {
        el.addClass('buttons-panel');

        const meta = this.metaCache.get(file.path) ?? null;
        const showDescription = this.options.showDescription ?? true;

        // 主行：优先显示文件名（实际选择与回填的值），无可解析 meta 时回退到路径
        const title = this.options.showFileNameOnly ? file.name : file.path;
        const titleEl = el.createDiv({ cls: 'file-suggestion-title' });
        titleEl.setText(title);

        // 次行：有 meta 时显示 “name：description”，否则回退到 description
        const name = meta?.name?.trim();
        const desc = meta?.description?.trim();
        let subLine = '';
        if (name && desc) {
            subLine = `${name}：${desc}`;
        } else if (desc) {
            subLine = desc;
        } else if (name) {
            subLine = name;
        }
        if (showDescription && subLine) {
            const descEl = el.createDiv({ cls: 'file-suggestion-desc' });
            descEl.setText(subLine);
        }
    }
}


