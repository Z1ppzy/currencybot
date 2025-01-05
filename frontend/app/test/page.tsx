'use client';

import { useTheme } from '@/providers/ThemeProvider';

export default function Test() {
    const { settings } = useTheme();

    const backgroundStyle = {
        backgroundColor: settings.colorScheme === 'custom'
            ? settings.customColor
            : `var(--primary-color)`
    };

    return (
        <div className="min-h-screen p-4">
            <div
                style={backgroundStyle}
                className="p-4 rounded-lg text-white transition-colors duration-300 shadow-lg"
            >
                <h1 className="text-2xl font-bold mb-2">Привет! 👋</h1>
                <p className="text-lg">Это текст с изменяемым фоном.</p>
            </div>
        </div>
    );
}