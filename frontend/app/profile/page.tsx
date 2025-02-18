"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Euro, PoundSterling, JapaneseYenIcon as Yen, Bitcoin } from "lucide-react"

const currencies = [
  { name: "USD", icon: DollarSign, color: "bg-green-500", label: "US Dollar" },
  { name: "EUR", icon: Euro, color: "bg-blue-500", label: "Euro" },
  { name: "GBP", icon: PoundSterling, color: "bg-purple-500", label: "British Pound" },
  { name: "JPY", icon: Yen, color: "bg-red-500", label: "Japanese Yen" },
  { name: "BTC", icon: Bitcoin, color: "bg-orange-500", label: "Bitcoin" },
]

export default function CurrencySelection() {
  const router = useRouter()

  const handleCurrencySelect = (currencyCode: string) => {
    router.push(`/currency/${currencyCode}`)
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen ">
      <Card className="bg-gray-800 border-gray-700 shadow-xl mb-8">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold text-white mb-2">Select a Currency</h1>
          <p className="text-gray-400 mb-6">Choose a currency to view detailed information and exchange rates.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {currencies.map((currency) => (
              <Button
                key={currency.name}
                variant="outline"
                className="h-28 hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:scale-105 border-gray-600"
                onClick={() => handleCurrencySelect(currency.name)}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className={`rounded-full p-3 ${currency.color}`}>
                    <currency.icon className="h-8 w-8 text-white" />
                  </div>
                  <span className="font-semibold text-white">{currency.name}</span>
                  <span className="text-xs text-gray-400">{currency.label}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-gray-500 text-sm">
        Data is for demonstration purposes only. Real-time rates may vary.
      </div>
    </div>
  )
}

