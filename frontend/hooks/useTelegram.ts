import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";

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
    if (WebApp.initDataUnsafe?.user) {
      setUser(WebApp.initDataUnsafe.user);
    }
  }, []);

  return { user };
}
    