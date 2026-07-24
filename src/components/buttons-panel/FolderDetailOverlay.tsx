import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { setIcon } from 'obsidian';
import type { CategoryConfig, ButtonConfig } from '@/types';
import type { ButtonsPanelPlugin } from '@/types/plugin';
import type { App } from 'obsidian';
import { CategoryButtonGrid } from '@/components/buttons-panel/CategoryButtonGrid';
import { AddButton } from '@/components/shared/AddButton';
import { createCategoryMenuHandler } from '@/utils/categoryMenuUtils';
import { titleDroppableId } from '@/utils/buttonDragItems';
import { useButtonDragOptional } from '@/contexts/ButtonDragContext';
import { t } from '@/utils/i18n';

interface FolderDetailOverlayProps {
    category: CategoryConfig;
    orderedButtons: ButtonConfig[];
    contentClass: string;
    enableAnimation: boolean;
    enableEditMode: boolean;
    sortableEnabled: boolean;
    plugin: ButtonsPanelPlugin;
    app: App;
    onClose: () => void;
    onAddButton: () => void;
    onRename?: (newName: string) => void;
    nameEditable?: boolean;
    closeOnBlankClick?: boolean;
    locked?: boolean;
    onToggleLock?: () => void;
    overlayStyle?: React.CSSProperties;
}

/**
 * 文件夹视图：打开后的文件夹详情层。
 * 单击标题可编辑名称，ESC 关闭，点击遮罩关闭。
 */
export const FolderDetailOverlay: React.FC<FolderDetailOverlayProps> = ({
    category,
    orderedButtons,
    contentClass,
    enableAnimation,
    enableEditMode,
    sortableEnabled,
    plugin,
    app,
    onClose,
    onAddButton,
    onRename,
    nameEditable = true,
    closeOnBlankClick = false,
    locked = false,
    onToggleLock,
    overlayStyle,
}) => {
    const titleRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const lockBtnRef = React.useRef<HTMLButtonElement>(null);
    const detailRef = React.useRef<HTMLDivElement>(null);
    const [isEditingName, setIsEditingName] = React.useState(false);
    const [editName, setEditName] = React.useState(category.name);
    const buttonDrag = useButtonDragOptional();

    // 标题区作为拖放目标：拖到此处 → 按钮放到该分类末尾
    const { setNodeRef: setTitleDroppableRef } = useDroppable({
        id: titleDroppableId(category.id),
        disabled: !sortableEnabled,
    });

    // 锁定图标
    React.useEffect(() => {
        if (lockBtnRef.current) {
            setIcon(lockBtnRef.current, 'pin');
        }
    }, []);

    // 点击文件夹外部任意位置关闭
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (locked || isEditingName) return;
            const detailEl = detailRef.current;
            if (!detailEl) return;
            if (!detailEl.contains(e.target as Node)) {
                onClose();
            }
        };
        const timer = window.setTimeout(() => {
            activeDocument.addEventListener('click', handleClickOutside);
        }, 0);
        return () => {
            window.clearTimeout(timer);
            activeDocument.removeEventListener('click', handleClickOutside);
        };
    }, [onClose, isEditingName, locked]);

    // ESC：拖拽中先取消拖拽，再次 ESC 关闭文件夹（锁定时不关闭）
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape' || isEditingName) return;
            if (locked) return;
            if (buttonDrag?.isDragging) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            onClose();
        };
        activeDocument.addEventListener('keydown', handleKeyDown, true);
        return () => activeDocument.removeEventListener('keydown', handleKeyDown, true);
    }, [onClose, isEditingName, locked, buttonDrag?.isDragging]);

    // 右键菜单
    React.useEffect(() => {
        const titleEl = titleRef.current;
        if (!titleEl || !enableEditMode || isEditingName) return;
        const handler = createCategoryMenuHandler(category, plugin.settings.categories, plugin, app);
        titleEl.addEventListener('contextmenu', handler);
        return () => titleEl.removeEventListener('contextmenu', handler);
    }, [category, enableEditMode, plugin, app, isEditingName]);

    React.useEffect(() => {
        setEditName(category.name);
    }, [category.name]);

    const handleTitleClick = () => {
        if (!nameEditable) return;
        setIsEditingName(true);
        window.setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        }, 0);
    };

    const handleNameInputBlur = () => {
        finishEditing();
    };

    const handleNameInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            finishEditing();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setEditName(category.name);
            setIsEditingName(false);
        }
    };

    const finishEditing = () => {
        setIsEditingName(false);
        const trimmed = editName.trim();
        if (trimmed && trimmed !== category.name) {
            onRename?.(trimmed);
        } else {
            setEditName(category.name);
        }
    };

    return (
        <div
            className="buttons-panel-folder-overlay"
            role="presentation"
            style={overlayStyle}
        >
            <div
                className="buttons-panel-folder-detail"
                ref={detailRef}
                data-category-id={category.id}
                onClick={closeOnBlankClick ? (e: React.MouseEvent) => {
                    if (locked) return;
                    const target = e.target as HTMLElement;
                    // 不消费按钮、可编辑标题文字的点击
                    if (target.closest('button')) return;
                    if (target.closest('.folder-detail-title')) return;
                    if (target.closest('.folder-detail-title-input')) return;
                    onClose();
                } : undefined}
            >
                <div className="folder-detail-header" ref={setTitleDroppableRef}>
                    <div
                        ref={titleRef}
                        className="folder-detail-title"
                    >
                        {isEditingName ? (
                            <input
                                ref={inputRef}
                                className="folder-detail-title-input"
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onBlur={handleNameInputBlur}
                                onKeyDown={handleNameInputKeyDown}
                                maxLength={50}
                            />
                        ) : (
                            <span
                                onClick={nameEditable ? handleTitleClick : undefined}
                                className={nameEditable ? 'folder-detail-name-text' : ''}
                            >
                                {category.name}
                            </span>
                        )}
                    </div>
                    <button
                        ref={lockBtnRef}
                        type="button"
                        className={`folder-detail-lock${locked ? ' is-active' : ''}`}
                        aria-label={locked ? '取消固定' : '固定'}
                        onClick={onToggleLock}
                    />
                </div>
                <div className="folder-detail-content">
                    {orderedButtons.length === 0 && !enableEditMode && !buttonDrag?.isDragging ? (
                        <div className="buttons-panel-empty-hint">{t('no_buttons_in_category')}</div>
                    ) : (
                        <CategoryButtonGrid
                            category={category}
                            orderedButtons={orderedButtons}
                            contentClass={contentClass}
                            displayStyle="icon_top"
                            enableAnimation={enableAnimation}
                            enableEditMode={enableEditMode}
                            plugin={plugin}
                            app={app}
                            sortableEnabled={sortableEnabled}
                        >
                            {enableEditMode && <AddButton onClick={onAddButton} />}
                        </CategoryButtonGrid>
                    )}
                </div>
            </div>
        </div>
    );
};
