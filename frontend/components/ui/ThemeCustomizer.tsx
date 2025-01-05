import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { COLOR_SCHEMES } from '../../constants/colors';
import { Button } from './button';
import { ColorScheme } from '@/types/theme';

export function ThemeCustomizer() {
    const { settings, setColorScheme, setCustomColor, toggleMode } = useTheme();

    return (
        <div className="space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Тема оформления</h3>
                <Button
                    onClick={toggleMode}
                    variant="outline"
                    size="sm"
                >
                    {settings.mode === 'light' ? '🌙 Темная тема' : '☀️ Светлая тема'}
                </Button>
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-medium">Цветовая схема</h3>
                <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(COLOR_SCHEMES) as ColorScheme[]).map((name) => (
                        <button
                            key={name}
                            onClick={() => setColorScheme(name)}
                            className={`
                w-full p-2 rounded-md flex flex-col items-center gap-2
                ${settings.colorScheme === name ? 'ring-2 ring-offset-2' : ''}
              `}
                            style={{
                                backgroundColor: COLOR_SCHEMES[name][settings.mode]
                            }}
                        >
              <span className="text-white text-sm">
                {COLOR_SCHEMES[name].label}
              </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-medium">Свой цвет</h3>
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        value={settings.customColor || '#000000'}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                    />
                    <span className="text-sm">
            Выберите любой цвет
          </span>
                </div>
            </div>
        </div>
    );
}