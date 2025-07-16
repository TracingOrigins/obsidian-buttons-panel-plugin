import { IButtonAction } from './IButtonAction';
import { ACTION_TYPES } from './actionTypes';

/**
 * 动作工厂类，负责根据原始数据或类型创建动作实例。
 * 支持类型校验、可用类型获取等功能。
 */
export class ButtonActionFactory {
    /**
     * 从原始 JSON 数据创建动作实例。
     * @param raw 原始动作对象
     */
    static fromRaw(raw: any): IButtonAction {
        if (!raw || typeof raw !== 'object' || !raw.type) {
            throw new Error('Invalid raw action: ' + JSON.stringify(raw));
        }
        const ActionClass = ACTION_TYPES[raw.type as keyof typeof ACTION_TYPES];
        if (!ActionClass) {
            throw new Error('Unknown action type: ' + raw.type);
        }
        return new ActionClass(raw.parameters);
    }

    /**
     * 根据类型和参数创建动作实例。
     * @param type 动作类型字符串
     * @param parameters 构造参数
     */
    static createAction(type: string, parameters: any): IButtonAction {
        const ActionClass = ACTION_TYPES[type as keyof typeof ACTION_TYPES];
        if (!ActionClass) {
            throw new Error('Unknown action type: ' + type);
        }
        return new ActionClass(parameters);
    }

    /**
     * 获取所有可用的动作类型字符串。
     */
    static getAvailableActionTypes(): string[] {
        return Object.keys(ACTION_TYPES);
    }

    /**
     * 校验动作类型是否合法。
     */
    static isValidActionType(type: string): boolean {
        return type in ACTION_TYPES;
    }
}
