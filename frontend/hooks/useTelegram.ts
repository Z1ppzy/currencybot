import { useEffect, useState } from "react";

let WebApp: typeof import("@twa-dev/sdk").default | null = null;

// Загружаем SDK только в браузере
if (typeof window !== "undefined") {
  WebApp = require("@twa-dev/sdk").default;
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    if (WebApp?.initDataUnsafe?.user) {
      setUser(WebApp.initDataUnsafe.user);
    }
  }, []);

  return { user };
}
