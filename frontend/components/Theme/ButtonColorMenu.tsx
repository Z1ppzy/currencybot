'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { ColorScheme } from '@/types/theme';
import { Palette } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const COLORS = {
    zinc: {
        label: 'Zinc',
        class: 'bg-zinc-500',
    },
    slate: {
        label: 'Slate',
        class: 'bg-slate-500',
    },
    stone: {
        label: 'Stone',
        class: 'bg-stone-500',
    },
    gray: {
        label: 'Gray',
        class: 'bg-gray-500',
    },
    neutral: {
        label: 'Neutral',
        class: 'bg-neutral-500',
    },
    blue: {
        label: 'Blue',
        class: 'bg-blue-500',
    },
} as const;

export function ButtonColorMenu() {
    const { settings, setColorScheme, setCustomColor } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                aria-label="Color settings"
            >
                <Palette className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                    <div className="py-1 space-y-1">
                        {Object.entries(COLORS).map(([key, value]) => (
                            <button
                                key={key}
                                onClick={() => {
                                    setColorScheme(key as ColorScheme);
                                    setIsOpen(false);
                                }}
                                className={`
                  flex items-center w-full px-4 py-2 text-sm
                  ${settings.colorScheme === key ? 'bg-gray-100 dark:bg-gray-700' : ''}
                  hover:bg-gray-100 dark:hover:bg-gray-700
                `}
                            >
                                <span className={`w-4 h-4 rounded-full mr-2 ${value.class}`} />
                                {value.label}
                            </button>
                        ))}
                        <div className="px-4 py-2 border-t dark:border-gray-600">
                            <label className="flex items-center space-x-2 text-sm">
                                <span>Свой цвет:</span>
                                <input
                                    type="color"
                                    value={settings.customColor || '#000000'}
                                    onChange={(e) => setCustomColor(e.target.value)}
                                    className="w-6 h-6 rounded cursor-pointer"
                                />
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}