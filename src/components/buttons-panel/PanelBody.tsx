import React from 'react';
import type { CategoryConfig } from '@/types';
import { PanelContent } from '@/components/buttons-panel/PanelContent';

interface PanelBodyProps {
    categories: CategoryConfig[];
    searchQuery?: string;
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
        prevProps.categories === nextProps.categories &&
        prevProps.searchQuery === nextProps.searchQuery
);

PanelBody.displayName = 'PanelBody';
