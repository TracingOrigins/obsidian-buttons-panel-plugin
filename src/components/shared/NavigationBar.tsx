import React from 'react';
import { setIcon, Menu } from 'obsidian';
import { t } from '@/utils/i18n';
import type { InteractionMode } from '@/types';
import './NavigationBar.css';

interface NavIconButtonProps {
    icon: string;
    label: string;
    className?: string;
    isActive?: boolean;
    onClick: () => void;
}

/**
 * 按钮面板导航栏中的单个图标按钮（无下拉菜单）。
 * - 只关注 UI：图标 + 状态样式 + 点击回调
 * - 不直接依赖插件或配置对象
 */
function NavIconButton({
    icon,
    label,
    className = '',
    isActive,
    onClick,
}: NavIconButtonProps) {
    const buttonRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (buttonRef.current) {
            setIcon(buttonRef.current, icon as unknown as string);
        }
    }, [icon]);

    const classes = [
        'clickable-icon',
        'nav-action-button',
        className,
        isActive ? 'is-active' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            ref={buttonRef}
            className={classes}
            aria-label={label}
            onClick={onClick}
        />
    );
}

// ---------------------------------------------------------------------------
// 下拉菜单按钮
// ---------------------------------------------------------------------------

interface MenuOption {
    icon: string;
    title: string;
    checked: boolean;
    onClick: () => void;
}

interface DropdownButtonProps {
    icon: string;
    label: string;
    className?: string;
    options: MenuOption[];
}

/**
 * 带下拉菜单的图标按钮。
 * 点击后在按钮下方弹出 Obsidian 原生 Menu：
 * - 每个选项左侧显示图标，右侧显示对勾表示当前选中状态；
 * - 选择后按钮图标同步切换为当前选项的图标。
 */
function DropdownButton({
    icon,
    label,
    className = '',
    options,
}: DropdownButtonProps) {
    const buttonRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (buttonRef.current) {
            setIcon(buttonRef.current, icon as unknown as string);
        }
    }, [icon]);

    const handleClick = (e: React.MouseEvent) => {
        const menu = new Menu();
        for (const opt of options) {
            menu.addItem((item) => {
                item
                    .setTitle(opt.title)
                    .setIcon(opt.icon)
                    .setChecked(opt.checked ? true : false)
                    .onClick(opt.onClick);
            });
        }
        menu.showAtMouseEvent(e.nativeEvent);
    };

    return (
        <div
            ref={buttonRef}
            className={`clickable-icon nav-action-button ${className}`.trim()}
            aria-label={label}
            onClick={handleClick}
        />
    );
}

// ---------------------------------------------------------------------------
// NavigationBar 主组件
// ---------------------------------------------------------------------------

export interface NavigationBarProps {
    /** 当前视图模式：tabs 或 list */
    panelViewType: 'tabs' | 'list';
    /** 按钮样式：default 或 icon_top */
    displayStyle: 'default' | 'icon_top';
    /** 当前交互模式：locked / sort / edit */
    interactionMode: InteractionMode;
    /** 是否显示导航栏（由外层控制） */
    showTopNavBar?: boolean;
    /** 视图切换回调，传入选中的视图类型 */
    onChangeView: (viewType: 'tabs' | 'list') => void;
    /** 样式切换回调，传入选中的显示样式 */
    onChangeStyle: (style: 'default' | 'icon_top') => void;
    /** 交互模式切换回调 */
    onChangeInteractionMode: (mode: InteractionMode) => void;
    /** 打开设置回调 */
    onOpenSettings: () => void;
    /** 搜索关键字变化回调（仅内存过滤，不写入设置） */
    onSearchChange?: (query: string) => void;
}

/**
 * 按钮面板顶部导航栏（纯 UI 组件）。
 *
 * - 不直接访问 plugin 或 panelConfig
 * - 通过 props 接收当前状态和回调
 * - 由外层决定是否渲染（showTopNavBar）
 * - 视图/样式按钮使用 Obsidian 原生 Menu 弹出下拉选项
 */
export const NavigationBar: React.FC<NavigationBarProps> = ({
    panelViewType,
    displayStyle,
    interactionMode,
    showTopNavBar = true,
    onChangeView,
    onChangeStyle,
    onChangeInteractionMode,
    onOpenSettings,
    onSearchChange,
}) => {
    if (!showTopNavBar) {
        return null;
    }

    const [isSearchOpen, setIsSearchOpen] = React.useState(false);
    const [searchText, setSearchText] = React.useState('');
    const searchInputRef = React.useRef<HTMLInputElement | null>(null);

    const handleSearchButtonClick = () => {
        setIsSearchOpen((prev) => {
            const next = !prev;

            if (!next) {
                // 关闭搜索时清空关键字
                setSearchText('');
                onSearchChange?.('');
            } else {
                // 打开搜索时自动聚焦输入框
                window.setTimeout(() => {
                    searchInputRef.current?.focus();
                }, 0);
            }

            return next;
        });
    };

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchText(value);
        onSearchChange?.(value);
    };

    const handleClearSearch = () => {
        setSearchText('');
        onSearchChange?.('');
        searchInputRef.current?.focus();
    };

    // ---- 按钮图标：根据当前模式动态变化 ----
    const viewIcon = panelViewType === 'tabs' ? 'tabs' : 'list';
    const styleIcon = displayStyle === 'icon_top' ? 'layout-panel-top' : 'layout-panel-left';
    // 交互模式图标：locked→lock, sort→arrow-up-down, edit→pencil
    const interactionIcon =
        interactionMode === 'locked' ? 'lock' :
        interactionMode === 'edit'   ? 'pencil' :
        'arrow-up-down';

    // ---- 视图模式下拉选项 ----
    const viewOptions: MenuOption[] = [
        {
            icon: 'list',
            title: t('list_view'),
            checked: panelViewType === 'list',
            onClick: () => onChangeView('list'),
        },
        {
            icon: 'tabs',
            title: t('tabs_view'),
            checked: panelViewType === 'tabs',
            onClick: () => onChangeView('tabs'),
        },
    ];

    // ---- 样式下拉选项 ----
    const styleOptions: MenuOption[] = [
        {
            icon: 'layout-panel-left',
            title: t('icon_left'),
            checked: displayStyle === 'default',
            onClick: () => onChangeStyle('default'),
        },
        {
            icon: 'layout-panel-top',
            title: t('icon_top'),
            checked: displayStyle === 'icon_top',
            onClick: () => onChangeStyle('icon_top'),
        },
    ];

    // ---- 交互模式下拉选项 ----
    const interactionOptions: MenuOption[] = [
        {
            icon: 'lock',
            title: t('interaction_locked'),
            checked: interactionMode === 'locked',
            onClick: () => onChangeInteractionMode('locked'),
        },
        {
            icon: 'arrow-up-down',
            title: t('interaction_sort'),
            checked: interactionMode === 'sort',
            onClick: () => onChangeInteractionMode('sort'),
        },
        {
            icon: 'pencil',
            title: t('interaction_edit'),
            checked: interactionMode === 'edit',
            onClick: () => onChangeInteractionMode('edit'),
        },
    ];

    // ---- 当前选项的悬浮提示文字 ----
    const viewLabel = panelViewType === 'list' ? t('list_view') : t('tabs_view');
    const styleLabel = displayStyle === 'default' ? t('icon_left') : t('icon_top');
    const interactionLabel =
        interactionMode === 'locked' ? t('interaction_locked') :
        interactionMode === 'edit'   ? t('interaction_edit') :
        t('interaction_sort');

    // ---- 搜索输入区占位文字 ----
    const searchPlaceholder = t('search_placeholder') || '输入并开始搜索…';

    return (
        <>
            <div className="nav-buttons-container">
                <NavIconButton
                    icon="search"
                    label={t('search') || '筛选'}
                    className="search-btn"
                    isActive={isSearchOpen}
                    onClick={handleSearchButtonClick}
                />
                <DropdownButton
                    icon={viewIcon}
                    label={viewLabel}
                    className="view-btn"
                    options={viewOptions}
                />
                <DropdownButton
                    icon={styleIcon}
                    label={styleLabel}
                    className="style-btn"
                    options={styleOptions}
                />
                <DropdownButton
                    icon={interactionIcon}
                    label={interactionLabel}
                    className="edit-mode-btn"
                    options={interactionOptions}
                />
                <NavIconButton
                    icon="settings"
                    label={t('buttons_panel_options')}
                    className="settings-btn"
                    onClick={onOpenSettings}
                />
            </div>
            {isSearchOpen && (
                <div className="search-input-container">
                    <input
                        ref={searchInputRef}
                        type="search"
                        spellCheck={false}
                        enterKeyHint="search"
                        placeholder={searchPlaceholder}
                        value={searchText}
                        onChange={handleSearchInputChange}
                    />
                    {searchText && (
                        <div
                            className="search-input-clear-button"
                            aria-label={t('clear_search') || '清除搜索'}
                            onClick={handleClearSearch}
                        />
                    )}
                </div>
            )}
        </>
    );
};

