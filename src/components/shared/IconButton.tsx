import React, { useEffect, useRef } from 'react';
import { setIcon } from 'obsidian';

interface IconButtonProps {
    icon: string;
    onClick: () => void;
    className?: string;
    ariaLabel?: string;
    type?: 'button' | 'submit' | 'reset';
}

/**
 * IconButton
 * 
 * 封装带图标的按钮组件，统一处理 setIcon 逻辑。
 * 
 * @param icon 图标名称或 SVG 字符串
 * @param onClick 点击回调
 * @param className 额外的 CSS 类名
 * @param ariaLabel 无障碍标签
 * @param type 按钮类型
 */
export const IconButton: React.FC<IconButtonProps> = ({
    icon,
    onClick,
    className = '',
    ariaLabel,
    type = 'button',
}) => {
    const iconRef = useRef<HTMLSpanElement | null>(null);

    useEffect(() => {
        if (iconRef.current) {
            setIcon(iconRef.current, icon);
        }
    }, [icon]);

    return (
        <button
            type={type}
            className={className}
            onClick={onClick}
            aria-label={ariaLabel}
        >
            <span ref={iconRef} />
        </button>
    );
};

