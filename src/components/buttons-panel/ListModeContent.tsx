import React from 'react';
import type { CategoryConfig, ButtonConfig } from '@/types';
import { setIcon } from 'obsidian';
import { usePluginContext } from '@/contexts/PluginContext';
import { useMoveModeContext } from '@/contexts/MoveModeContext';
import { useButtonDragOptional } from '@/contexts/ButtonDragContext';
import { CategoryButtonGrid } from '@/components/buttons-panel/CategoryButtonGrid';
import { useCategoryCreation, useButtonCreation } from '@/hooks';
import { AddButton } from '@/components/shared/AddButton';
import { AddCategoryButton } from '@/components/shared/AddCategoryButton';
import { createCategoryMenuHandler } from '@/utils/categoryMenuUtils';
import { t } from '@/utils/i18n';
import './ListModeContent.css';

interface ListModeContentProps {
    categories: CategoryConfig[];
    displayStyle: 'default' | 'icon_top';
    enableAnimation: boolean;
    enableEditMode: boolean;
    /** 列表视图：是否在组件 mount 时默认折叠所有分类（按钮移动模式等场景应传 false） */
    autoCollapseOnMount?: boolean;
    /** 是否处于顶部导航栏搜索过滤中（用于空状态文案） */
    isSearchActive?: boolean;
}

/**
 * ListModeContent
 * 列表视图：
 * - 显示每个分类的标题
 * - 显示每个分类下的按钮列表
 */
export const ListModeContent: React.FC<ListModeContentProps> = ({
    categories,
    displayStyle,
    enableAnimation,
    enableEditMode,
    autoCollapseOnMount = false,
    isSearchActive = false,
}) => {
    const { plugin, app } = usePluginContext();
    const moveMode = useMoveModeContext();
    const buttonDrag = useButtonDragOptional();
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

    const categoryMenuHandlers = React.useMemo(() => {
        const handlers = new Map<string, (e: MouseEvent) => void>();
        categories.forEach((category) => {
            const handler = createCategoryMenuHandler(category, categories, plugin, app, moveMode);
            handlers.set(category.id, handler);
        });
        return handlers;
    }, [categories, plugin, app, moveMode]);

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

    const contentClass = React.useMemo(
        () => `buttons-panel-grid ${displayStyle === 'icon_top' ? 'icon-top' : 'icon-left'}`,
        [displayStyle]
    );

    if (categories.length === 0) {
        return (
            <div className="buttons-panel-list-mode">
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

    return (
        <div className="buttons-panel-list-mode">
            {categories.map((category) => {
                const isMovingCategory = isCategoryMoveMode && movingCategoryId === category.id;
                const isOpen =
                    openByCategoryId.get(category.id) ?? !autoCollapseOnMount;
                const orderedButtons = sortableEnabled
                    ? buttonDrag!.getOrderedButtons(category)
                    : category.buttons;
                const showButtonGrid =
                    !isCategoryMoveMode &&
                    (isButtonMoveMode || isOpen || sortableEnabled);
                const hideButtonGridWhileCollapsed =
                    sortableEnabled &&
                    !isButtonMoveMode &&
                    !isOpen &&
                    !buttonDrag?.isDragging;
                const isVisuallyOpen =
                    isOpen || (sortableEnabled && !!buttonDrag?.isDragging);
                const categoryClassNames = ['buttons-panel-category'];
                if (isButtonMoveMode) {
                    categoryClassNames.push('move-mode-category');
                } else if (isCategoryMoveMode) {
                    categoryClassNames.push('move-category-target');
                } else {
                    categoryClassNames.push(
                        isVisuallyOpen ? 'move-mode-category' : 'move-category-target'
                    );
                }
                if (isMovingCategory) {
                    categoryClassNames.push('moving-category');
                }

                const handleCategoryClick = () => {
                    if (isCategoryMoveMode) {
                        if (!movingCategoryId) return;
                        void moveMode.moveCategoryTo(category.id);
                    }
                };

                return (
                    <div
                        key={category.id}
                        className={categoryClassNames.join(' ')}
                        onClick={
                            isCategoryMoveMode
                                ? (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleCategoryClick();
                                  }
                                : undefined
                        }
                    >
                        {(() => {
                            const titleClassName =
                                'buttons-panel-category-title' +
                                (!isButtonMoveMode && !isCategoryMoveMode
                                    ? ' is-collapsible'
                                    : '');
                            const bindTitleRef = getTitleRef(category.id);
                            const titleHandlers = {
                                role: !isButtonMoveMode && !isCategoryMoveMode
                                    ? ('button' as const)
                                    : undefined,
                                tabIndex: !isButtonMoveMode && !isCategoryMoveMode ? 0 : undefined,
                                'aria-expanded':
                                    !isButtonMoveMode && !isCategoryMoveMode
                                        ? isVisuallyOpen
                                        : undefined,
                                onClick: isButtonMoveMode
                                    ? (e: React.MouseEvent) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          void moveMode.moveButtonTo(
                                              category.id,
                                              category.buttons.length
                                          );
                                      }
                                    : !isCategoryMoveMode
                                      ? (e: React.MouseEvent) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setOpenByCategoryId((prev) => {
                                                const next = new Map(prev);
                                                next.set(category.id, !isOpen);
                                                return next;
                                            });
                                        }
                                      : undefined,
                                onKeyDown: !isButtonMoveMode && !isCategoryMoveMode
                                    ? (e: React.KeyboardEvent) => {
                                          if (e.key !== 'Enter' && e.key !== ' ') return;
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setOpenByCategoryId((prev) => {
                                              const next = new Map(prev);
                                              next.set(category.id, !isOpen);
                                              return next;
                                          });
                                      }
                                    : undefined,
                            };
                            const titleContent = (
                                <>
                            <span
                                className="category-icon"
                                ref={(el) => {
                                    if (el) {
                                        if (isCategoryMoveMode) {
                                            setIcon(el, 'chevron-right');
                                            return;
                                        }
                                        const isCollapsibleActive =
                                            !isButtonMoveMode && !isCategoryMoveMode;
                                        const iconOpen = isCollapsibleActive
                                            ? isVisuallyOpen
                                            : true;
                                        setIcon(el, iconOpen ? 'chevron-down' : 'chevron-right');
                                    }
                                }}
                            />
                                    {category.name}
                                </>
                            );

                            return (
                                <div
                                    ref={bindTitleRef}
                                    className={titleClassName}
                                    {...titleHandlers}
                                >
                                    {titleContent}
                                </div>
                            );
                        })()}
                        {showButtonGrid &&
                            (category.buttons.length === 0 && !sortableEnabled ? (
                                isButtonMoveMode ? (
                                    <div
                                        className={contentClass}
                                        onClick={(e) => {
                                            if (e.target !== e.currentTarget) return;
                                            e.preventDefault();
                                            e.stopPropagation();
                                            void moveMode.moveButtonTo(category.id, 0);
                                        }}
                                    >
                                        <div
                                            className="empty-category-placeholder"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                void moveMode.moveButtonTo(category.id, 0);
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
                                ) : enableEditMode && moveMode.state.type === 'none' ? (
                                    <div className={contentClass}>
                                        <AddButton onClick={() => createButton(category)} />
                                    </div>
                                ) : (
                                    <div className="buttons-panel-empty-hint">
                                        该分类下暂无按钮。
                                    </div>
                                )
                            ) : (
                                <div
                                    style={
                                        hideButtonGridWhileCollapsed
                                            ? { display: 'none' }
                                            : undefined
                                    }
                                >
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
                                                          category.id,
                                                          category.buttons.length
                                                      );
                                                  }
                                                : undefined
                                        }
                                    >
                                        {enableEditMode && moveMode.state.type === 'none' && (
                                            <AddButton onClick={() => createButton(category)} />
                                        )}
                                    </CategoryButtonGrid>
                                </div>
                            ))}
                    </div>
                );
            })}
            {enableEditMode && moveMode.state.type === 'none' && (
                <AddCategoryButton onClick={() => createCategory()} />
            )}
        </div>
    );
};
