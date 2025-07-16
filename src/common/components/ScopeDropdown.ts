import { Setting } from 'obsidian';
import { t } from '@/common/utils/i18n';

/**
 * ScopeDropdown 组件用于在设置面板中创建作用域下拉选择框。
 */
export interface ScopeDropdownOptions {
    /** 下拉框名称 */
    name?: string;
    /** 下拉框描述 */
    description?: string;
    /** 默认值 */
    value?: string;
    /** 作用域变更回调 */
    onScopeChange?: (scope: string) => void;
    /** 插件实例 */
    plugin?: any;
}

/**
 * ScopeDropdown 类，封装作用域下拉选择逻辑。
 */
export class ScopeDropdown {
    private setting: Setting;
    private value: string;

    /**
     * 构造函数
     * @param container 容器元素
     * @param options 组件配置项
     * @param context 上下文（含 app、plugin）
     */
    constructor(container: HTMLElement, options: ScopeDropdownOptions, context: any) {
        this.value = options.value ?? 'global';
        this.setting = new Setting(container)
            .setName(options.name ?? t('action_scope', context.plugin))
            .setDesc(options.description ?? t('action_scope_desc', context.plugin))
            .addDropdown((dropdown) => {
                const scopeOptions = [
                    { value: 'global', label: t('global', context.plugin) },
                    { value: 'current-editor', label: t('current_editor', context.plugin) },
                ];
                scopeOptions.forEach((opt) => dropdown.addOption(opt.value, opt.label));
                dropdown.setValue(this.value);
                dropdown.onChange((value) => {
                    this.value = value;
                    options.onScopeChange?.(value);
                });
            });
    }

    /** 获取当前值 */
    getValue(): string {
        return this.value;
    }

    /** 设置当前值（注意：不会直接操作下拉框 UI） */
    setValue(value: string) {
        this.value = value;
        // 这里没有直接操作 dropdown，因为 obsidian Setting 没有暴露 dropdown 实例
        // 如需动态更新 UI，可扩展为保存 dropdown 实例并 setValue
    }
}
