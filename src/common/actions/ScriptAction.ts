import { IButtonAction } from '@/common/actions/IButtonAction';
import { t } from '@/common/utils/i18n';
import { ScriptInput } from '@/common/components';

/**
 * “运行脚本”动作类，实现按钮动作表单的渲染、数据管理、校验和序列化。
 */
export class ScriptAction implements IButtonAction {
    type = 'script';
    scriptName: string;
    args?: any[];
    private scriptInput: ScriptInput | null = null;

    /**
     * 构造函数，初始化参数。
     */
    constructor(params: { scriptName: string; args?: any[] }) {
        this.scriptName = params.scriptName;
        this.args = params.args;
    }

    /**
     * 渲染表单控件，绑定数据双向同步。
     */
    render(container: HTMLElement, context: any) {
        // 使用可复用的脚本输入组件
        this.scriptInput = new ScriptInput(
            container,
            {
                name: t('script_file', context.plugin),
                description: t('script_file_desc', context.plugin),
                placeholder: t('script_file_placeholder', context.plugin),
                searchTooltip: t('search_files_tooltip', context.plugin),
                rootFolder: context.plugin?.settings?.pathConfig?.scriptFolderPath || '',
            },
            { app: context.app, plugin: context.plugin },
            (value: string) => {
                this.scriptName = value;
            }
        );

        // 设置初始值
        this.scriptInput.setValue(this.scriptName || '');
    }

    /**
     * 校验表单数据有效性。
     */
    validate() {
        return !!(this.scriptName && this.scriptName.trim());
    }

    setError(message: string): void {
        this.scriptInput?.setError(message);
    }

    clearError(): void {
        this.scriptInput?.clearError();
    }

    /**
     * 序列化为 JSON 数据。
     */
    toJSON() {
        return {
            type: this.type,
            parameters: {
                scriptName: this.scriptName,
                args: this.args,
            },
        };
    }
}
