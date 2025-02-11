"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DollarSign, Euro, PoundSterling, JapaneseYenIcon as Yen, Bitcoin } from "lucide-react"

const currencies = [
    { name: "USD", icon: DollarSign, color: "bg-green-500" },
    { name: "EUR", icon: Euro, color: "bg-blue-500" },
    { name: "GBP", icon: PoundSterling, color: "bg-purple-500" },
    { name: "JPY", icon: Yen, color: "bg-red-500" },
    { name: "BTC", icon: Bitcoin, color: "bg-orange-500" },
]

export default function Profile() {
    const router = useRouter()

    const handleCurrencySelect = (currencyCode: string) => {
        router.push(`/currency/${currencyCode}`)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-6">Select a Currency</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {currencies.map((currency) => (
                    <Button
                        key={currency.name}
                        variant="outline"
                        className="h-20 hover:bg-[#2D2B52] transition-colors duration-200"
                        onClick={() => handleCurrencySelect(currency.name)}
                    >
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <div className={`rounded-full p-2 ${currency.color}`}>
                                <currency.icon className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-semibold">{currency.name}</span>
                        </div>
                    </Button>
                ))}
            </div>
        </div>
    )
}

