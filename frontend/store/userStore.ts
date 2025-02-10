import { create } from "zustand";

export interface User {
    username?: string;
    first_name?: string;
    photo_url?: string;
    // При необходимости добавьте другие поля
}

interface UserStore {
    user: User | null;
    setUser: (user: User | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
}));
