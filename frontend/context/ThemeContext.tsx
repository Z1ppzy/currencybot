import React, { createContext, useContext, useState, useEffect } from 'react';
import { COLOR_SCHEMES } from '@/constants/colors';
import { ThemeContextType, ThemeSettings, ColorScheme } from '@/types/theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_SETTINGS: ThemeSettings = {
    mode: 'light',
    colorScheme: 'blue',
};

const THEME_SETTINGS_KEY = 'themeSettings';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<ThemeSettings>(() => {
        // Пытаемся загрузить сохраненные настройки при инициализации
        if (typeof window !== 'undefined') {
            const savedSettings = localStorage.getItem(THEME_SETTINGS_KEY);
            if (savedSettings) {
                try {
                    return JSON.parse(savedSettings);
                } catch (e) {
                    console.error('Failed to parse saved theme settings');
                }
            }
        }
        return DEFAULT_SETTINGS;
    });

    useEffect(() => {
        // Применяем настройки темы
        document.documentElement.setAttribute('data-theme-mode', settings.mode);

        // Определяем основной цвет
        const primaryColor = settings.colorScheme === 'custom'
            ? settings.customColor
            : COLOR_SCHEMES[settings.colorScheme][settings.mode];

        // Применяем основной цвет
        document.documentElement.style.setProperty('--primary-color', primaryColor);

        // Сохраняем настройки
        localStorage.setItem(THEME_SETTINGS_KEY, JSON.stringify(settings));
    }, [settings]);

    const setColorScheme = (colorScheme: ColorScheme) => {
        setSettings(prev => ({ ...prev, colorScheme }));
    };

    const setCustomColor = (customColor: string) => {
        setSettings(prev => ({
            ...prev,
            colorScheme: 'custom',
            customColor
        }));
    };

    const toggleMode = () => {
        setSettings(prev => ({
            ...prev,
            mode: prev.mode === 'light' ? 'dark' : 'light'
        }));
    };

    return (
        <ThemeContext.Provider value={{
            settings,
            setColorScheme,
            setCustomColor,
            toggleMode
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};