"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
    ArrowUpIcon,
    ArrowDownIcon,
    RefreshCcwIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    DollarSignIcon,
    PercentIcon,
} from "lucide-react"

// Моковые данные для графика
const generateChartData = (days: number) => {
    const data = []
    let value = 1
    for (let i = days; i >= 0; i--) {
        value = value + Math.random() * 0.1 - 0.05
        data.push({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            value: value.toFixed(4),
        })
    }
    return data
}

const currencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "RUB", name: "Russian Ruble" },
]

export default function CurrencyDetail() {
    const params = useParams()
    const [currency, setCurrency] = useState({
        code: params.code as string,
        name: "",
        rate: 0,
        change: 0,
        lastUpdated: "",
    })
    const [chartData, setChartData] = useState(generateChartData(30))
    const [amount, setAmount] = useState("1")
    const [convertTo, setConvertTo] = useState("USD")
    const [convertedAmount, setConvertedAmount] = useState("0")
    const [timeRange, setTimeRange] = useState("30")

    useEffect(() => {
        // В реальном приложении здесь был бы запрос к API для получения актуальных данных
        const selectedCurrency = currencies.find((c) => c.code === params.code) || currencies[0]
        setCurrency({
            code: selectedCurrency.code,
            name: selectedCurrency.name,
            rate: 1.1234,
            change: 0.0023,
            lastUpdated: new Date().toLocaleString(),
        })
    }, [params.code])

    useEffect(() => {
        // Простая конвертация для демонстрации
        const converted = (Number.parseFloat(amount) * currency.rate).toFixed(4)
        setConvertedAmount(converted)
    }, [amount, currency.rate])

    useEffect(() => {
        setChartData(generateChartData(Number.parseInt(timeRange)))
    }, [timeRange])

    const refreshData = () => {
        // В реальном приложении здесь был бы запрос к API для обновления данных
        setChartData(generateChartData(Number.parseInt(timeRange)))
        setCurrency((prev) => ({
            ...prev,
            rate: prev.rate + (Math.random() * 0.02 - 0.01),
            change: Math.random() * 0.004 - 0.002,
            lastUpdated: new Date().toLocaleString(),
        }))
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="bg-[#1C1B33] border-[#2D2B52] mb-8">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <CardTitle className="text-3xl font-bold text-white mb-2 sm:mb-0">
                            {currency.name} ({currency.code})
                        </CardTitle>
                        <Button onClick={refreshData} variant="outline">
                            <RefreshCcwIcon className="h-4 w-4"/>
                        </Button>
                    </div>
                    <CardDescription className="text-gray-400">Last updated: {currency.lastUpdated}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                        <div className="text-4xl font-bold text-white mb-2 sm:mb-0">{currency.rate.toFixed(4)}</div>
                        <div
                            className={`flex items-center ${currency.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {currency.change >= 0 ? <ArrowUpIcon className="mr-1"/> : <ArrowDownIcon className="mr-1"/>}
                            <span className="text-xl font-semibold">
                {Math.abs(currency.change).toFixed(4)} ({((currency.change / currency.rate) * 100).toFixed(2)}%)
              </span>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Currency Converter</h3>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="bg-[#2D2B52] border-[#3F3D6D] text-white"
                                placeholder="Amount"
                            />
                            <Select value={convertTo} onValueChange={setConvertTo}>
                                <SelectTrigger className="w-full sm:w-[180px] bg-[#2D2B52] border-[#3F3D6D] text-white">
                                    <SelectValue placeholder="Convert to"/>
                                </SelectTrigger>
                                <SelectContent className="bg-[#2D2B52] border-[#3F3D6D] text-white">
                                    {currencies
                                        .filter((c) => c.code !== currency.code)
                                        .map((c) => (
                                            <SelectItem key={c.code} value={c.code}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <div className="text-white text-xl font-semibold">
                                = {convertedAmount} {convertTo}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#1C1B33] border-[#2D2B52] mb-8">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-white">Price Chart</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="30" className="w-full" onValueChange={setTimeRange}>
                        <TabsList className="grid w-full grid-cols-4 bg-[#2D2B52]">
                            <TabsTrigger value="7">7D</TabsTrigger>
                            <TabsTrigger value="30">30D</TabsTrigger>
                            <TabsTrigger value="90">90D</TabsTrigger>
                            <TabsTrigger value="365">1Y</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="h-[300px] sm:h-[400px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2D2B52"/>
                                <XAxis dataKey="date" stroke="#6C7293"/>
                                <YAxis stroke="#6C7293"/>
                                <Tooltip
                                    contentStyle={{backgroundColor: "#1C1B33", border: "1px solid #2D2B52"}}
                                    labelStyle={{color: "#6C7293"}}
                                />
                                <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} dot={false}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-[#1C1B33] border-[#2D2B52]">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-white">Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">24h High</span>
                                <span className="text-white font-semibold">{(currency.rate * 1.05).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">24h Low</span>
                                <span className="text-white font-semibold">{(currency.rate * 0.95).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">7d Change</span>
                                <span
                                    className={`font-semibold ${Math.random() > 0.5 ? "text-green-500" : "text-red-500"}`}>
                  {(Math.random() * 10 - 5).toFixed(2)}%
                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">30d Change</span>
                                <span
                                    className={`font-semibold ${Math.random() > 0.5 ? "text-green-500" : "text-red-500"}`}>
                  {(Math.random() * 20 - 10).toFixed(2)}%
                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#1C1B33] border-[#2D2B52]">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-white">Market Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <TrendingUpIcon className="text-green-500 mr-2"/>
                                <span className="text-gray-400">Bullish Trend</span>
                            </div>
                            <div className="flex items-center">
                                <DollarSignIcon className="text-yellow-500 mr-2"/>
                                <span className="text-gray-400">High Liquidity</span>
                            </div>
                            <div className="flex items-center">
                                <PercentIcon className="text-blue-500 mr-2"/>
                                <span className="text-gray-400">Low Volatility</span>
                            </div>
                            <div className="flex items-center">
                                <TrendingDownIcon className="text-red-500 mr-2"/>
                                <span className="text-gray-400">Resistance at {(currency.rate * 1.1).toFixed(4)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className='h-[90px]'></div>
        </div>
    )
}

