// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { COLOR_SCHEMES } from '@/constants/colors';
// import { ThemeContextType, ThemeSettings, ColorScheme } from '@/types/theme';
//
// const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
//
// const DEFAULT_SETTINGS: ThemeSettings = {
//     mode: 'light',
//     colorScheme: 'blue',
// };
//
// const THEME_SETTINGS_KEY = 'themeSettings';
//
// export function ThemeProvider({ children }: { children: React.ReactNode }) {
//     const [settings, setSettings] = useState<ThemeSettings>(() => {
//         // Try to load saved settings during initialization
//         if (typeof window !== 'undefined') {
//             const savedSettings = localStorage.getItem(THEME_SETTINGS_KEY);
//             if (savedSettings) {
//                 try {
//                     const parsed = JSON.parse(savedSettings) as ThemeSettings;
//                     // Validate the parsed settings
//                     if (
//                         typeof parsed === 'object' &&
//                         parsed !== null &&
//                         (parsed.mode === 'light' || parsed.mode === 'dark') &&
//                         (parsed.colorScheme === 'custom' || parsed.colorScheme in COLOR_SCHEMES)
//                     ) {
//                         return parsed;
//                     }
//                 } catch (e) {
//                     console.error('Failed to parse saved theme settings');
//                 }
//             }
//         }
//         return DEFAULT_SETTINGS;
//     });
//
//     useEffect(() => {
//         // Apply theme settings
//         document.documentElement.setAttribute('data-theme-mode', settings.mode);
//
//         // Determine primary color
//         let primaryColor = '#000000'; // Default fallback color
//         if (settings.colorScheme === 'custom' && settings.customColor) {
//             primaryColor = settings.customColor;
//         } else if (settings.colorScheme !== 'custom' && settings.colorScheme in COLOR_SCHEMES) {
//             primaryColor = COLOR_SCHEMES[settings.colorScheme][settings.mode];
//         }
//
//         // Apply primary color
//         document.documentElement.style.setProperty('--primary-color', primaryColor);
//
//         // Save settings
//         localStorage.setItem(THEME_SETTINGS_KEY, JSON.stringify(settings));
//     }, [settings]);
//
//     const setColorScheme = (colorScheme: ColorScheme) => {
//         setSettings(prev => ({ ...prev, colorScheme }));
//     };
//
//     const setCustomColor = (customColor: string) => {
//         setSettings(prev => ({
//             ...prev,
//             colorScheme: 'custom',
//             customColor
//         }));
//     };
//
//     const toggleMode = () => {
//         setSettings(prev => ({
//             ...prev,
//             mode: prev.mode === 'light' ? 'dark' : 'light'
//         }));
//     };
//
//     const contextValue: ThemeContextType = {
//         settings,
//         setColorScheme,
//         setCustomColor,
//         toggleMode
//     };
//
//     return (
//         <ThemeContext.Provider value={contextValue}>
//             {children}
//         </ThemeContext.Provider>
//     );
// }
//
// export const useTheme = () => {
//     const context = useContext(ThemeContext);
//     if (context === undefined) {
//         throw new Error('useTheme must be used within a ThemeProvider');
//     }
//     return context;
// };