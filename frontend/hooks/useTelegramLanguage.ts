import { useState, useEffect } from "react";
import WebApp from "@twa-dev/sdk";

export function useTelegramLanguage() {
  const [language, setLanguage] = useState<string>("en");

  useEffect(() => {
    if (typeof window !== "undefined" && WebApp?.initDataUnsafe?.user?.language_code) {
      setLanguage(WebApp.initDataUnsafe.user.language_code);
    }
  }, []);

  return { language, setLanguage };
}
