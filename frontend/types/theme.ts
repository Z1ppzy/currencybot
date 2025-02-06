// @/types/theme.ts

export const COLORS = {
    zinc: { value: '#71717a' },
    slate: { value: '#64748b' },
    stone: { value: '#78716c' },
    gray: { value: '#6b7280' },
    neutral: { value: '#737373' },
    blue: { value: '#3b82f6' },
} as const;

export type ColorScheme = keyof typeof COLORS | 'custom';

export type ThemeMode = 'light' | 'dark';

export interface ThemeSettings {
    colorScheme: ColorScheme;
    customColor?: string;
}

export interface ThemeContextType {
    theme: ThemeMode;
    toggleTheme: () => void;
    settings: ThemeSettings;
    setColorScheme: (scheme: ColorScheme) => void;
    setCustomColor: (color: string) => void;
}