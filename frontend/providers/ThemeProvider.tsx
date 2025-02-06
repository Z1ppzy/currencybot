// 'use client';
//
// import { createContext, useContext, useEffect, useState } from 'react';
// import { ColorScheme, ThemeSettings, ThemeContextType, ThemeMode, COLORS } from '@/types/theme';
//
// const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
//
// const defaultSettings: ThemeSettings = {
//     colorScheme: 'blue',
// };
//
// export function ThemeProvider({ children }: { children: React.ReactNode }) {
//     const [mounted, setMounted] = useState(false);
//     const [theme, setTheme] = useState<ThemeMode>('light');
//     const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
//
//     useEffect(() => {
//         setMounted(true);
//         // Check for theme in localStorage
//         const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
//         if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
//             setTheme(savedTheme);
//             if (savedTheme === 'dark') {
//                 document.documentElement.classList.add('dark');
//             }
//         } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
//             setTheme('dark');
//             document.documentElement.classList.add('dark');
//         }
//
//         // Load saved color settings
//         const savedSettings = localStorage.getItem('themeSettings');
//         if (savedSettings) {
//             try {
//                 const parsed = JSON.parse(savedSettings) as ThemeSettings;
//                 if (isValidThemeSettings(parsed)) {
//                     setSettings(parsed);
//                     if (parsed.colorScheme === 'custom' && parsed.customColor) {
//                         document.documentElement.style.setProperty('--primary-color', parsed.customColor);
//                     }
//                 }
//             } catch (error) {
//                 console.error('Failed to parse theme settings:', error);
//             }
//         }
//     }, []);
//
//     const toggleTheme = () => {
//         const newTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
//         setTheme(newTheme);
//         localStorage.setItem('theme', newTheme);
//
//         if (newTheme === 'dark') {
//             document.documentElement.classList.add('dark');
//         } else {
//             document.documentElement.classList.remove('dark');
//         }
//     };
//
//     const setColorScheme = (colorScheme: ColorScheme) => {
//         const newSettings: ThemeSettings = { ...settings, colorScheme };
//         setSettings(newSettings);
//         localStorage.setItem('themeSettings', JSON.stringify(newSettings));
//
//         if (colorScheme === 'custom') {
//             if (settings.customColor) {
//                 document.documentElement.style.setProperty('--primary-color', settings.customColor);
//             }
//         } else {
//             const color = COLORS[colorScheme]?.value;
//             if (color) {
//                 document.documentElement.style.setProperty('--primary-color', color);
//             }
//         }
//     };
//
//     const setCustomColor = (color: string) => {
//         const newSettings: ThemeSettings = { ...settings, colorScheme: 'custom', customColor: color };
//         setSettings(newSettings);
//         localStorage.setItem('themeSettings', JSON.stringify(newSettings));
//         document.documentElement.style.setProperty('--primary-color', color);
//     };
//
//     // Type guard for theme settings
//     const isValidThemeSettings = (settings: any): settings is ThemeSettings => {
//         return (
//             settings &&
//             typeof settings === 'object' &&
//             (settings.colorScheme === 'custom' || settings.colorScheme in COLORS) &&
//             (settings.customColor === undefined || typeof settings.customColor === 'string')
//         );
//     };
//
//     if (!mounted) return null;
//
//     return (
//         <ThemeContext.Provider
//             value={{
//                 theme,
//                 toggleTheme,
//                 settings,
//                 setColorScheme,
//                 setCustomColor,
//             }}
//         >
//             {children}
//         </ThemeContext.Provider>
//     );
// }
//
// export const useTheme = () => {
//     const context = useContext(ThemeContext);
//     if (!context) {
//         throw new Error('useTheme must be used within ThemeProvider');
//     }
//     return context;
// };