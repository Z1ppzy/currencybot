interface TelegramWebApp {
    WebApp?: {
      initDataUnsafe?: {
        user?: {
          id: number;
          first_name: string;
          last_name?: string;
          username?: string;
          photo_url?: string;
          language_code?: string;
        };
      };
    };
  }
  
  interface Window {
    Telegram?: TelegramWebApp;
  }
  