// NavigationBarRenderer.tsx
// 使用 React 渲染面板顶部的导航栏，但仍由 ItemView 决定挂载位置（view-header 之上）。
import React from 'react';
import { ButtonsPanelPlugin } from '@/types/plugin';
import { PanelConfig } from '@/types';
import { ReactRoot } from '@/utils/ReactRoot';
import { NavigationBar } from '@/components/shared/NavigationBar';

/**
 * NavigationBarRenderer
 * 负责在 Obsidian 的视图容器中找到（或创建） .nav-header 容器，
 * 并通过 ReactRoot 渲染 NavigationBar 组件。
 *
 * 注意：
 * - NavigationBar 组件是纯 React UI（见 src/components/shared/NavigationBar.tsx）
 * - Renderer 负责把它插入到 Obsidian 原生 DOM 结构中（.view-header 同级、且位于其上方）
 */
export class NavigationBarRenderer {
    private plugin: ButtonsPanelPlugin;
    private panelConfig: PanelConfig;
    private reactRoot: ReactRoot | null = null;

    constructor(plugin: ButtonsPanelPlugin, panelConfig: PanelConfig) {
        this.plugin = plugin;
        this.panelConfig = panelConfig;
    }

    /**
     * 在 Obsidian 视图中创建/更新顶部导航栏 React 组件。
     * @param containerEl ItemView 的根容器元素
     * @param onRenderComplete 可选的渲染完成回调
     */
    createNavigationBar(containerEl: HTMLElement, onRenderComplete?: () => void): void {
        // 在 .view-header 之前插入 .nav-header 外层容器
        let actionsWrapper: HTMLElement | null = containerEl.querySelector('.nav-header');

        if (!actionsWrapper) {
            actionsWrapper = document.createElement('div');
            actionsWrapper.className = 'nav-header';
            const viewHeader = containerEl.querySelector('.view-header');
            if (viewHeader?.parentNode) {
                viewHeader.parentNode.insertBefore(actionsWrapper, viewHeader);
            } else {
                containerEl.prepend(actionsWrapper);
            }
        }

        const element = (
            <NavigationBar
                panelViewType={this.panelConfig.panelViewType}
                displayStyle={this.panelConfig.displayStyle}
                enableEditMode={this.panelConfig.enableEditMode}
                showTopNavBar={this.panelConfig.showTopNavBar}
                onToggleView={() => {
                    this.panelConfig.panelViewType =
                        this.panelConfig.panelViewType === 'tabs' ? 'list' : 'tabs';
                    void this.plugin.saveSettings();
                    document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
                }}
                onToggleStyle={() => {
                    this.panelConfig.displayStyle =
                        this.panelConfig.displayStyle === 'icon_top' ? 'default' : 'icon_top';
                    void this.plugin.saveSettings();
                    document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
                }}
                onToggleEditMode={() => {
                    this.panelConfig.enableEditMode = !this.panelConfig.enableEditMode;
                    void this.plugin.saveSettings();
                    document.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
                }}
                onOpenSettings={() => {
                    const pluginWithSettings = this.plugin as unknown as {
                        activateSettingsView?: () => void;
                    };
                    pluginWithSettings.activateSettingsView?.();
                }}
                onSearchChange={(query) => {
                    document.dispatchEvent(
                        new CustomEvent('buttons-panel-search', {
                            detail: { query },
                        })
                    );
                }}
            />
        );

        if (!this.reactRoot) {
            this.reactRoot = new ReactRoot();
            this.reactRoot.mount(actionsWrapper, element);
        } else {
            this.reactRoot.update(element);
        }

        if (onRenderComplete) {
            onRenderComplete();
        }
    }

    /**
     * 更新面板配置引用（由 ButtonsPanelView 调用）。
     * @param panelConfig 新的面板配置
     */
    updatePanelConfig(panelConfig: PanelConfig): void {
        this.panelConfig = panelConfig;
    }

    /**
     * 可选：卸载 React 根节点（当前由 Obsidian 视图整体卸载兜底）。
     */
    destroy(): void {
        if (this.reactRoot) {
            this.reactRoot.unmount();
            this.reactRoot = null;
        }
    }
}


