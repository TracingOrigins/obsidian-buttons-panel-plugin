import type { App } from 'obsidian';
import { IButtonAction } from '@/actions/IButtonAction';
import { t } from '@/utils/i18n';
import { FileInput, FolderInput, FileNameInput } from '@/components/input';
import type { ButtonsPanelPlugin } from '@/types/plugin';

type ActionRenderContext = { app: App; plugin: ButtonsPanelPlugin };

/**
 * “创建文件”动作类，实现按钮动作表单的渲染、数据管理、校验和序列化。
 */
export class CreateFileAction implements IButtonAction {
    type = 'create_file';
    folderPath: string = '';
    fileName: string = '';
    templateName: string = '';
    private fileNameInput: FileNameInput | null = null;
    private folderInput: FolderInput | null = null;

    /**
     * 构造函数，初始化参数。
     */
    constructor(params: { folderPath?: string; fileName?: string; templateName?: string }) {
        this.folderPath = params.folderPath || '';
        this.fileName = params.fileName || '';
        this.templateName = params.templateName || '';
    }

    /**
     * 渲染表单控件，绑定数据双向同步。
     */
    render(container: HTMLElement, context: ActionRenderContext) {
        // 使用可复用的文件夹输入组件
        this.folderInput = new FolderInput(
            container,
            {
                name: t('folder'),
                description: t('folder_placeholder'),
                placeholder: t('folder_placeholder'),
                searchTooltip: t('search_folders_tooltip'),
            },
            { app: context.app, plugin: context.plugin },
            (value: string) => {
                this.folderPath = value;
                // 修正文件夹路径时，只要当前字段非空就清除该字段的错误样式
                if (this.folderPath && this.folderPath.trim()) {
                    this.folderInput?.clearError();
                }
                // 如果两个必填字段都已有效，则整体清除错误
                if (this.validate()) {
                    this.clearError();
                }
            }
        );

        // 使用可复用的文件名输入组件
        this.fileNameInput = new FileNameInput(
            container,
            {
                name: t('file_name'),
                description: t('file_name_desc'),
                placeholder: t('file_name_placeholder'),
                searchTooltip: t('search'),
                suggestTooltip: t('search_date_variables_tooltip'),
                onFileNameChange: (fileName: string) => {
                    this.fileName = fileName;
                },
            },
            { app: context.app, plugin: context.plugin },
            (value: string) => {
                this.fileName = value;
                // 修正文件名时，只要当前字段非空就清除该字段的错误样式
                if (this.fileName && this.fileName.trim()) {
                    this.fileNameInput?.clearError();
                }
                // 如果两个必填字段都已有效，则整体清除错误
                if (this.validate()) {
                    this.clearError();
                }
            }
        );

        // 使用可复用的文件输入组件作为模板选择
        const templateInput = new FileInput(
            container,
            {
                name: t('template_file'),
                description: t('template_file_desc'),
                placeholder: t('template_file_placeholder'),
                searchTooltip: t('search_files_tooltip'),
                rootFolder: context.plugin?.settings?.pathConfig?.templateFolderPath || '',
                fileExts: ['md'],
                showFileNameOnly: true,
            },
            { app: context.app, plugin: context.plugin },
            (value: string) => {
                this.templateName = value;
            }
        );

        // 设置初始值
        this.folderInput.setValue(this.folderPath || '');
        this.fileNameInput.setValue(this.fileName || '');
        templateInput.setValue(this.templateName || '');
    }

    /**
     * 校验表单数据有效性。
     */
    validate() {
        // 同时验证文件夹路径和文件名
        return !!(
            this.folderPath &&
            this.folderPath.trim() &&
            this.fileName &&
            this.fileName.trim()
        );
    }

    setError(message: string): void {
        // 如果验证失败，对文件夹路径和文件名输入框都设置错误状态
        if (!this.folderPath || !this.folderPath.trim()) {
            this.folderInput?.setError(message);
        }
        if (!this.fileName || !this.fileName.trim()) {
            this.fileNameInput?.setError(message);
        }
    }

    clearError(): void {
        // 清除所有输入框的错误状态
        this.fileNameInput?.clearError();
        this.folderInput?.clearError();
    }

    /**
     * 获取完整文件路径。
     */
    getFullPath(): string {
        if (!this.fileName) return '';
        if (!this.folderPath) return this.fileName;
        return `${this.folderPath}/${this.fileName}`;
    }

    /**
     * 序列化为 JSON 数据。
     */
    toJSON() {
        return {
            type: this.type,
            parameters: {
                folderPath: this.folderPath,
                fileName: this.fileName,
                templateName: this.templateName,
            },
        };
    }
}


