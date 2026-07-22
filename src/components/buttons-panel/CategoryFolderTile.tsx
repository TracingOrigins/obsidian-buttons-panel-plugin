import React from 'react';
import type { ButtonConfig, CategoryConfig } from '@/types';
import { safeSetSVG } from '@/utils/dom';

interface CategoryFolderTileProps {
    category: CategoryConfig;
    previewButtons: ButtonConfig[];
    className?: string;
    showCount?: boolean;
}

function FolderPreviewIcon({ button }: { button: ButtonConfig }) {
    const iconRef = React.useRef<HTMLSpanElement>(null);

    React.useEffect(() => {
        const el = iconRef.current;
        if (!el) return;
        if (!button.icon) {
            el.textContent = (button.name?.trim()?.[0] ?? '\u2022').toUpperCase();
            return;
        }
        if (button.icon.trim().startsWith('<svg')) {
            safeSetSVG(el, button.icon);
        } else {
            el.textContent = button.icon;
        }
    }, [button.icon, button.name]);

    return <span className="folder-preview-icon" ref={iconRef} aria-hidden />;
}

/**
 * 文件夹视图：单个分类文件夹磁贴（名称 + 内部按钮预览）。
 */
export const CategoryFolderTile: React.FC<CategoryFolderTileProps> = ({
    category,
    previewButtons,
    className,
    showCount = true,
}) => {
    const previewSlots = previewButtons.slice(0, 9);
    const emptySlots = Math.max(0, 9 - previewSlots.length);

    const classNames = ['buttons-panel-folder-tile', className].filter(Boolean).join(' ');

    return (
        <div className={classNames}>
            <div className="folder-tile-body">
                <div className="folder-tile-preview-grid">
                    {previewSlots.map((button) => (
                        <FolderPreviewIcon key={button.id} button={button} />
                    ))}
                    {Array.from({ length: emptySlots }).map((_, index) => (
                        <span
                            key={`empty-${index}`}
                            className="folder-preview-icon folder-preview-icon--empty"
                            aria-hidden
                        />
                    ))}
                </div>
            </div>
            <span className="folder-tile-label">{category.name}</span>
            {showCount && category.buttons.length > 0 && (
                <span className="folder-tile-count">{category.buttons.length}</span>
            )}
        </div>
    );
};
