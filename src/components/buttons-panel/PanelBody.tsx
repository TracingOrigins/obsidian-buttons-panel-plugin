import React from 'react';
import type { CategoryConfig } from '@/types';
import { PanelContent } from '@/components/buttons-panel/PanelContent';

interface PanelBodyProps {
    categories: CategoryConfig[];
    searchQuery?: string;
}

/** 比较分类列表内容（含按钮数量），避免原地修改后 React.memo 跳过更新 */
function categoriesListEqual(a: CategoryConfig[], b: CategoryConfig[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i].id !== b[i].id) return false;
        if (a[i].name !== b[i].name) return false;
        if (a[i].order !== b[i].order) return false;
        if (a[i].buttons.length !== b[i].buttons.length) return false;
    }
    return true;
}

export const PanelBody: React.FC<PanelBodyProps> = React.memo(
    ({ categories, searchQuery }) => {
        return (
            <div className="buttons-panel-body">
                <PanelContent categories={categories} searchQuery={searchQuery} />
            </div>
        );
    },
    (prevProps, nextProps) =>
        prevProps.searchQuery === nextProps.searchQuery &&
        categoriesListEqual(prevProps.categories, nextProps.categories)
);

PanelBody.displayName = 'PanelBody';
