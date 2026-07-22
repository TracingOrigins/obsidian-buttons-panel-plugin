import React from 'react';
import type { CategoryConfig } from '@/types';
import { PanelContent } from '@/components/buttons-panel/PanelContent';

interface PanelBodyProps {
    categories: CategoryConfig[];
    searchQuery?: string;
}

export const PanelBody: React.FC<PanelBodyProps> = ({
    categories,
    searchQuery,
}) => {
    return (
        <div className="buttons-panel-body">
            <PanelContent categories={categories} searchQuery={searchQuery} />
        </div>
    );
};
