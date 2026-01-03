import React from 'react';

interface TouchableCardProps {
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    ariaLabel?: string;
}

export const TouchableCard: React.FC<TouchableCardProps> = ({
    onClick,
    children,
    className = '',
    disabled = false,
    ariaLabel
}) => {
    const handleClick = () => {
        if (!disabled && onClick) {
            onClick();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled && onClick) {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <div
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick && !disabled ? 0 : undefined}
            aria-label={ariaLabel}
            aria-disabled={disabled}
            className={`glass-card rounded-2xl
                ${onClick && !disabled ? 'cursor-pointer' : ''}
                ${onClick && !disabled ? 'transition-all duration-150' : ''}
                ${onClick && !disabled ? 'active:scale-[0.98] active:brightness-90' : ''}
                ${onClick && !disabled ? 'hover:bg-white/5' : ''}
                ${onClick && !disabled ? 'focus:outline-none focus:ring-2 focus:ring-primary/50' : ''}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}`}
        >
            {children}
        </div>
    );
};
