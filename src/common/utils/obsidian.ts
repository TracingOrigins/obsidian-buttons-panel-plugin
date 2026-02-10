import type { App, WorkspaceLeaf } from 'obsidian';
import { ButtonsPanelSettingsView } from '@/views/ButtonsPanelSettingsView';
import { ButtonsPanelView } from '@/views/ButtonsPanelView';
// obsidian.ts
// Obsidian 相关工具函数。

/**
 * 刷新所有按钮面板设置页面（主页面标签页）。
 * 用于在设置变更后同步刷新所有相关视图。
 * @param app Obsidian应用实例
 */
export function refreshAllSettingsViews(app: App): void {
    const leaves = app.workspace.getLeavesOfType?.('buttons-panel-settings-view');
    if (Array.isArray(leaves)) {
        for (const leaf of leaves) {
            try {
				// 安全处理 DeferredView (Obsidian v1.7.2+)
				if (leaf.view instanceof ButtonsPanelSettingsView) {
					const view = leaf.view;
					if (view && typeof view.refreshSettings === 'function') {
						view.refreshSettings();
					}
				}
            } catch (error) {
                console.warn('刷新设置视图时出错:', error);
            }
        }
    }
}

/**
 * 获取最后激活的内容标签页（排除指定 viewType，如按钮面板）
 * @param app Obsidian应用实例
 * @param excludeViewType 要排除的 viewType（如 'buttons-panel-view'）
 * @param lastActiveLeaf 当前激活的 leaf（可选，优先使用）
 */
export function getLastActiveContentLeaf(
    app: App,
    excludeViewType: string,
    lastActiveLeaf?: WorkspaceLeaf | null
): WorkspaceLeaf | null {
    // 优先使用传入的 lastActiveLeaf
    if (
        lastActiveLeaf &&
        lastActiveLeaf.view &&
        lastActiveLeaf.view.getViewType &&
        lastActiveLeaf.view.getViewType() !== excludeViewType
    ) {
        return lastActiveLeaf;
    }
    // 兜底：遍历所有 leaf，返回第一个非按钮面板的激活 leaf
    const allLeaves = app.workspace.getLeavesOfType?.(''); // 获取所有类型
    if (Array.isArray(allLeaves)) {
        for (const leaf of allLeaves) {
            if (
                leaf &&
                leaf.view &&
                leaf.view.getViewType &&
                leaf.view.getViewType() !== excludeViewType
            ) {
                return leaf;
            }
        }
    }
    return null;
}
