import React, { useState, useEffect } from 'react';
import type { CategoryConfig } from '@/types';
import { setIcon } from 'obsidian';
import { usePluginContext } from '@/contexts/PluginContext';
import { useButtonDragOptional, useCategoryDragOptional } from '@/contexts/ButtonDragContext';
import { CategoryButtonGrid } from '@/components/buttons-panel/CategoryButtonGrid';
import { TabDropTarget } from '@/components/buttons-panel/TabDropTarget';
import { SortableCategoryTab } from '@/components/buttons-panel/SortableCategoryTab';
import { useCategoryCreation, useButtonCreation } from '@/hooks';
import { AddButton } from '@/components/shared/AddButton';
import { AddCategoryButton } from '@/components/shared/AddCategoryButton';
import { IconButton } from '@/components/shared/IconButton';
import { createCategoryMenuHandler } from '@/utils/categoryMenuUtils';
import { t } from '@/utils/i18n';

function resolveActiveTabId(
    preferredId: string | null | undefined,
    categories: CategoryConfig[]
): string | null {
    if (categories.length === 0) return null;
    if (preferredId && categories.some((cat) => cat.id === preferredId)) {
        return preferredId;
    }
    return categories[0]?.id ?? null;
}

interface TabsModeContentProps {
    categories: CategoryConfig[];
    displayStyle: 'icon_left' | 'icon_top';
    enableAnimation: boolean;
    enableEditMode: boolean;
    tabsWrap: boolean;
    isSearchActive?: boolean;
}

export const TabsModeContent: React.FC<TabsModeContentProps> = ({
    categories,
    displayStyle,
    enableAnimation,
    enableEditMode,
    tabsWrap,
    isSearchActive = false,
}) => {
    const { plugin, app } = usePluginContext();
    const buttonDrag = useButtonDragOptional();
    const categoryDrag = useCategoryDragOptional();
    const { createCategory } = useCategoryCreation();
    const { createButton } = useButtonCreation();
    const tabRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());

    const [activeTabId, setActiveTabId] = useState<string | null>(() =>
        resolveActiveTabId(plugin.activeTabCategoryId, categories)
    );
    const activeTabIdRef = React.useRef(activeTabId);
    activeTabIdRef.current = activeTabId;

    const selectActiveTab = React.useCallback(
        (categoryId: string) => {
            if (categoryId === activeTabIdRef.current) return;
            plugin.activeTabCategoryId = categoryId;
            setActiveTabId(categoryId);
        },
        [plugin]
    );

    useEffect(() => {
        const resolved = resolveActiveTabId(
            activeTabId ?? plugin.activeTabCategoryId,
            categories
        );
        if (resolved === activeTabId) return;
        if (resolved !== null) {
            plugin.activeTabCategoryId = resolved;
        }
        setActiveTabId(resolved);
    }, [categories, activeTabId, plugin]);

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

    useEffect(() => {
        if (!enableEditMode) return;

        const cleanupFunctions: Array<() => void> = [];

        tabRefs.current.forEach((tabEl, categoryId) => {
            const handleContextMenu = categoryMenuHandlers.get(categoryId);
            if (!handleContextMenu) return;

            tabEl.addEventListener('contextmenu', handleContextMenu);
            cleanupFunctions.push(() => {
                tabEl.removeEventListener('contextmenu', handleContextMenu);
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

    const orderedCategories = React.useMemo(() => {
        if (isCategoryDragging) {
            return [...categories].sort((a, b) => a.order - b.order);
        }
        if (categorySortEnabled) {
            return categoryDrag!.getOrderedCategories(categories);
        }
        return categories;
    }, [categories, isCategoryDragging, categorySortEnabled, categoryDrag]);

    const tabBarClass = React.useMemo(
        () => `buttons-panel-tab-bar${tabsWrap ? ' tabs-wrap' : ''}`,
        [tabsWrap]
    );

    const contentClass = React.useMemo(
        () =>
            sortableEnabled
                ? `buttons-panel-grid ${displayStyle === 'icon_top' ? 'icon-top' : 'icon-left'}`
                : `buttons-panel-content ${displayStyle === 'icon_top' ? 'icon-top' : 'icon-left'}`,
        [sortableEnabled, displayStyle]
    );

    if (categories.length === 0) {
        return (
            <div className="buttons-panel-tabs-mode">
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

    const activeCategory = categories.find((cat) => cat.id === activeTabId);
    const activeButtons = activeCategory?.buttons ?? [];

    const orderedActiveButtons =
        activeCategory && sortableEnabled
            ? buttonDrag!.getOrderedButtons(activeCategory)
            : activeButtons;

    const renderSortableCategoryGrid = (category: CategoryConfig, visible: boolean) => (
        <div
            key={category.id}
            className={visible ? undefined : 'buttons-panel-tab-drag-pool'}
            style={visible ? undefined : { display: 'none' }}
            aria-hidden={!visible}
        >
            <CategoryButtonGrid
                category={category}
                orderedButtons={buttonDrag!.getOrderedButtons(category)}
                contentClass={contentClass}
                displayStyle={displayStyle}
                enableAnimation={enableAnimation && visible}
                enableEditMode={enableEditMode}
                plugin={plugin}
                app={app}
                sortableEnabled={sortableEnabled}
            >
                {enableEditMode && visible && (
                    <AddButton onClick={() => createButton(category)} />
                )}
            </CategoryButtonGrid>
        </div>
    );

    const bindTabRef = (categoryId: string) => (el: HTMLDivElement | null) => {
        if (el) {
            tabRefs.current.set(categoryId, el);
        } else {
            tabRefs.current.delete(categoryId);
        }
    };

    const renderTab = (category: CategoryConfig) => {
        const isActive = category.id === activeTabId;
        const tabClassNames = ['buttons-panel-tab', isActive && 'is-active']
            .filter(Boolean)
            .join(' ');

        const handleTabClick = () => {
            if (categoryDrag?.isDragging || buttonDrag?.isDragging) return;
            selectActiveTab(category.id);
        };

        const tabInner = (
            <>
                <span
                    className="tab-icon"
                    ref={(el) => {
                        if (el) {
                            setIcon(el, 'layout-grid');
                        }
                    }}
                />
                <span className="tab-label">{category.name}</span>
            </>
        );

        if (categorySortEnabled) {
            return (
                <SortableCategoryTab
                    key={category.id}
                    categoryId={category.id}
                    className={tabClassNames}
                    onClick={handleTabClick}
                    onDragTabHoverActivate={selectActiveTab}
                    innerRef={bindTabRef(category.id)}
                >
                    {tabInner}
                </SortableCategoryTab>
            );
        }

        if (sortableEnabled) {
            return (
                <TabDropTarget
                    key={category.id}
                    categoryId={category.id}
                    className={tabClassNames}
                    onClick={handleTabClick}
                    onDragTabHoverActivate={selectActiveTab}
                >
                    {tabInner}
                </TabDropTarget>
            );
        }

        return (
            <div
                key={category.id}
                ref={bindTabRef(category.id)}
                className={tabClassNames}
                onClick={handleTabClick}
                style={{ cursor: 'pointer' }}
            >
                {tabInner}
            </div>
        );
    };

    const tabList = orderedCategories.map((category) => renderTab(category));

    return (
        <div className="buttons-panel-tabs-mode">
            <div
                className={tabBarClass}
                data-category-sort-dragging={isCategoryDragging || undefined}
            >
                {tabList}
                {enableEditMode && (
                    <div className="add-category">
                        <IconButton
                            icon="plus"
                            onClick={() => createCategory()}
                            className="add-category-btn"
                            ariaLabel={t('add_category') || '添加分类'}
                        />
                    </div>
                )}
            </div>
            <div className="buttons-panel-tab-content">
                {sortableEnabled ? (
                    <>
                        {orderedCategories.map((category) =>
                            renderSortableCategoryGrid(category, category.id === activeTabId)
                        )}
                        {!enableEditMode && activeCategory && orderedActiveButtons.length === 0 && !(buttonDrag?.isDragging || isCategoryDragging) && (
                            <div className="buttons-panel-empty-hint">{t('no_buttons_in_category')}</div>
                        )}
                    </>
                ) : activeButtons.length === 0 ? (
                    enableEditMode && activeCategory ? (
                        <div className={contentClass}>
                            <AddButton onClick={() => createButton(activeCategory)} />
                        </div>
                    ) : (
                        <div className="buttons-panel-empty-hint">{t('no_buttons_in_category')}</div>
                    )
                ) : (
                    activeCategory && (
                        <CategoryButtonGrid
                            category={activeCategory}
                            orderedButtons={orderedActiveButtons}
                            contentClass={contentClass}
                            displayStyle={displayStyle}
                            enableAnimation={enableAnimation}
                            enableEditMode={enableEditMode}
                            plugin={plugin}
                            app={app}
                            sortableEnabled={sortableEnabled}
                        >
                            {enableEditMode && (
                                <AddButton onClick={() => createButton(activeCategory)} />
                            )}
                        </CategoryButtonGrid>
                    )
                )}
            </div>
        </div>
    );
};
