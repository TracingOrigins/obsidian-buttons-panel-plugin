import React from 'react';
import type { App } from 'obsidian';
import type { ButtonsPanelPlugin } from '@/types/plugin';
import type { CategoryConfig, PanelConfig } from '@/types';
import { PluginProvider } from '@/contexts/PluginContext';
import { ConfigProvider } from '@/contexts/ConfigContext';
import { ButtonsPanelLayout } from '@/components/buttons-panel/ButtonsPanelLayout';

interface ButtonsPanelAppProps {
    plugin: ButtonsPanelPlugin;
    app: App;
    categories: CategoryConfig[];
    panelConfig: PanelConfig;
    searchQuery: string;
}

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
                <ButtonsPanelLayout categories={categories} searchQuery={searchQuery} />
            </ConfigProvider>
        </PluginProvider>
    );
};
