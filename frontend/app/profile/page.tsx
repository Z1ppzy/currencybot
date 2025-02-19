"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import ReactCountryFlag from "react-country-flag"
import { Heart } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFavoritesStore } from "@/store/favorites"

interface Currency {
  code: string
  name: string
}

export default function CurrencySelection() {
  const router = useRouter()
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const { favorites, toggleFavorite } = useFavoritesStore()

  useEffect(() => {
    if (isInitialLoad) {
      if (favorites.length > 0) {
        setActiveTab("favorites")
      }
      setIsInitialLoad(false)
    }
    fetchCurrencies()
  }, [isInitialLoad, favorites.length])

  async function fetchCurrencies() {
    try {
      const res = await fetch("https://api.heavenlyweiner.ru/api/currencies")
      if (!res.ok) {
        throw new Error("Ошибка при получении валют")
      }
      const data: Currency[] = await res.json()
      const filteredData = data.filter((currency) => currency.code !== "UAH")
      setCurrencies(filteredData)
    } catch (error) {
      console.error("Ошибка:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCurrencySelect = (currencyCode: string) => {
    router.push(`/currency/${currencyCode}`)
  }

  const handleToggleFavorite = (currencyCode: string, e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(currencyCode)
    if (favorites.length === 1 && favorites.includes(currencyCode)) {
      setActiveTab("all")
    }
  }

  const CurrencyCard = ({ currency }: { currency: Currency }) => (
    <div
      className="relative group cursor-pointer rounded-lg border border-gray-600 bg-gray-800 hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:scale-105"
      onClick={() => handleCurrencySelect(currency.code)}
    >
      <div className="flex flex-col items-center justify-center h-full p-4 space-y-3">
        <div className="rounded-full p-2 bg-gray-600 w-12 h-12 flex items-center justify-center overflow-hidden">
          <ReactCountryFlag
            countryCode={currency.code.slice(0, 2)}
            svg
            style={{ width: "1.5em", height: "1.5em" }}
            title={currency.name}
          />
        </div>
        <div className="flex flex-col items-center space-y-1 w-full">
          <span className="font-semibold text-white text-center">{currency.code}</span>
          <span className="text-xs text-gray-400 text-center break-words w-full px-2 line-clamp-2">
            {currency.name}
          </span>
        </div>
      </div>
      <button
        className="absolute top-2 right-2 opacity-70 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white rounded-full p-1 z-10"
        onClick={(e) => handleToggleFavorite(currency.code, e)}
        aria-label={favorites.includes(currency.code) ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={`h-4 w-4 ${
            favorites.includes(currency.code) ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400"
          }`}
        />
      </button>
    </div>
  )

  const renderFavoritesList = () => {
    if (favorites.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400 text-lg mb-2">У вас нет избранных валют 😢</p>
          <p className="text-gray-500">Добавьте валюты в избранное, нажав на иконку сердечка</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {currencies
          .filter((currency) => favorites.includes(currency.code))
          .map((currency) => (
            <CurrencyCard key={currency.code} currency={currency} />
          ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <Card className="bg-gray-800 border-gray-700 shadow-xl mb-8">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold text-white mb-2">Выберите валюту</h1>
          <p className="text-gray-400 mb-6">Выберите валюту для просмотра детальной информации и обменных курсов.</p>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 w-full justify-start">
                <TabsTrigger value="all" className="flex-1 sm:flex-none">
                  Все валюты
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex-1 sm:flex-none relative">
                  Избранные
                  {favorites.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {favorites.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {currencies.map((currency) => (
                    <CurrencyCard key={currency.code} currency={currency} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="favorites">{renderFavoritesList()}</TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
      <div className="text-center text-gray-500 text-sm">
        Данные предоставлены для демонстрационных целей. Реальные курсы могут отличаться.
      </div>
    </div>
  )
}