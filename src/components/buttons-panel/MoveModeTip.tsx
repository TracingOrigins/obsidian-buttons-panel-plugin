import React from 'react';
import { useMoveModeContext } from '@/contexts/MoveModeContext';
import { t } from '@/utils/i18n';
import './MoveModeTip.css';

/**
 * MoveModeTip
 * 移动模式顶部提示信息（React 版）。
 * - 当处于按钮移动模式或分类移动模式时显示一条提示条；
 * - 样式已抽取到 `MoveModeTip.css` 中。
 */
export const MoveModeTip: React.FC = () => {
    const moveMode = useMoveModeContext();

    if (moveMode.state.type === 'none') {
        return null;
    }

    const isButtonMode = moveMode.state.type === 'button';

    const title = isButtonMode ? t('button_move_mode') : t('category_move_mode');
    const desc = isButtonMode ? t('button_move_mode_desc') : t('category_move_mode_desc');

    return (
        <div className="move-mode-tip">
            <div>
                <strong>{title}</strong>
                <br />
                <span>{desc}</span>
            </div>
        </div>
    );
};


