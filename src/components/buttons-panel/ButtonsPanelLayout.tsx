import React from 'react';
import type { CategoryConfig } from '@/types';
import { PanelBody } from '@/components/buttons-panel/PanelBody';
import './ButtonsPanelLayout.css';

interface ButtonsPanelLayoutProps {
    categories: CategoryConfig[];
    searchQuery?: string;
}

export const ButtonsPanelLayout: React.FC<ButtonsPanelLayoutProps> = ({
    categories,
    searchQuery,
}) => {
    return (
        <div className="buttons-panel-container buttons-panel-react-root">
            <PanelBody categories={categories} searchQuery={searchQuery} />
        </div>
    );
};
