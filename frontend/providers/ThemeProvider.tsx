'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ColorScheme, ThemeSettings } from '@/types/theme';

interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    settings: ThemeSettings;
    setColorScheme: (scheme: ColorScheme) => void;
    setCustomColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultSettings: ThemeSettings = {
    colorScheme: 'blue',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);

    useEffect(() => {
        setMounted(true);
        // Проверяем наличие темы в localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme as 'light' | 'dark');
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
            }
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        }

        // Загружаем сохраненные настройки цвета
        const savedSettings = localStorage.getItem('themeSettings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            setSettings(parsed);
            if (parsed.colorScheme === 'custom' && parsed.customColor) {
                document.documentElement.style.setProperty('--primary-color', parsed.customColor);
            }
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const setColorScheme = (colorScheme: ColorScheme) => {
        const newSettings = { ...settings, colorScheme };
        setSettings(newSettings);
        localStorage.setItem('themeSettings', JSON.stringify(newSettings));

        // Устанавливаем цвет через CSS переменную
        const color = COLORS[colorScheme]?.value || settings.customColor;
        if (color) {
            document.documentElement.style.setProperty('--primary-color', color);
        }
    };

    const setCustomColor = (color: string) => {
        const newSettings = { ...settings, colorScheme: 'custom', customColor: color };
        setSettings(newSettings);
        localStorage.setItem('themeSettings', JSON.stringify(newSettings));
        document.documentElement.style.setProperty('--primary-color', color);
    };

    if (!mounted) return null;

    return (
        <ThemeContext.Provider
            value={{
                theme,
                toggleTheme,
                settings,
                setColorScheme,
                setCustomColor,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

const COLORS = {
    zinc: { value: '#71717a' },
    slate: { value: '#64748b' },
    stone: { value: '#78716c' },
    gray: { value: '#6b7280' },
    neutral: { value: '#737373' },
    blue: { value: '#3b82f6' },
} as const;