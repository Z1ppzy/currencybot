import type React from "react"
import Header from "@/components/Header"

export default function CurrencyLayout({
                                           children,
                                       }: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[#0d0d2b]">
            <main>{children}</main>
        </div>
    )
}

