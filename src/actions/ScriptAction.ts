import type { App } from 'obsidian';
import { IButtonAction } from '@/actions/IButtonAction';
import { t } from '@/utils/i18n';
import { ScriptInput } from '@/components/input';
import type { ButtonsPanelPlugin } from '@/types/plugin';

type ActionRenderContext = { app: App; plugin: ButtonsPanelPlugin };

/**
 * “运行脚本”动作类，实现按钮动作表单的渲染、数据管理、校验和序列化。
 */
export class ScriptAction implements IButtonAction {
    type = 'script';
    scriptName: string;
    args?: unknown[];
    private scriptInput: ScriptInput | null = null;

    /**
     * 构造函数，初始化参数。
     */
    constructor(params: { scriptName: string; args?: unknown[] }) {
        this.scriptName = params.scriptName;
        this.args = params.args;
    }

    /**
     * 渲染表单控件，绑定数据双向同步。
     */
    render(container: HTMLElement, context: ActionRenderContext) {
        // 使用可复用的脚本输入组件
        this.scriptInput = new ScriptInput(
            container,
            {
                name: t('script_file'),
                description: t('script_file_desc'),
                placeholder: t('script_file_placeholder'),
                searchTooltip: t('search_files_tooltip'),
                rootFolder: context.plugin?.settings?.pathConfig?.scriptFolderPath || '',
            },
            { app: context.app, plugin: context.plugin },
            (value: string) => {
                this.scriptName = value;
                // 当用户输入或通过下拉建议选择了有效脚本文件时，自动清除错误提示
                if (this.validate()) {
                    this.clearError();
                }
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


