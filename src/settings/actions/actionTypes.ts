// 动作类型映射表，用于根据 type 字符串动态获取对应的动作类。
// 便于工厂方法和类型校验统一管理所有支持的动作类型。
// 新增动作类型时只需在此处注册即可。
import { FileAction } from './FileAction';
import { CommandAction } from './CommandAction';
import { UrlAction } from './UrlAction';
import { CreateFileAction } from './CreateFileAction';
import { ScriptAction } from './ScriptAction';

export const ACTION_TYPES = {
    file: FileAction,
    command: CommandAction,
    url: UrlAction,
    create_file: CreateFileAction,
    script: ScriptAction,
} as const;
