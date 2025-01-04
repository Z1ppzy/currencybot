'use client';

import { useTheme } from '@/providers/ThemeProvider';
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export const ButtonColorMenu = () => {
    const { buttonColor, setButtonColor } = useTheme();

    const colors = ['blue', 'green', 'red', 'purple'];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Select Button Color</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {colors.map((color) => (
                    <DropdownMenuItem
                        key={color}
                        onClick={() => setButtonColor(color)}
                    >
                        <span className={`text-${color}-500`}>{color}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
