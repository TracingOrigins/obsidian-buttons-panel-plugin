import React from 'react';
import { useConfigContext } from '@/contexts/ConfigContext';
import './ButtonsPanelLayout.css';

/**
 * PanelHeader
 * 面板内容区域内部的标题容器：
 * - 仅负责显示面板标题（导航栏挂载在 Obsidian 原生 view-header 上方，由 NavigationBarRenderer 负责）；
 * 
 * 使用 React.memo 优化性能，避免不必要的重新渲染
 */
export const PanelHeader: React.FC = React.memo(() => {
    const { panelConfig } = useConfigContext();

    if (!panelConfig.showTitle) {
        return null;
    }

    return (
        <div className="buttons-panel-header">
            <div className="buttons-panel-header-title">
                <div className="buttons-panel-title">{panelConfig.title}</div>
            </div>
        </div>
    );
});

PanelHeader.displayName = 'PanelHeader';

