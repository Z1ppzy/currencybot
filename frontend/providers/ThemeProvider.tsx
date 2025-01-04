'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    buttonColor: string;
    setButtonColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [buttonColor, setButtonColor] = useState<string>('blue');

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as 'light' | 'dark';
        const storedButtonColor = localStorage.getItem('buttonColor') || 'blue';

        if (storedTheme) setTheme(storedTheme);
        setButtonColor(storedButtonColor);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
        localStorage.setItem('buttonColor', buttonColor);
    }, [theme, buttonColor]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, buttonColor, setButtonColor }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
