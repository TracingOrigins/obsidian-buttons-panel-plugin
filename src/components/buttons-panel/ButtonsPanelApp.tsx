import React from 'react';
import type { App } from 'obsidian';
import type { ButtonsPanelPlugin } from '@/types/plugin';
import type { CategoryConfig, PanelConfig } from '@/types';
import { PluginProvider } from '@/contexts/PluginContext';
import { ConfigProvider } from '@/contexts/ConfigContext';
import { MoveModeProvider } from '@/contexts/MoveModeContext';
import { ButtonsPanelLayout } from '@/components/buttons-panel/ButtonsPanelLayout';

interface ButtonsPanelAppProps {
    plugin: ButtonsPanelPlugin;
    app: App;
    categories: CategoryConfig[];
    panelConfig: PanelConfig;
    /** 顶部导航栏搜索关键字（由 ButtonsPanelView 传入） */
    searchQuery: string;
}

/**
 * ButtonsPanelApp
 * React 根组件：
 * - 负责拼装各类 Provider（Plugin / Config / MoveMode 等）
 * - 将业务 UI 交给 ButtonsPanelLayout 及其子组件
 */
export const ButtonsPanelApp: React.FC<ButtonsPanelAppProps> = ({
    plugin,
    app,
    categories,
    panelConfig,
    searchQuery,
}) => {
    return (
        <PluginProvider plugin={plugin} app={app}>
            <ConfigProvider initialConfig={panelConfig}>
                <MoveModeProvider plugin={plugin}>
                    <ButtonsPanelLayout
                        categories={categories}
                        searchQuery={searchQuery}
                    />
                </MoveModeProvider>
            </ConfigProvider>
        </PluginProvider>
    );
};
