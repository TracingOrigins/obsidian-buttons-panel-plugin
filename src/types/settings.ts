// settings.ts
// 用户设置/配置相关类型定义。
import type { ButtonAction } from '@/types/action';

/**
 * ButtonConfig 按钮配置对象类型。
 * 描述单个按钮的所有属性。
 */
export interface ButtonConfig {
    /** 按钮唯一ID */
    id: string;
    /** 按钮名称 */
    name: string;
    /** 按钮图标（SVG或字符） */
    icon?: string;
    /** 按钮动作序列 */
    actions: ButtonAction[];
    /** 按钮在分类内的排序值 */
    order: number;
    /** 按钮自定义样式（可选） */
    customCss?: string;
    /** 动作执行模式（顺序/并行） */
    executionMode?: 'sequential' | 'parallel';
    /** 某个动作失败时是否停止 */
    stopOnError?: boolean;
    /** 顺序执行时动作间延迟（毫秒） */
    delayBetweenActions?: number;
}

/**
 * CategoryConfig 分类配置对象类型。
 * 包含分类信息和该分类下的所有按钮。
 */
export interface CategoryConfig {
    /** 分类唯一ID */
    id: string;
    /** 分类名称 */
    name: string;
    /** 分类在全局的排序值 */
    order: number;
    /** 分类下的按钮数组 */
    buttons: ButtonConfig[];
}

/** 交互模式：locked(锁定布局)、sort(排序模式)、edit(编辑模式) */
export type InteractionMode = 'locked' | 'sort' | 'edit';

/**
 * PanelConfig 面板设置类型。
 * 控制面板的标题、显示方式、布局等。
 */
export interface PanelConfig {
    /** 按钮显示样式（icon_left:图标在左文字在右，icon_top:图标在上文字在下） */
    displayStyle: 'icon_left' | 'icon_top';
    /** 面板视图类型（列表/标签页/文件夹） */
    panelViewType: 'list' | 'tabs' | 'folder';
    /** 是否启用按钮动画 */
    enableAnimation?: boolean;
    /** 交互模式：locked(锁定布局) / sort(排序) / edit(编辑) */
    interactionMode?: InteractionMode;
    /** 是否显示顶部导航栏 */
    showTopNavBar?: boolean;
    /** 标签页是否自动换行 */
    tabsWrap?: boolean;
    /** 列表视图：是否在每次打开列表视图时默认折叠所有分类 */
    autoCollapseListView?: boolean;
    /** 文件夹视图：已展开文件夹名称是否可编辑 */
    folderDetailNameEditable?: boolean;
    /** 文件夹视图：是否显示按钮个数 */
    folderShowBtnCount?: boolean;
    /** 文件夹视图：点击空白处关闭 */
    folderCloseOnBlankClick?: boolean;
}

/**
 * PathConfig 路径设置类型。
 * 包含模板和脚本文件夹路径。
 */
export interface PathConfig {
    /** 模板文件夹路径 */
    templateFolderPath?: string;
    /** 脚本文件夹路径 */
    scriptFolderPath?: string;
}

/**
 * ButtonsPanelPluginSettings 插件全局设置类型。
 * 包含所有分类、面板设置等。
 */
export interface ButtonsPanelPluginSettings {
    /** 分类数组 */
    categories: CategoryConfig[];
    /** 面板设置 */
    panelConfig: PanelConfig;
    /** 路径设置 */
    pathConfig: PathConfig;
}

/**
 * DEFAULT_SETTINGS 插件默认设置常量。
 * 提供插件初始化时的默认配置。
 */
export const DEFAULT_SETTINGS: ButtonsPanelPluginSettings = {
    categories: [],
    panelConfig: {
        displayStyle: 'icon_top',
        panelViewType: 'list',
        enableAnimation: false,
        interactionMode: 'edit',
        showTopNavBar: true,
        tabsWrap: false,
        autoCollapseListView: false,
        folderDetailNameEditable: true,
        folderShowBtnCount: true,
        folderCloseOnBlankClick: false,
    },
    pathConfig: {
        templateFolderPath: 'templates/',
        scriptFolderPath: 'scripts/',
    },
};
