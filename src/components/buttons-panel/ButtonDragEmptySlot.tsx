import React from 'react';

interface ButtonDragEmptySlotProps {
    displayStyle: 'default' | 'icon_top';
}

/** 拖拽过程中空分类的按钮轮廓占位（尺寸与 icon-left / icon-top 按钮一致） */
export const ButtonDragEmptySlot: React.FC<ButtonDragEmptySlotProps> = ({ displayStyle }) => {
    const layoutClass = displayStyle === 'icon_top' ? 'icon-top' : 'icon-left';
    return (
        <div
            className={`button-drag-empty-slot ${layoutClass}`}
            aria-hidden
        />
    );
};
