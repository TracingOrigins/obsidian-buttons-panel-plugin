import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { CategoryConfig } from '@/types';
import { setIcon } from 'obsidian';
import { usePluginContext } from '@/contexts/PluginContext';
import { useButtonDragOptional, useCategoryDragOptional } from '@/contexts/ButtonDragContext';
import { CategoryButtonGrid } from '@/components/buttons-panel/CategoryButtonGrid';
import { SortableCategoryBlock } from '@/components/buttons-panel/SortableCategoryBlock';
import { CategoryListDragPreview } from '@/components/buttons-panel/CategoryListDragPreview';
import { useCategoryCreation, useButtonCreation } from '@/hooks';
import { AddButton } from '@/components/shared/AddButton';
import { AddCategoryButton } from '@/components/shared/AddCategoryButton';
import { createCategoryMenuHandler } from '@/utils/categoryMenuUtils';
import { t } from '@/utils/i18n';
import './ListModeContent.css';

interface ListModeContentProps {
    categories: CategoryConfig[];
    displayStyle: 'icon_left' | 'icon_top';
    enableAnimation: boolean;
    enableEditMode: boolean;
    autoCollapseOnMount?: boolean;
    isSearchActive?: boolean;
}

export const ListModeContent: React.FC<ListModeContentProps> = ({
    categories,
    displayStyle,
    enableAnimation,
    enableEditMode,
    autoCollapseOnMount = false,
    isSearchActive = false,
}) => {
    const { plugin, app } = usePluginContext();
    const buttonDrag = useButtonDragOptional();
    const categoryDrag = useCategoryDragOptional();
    const { createCategory } = useCategoryCreation();
    const { createButton } = useButtonCreation();
    const titleRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());
    const titleRefCallbacks = React.useRef(
        new Map<string, (el: HTMLDivElement | null) => void>()
    );

    const getTitleRef = React.useCallback((categoryId: string) => {
        let callback = titleRefCallbacks.current.get(categoryId);
        if (!callback) {
            callback = (el: HTMLDivElement | null) => {
                if (el) {
                    titleRefs.current.set(categoryId, el);
                } else {
                    titleRefs.current.delete(categoryId);
                }
            };
            titleRefCallbacks.current.set(categoryId, callback);
        }
        return callback;
    }, []);

    const [openByCategoryId, setOpenByCategoryId] = React.useState<Map<string, boolean>>(() => {
        const map = new Map<string, boolean>();
        const defaultOpen = !autoCollapseOnMount;
        categories.forEach((c) => map.set(c.id, defaultOpen));
        return map;
    });

    React.useEffect(() => {
        setOpenByCategoryId((prev) => {
            const next = new Map(prev);
            const defaultOpen = !autoCollapseOnMount;
            let changed = false;

            for (const c of categories) {
                if (!next.has(c.id)) {
                    next.set(c.id, defaultOpen);
                    changed = true;
                }
            }
            for (const key of Array.from(next.keys())) {
                if (!categories.some((c) => c.id === key)) {
                    next.delete(key);
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [categories, autoCollapseOnMount]);

    React.useEffect(() => {
        if (!buttonDrag?.enabled) return;
        buttonDrag.registerCategoryHover((categoryId) => {
            setOpenByCategoryId((prev) => {
                if (prev.get(categoryId)) return prev;
                const next = new Map(prev);
                next.set(categoryId, true);
                return next;
            });
        });
        return () => buttonDrag.registerCategoryHover(null);
    }, [buttonDrag]);

    React.useEffect(() => {
        categoryDrag?.setListCategoryOpenById(openByCategoryId);
    }, [categoryDrag, openByCategoryId]);

    const categoryMenuHandlers = React.useMemo(() => {
        const handlers = new Map<string, (e: MouseEvent) => void>();
        categories.forEach((category) => {
            const handler = createCategoryMenuHandler(category, categories, plugin, app);
            handlers.set(category.id, handler);
        });
        return handlers;
    }, [categories, plugin, app]);

    React.useEffect(() => {
        if (!enableEditMode) return;

        const cleanupFunctions: Array<() => void> = [];

        titleRefs.current.forEach((titleEl, categoryId) => {
            const handleContextMenu = categoryMenuHandlers.get(categoryId);
            if (!handleContextMenu) return;

            titleEl.addEventListener('contextmenu', handleContextMenu);
            cleanupFunctions.push(() => {
                titleEl.removeEventListener('contextmenu', handleContextMenu);
            });
        });

        return () => {
            cleanupFunctions.forEach((cleanup) => cleanup());
        };
    }, [enableEditMode, categoryMenuHandlers]);

    const sortableEnabled = buttonDrag?.enabled ?? false;
    const isCategoryDragging = categoryDrag?.isDragging ?? false;
    const categorySortEnabled =
        ((categoryDrag?.enabled ?? false) || isCategoryDragging) &&
        !(buttonDrag?.isDragging ?? false);

    const orderedCategories = categorySortEnabled
        ? categoryDrag!.getOrderedCategories(categories)
        : categories;

    const contentClass = React.useMemo(
        () => `buttons-panel-grid ${displayStyle === 'icon_top' ? 'icon-top' : 'icon-left'}`,
        [displayStyle]
    );

    if (categories.length === 0) {
        return (
            <div className="buttons-panel-list-mode">
                {enableEditMode && !isSearchActive ? (
                    <div className="buttons-panel-empty-hint">
                        <AddCategoryButton onClick={() => createCategory()} />
                    </div>
                ) : (
                    <div className="buttons-panel-empty-hint">
                        {isSearchActive ? t('no_search_results') : t('no_categories_hint')}
                    </div>
                )}
            </div>
        );
    }

    const renderCategoryItem = (category: CategoryConfig) => {
        const isOpen = openByCategoryId.get(category.id) ?? !autoCollapseOnMount;
        const orderedButtons = sortableEnabled
            ? buttonDrag!.getOrderedButtons(category)
            : category.buttons;
        const isButtonDragging = !!buttonDrag?.isDragging;
        const showButtonGrid = isOpen || sortableEnabled;
        const hideButtonGridWhileCollapsed =
            sortableEnabled && !isOpen && !isButtonDragging;
        const isVisuallyOpen = isOpen || (sortableEnabled && isButtonDragging);

        const titleClassName = 'buttons-panel-category-title is-collapsible';
        const bindTitleRef = getTitleRef(category.id);

        const titleContent = (
            <>
                <span
                    className="category-icon"
                    ref={(el) => {
                        if (el) {
                            setIcon(el, isVisuallyOpen ? 'chevron-down' : 'chevron-right');
                        }
                    }}
                />
                {category.name}
            </>
        );

        const titleHandlers = {
            role: 'button' as const,
            tabIndex: 0,
            'aria-expanded': isVisuallyOpen,
            onClick: (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                if (categoryDrag?.isDragging || buttonDrag?.isDragging) return;
                setOpenByCategoryId((prev) => {
                    const next = new Map(prev);
                    next.set(category.id, !isOpen);
                    return next;
                });
            },
            onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                e.preventDefault();
                e.stopPropagation();
                setOpenByCategoryId((prev) => {
                    const next = new Map(prev);
                    next.set(category.id, !isOpen);
                    return next;
                });
            },
        };

        const buttonGridSection = showButtonGrid && (
            <div style={hideButtonGridWhileCollapsed ? { display: 'none' } : undefined}>
                {!enableEditMode && orderedButtons.length === 0 && !sortableEnabled ? (
                    <div className="buttons-panel-empty-hint">{t('no_buttons_in_category')}</div>
                ) : (
                    <>
                        {!enableEditMode && orderedButtons.length === 0 && !(buttonDrag?.isDragging || isCategoryDragging) && (
                            <div className="buttons-panel-empty-hint">{t('no_buttons_in_category')}</div>
                        )}
                        <CategoryButtonGrid
                            category={category}
                            orderedButtons={orderedButtons}
                            contentClass={contentClass}
                            displayStyle={displayStyle}
                            enableAnimation={enableAnimation}
                            enableEditMode={enableEditMode}
                            plugin={plugin}
                            app={app}
                            sortableEnabled={sortableEnabled}
                        >
                            {enableEditMode && (
                                <AddButton onClick={() => createButton(category)} />
                            )}
                        </CategoryButtonGrid>
                    </>
                )}
            </div>
        );

        const categoryClassNames = [
            'buttons-panel-category',
            isVisuallyOpen ? 'list-category-open' : 'list-category-closed',
        ].join(' ');

        if (categorySortEnabled) {
            return (
                <SortableCategoryBlock
                    key={category.id}
                    categoryId={category.id}
                    className={categoryClassNames}
                    renderDragPreview={() => (
                        <CategoryListDragPreview
                            category={category}
                            orderedButtons={orderedButtons}
                            isOpen={isOpen}
                            displayStyle={displayStyle}
                            plugin={plugin}
                            app={app}
                            categoryClassName={[
                                'buttons-panel-category',
                                isOpen ? 'list-category-open' : 'list-category-closed',
                            ].join(' ')}
                            titleClassName={titleClassName}
                        />
                    )}
                    renderTitle={() => (
                        <div ref={bindTitleRef} className={titleClassName} {...titleHandlers}>
                            {titleContent}
                        </div>
                    )}
                >
                    {buttonGridSection}
                </SortableCategoryBlock>
            );
        }

        return (
            <div key={category.id} className={categoryClassNames}>
                <div ref={bindTitleRef} className={titleClassName} {...titleHandlers}>
                    {titleContent}
                </div>
                {buttonGridSection}
            </div>
        );
    };

    const categoryList = orderedCategories.map((category) => renderCategoryItem(category));

    return (
        <div className="buttons-panel-list-mode">
            {categorySortEnabled ? (
                <SortableContext
                    items={categoryDrag!.categoryIds}
                    strategy={verticalListSortingStrategy}
                >
                    {categoryList}
                </SortableContext>
            ) : (
                categoryList
            )}
            {enableEditMode && <AddCategoryButton onClick={() => createCategory()} />}
        </div>
    );
};
