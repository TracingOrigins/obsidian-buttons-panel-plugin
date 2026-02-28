import React from 'react';
import { IconButton } from './IconButton';
import { t } from '@/utils/i18n';

interface AddCategoryButtonProps {
    onClick: () => void;
    className?: string;
    ariaLabel?: string;
}

/**
 * AddCategoryButton
 * 
 * 统一的"添加分类"按钮组件。
 */
export const AddCategoryButton: React.FC<AddCategoryButtonProps> = ({
    onClick,
    className = 'add-category-btn',
    ariaLabel,
}) => {
    return (
        <div className="buttons-panel-category add-category">
            <IconButton
                icon="plus"
                onClick={onClick}
                className={className}
                ariaLabel={ariaLabel || t('add_category') || '添加分类'}
            />
        </div>
    );
};

