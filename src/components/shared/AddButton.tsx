import React from 'react';
import { IconButton } from './IconButton';
import { t } from '@/utils/i18n';

interface AddButtonProps {
    onClick: () => void;
    className?: string;
    ariaLabel?: string;
}

/**
 * AddButton
 * 
 * 统一的"添加按钮"组件，用于在分类中添加新按钮。
 */
export const AddButton: React.FC<AddButtonProps> = ({
    onClick,
    className = 'add-button-btn',
    ariaLabel,
}) => {
    return (
        <div className="add-button">
            <IconButton
                icon="plus"
                onClick={onClick}
                className={className}
                ariaLabel={ariaLabel || t('add_button') || '添加按钮'}
            />
        </div>
    );
};

