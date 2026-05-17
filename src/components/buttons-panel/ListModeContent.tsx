import React from 'react';
import type { CategoryConfig, ButtonConfig } from '@/types';
import { setIcon } from 'obsidian';
import { ButtonItem } from '@/components/button/ButtonItem';
import { usePluginContext } from '@/contexts/PluginContext';
import { useMoveModeContext } from '@/contexts/MoveModeContext';
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
}) => {
    const { plugin, app } = usePluginContext();
    const moveMode = useMoveModeContext();
    const { createCategory } = useCategoryCreation();
    const { createButton } = useButtonCreation();
    // 分类标题 DOM 引用（用于绑定右键菜单等），不再使用 heading 标签，改为普通块级元素
    const titleRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());

    // 列表视图折叠状态（仅在"非移动模式"下生效；移动模式强制展开便于操作）
    const [openByCategoryId, setOpenByCategoryId] = React.useState<Map<string, boolean>>(() => {
        const map = new Map<string, boolean>();
        const defaultOpen = !autoCollapseOnMount;
        categories.forEach((c) => map.set(c.id, defaultOpen));
        return map;
    });

    // categories 变更时补齐新分类，并清理已删除分类
    React.useEffect(() => {
        setOpenByCategoryId((prev) => {
            const next = new Map(prev);
            const defaultOpen = !autoCollapseOnMount;

            for (const c of categories) {
                if (!next.has(c.id)) {
                    next.set(c.id, defaultOpen);
                }
            }
            for (const key of Array.from(next.keys())) {
                if (!categories.some((c) => c.id === key)) {
                    next.delete(key);
                }
            }
            return next;
        });
    }, [categories, autoCollapseOnMount]);

    // 创建分类菜单处理函数的映射（为每个分类创建处理函数）
    const categoryMenuHandlers = React.useMemo(() => {
        const handlers = new Map<string, (e: MouseEvent) => void>();
        categories.forEach((category) => {
            const handler = createCategoryMenuHandler(category, categories, plugin, app, moveMode);
            handlers.set(category.id, handler);
        });
        return handlers;
    }, [categories, plugin, app, moveMode]);

    // 绑定分类标题右键菜单
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

    // 列表视图展开内容统一使用 grid 布局（与按钮移动模式一致）
    const contentClass = React.useMemo(
        () => `buttons-panel-grid ${displayStyle === 'icon_top' ? 'icon-top' : 'icon-left'}`,
        [displayStyle]
    );

    if (categories.length === 0) {
        return (
            <div className="buttons-panel-list-mode">
                {enableEditMode && moveMode.state.type === 'none' ? (
                    <AddCategoryButton onClick={() => createCategory()} />
                ) : (
                    <div>尚未配置任何分类，请在设置中添加分类和按钮。</div>
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
                const categoryClassNames = ['buttons-panel-category'];
                if (isButtonMoveMode) {
                    categoryClassNames.push('move-mode-category');
                } else if (isCategoryMoveMode) {
                    categoryClassNames.push('move-category-target');
                } else {
                    // 普通列表：折叠用分类移动模式卡片，展开用按钮移动模式卡片
                    categoryClassNames.push(isOpen ? 'move-mode-category' : 'move-category-target');
                }
                if (isMovingCategory) {
                    categoryClassNames.push('moving-category');
                }

                const handleCategoryClick = () => {
                    // 分类移动模式下，点击分类整体 => 移动到该分类位置
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
                        <div
                            ref={(el) => {
                                if (el) {
                                    titleRefs.current.set(category.id, el);
                                } else {
                                    titleRefs.current.delete(category.id);
                                }
                            }}
                            className={
                                'buttons-panel-category-title' +
                                (!isButtonMoveMode && !isCategoryMoveMode ? ' is-collapsible' : '')
                            }
                            role={!isButtonMoveMode && !isCategoryMoveMode ? 'button' : undefined}
                            tabIndex={!isButtonMoveMode && !isCategoryMoveMode ? 0 : undefined}
                            aria-expanded={
                                !isButtonMoveMode && !isCategoryMoveMode ? isOpen : undefined
                            }
                            onClick={
                                isButtonMoveMode
                                    ? (e) => {
                                          // 按钮移动模式下，点击分类标题 => 移动到该分类最后一个位置
                                          e.preventDefault();
                                          e.stopPropagation();
                                          void moveMode.moveButtonTo(category.id, category.buttons.length);
                                      }
                                    : !isCategoryMoveMode
                                      ? (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setOpenByCategoryId((prev) => {
                                                const next = new Map(prev);
                                                next.set(category.id, !isOpen);
                                                return next;
                                            });
                                        }
                                      : undefined
                            }
                            onKeyDown={
                                !isButtonMoveMode && !isCategoryMoveMode
                                    ? (e) => {
                                          if (e.key !== 'Enter' && e.key !== ' ') return;
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setOpenByCategoryId((prev) => {
                                              const next = new Map(prev);
                                              next.set(category.id, !isOpen);
                                              return next;
                                          });
                                      }
                                    : undefined
                            }
                        >
                            <span
                                className="category-icon"
                                ref={(el) => {
                                    if (el) {
                                        // 分类移动模式：所有分类都显示“折叠”样式（只展示图标 + 名称）
                                        if (isCategoryMoveMode) {
                                            setIcon(el, 'chevron-right');
                                            return;
                                        }

                                        const isCollapsibleActive = !isButtonMoveMode && !isCategoryMoveMode;
                                        const iconOpen = isCollapsibleActive ? isOpen : true;
                                        setIcon(el, iconOpen ? 'chevron-down' : 'chevron-right');
                                    }
                                }}
                            />
                            {category.name}
                        </div>
                        {!isCategoryMoveMode && (isButtonMoveMode || isOpen) && (
                            <div
                                className={contentClass}
                                onClick={
                                    isButtonMoveMode
                                        ? (e) => {
                                              // 仅在点击“按钮容器背景空白处”时，移动到该分类末尾
                                              if (e.target !== e.currentTarget) return;
                                              e.preventDefault();
                                              e.stopPropagation();
                                              void moveMode.moveButtonTo(category.id, category.buttons.length);
                                          }
                                        : undefined
                                }
                            >
                                {category.buttons.length === 0 ? (
                                    isButtonMoveMode ? (
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
                                    ) : enableEditMode && moveMode.state.type === 'none' ? (
                                        <AddButton onClick={() => createButton(category)} />
                                    ) : (
                                        <div className="buttons-panel-empty-hint">该分类下暂无按钮。</div>
                                    )
                                ) : (
                                    <>
                                        {category.buttons.map((button, index) => {
                                            const isMovingButton =
                                                isButtonMoveMode && movingButtonId === button.id;

                                            return (
                                                <ButtonItem
                                                    key={button.id}
                                                    button={button}
                                                    category={category}
                                                    index={index}
                                                    displayStyle={displayStyle}
                                                    enableAnimation={enableAnimation}
                                                    enableEditMode={enableEditMode}
                                                    plugin={plugin}
                                                    app={app}
                                                    onMoveStart={handleButtonMoveStart}
                                                    isInButtonMoveMode={isButtonMoveMode}
                                                    isMovingButton={isMovingButton}
                                                />
                                            );
                                        })}
                                        {enableEditMode && moveMode.state.type === 'none' && (
                                            <AddButton onClick={() => createButton(category)} />
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
            {enableEditMode && moveMode.state.type === 'none' && (
                <AddCategoryButton onClick={() => createCategory()} />
            )}
        </div>
    );
};
