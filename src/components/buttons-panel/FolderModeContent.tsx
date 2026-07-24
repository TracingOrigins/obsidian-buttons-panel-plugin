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

    // 拖拽中保留上一个 detail，防止 dnd-kit 传感器元素被移除
    const prevOpenIdRef = React.useRef<string | null>(null);
    const [staleCategoryId, setStaleCategoryId] = React.useState<string | null>(null);
    React.useEffect(() => {
        const prev = prevOpenIdRef.current;
        prevOpenIdRef.current = openCategoryId;
        if (openCategoryId && prev && prev !== openCategoryId) {
            setStaleCategoryId(prev);
        }
    }, [openCategoryId]);
    React.useEffect(() => {
        if (!buttonDrag?.isDragging) {
            setStaleCategoryId(null);
            prevOpenIdRef.current = null;
        }
    }, [buttonDrag?.isDragging]);

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

    // ---- 拖拽交互优化（与标签页视图的 scheduleCategoryTabDropTarget 同模式） ----
    // autoClose: 移出展开的 detail → 600ms 后自动关闭；移回则取消
    // hoverExpand: 悬浮磁贴不动 600ms → RAF 轮询 + 时间戳，无 setTimeout 竞态
    const hoverExpandCategoryRef = React.useRef<string | null>(null);
    const hoverStartTimeRef = React.useRef<number>(0);
    const autoCloseTimerRef = React.useRef<number | null>(null);
    const dragShouldCancelRef = React.useRef(false);
    const lastPointerRef = React.useRef<{ x: number; y: number } | null>(null);

    const clearAutoCloseTimer = React.useCallback(() => {
        if (autoCloseTimerRef.current) {
            window.clearTimeout(autoCloseTimerRef.current);
            autoCloseTimerRef.current = null;
        }
    }, []);

    const resetHoverExpand = React.useCallback(() => {
        hoverExpandCategoryRef.current = null;
        hoverStartTimeRef.current = 0;
    }, []);

    // hover-expand RAF 轮询：每帧检查悬浮时长 >= 600ms
    React.useEffect(() => {
        if (!buttonDrag?.isDragging || !buttonDrag?.activeButtonId) {
            resetHoverExpand();
            return;
        }
        let rafId: number;
        const tick = () => {
            const cat = hoverExpandCategoryRef.current;
            const start = hoverStartTimeRef.current;
            if (cat && start > 0 && Date.now() - start >= 600 && !openCategoryIdRef.current) {
                setOpenCategoryId(cat);
                clearAutoCloseTimer();
                dragShouldCancelRef.current = false;
                resetHoverExpand();
                // 等待 React 渲染完成：双重 RAF（render → layout → paint）
                window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(() => {
                        const pos = lastPointerRef.current;
                        const target = window.__dndSensorTarget;
                        if (pos && target) {
                            target.dispatchEvent(new PointerEvent('pointermove', {
                                bubbles: true,
                                cancelable: true,
                                clientX: pos.x,
                                clientY: pos.y,
                            }));
                        }
                    });
                });
            }
            rafId = window.requestAnimationFrame(tick);
        };
        rafId = window.requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [buttonDrag?.isDragging, buttonDrag?.activeButtonId, clearAutoCloseTimer, resetHoverExpand]);

    /** 检测指针下磁贴：新磁贴 → 重置计时起点；离开磁贴 → 归零 */
    const checkHoverExpand = React.useCallback(() => {
        const pos = lastPointerRef.current;
        if (!pos || openCategoryIdRef.current) return;
        const elements = activeDocument.elementsFromPoint(pos.x, pos.y);
        const tileEl = elements.find((el) => el.closest('[data-folder-id]'));
        const categoryId = tileEl?.closest('[data-folder-id]')?.getAttribute('data-folder-id') ?? null;
        if (categoryId && categoryId !== hoverExpandCategoryRef.current) {
            hoverExpandCategoryRef.current = categoryId;
            hoverStartTimeRef.current = Date.now();
        } else if (!categoryId && hoverExpandCategoryRef.current) {
            resetHoverExpand();
        }
    }, [resetHoverExpand]);

    const resetDragInteraction = React.useCallback(() => {
        dragShouldCancelRef.current = false;
        resetHoverExpand();
        clearAutoCloseTimer();
        lastPointerRef.current = null;
    }, [resetHoverExpand, clearAutoCloseTimer]);

    React.useEffect(() => {
        if (!buttonDrag?.isDragging || !buttonDrag?.activeButtonId) {
            resetDragInteraction();
            return;
        }

        const handleDragMove = (e: PointerEvent) => {
            lastPointerRef.current = { x: e.clientX, y: e.clientY };

            // 1. 自动关闭：移出 detail 600ms 后关闭；回到 detail 则取消
            if (openCategoryIdRef.current) {
                const detailEl = activeDocument.querySelector('.buttons-panel-folder-detail');
                if (detailEl) {
                    const rect = detailEl.getBoundingClientRect();
                    const insideDetail =
                        e.clientX >= rect.left && e.clientX <= rect.right &&
                        e.clientY >= rect.top && e.clientY <= rect.bottom;

                    if (!insideDetail) {
                        if (!autoCloseTimerRef.current) {
                            dragShouldCancelRef.current = true;
                            autoCloseTimerRef.current = window.setTimeout(() => {
                                // 关闭文件夹，同步更新 ref（避免等待 React 渲染）
                                setOpenCategoryId(null);
                                openCategoryIdRef.current = null;
                                autoCloseTimerRef.current = null;
                                dragShouldCancelRef.current = false;
                                resetHoverExpand();
                                // 立即检测指针下是否已有磁贴 → 启动 hover-expand
                                checkHoverExpand();
                            }, 600);
                        }
                    } else {
                        clearAutoCloseTimer();
                        dragShouldCancelRef.current = false;
                    }
                }
            }

            // 2. 悬停展开
            if (!openCategoryIdRef.current) {
                checkHoverExpand();
            } else if (hoverExpandCategoryRef.current) {
                resetHoverExpand();
            }
        };

        activeDocument.addEventListener('pointermove', handleDragMove, true);
        return () => activeDocument.removeEventListener('pointermove', handleDragMove, true);
    }, [buttonDrag?.isDragging, buttonDrag?.activeButtonId, clearAutoCloseTimer, checkHoverExpand, resetDragInteraction, resetHoverExpand]);

    // 拖出文件夹外松手：在 dnd-kit onDragEnd 之前同步取消，防止错误持久化
    React.useEffect(() => {
        if (!buttonDrag?.isDragging) return;
        const onPointerUp = () => {
            if (dragShouldCancelRef.current) {
                dragShouldCancelRef.current = false;
                clearAutoCloseTimer();
                activeDocument.dispatchEvent(new CustomEvent('buttons-panel-folder-drag-cancel'));
            }
        };
        activeDocument.addEventListener('pointerup', onPointerUp, true);
        return () => activeDocument.removeEventListener('pointerup', onPointerUp, true);
    }, [buttonDrag?.isDragging, clearAutoCloseTimer]);

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

            {/* 拖拽中保留旧 detail（不可见 + 不可排序），防止 dnd-kit 传感器元素被移除 */}
            {staleCategoryId && staleCategoryId !== openCategoryId && (
                (() => {
                    const stale = categories.find((c) => c.id === staleCategoryId);
                    if (!stale) return null;
                    return (
                        <FolderDetailOverlay
                            key={`stale-${staleCategoryId}`}
                            category={stale}
                            orderedButtons={[]}
                            contentClass={contentClass}
                            enableAnimation={false}
                            enableEditMode={false}
                            sortableEnabled={false}
                            plugin={plugin}
                            app={app}
                            onClose={() => {}}
                            onAddButton={() => {}}
                            overlayStyle={{ display: 'none' }}
                        />
                    );
                })()
            )}

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
