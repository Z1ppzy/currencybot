// import React from 'react';
// import { useTheme } from '@/context/ThemeContext';
// import { COLORS } from '@/types/theme';
// import { Button } from './button';
//
// export function ThemeCustomizer() {
//     const { theme, toggleTheme, settings, setColorScheme, setCustomColor } = useTheme();
//
//     return (
//         <div className="space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
//             <div className="space-y-2">
//                 <h3 className="text-lg font-medium">Тема оформления</h3>
//                 <Button
//                     onClick={toggleTheme}
//                     variant="outline"
//                     size="sm"
//                 >
//                     {theme === 'light' ? '🌙 Темная тема' : '☀️ Светлая тема'}
//                 </Button>
//             </div>
//
//             <div className="space-y-2">
//                 <h3 className="text-lg font-medium">Цветовая схема</h3>
//                 <div className="grid grid-cols-3 gap-2">
//                     {(Object.keys(COLORS) as Array<keyof typeof COLORS>).map((name) => (
//                         <button
//                             key={name}
//                             onClick={() => setColorScheme(name)}
//                             className={`w-full p-2 rounded-md flex flex-col items-center gap-2 ${
//                                 settings.colorScheme === name ? 'ring-2 ring-offset-2' : ''
//                             }`}
//                             style={{
//                                 backgroundColor: COLORS[name].value
//                             }}
//                         >
//                             <span className="text-white text-sm capitalize">
//                                 {name}
//                             </span>
//                         </button>
//                     ))}
//                 </div>
//             </div>
//
//             <div className="space-y-2">
//                 <h3 className="text-lg font-medium">Свой цвет</h3>
//                 <div className="flex items-center gap-3">
//                     <input
//                         type="color"
//                         value={settings.customColor || '#000000'}
//                         onChange={(e) => setCustomColor(e.target.value)}
//                         className="w-10 h-10 rounded cursor-pointer"
//                     />
//                     <span className="text-sm">
//                         Выберите любой цвет
//                     </span>
//                 </div>
//             </div>
//         </div>
//     );
// }