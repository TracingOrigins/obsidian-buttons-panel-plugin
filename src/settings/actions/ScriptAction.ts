import { IButtonAction } from './IButtonAction';
import { t } from '@/utils/i18n';
import { ScriptInput, ScopeDropdown } from '@/settings/components';

/**
 * “运行脚本”动作类，实现按钮动作表单的渲染、数据管理、校验和序列化。
 */
export class ScriptAction implements IButtonAction {
    type = 'script';
    scriptName: string;
    args?: any[];
    scope?: string;
    private scriptInput: ScriptInput | null = null;

    /**
     * 构造函数，初始化参数。
     */
    constructor(params: { scriptName: string; args?: any[]; scope?: string }) {
        this.scriptName = params.scriptName;
        this.args = params.args;
        this.scope = params.scope ?? 'global';
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

        // 使用可复用的作用域下拉组件
        const scopeDropdown = new ScopeDropdown(
            container,
            {
                name: t('action_scope', context.plugin),
                description: t('action_scope_desc', context.plugin),
                onScopeChange: (value: string) => {
                    this.scope = value;
                },
            },
            { app: context.app, plugin: context.plugin }
        );

        // 设置初始值
        this.scriptInput.setValue(this.scriptName || '');
        scopeDropdown.setValue(this.scope || 'global');
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
                scope: this.scope ?? 'global',
            },
        };
    }
}
