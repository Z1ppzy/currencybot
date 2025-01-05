'use client';

import { useTheme } from '@/providers/ThemeProvider';

export default function Header() {
    const { settings } = useTheme();

    // Определяем цвет текста в зависимости от выбранной схемы
    const textColorStyle = {
        color: settings.colorScheme === 'custom'
            ? settings.customColor
            : `var(--primary-color)`
    };

    return (
        <div className='w-full h-[70px] '>
            <div className='text-center flex items-center font-bold'>
                <span style={textColorStyle}>CurrencyBot</span>
            </div>
        </div>
    );
}