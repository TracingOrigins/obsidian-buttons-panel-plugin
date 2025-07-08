/**
 * 按钮配置对象类型。
 * 描述单个按钮的所有属性。
 */
export interface ButtonConfig {
	/** 按钮唯一ID */
	id: string;
	/** 按钮名称 */
	name: string;
	/** 按钮图标（SVG或字符） */
	icon?: string;
	/** 按钮动作配置 */
	action: ButtonAction;
	/** 按钮在分类内的排序值 */
	order: number;
	/** 按钮自定义样式（可选） */
	customCss?: string;
}

/**
 * 分类配置对象类型。
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

/**
 * 按钮动作类型。
 * 支持文件、命令、URL、创建文件、脚本等多种类型。
 */
export interface ButtonAction {
	/** 动作类型（file/command/url/create_file/script） */
	type: 'file' | 'command' | 'url' | 'create_file' | 'script';
	/** 动作参数值，如文件路径、命令ID、URL、脚本内容等 */
	value: string;
	/** 额外参数（如模板路径等） */
	parameters?: Record<string, any>;
}

/**
 * 面板设置类型。
 * 控制面板的标题、显示方式、布局等。
 */
export interface PanelSettings {
	/** 面板标题 */
	title: string;
	/** 是否显示标题 */
	showTitle: boolean;
	/** 面板高度 */
	panelHeight: string;
	/** 按钮显示样式（default:图标和文字同一行，icon_top:图标在上文字在下） */
	displayStyle: 'default' | 'icon_top';
	/** 面板视图类型（列表/标签页） */
	panelViewType?: 'list' | 'tabs';
	/** 是否启用按钮动画 */
	enableAnimation?: boolean;
}

/**
 * 路径设置类型。
 * 包含模板和脚本文件夹路径。
 */
export interface PathSettings {
	/** 模板文件夹路径 */
	templateFolderPath?: string;
	/** 脚本文件夹路径 */
	scriptFolderPath?: string;
}

/**
 * 插件全局设置类型。
 * 包含所有分类、面板设置等。
 */
export interface ButtonsPanelPluginSettings {
	/** 分类数组 */
	categories: CategoryConfig[];
	/** 面板设置 */
	panelSettings: PanelSettings;
	/** 路径设置 */
	pathSettings: PathSettings;
}

/**
 * 插件默认设置常量。
 * 提供插件初始化时的默认配置。
 */
export const DEFAULT_SETTINGS: ButtonsPanelPluginSettings = {
	categories: [],
	panelSettings: {
		title: 'Buttons Panel',
		showTitle: true,
		panelHeight: 'auto',
		displayStyle: 'default',
		panelViewType: 'list',
		enableAnimation: true,
	},
	pathSettings: {
		templateFolderPath: 'templates/',
		scriptFolderPath: 'scripts/',
	},
}; 