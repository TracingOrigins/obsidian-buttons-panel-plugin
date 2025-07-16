// obsidian.ts
// Obsidian 相关工具函数。

/**
 * 刷新所有按钮面板设置页面（主页面标签页）。
 * 用于在设置变更后同步刷新所有相关视图。
 * @param app Obsidian应用实例
 */
import type { App } from 'obsidian';
export function refreshAllSettingsViews(app: App): void {
    const leaves = app.workspace.getLeavesOfType?.('buttons-panel-settings-view');
    if (Array.isArray(leaves)) {
        for (const leaf of leaves) {
            const view = leaf.view as any;
            if (view && typeof view.refreshSettings === 'function') {
                view.refreshSettings();
            } else if (view && typeof view.display === 'function') {
                view.display();
            }
        }
    }
}
