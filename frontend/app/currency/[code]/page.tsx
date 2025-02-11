"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ArrowUpIcon, ArrowDownIcon, RefreshCcwIcon } from "lucide-react"

// Моковые данные для графика
const generateChartData = () => {
    const data = []
    let value = 1
    for (let i = 30; i >= 0; i--) {
        value = value + Math.random() * 0.1 - 0.05
        data.push({
            date: `2024-02-${(30 - i).toString().padStart(2, "0")}`,
            value: value.toFixed(4),
        })
    }
    return data
}

export default function CurrencyDetail() {
    const params = useParams()
    const [currency, setCurrency] = useState({
        code: params.code as string,
        name: "",
        rate: 0,
        change: 0,
        lastUpdated: "",
    })
    const [chartData, setChartData] = useState(generateChartData())

    useEffect(() => {
        // В реальном приложении здесь был бы запрос к API для получения актуальных данных
        setCurrency({
            code: params.code as string,
            name: params.code === "EUR" ? "Euro" : "US Dollar",
            rate: 1.1234,
            change: 0.0023,
            lastUpdated: new Date().toLocaleString(),
        })
    }, [params.code])

    const refreshData = () => {
        // В реальном приложении здесь был бы запрос к API для обновления данных
        setChartData(generateChartData())
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
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-3xl font-bold text-white">
                            {currency.name} ({currency.code})
                        </CardTitle>
                        <Button onClick={refreshData} variant="outline">
                            <RefreshCcwIcon className="h-4 w-4" />
                        </Button>
                    </div>
                    <CardDescription className="text-gray-400">Last updated: {currency.lastUpdated}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-4xl font-bold text-white">{currency.rate.toFixed(4)}</div>
                        <div className={`flex items-center ${currency.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {currency.change >= 0 ? <ArrowUpIcon className="mr-1" /> : <ArrowDownIcon className="mr-1" />}
                            <span className="text-xl font-semibold">
                {Math.abs(currency.change).toFixed(4)} ({((currency.change / currency.rate) * 100).toFixed(2)}%)
              </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#1C1B33] border-[#2D2B52]">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-white">30 Day Price Chart</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2D2B52" />
                                <XAxis dataKey="date" stroke="#6C7293" />
                                <YAxis stroke="#6C7293" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#1C1B33", border: "1px solid #2D2B52" }}
                                    labelStyle={{ color: "#6C7293" }}
                                />
                                <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

