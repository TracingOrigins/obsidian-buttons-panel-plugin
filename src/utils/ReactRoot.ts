import { createRoot, Root } from 'react-dom/client';
import type React from 'react';

/**
 * ReactRoot
 * 封装 React 18 createRoot，在 Obsidian ItemView 中安全挂载/卸载 React 应用。
 */
export class ReactRoot {
    private root: Root | null = null;
    private container: HTMLElement | null = null;

    /**
     * 在指定容器上挂载 React 组件。
     * @param container Obsidian 提供的容器元素（通常是 this.contentEl）
     * @param component 根 React 元素
     */
    mount(container: HTMLElement, component: React.ReactElement): void {
        this.container = container;
        this.root = createRoot(container);
        this.root.render(component);
    }

    /**
     * 重新渲染（可选），通常用于需要在不卸载的情况下更新根组件时。
     */
    update(component: React.ReactElement): void {
        if (!this.root) {
            console.warn('ReactRoot.update: root is null, cannot update');
            return;
        }
        if (!this.container || !this.container.isConnected) {
            console.warn('ReactRoot.update: container is null or disconnected, cannot update');
            return;
        }
        try {
            this.root.render(component);
        } catch (error) {
            console.error('ReactRoot.update: error rendering component', error);
            // 如果更新失败，尝试重新挂载
            if (this.container) {
                try {
                    this.root.unmount();
                    this.root = createRoot(this.container);
                    this.root.render(component);
                } catch (remountError) {
                    console.error('ReactRoot.update: error remounting', remountError);
                }
            }
        }
    }

    /**
     * 卸载 React 应用并清空容器。
     */
    unmount(): void {
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
        if (this.container) {
            this.container.empty();
            this.container = null;
        }
    }
}


