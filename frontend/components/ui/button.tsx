import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'solid' | 'outline';
    size?: 'sm' | 'md' | 'lg';
}

export function Button({
                           children,
                           className,
                           variant = 'solid',
                           size = 'md',
                           ...props
                       }: ButtonProps) {
    const baseStyles = "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        solid: "text-white",
        outline: "border-2 bg-transparent",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            style={{
                backgroundColor: variant === 'solid' ? 'var(--primary-color)' : 'transparent',
                borderColor: variant === 'outline' ? 'var(--primary-color)' : undefined,
                color: variant === 'outline' ? 'var(--primary-color)' : undefined,
            }}
            {...props}
        >
            {children}
        </button>
    );
}