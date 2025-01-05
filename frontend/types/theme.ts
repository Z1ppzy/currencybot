export type ColorScheme = 'zinc' | 'slate' | 'stone' | 'gray' | 'neutral' | 'blue' | 'custom';

export interface ThemeSettings {
    colorScheme: ColorScheme;
    customColor?: string;
}