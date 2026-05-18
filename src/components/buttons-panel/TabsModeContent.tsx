import React, { useState, useEffect } from 'react';
import type { CategoryConfig, ButtonConfig } from '@/types';
import { setIcon } from 'obsidian';
import { usePluginContext } from '@/contexts/PluginContext';
import { useMoveModeContext } from '@/contexts/MoveModeContext';
import { useButtonDragOptional } from '@/contexts/ButtonDragContext';
import { CategoryButtonGrid } from '@/components/buttons-panel/CategoryButtonGrid';
import { TabDropTarget } from '@/components/buttons-panel/TabDropTarget';
import { useCategoryCreation, useButtonCreation } from '@/hooks';
import { AddButton } from '@/components/shared/AddButton';
import { AddCategoryButton } from '@/components/shared/AddCategoryButton';
import { IconButton } from '@/components/shared/IconButton';
import { createCategoryMenuHandler } from '@/utils/categoryMenuUtils';
import { t } from '@/utils/i18n';
import './TabsModeContent.css';

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
    displayStyle: 'default' | 'icon_top';
    enableAnimation: boolean;
    enableEditMode: boolean;
    tabsWrap: boolean;
    /** 是否处于顶部导航栏搜索过滤中（用于空状态文案） */
    isSearchActive?: boolean;
}

/**
 * TabsModeContent
 * 标签视图：
 * - 显示标签栏，每个分类一个标签
 * - 显示当前激活标签对应的分类按钮
 */
export const TabsModeContent: React.FC<TabsModeContentProps> = ({
    categories,
    displayStyle,
    enableAnimation,
    enableEditMode,
    tabsWrap,
    isSearchActive = false,
}) => {
    const { plugin, app } = usePluginContext();
    const moveMode = useMoveModeContext();
    const buttonDrag = useButtonDragOptional();
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

    // 当分类列表变化时，校正激活标签（优先保留插件记录或当前选中）
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

    // 创建分类菜单处理函数的映射（为每个分类创建处理函数）
    const categoryMenuHandlers = React.useMemo(() => {
        const handlers = new Map<string, (e: MouseEvent) => void>();
        categories.forEach((category) => {
            const handler = createCategoryMenuHandler(category, categories, plugin, app, moveMode);
            handlers.set(category.id, handler);
        });
        return handlers;
    }, [categories, plugin, app, moveMode]);

    // 绑定分类标签右键菜单
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

    const handleButtonMoveStart = React.useCallback(
        (button: ButtonConfig) => {
            moveMode.enterButtonMoveMode(button);
        },
        [moveMode]
    );

    const isButtonMoveMode = moveMode.state.type === 'button';
    const movingButtonId =
        moveMode.state.type === 'button' ? moveMode.state.button.id : null;

    const isCategoryMoveMode = moveMode.state.type === 'category';
    const movingCategoryId =
        moveMode.state.type === 'category' ? moveMode.state.category.id : null;

    const sortableEnabled =
        (buttonDrag?.enabled ?? false) && !isButtonMoveMode && !isCategoryMoveMode;

    // 使用 useMemo 缓存类名计算
    const tabBarClass = React.useMemo(
        () => `buttons-panel-tab-bar${tabsWrap ? ' tabs-wrap' : ''}`,
        [tabsWrap]
    );

    const contentClass = React.useMemo(
        () =>
            isButtonMoveMode || sortableEnabled
                ? `buttons-panel-grid ${displayStyle === 'icon_top' ? 'icon-top' : 'icon-left'}`
                : `buttons-panel-content ${displayStyle === 'icon_top' ? 'icon-top' : 'icon-left'}`,
        [isButtonMoveMode, sortableEnabled, displayStyle]
    );

    if (categories.length === 0) {
        return (
            <div className="buttons-panel-tabs-mode">
                {enableEditMode && moveMode.state.type === 'none' && !isSearchActive ? (
                    <div className="buttons-panel-empty-hint">
                        <AddCategoryButton onClick={() => createCategory()} />
                    </div>
                ) : (
                    <div className="buttons-panel-empty-hint">
                        {isSearchActive ? '无匹配结果。' : '尚未配置任何分类，请在设置中添加分类和按钮。'}
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
                onMoveStart={handleButtonMoveStart}
                isInButtonMoveMode={isButtonMoveMode}
                movingButtonId={movingButtonId}
            >
                {enableEditMode && moveMode.state.type === 'none' && visible && (
                    <AddButton onClick={() => createButton(category)} />
                )}
            </CategoryButtonGrid>
        </div>
    );

    return (
        <div className="buttons-panel-tabs-mode">
            <div className={tabBarClass}>
                {categories.map((category) => {
                    const isActive = category.id === activeTabId;
                    const isMovingCategory = isCategoryMoveMode && movingCategoryId === category.id;
                    // 直接计算类名（在 map 循环中，每次迭代都会重新计算，使用 useMemo 反而增加开销）
                    const tabClassNames = [
                        'buttons-panel-tab',
                        isActive && 'is-active',
                        isCategoryMoveMode && 'move-category-target',
                        isMovingCategory && 'moving-category',
                    ]
                        .filter(Boolean)
                        .join(' ');

                    const handleTabClick = () => {
                        if (isButtonMoveMode) {
                            // 按钮移动模式下，点击分类标签 => 移动到该分类最后一个位置
                            void moveMode.moveButtonTo(category.id, category.buttons.length);
                            return;
                        }
                        if (isCategoryMoveMode) {
                            if (!movingCategoryId) return;
                            void moveMode.moveCategoryTo(category.id);
                            return;
                        }
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
                            ref={(el) => {
                                if (el) {
                                    tabRefs.current.set(category.id, el);
                                } else {
                                    tabRefs.current.delete(category.id);
                                }
                            }}
                            className={tabClassNames}
                            onClick={handleTabClick}
                            style={{ cursor: 'pointer' }}
                        >
                            {tabInner}
                        </div>
                    );
                })}
                {enableEditMode && moveMode.state.type === 'none' && (
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
                {!isCategoryMoveMode && (
                    <>
                        {sortableEnabled ? (
                            categories.map((category) =>
                                renderSortableCategoryGrid(
                                    category,
                                    category.id === activeTabId
                                )
                            )
                        ) : activeButtons.length === 0 ? (
                            isButtonMoveMode && activeCategory ? (
                                <div
                                    className={contentClass}
                                    onClick={(e) => {
                                        // 仅在点击“按钮容器背景空白处”时，移动到该分类末尾（空分类末尾就是 0）
                                        if (e.target !== e.currentTarget) return;
                                        e.preventDefault();
                                        e.stopPropagation();
                                        void moveMode.moveButtonTo(activeCategory.id, activeButtons.length);
                                    }}
                                >
                                    <div
                                        className="empty-category-placeholder"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            void moveMode.moveButtonTo(activeCategory.id, 0);
                                        }}
                                    >
                                        <div>
                                            <div>
                                                <div>+</div>
                                                <div>{t('empty_category_placeholder')}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : enableEditMode && moveMode.state.type === 'none' && activeCategory ? (
                                <div className={contentClass}>
                                    <AddButton onClick={() => createButton(activeCategory)} />
                                </div>
                            ) : (
                                <div className="buttons-panel-empty-hint">该分类下暂无按钮。</div>
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
                                    onMoveStart={handleButtonMoveStart}
                                    isInButtonMoveMode={isButtonMoveMode}
                                    movingButtonId={movingButtonId}
                                    onEmptyAreaClick={
                                        isButtonMoveMode
                                            ? (e) => {
                                                  if (e.target !== e.currentTarget) return;
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  void moveMode.moveButtonTo(
                                                      activeCategory.id,
                                                      activeButtons.length
                                                  );
                                              }
                                            : undefined
                                    }
                                >
                                    {enableEditMode && moveMode.state.type === 'none' && (
                                        <AddButton onClick={() => createButton(activeCategory)} />
                                    )}
                                </CategoryButtonGrid>
                            )
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
