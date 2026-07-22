import React from 'react';
import { setIcon } from 'obsidian';
import type { ButtonConfig, CategoryConfig } from '@/types';
import type { ButtonsPanelPlugin } from '@/types/plugin';
import type { App } from 'obsidian';
import { CategoryButtonGrid } from '@/components/buttons-panel/CategoryButtonGrid';

interface CategoryListDragPreviewProps {
    category: CategoryConfig;
    orderedButtons: ButtonConfig[];
    isOpen: boolean;
    displayStyle: 'default' | 'icon_top';
    plugin: ButtonsPanelPlugin;
    app: App;
    /** 与列表项一致的分类容器 class（如 list-category-open） */
    categoryClassName: string;
    /** 与列表项一致的标题 class（如 is-collapsible） */
    titleClassName: string;
    className?: string;
}

/** 列表视图分类拖拽：占位与跟随预览的完整内容（标题 + 按钮区） */
export const CategoryListDragPreview: React.FC<CategoryListDragPreviewProps> = ({
    category,
    orderedButtons,
    isOpen,
    displayStyle,
    plugin,
    app,
    categoryClassName,
    titleClassName,
    className,
}) => {
    const iconRef = React.useRef<HTMLSpanElement>(null);
    const contentClass = `buttons-panel-grid ${displayStyle === 'icon_top' ? 'icon-top' : 'icon-left'}`;

    React.useEffect(() => {
        if (iconRef.current) {
            setIcon(iconRef.current, isOpen ? 'chevron-down' : 'chevron-right');
        }
    }, [isOpen]);

    const rootClass = [categoryClassName, className].filter(Boolean).join(' ');

    return (
        <div className={rootClass}>
            <div className={titleClassName}>
                <span className="category-icon" ref={iconRef} />
                {category.name}
            </div>
            {isOpen && (
                <CategoryButtonGrid
                    category={category}
                    orderedButtons={orderedButtons}
                    contentClass={contentClass}
                    displayStyle={displayStyle}
                    enableAnimation={false}
                    enableEditMode={false}
                    plugin={plugin}
                    app={app}
                    sortableEnabled={false}
                />
            )}
        </div>
    );
};
