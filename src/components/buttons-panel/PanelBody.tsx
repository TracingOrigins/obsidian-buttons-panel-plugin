import React from 'react';
import type { CategoryConfig } from '@/types';
import { PanelContent } from '@/components/buttons-panel/PanelContent';
import { MoveModeTip } from '@/components/buttons-panel/MoveModeTip';
import { MoveIndicatorLayer } from '@/components/buttons-panel/MoveIndicatorLayer';

interface PanelBodyProps {
    categories: CategoryConfig[];
    /** 顶部导航栏搜索关键字（用于本地过滤按钮） */
    searchQuery?: string;
}

/**
 * PanelBody
 * 面板主体区域容器，负责承载 MoveModeTip 与 PanelContent。
 * 当前阶段只渲染 PanelContent，后续会增加 MoveModeTip 等子组件。
 * 
 * 使用 React.memo 优化性能，避免不必要的重新渲染
 */
export const PanelBody: React.FC<PanelBodyProps> = React.memo(({ categories, searchQuery }) => {
    return (
        <div className="buttons-panel-body">
            <MoveModeTip />
            <MoveIndicatorLayer />
            <PanelContent categories={categories} searchQuery={searchQuery} />
        </div>
    );
}, (prevProps, nextProps) => {
    // 自定义比较函数，只在关键属性变化时重新渲染
    return (
        prevProps.categories === nextProps.categories &&
        prevProps.searchQuery === nextProps.searchQuery
    );
});

PanelBody.displayName = 'PanelBody';

