import React, { createContext, useContext } from 'react';
import type { App } from 'obsidian';
import type { ButtonsPanelPlugin } from '@/types/plugin';

export interface PluginContextValue {
    plugin: ButtonsPanelPlugin;
    app: App;
}

const PluginContext = createContext<PluginContextValue | null>(null);

export const PluginProvider: React.FC<React.PropsWithChildren<PluginContextValue>> = ({
    plugin,
    app,
    children,
}) => {
    return <PluginContext.Provider value={{ plugin, app }}>{children}</PluginContext.Provider>;
};

export function usePluginContext(): PluginContextValue {
    const ctx = useContext(PluginContext);
    if (!ctx) {
        throw new Error('usePluginContext must be used within PluginProvider');
    }
    return ctx;
}


