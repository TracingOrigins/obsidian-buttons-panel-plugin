import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { PanelConfig } from '@/types';

export interface ConfigContextValue {
    panelConfig: PanelConfig;
    setPanelConfig: (config: PanelConfig) => void;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

interface ConfigProviderProps {
    initialConfig: PanelConfig;
}

export const ConfigProvider: React.FC<React.PropsWithChildren<ConfigProviderProps>> = ({
    initialConfig,
    children,
}) => {
    const [panelConfig, updatePanelConfig] = useState<PanelConfig>(initialConfig);
    // 标记是否为内部 setPanelConfig 调用，避免被外部 prop 同步覆盖
    const internalUpdateRef = useRef(false);

    // 外部 prop 变化时同步到 state
    useEffect(() => {
        if (internalUpdateRef.current) {
            internalUpdateRef.current = false;
            return;
        }
        updatePanelConfig(initialConfig);
    }, [initialConfig]);

    const setPanelConfig = useCallback((config: PanelConfig) => {
        internalUpdateRef.current = true;
        updatePanelConfig(config);
    }, []);

    return (
        <ConfigContext.Provider
            value={{
                panelConfig,
                setPanelConfig,
            }}
        >
            {children}
        </ConfigContext.Provider>
    );
};

export function useConfigContext(): ConfigContextValue {
    const ctx = useContext(ConfigContext);
    if (!ctx) {
        throw new Error('useConfigContext must be used within ConfigProvider');
    }
    return ctx;
}


