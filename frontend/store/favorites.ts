import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
  favorites: string[]
  addFavorite: (code: string) => void
  removeFavorite: (code: string) => void
  toggleFavorite: (code: string) => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      favorites: [],
      addFavorite: (code) =>
        set((state) => ({
          favorites: [...state.favorites, code],
        })),
      removeFavorite: (code) =>
        set((state) => ({
          favorites: state.favorites.filter((item) => item !== code),
        })),
      toggleFavorite: (code) =>
        set((state) => ({
          favorites: state.favorites.includes(code)
            ? state.favorites.filter((item) => item !== code)
            : [...state.favorites, code],
        })),
    }),
    {
      name: 'currency-favorites',
    }
  )
)