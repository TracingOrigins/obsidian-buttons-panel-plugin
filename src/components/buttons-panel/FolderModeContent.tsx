import React from 'react';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import type { CategoryConfig } from '@/types';
import { usePluginContext } from '@/contexts/PluginContext';
import { useButtonDragOptional, useCategoryDragOptional } from '@/contexts/ButtonDragContext';
import { CategoryFolderTile } from '@/components/buttons-panel/CategoryFolderTile';
import { SortableCategoryFolder } from '@/components/buttons-panel/SortableCategoryFolder';
import { FolderDropTarget } from '@/components/buttons-panel/FolderDropTarget';
import { FolderDetailOverlay } from '@/components/buttons-panel/FolderDetailOverlay';
import { useCategoryCreation, useButtonCreation } from '@/hooks';
import { AddCategoryButton } from '@/components/shared/AddCategoryButton';
import { createCategoryMenuHandler } from '@/utils/categoryMenuUtils';
import { categorySortableId } from '@/utils/categoryDragItems';
import { useConfigContext } from '@/contexts/ConfigContext';
import { t } from '@/utils/i18n';
import './FolderModeContent.css';

interface FolderModeContentProps {
    categories: CategoryConfig[];
    displayStyle: 'default' | 'icon_top';
    enableAnimation: boolean;
    enableEditMode: boolean;
    isSearchActive?: boolean;
}

export const FolderModeContent: React.FC<FolderModeContentProps> = ({
    categories,
    displayStyle,
    enableAnimation,
    enableEditMode,
    isSearchActive = false,
}) => {
    const { plugin, app } = usePluginContext();
    const { panelConfig } = useConfigContext();
    const buttonDrag = useButtonDragOptional();
    const categoryDrag = useCategoryDragOptional();
    const { createCategory } = useCategoryCreation();
    const { createButton } = useButtonCreation();

    // 默认不自动展开
    const [openCategoryId, setOpenCategoryId] = React.useState<string | null>(null);

    const openCategoryIdRef = React.useRef(openCategoryId);
    openCategoryIdRef.current = openCategoryId;

    const [isFolderLocked, setIsFolderLocked] = React.useState(false);
    const isFolderLockedRef = React.useRef(isFolderLocked);
    isFolderLockedRef.current = isFolderLocked;

    /** 打开文件夹时 detail 的偏移量（匹配磁贴位置） */
    const [detailTop, setDetailTop] = React.useState(24);
    const [detailLeft, setDetailLeft] = React.useState(24);

    // 切换文件夹时重置锁定
    React.useEffect(() => {
        setIsFolderLocked(false);
    }, [openCategoryId]);

    // 打开文件夹时计算磁贴位置，使 detail 出现在该位置且不超出容器
    React.useEffect(() => {
        if (!openCategoryId) return;
        const raf = window.requestAnimationFrame(() => {
            const wrapper = activeDocument.querySelector(`[data-folder-id="${openCategoryId}"]`);
            const tileEl = wrapper?.querySelector('.buttons-panel-folder-tile') as HTMLElement | null;
            const container = wrapper?.closest('.buttons-panel-folder-mode');
            if (tileEl && container) {
                const DETAIL_W = 275;
                const PAD = 24;
                const containerRect = container.getBoundingClientRect();
                const tileRect = tileEl.getBoundingClientRect();
                const rawTop = tileRect.top - containerRect.top;
                const rawLeft = tileRect.left - containerRect.left;
                const maxLeft = Math.max(8, containerRect.width - DETAIL_W - PAD);
                setDetailTop(Math.max(8, rawTop));
                setDetailLeft(Math.min(Math.max(8, rawLeft), maxLeft));
            }
        });
        return () => cancelAnimationFrame(raf);
    }, [openCategoryId]);

    const openFolder = React.useCallback(
        (categoryId: string) => {
            if (categoryDrag?.isDragging || buttonDrag?.isDragging) return;
            setOpenCategoryId(categoryId);
        },
        [categoryDrag?.isDragging, buttonDrag?.isDragging]
    );

    const closeFolder = React.useCallback(() => {
        setOpenCategoryId(null);
    }, []);

    React.useEffect(() => {
        if (openCategoryId && !categories.some((c) => c.id === openCategoryId)) {
            setOpenCategoryId(null);
        }
    }, [categories, openCategoryId]);

    // ---- 拖拽交互优化 ----
    // 1. 鼠标移出展开的文件夹区域 → 自动关闭（仍用 pointermove）
    // 2. 按钮拖到文件夹磁贴上 → 自动展开（通过 ButtonDragContext 派发的自定义事件）
    const dragHoverTimerRef = React.useRef<number | null>(null);
    const hoveredCategoryIdRef = React.useRef<string | null>(null);
    /** 自动展开后的冷却期：展开后短时间内不触发自动关闭，给用户时间移入 detail */
    const autoCloseCooldownRef = React.useRef(false);

    // 关闭 + 悬停：仍然用 pointermove（capture 阶段）
    React.useEffect(() => {
        if (!buttonDrag?.isDragging || !buttonDrag?.activeButtonId) {
            if (dragHoverTimerRef.current) {
                window.clearTimeout(dragHoverTimerRef.current);
                dragHoverTimerRef.current = null;
            }
            hoveredCategoryIdRef.current = null;
            autoCloseCooldownRef.current = false;
            return;
        }

        const handleDragMove = (e: PointerEvent) => {
            // 检查是否在展开的文件夹内
            if (openCategoryIdRef.current && !autoCloseCooldownRef.current) {
                const detailEl = activeDocument.querySelector('.buttons-panel-folder-detail');
                if (detailEl) {
                    const rect = detailEl.getBoundingClientRect();
                    const isInside =
                        e.clientX >= rect.left &&
                        e.clientX <= rect.right &&
                        e.clientY >= rect.top &&
                        e.clientY <= rect.bottom;

                    if (!isInside) {
                        setOpenCategoryId(null);
                        if (dragHoverTimerRef.current) {
                            window.clearTimeout(dragHoverTimerRef.current);
                            dragHoverTimerRef.current = null;
                        }
                        hoveredCategoryIdRef.current = null;
                    }
                }
            }
        };

        activeDocument.addEventListener('pointermove', handleDragMove, true);
        return () => activeDocument.removeEventListener('pointermove', handleDragMove, true);
    }, [buttonDrag?.isDragging, buttonDrag?.activeButtonId]);

    // 悬停自动展开：监听 ButtonDragContext 派发的自定义事件
    React.useEffect(() => {
        const handleFolderHover = (e: Event) => {
            const { categoryId } = (e as CustomEvent<{ categoryId: string | null }>).detail;

            if (categoryId && categoryId !== hoveredCategoryIdRef.current) {
                hoveredCategoryIdRef.current = categoryId;
                if (dragHoverTimerRef.current) {
                    window.clearTimeout(dragHoverTimerRef.current);
                }
                dragHoverTimerRef.current = window.setTimeout(() => {
                    if (hoveredCategoryIdRef.current === categoryId) {
                        setOpenCategoryId(categoryId);
                        // 展开后 800ms 内不触发自动关闭，给用户时间移入 detail 区域
                        autoCloseCooldownRef.current = true;
                        window.setTimeout(() => {
                            autoCloseCooldownRef.current = false;
                        }, 800);
                    }
                    dragHoverTimerRef.current = null;
                }, 600);
            } else if (!categoryId && hoveredCategoryIdRef.current) {
                hoveredCategoryIdRef.current = null;
                if (dragHoverTimerRef.current) {
                    window.clearTimeout(dragHoverTimerRef.current);
                    dragHoverTimerRef.current = null;
                }
            }
        };

        activeDocument.addEventListener('buttons-panel-folder-hover', handleFolderHover);
        return () => activeDocument.removeEventListener('buttons-panel-folder-hover', handleFolderHover);
    }, []);

    const sortableEnabled = buttonDrag?.enabled ?? false;
    const isCategoryDragging = categoryDrag?.isDragging ?? false;
    const categorySortEnabled =
        ((categoryDrag?.enabled ?? false) || isCategoryDragging) &&
        !(buttonDrag?.isDragging ?? false);

    const orderedCategories = categorySortEnabled
        ? categoryDrag!.getOrderedCategories(categories)
        : categories;

    const contentClass = React.useMemo(
        () =>
            sortableEnabled
                ? 'buttons-panel-grid icon-top folder-detail-grid'
                : 'buttons-panel-content icon-top folder-detail-grid',
        [sortableEnabled]
    );

    const folderRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());
    const categoryMenuHandlers = React.useMemo(() => {
        const handlers = new Map<string, (e: MouseEvent) => void>();
        categories.forEach((category) => {
            handlers.set(
                category.id,
                createCategoryMenuHandler(category, categories, plugin, app)
            );
        });
        return handlers;
    }, [categories, plugin, app]);

    React.useEffect(() => {
        if (!enableEditMode || openCategoryId) return;
        const cleanup: Array<() => void> = [];
        folderRefs.current.forEach((el, categoryId) => {
            const handler = categoryMenuHandlers.get(categoryId);
            if (!handler) return;
            el.addEventListener('contextmenu', handler);
            cleanup.push(() => el.removeEventListener('contextmenu', handler));
        });
        return () => cleanup.forEach((fn) => fn());
    }, [enableEditMode, openCategoryId, categoryMenuHandlers, orderedCategories]);

    const bindFolderRef = (categoryId: string) => (el: HTMLDivElement | null) => {
        if (el) folderRefs.current.set(categoryId, el);
        else folderRefs.current.delete(categoryId);
    };

    const renderFolderTile = (category: CategoryConfig) => {
        const orderedButtons = sortableEnabled
            ? buttonDrag!.getOrderedButtons(category)
            : [...category.buttons].sort((a, b) => a.order - b.order);

        const tile = (
            <CategoryFolderTile category={category} previewButtons={orderedButtons} showCount={panelConfig.folderShowBtnCount ?? true} />
        );

        const handleOpen = () => openFolder(category.id);
        const isFolderOpen = !!openCategoryId;

        if (categorySortEnabled) {
            return (
                <div key={category.id} data-folder-id={category.id}>
                    <SortableCategoryFolder
                        categoryId={category.id}
                        onClick={handleOpen}
                        innerRef={bindFolderRef(category.id)}
                        buttonDropDisabled={isFolderOpen}
                    >
                        {tile}
                    </SortableCategoryFolder>
                </div>
            );
        }

        if (sortableEnabled) {
            return (
                <div key={category.id} data-folder-id={category.id}>
                    <FolderDropTarget categoryId={category.id} onClick={handleOpen} buttonDropDisabled={isFolderOpen}>
                        {tile}
                    </FolderDropTarget>
                </div>
            );
        }

        return (
            <div
                key={category.id}
                ref={bindFolderRef(category.id)}
                className="buttons-panel-folder-static"
                data-folder-id={category.id}
                onClick={handleOpen}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    handleOpen();
                }}
            >
                {tile}
            </div>
        );
    };

    if (categories.length === 0) {
        return (
            <div className="buttons-panel-folder-mode">
                {enableEditMode && !isSearchActive ? (
                    <p className="buttons-panel-empty-hint">
                        <AddCategoryButton onClick={() => createCategory()} />
                    </p>
                ) : (
                    <div className="buttons-panel-empty-hint">
                        {isSearchActive ? t('no_search_results') : t('no_categories_hint')}
                    </div>
                )}
            </div>
        );
    }

    const openCategory = openCategoryId
        ? categories.find((c) => c.id === openCategoryId)
        : undefined;
    const openOrderedButtons =
        openCategory && sortableEnabled
            ? buttonDrag!.getOrderedButtons(openCategory)
            : openCategory
              ? [...openCategory.buttons].sort((a, b) => a.order - b.order)
              : [];

    const handleRename = React.useCallback(
        (newName: string) => {
            if (!openCategory) return;
            openCategory.name = newName;
            void plugin.saveSettings();
            activeDocument.dispatchEvent(new CustomEvent('buttons-panel-refresh'));
        },
        [openCategory, plugin]
    );

    const categorySortIds = orderedCategories.map((c) => categorySortableId(c.id));

    return (
        <div className="buttons-panel-folder-mode">
            <div
                className="buttons-panel-folder-home"
                data-folder-reorder-enabled={categorySortEnabled ? 'true' : undefined}
                data-category-sort-dragging={
                    isCategoryDragging ? 'true' : undefined
                }
            >
                {categorySortEnabled ? (
                    <SortableContext items={categorySortIds} strategy={rectSortingStrategy}>
                        {orderedCategories.map((category) => renderFolderTile(category))}
                        {enableEditMode && !isSearchActive && (
                            <div>
                                <AddCategoryButton onClick={() => createCategory()} />
                            </div>
                        )}
                    </SortableContext>
                ) : (
                    <>
                        {orderedCategories.map((category) => renderFolderTile(category))}
                        {enableEditMode && !isSearchActive && (
                            <div>
                                <AddCategoryButton onClick={() => createCategory()} />
                            </div>
                        )}
                    </>
                )}
            </div>

            {openCategory && (
                <FolderDetailOverlay
                    category={openCategory}
                    orderedButtons={openOrderedButtons}
                    contentClass={contentClass}
                    enableAnimation={enableAnimation}
                    enableEditMode={enableEditMode}
                    sortableEnabled={sortableEnabled}
                    plugin={plugin}
                    app={app}
                    onClose={closeFolder}
                    onAddButton={() => createButton(openCategory)}
                    onRename={handleRename}
                    nameEditable={panelConfig.folderDetailNameEditable ?? true}
                    closeOnBlankClick={panelConfig.folderCloseOnBlankClick ?? false}
                    locked={isFolderLocked}
                    onToggleLock={() => setIsFolderLocked((v) => !v)}
                    overlayStyle={{ paddingTop: detailTop, paddingLeft: detailLeft }}
                />
            )}
        </div>
    );
};
