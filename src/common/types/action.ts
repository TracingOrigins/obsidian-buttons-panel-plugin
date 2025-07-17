// action.ts
// 按钮动作相关类型

/**
 * 文件动作参数类型。
 * 用于描述“打开文件”类按钮的参数。
 */
export interface FileActionParams {
    /** 文件路径 */
    filePath: string;
}

/**
 * 命令动作参数类型。
 * 用于描述“执行命令”类按钮的参数。
 */
export interface CommandActionParams {
    /** 命令ID */
    commandId: string;
    /** 命令参数（可选） */
    args?: any[];
}

/**
 * URL 动作参数类型。
 * 用于描述“打开链接”类按钮的参数。
 */
export interface UrlActionParams {
    /** 目标URL */
    url: string;
}

/**
 * 创建文件动作参数类型。
 * 用于描述“新建文件”类按钮的参数。
 */
export interface CreateFileActionParams {
    /** 文件夹路径（可选） */
    folderPath?: string;
    /** 文件名 */
    fileName: string;
    /** 模板名（可选） */
    templateName?: string;
}

/**
 * 脚本动作参数类型。
 * 用于描述“执行脚本”类按钮的参数。
 */
export interface ScriptActionParams {
    /** 脚本名 */
    scriptName: string;
    /** 脚本参数（可选） */
    args?: any[];
}

/**
 * ButtonAction 联合类型。
 * 描述所有支持的按钮动作类型及其参数。
 */
export type ButtonAction =
    | { type: 'file'; parameters: FileActionParams }
    | { type: 'command'; parameters: CommandActionParams }
    | { type: 'url'; parameters: UrlActionParams }
    | { type: 'create_file'; parameters: CreateFileActionParams }
    | { type: 'script'; parameters: ScriptActionParams };
