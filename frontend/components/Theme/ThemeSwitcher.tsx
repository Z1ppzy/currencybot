'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

export function ThemeSwitcher() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5" />
            ) : (
                <Sun className="w-5 h-5" />
            )}
        </button>
    );
}