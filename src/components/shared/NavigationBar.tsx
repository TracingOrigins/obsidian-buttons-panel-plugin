import React from 'react';
import { setIcon } from 'obsidian';
import { t } from '@/utils/i18n';
import './NavigationBar.css';

interface NavIconButtonProps {
    icon: string;
    label: string;
    className?: string;
    isActive?: boolean;
    onClick: () => void;
}

/**
 * 按钮面板导航栏中的单个图标按钮。
 * 参考 obsidian-music-player-plugin 的 NavigationBar/NavIconButton 设计：
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

export interface NavigationBarProps {
    /** 当前视图模式：tabs 或 list */
    panelViewType: 'tabs' | 'list';
    /** 按钮样式：default 或 icon_top */
    displayStyle: 'default' | 'icon_top';
    /** 是否开启编辑模式 */
    enableEditMode?: boolean;
    /** 是否显示导航栏（由外层控制） */
    showTopNavBar?: boolean;
    /** 视图切换回调 */
    onToggleView: () => void;
    /** 样式切换回调 */
    onToggleStyle: () => void;
    /** 编辑模式切换回调 */
    onToggleEditMode: () => void;
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
 */
export const NavigationBar: React.FC<NavigationBarProps> = ({
    panelViewType,
    displayStyle,
    enableEditMode,
    showTopNavBar = true,
    onToggleView,
    onToggleStyle,
    onToggleEditMode,
    onOpenSettings,
    onSearchChange,
}) => {
    if (!showTopNavBar) {
        return null;
    }

    const isEditActive = !!enableEditMode;

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
                <NavIconButton
                    icon={panelViewType === 'list' ? 'list-collapse' : 'tabs'}
                    label={
                        panelViewType === 'list' ? t('list_view') : t('tabs_view')
                    }
                    className="view-btn"
                    onClick={onToggleView}
                />
                <NavIconButton
                    icon={displayStyle === 'icon_top' ? 'image' : 'type'}
                    label={
                        displayStyle === 'icon_top'
                            ? t('icon_top_text_bottom')
                            : t('icon_text_same_line')
                    }
                    className="style-btn"
                    onClick={onToggleStyle}
                />
                <NavIconButton
                    icon="edit"
                    label={
                        isEditActive
                            ? t('disable_edit_mode') || '关闭编辑模式'
                            : t('enable_edit_mode')
                    }
                    className="edit-mode-btn"
                    isActive={isEditActive}
                    onClick={onToggleEditMode}
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
                        placeholder="输入并开始搜索…"
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

