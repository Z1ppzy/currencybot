import {ThemeSwitcher} from "@/components/Theme/ThemeSwitcher";
import {ButtonColorMenu} from "@/components/Theme/ButtonColorMenu";

export default function Settings() {
    return (
        <div className="p-4 flex items-center justify-between">
            <ThemeSwitcher/>
            <ButtonColorMenu/>
        </div>
    )
}