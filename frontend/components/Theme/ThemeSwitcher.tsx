'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { Button } from '@/components/ui/button';

export const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <Button onClick={toggleTheme} variant="outline">
            {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
        </Button>
    );
};
