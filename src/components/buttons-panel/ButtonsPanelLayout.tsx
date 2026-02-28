import React from 'react';
import { useMoveModeContext } from '@/contexts/MoveModeContext';
import type { CategoryConfig } from '@/types';
import { PanelHeader } from '@/components/buttons-panel/PanelHeader';
import { PanelBody } from '@/components/buttons-panel/PanelBody';
import './ButtonsPanelLayout.css';

interface ButtonsPanelLayoutProps {
    categories: CategoryConfig[];
    /** 顶部导航栏搜索关键字（用于本地过滤按钮） */
    searchQuery?: string;
}

/**
 * ButtonsPanelLayout
 * 面板的基础布局组件：
 * - 使用 PanelHeader / PanelBody 拆分头部和主体；
 * - 当前阶段 PanelHeader 仅显示标题，PanelBody 内部由 PanelContent 渲染按钮列表；
 * - 顶部导航栏由 NavigationBarRenderer + NavigationBar 挂载在 Obsidian view-header 之上。
 */
export const ButtonsPanelLayout: React.FC<ButtonsPanelLayoutProps> = ({
    categories,
    searchQuery,
}) => {
    const moveMode = useMoveModeContext();

    // 使用 useMemo 缓存容器类名计算，避免每次渲染都重新计算
    const containerClassNames = React.useMemo(() => {
        const classes = ['buttons-panel-container', 'buttons-panel-react-root'];
        if (moveMode.state.type === 'button') {
            classes.push('button-move-mode');
        } else if (moveMode.state.type === 'category') {
            classes.push('category-move-mode');
        }
        return classes.join(' ');
    }, [moveMode.state.type]);

    return (
        <div className={containerClassNames}>
            <PanelHeader />
            <PanelBody categories={categories} searchQuery={searchQuery} />
        </div>
    );
};

