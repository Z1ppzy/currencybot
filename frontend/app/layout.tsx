"use client"

import { useState, useEffect } from "react"
import { Geist, Azeret_Mono as Geist_Mono } from "next/font/google"
import "./globals.css"
import Header from "@/components/Header"
import LoadingScreen from "@/components/Loading"
import type React from "react"

const user = {
    name: "John Doe",
    email: "john@example.com",
    image: "https://github.com/shadcn.png",
}

const geistSans = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
})

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    const [isLoading, setIsLoading] = useState(true)
    const [contentLoaded, setContentLoaded] = useState(false)

    useEffect(() => {
        // Симуляция загрузки контента
        const timer = setTimeout(() => {
            setContentLoaded(true)
        }, 2000) // Задержка в 2 секунды, можно настроить по необходимости

        return () => clearTimeout(timer)
    }, [])

    const handleLoadingComplete = () => {
        setIsLoading(false)
    }

    return (
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <body className={`${geistSans.className}`}>
        <LoadingScreen isLoading={isLoading} onLoadingComplete={handleLoadingComplete} />
        <div className={`min-h-screen bg-[#0d0d2b] dark:bg-gray-900 ${isLoading ? "hidden" : ""}`}>
            <main>
                <Header />
                {contentLoaded && children}
            </main>
        </div>
        </body>
        </html>
    )
}

