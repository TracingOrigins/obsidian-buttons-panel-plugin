import { IButtonAction } from './IButtonAction';
import { t } from '@/utils/i18n';
import { FileInput } from '@/settings/components';

/**
 * “打开文件”动作类，实现按钮动作表单的渲染、数据管理、校验和序列化。
 */
export class FileAction implements IButtonAction {
    type = 'file';
    filePath: string;
    private fileInput: FileInput | null = null;

    /**
     * 构造函数，初始化参数。
     */
    constructor(params: { filePath: string }) {
        this.filePath = params.filePath;
    }

    /**
     * 渲染表单控件，绑定数据双向同步。
     */
    render(container: HTMLElement, context: any) {
        // 使用可复用的文件输入组件
        this.fileInput = new FileInput(
            container,
            {
                name: t('file', context.plugin),
                description: t('file_desc', context.plugin),
                placeholder: t('file_path_placeholder', context.plugin),
                searchTooltip: t('search_files_tooltip', context.plugin),
                rootFolder: '',
                fileExts: [],
                showFileNameOnly: false,
            },
            { app: context.app, plugin: context.plugin },
            (value: string) => {
                this.filePath = value;
            }
        );

        // 设置初始值
        this.fileInput.setValue(this.filePath || '');
    }

    /**
     * 校验表单数据有效性。
     */
    validate() {
        return !!(this.filePath && this.filePath.trim());
    }

    setError(message: string): void {
        this.fileInput?.setError(message);
    }

    clearError(): void {
        this.fileInput?.clearError();
    }

    /**
     * 序列化为 JSON 数据。
     */
    toJSON() {
        return { type: this.type, parameters: { filePath: this.filePath } };
    }
}
