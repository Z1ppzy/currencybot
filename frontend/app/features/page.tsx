"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    ChartBarIcon,
    CurrencyDollarIcon,
    LightBulbIcon,
    ShieldCheckIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { CarouselApi } from "@/components/ui/carousel"
import Link from "next/link"
import LiveCurrencyRates from "@/components/LiveCurrencyRates"

interface Feature {
    name: string
    description: string
    icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>
}

const features: Feature[] = [
    {
        name: "High-Precision Data",
        description:
            "Our app utilizes advanced algorithms and reliable sources to provide the most accurate currency exchange rates.",
        icon: ChartBarIcon,
    },
    {
        name: "Small Business Support",
        description: "Specialized tools and analytics to help small businesses effectively manage currency risks.",
        icon: ShieldCheckIcon,
    },
    {
        name: "Personal Financial Planning",
        description: "Personalized recommendations to optimize your personal finances considering currency fluctuations.",
        icon: LightBulbIcon,
    },
    {
        name: "Multi-Currency Operations",
        description: "Easily convert and track multiple currencies in real-time.",
        icon: CurrencyDollarIcon,
    },
    {
        name: "Security First",
        description: "Your data is protected using cutting-edge encryption and security technologies.",
        icon: ShieldCheckIcon,
    },
    {
        name: "User Community",
        description: "Join a growing community to share experiences and gain valuable advice.",
        icon: UserGroupIcon,
    },
]

interface CurrencyInfo {
    code: string
    name: string
    rate: number
    change: number
}

const currencyInfo: CurrencyInfo[] = [
    { code: "USD", name: "US Dollar", rate: 1.0, change: 0.0 },
    { code: "EUR", name: "Euro", rate: 0.85, change: -0.15 },
    { code: "GBP", name: "British Pound", rate: 0.72, change: 0.25 },
    { code: "JPY", name: "Japanese Yen", rate: 110.5, change: -0.35 },
]

const FeatureCard = ({ feature }: { feature: Feature }) => (
    <Card className="bg-[#1C1B33] border-[#2D2B52] h-[280px]">
        <CardContent className="p-6 flex flex-col h-full">
            <feature.icon className="h-12 w-12 text-[#6366F1] mb-4 flex-shrink-0" />
            <h3 className="text-xl font-semibold text-white mb-2">{feature.name}</h3>
            <p className="text-gray-400 flex-grow overflow-y-auto">{feature.description}</p>
        </CardContent>
    </Card>
)

const CurrencyCard = ({ currency }: { currency: CurrencyInfo }) => (
    <Card className="bg-[#1C1B33] border-[#2D2B52]">
        <CardContent className="p-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-white">{currency.code}</h3>
                    <p className="text-sm text-gray-400">{currency.name}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-semibold text-white">{currency.rate.toFixed(4)}</p>
                    <p className={`text-sm ${currency.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {currency.change >= 0 ? "+" : ""}
                        {currency.change.toFixed(2)}%
                    </p>
                </div>
            </div>
        </CardContent>
    </Card>
)

export default function FeaturesPage() {
    const isMobile = useMediaQuery("(max-width: 768px)")
    const [activeIndex, setActiveIndex] = React.useState(0)
    const [api, setApi] = React.useState<CarouselApi>()
    const [isVisible, setIsVisible] = React.useState(false)

    const plugin = React.useRef(
        Autoplay({
            delay: 5000,
            stopOnInteraction: true,
            rootNode: (emblaRoot) => emblaRoot.parentElement,
        }),
    )

    React.useEffect(() => {
        if (!api) return

        api.on("select", () => {
            setActiveIndex(api.selectedScrollSnap())
        })
    }, [api])

    React.useEffect(() => {
        // Simulate page load completion
        const timer = setTimeout(() => {
            setIsVisible(true)
        }, 100)

        return () => clearTimeout(timer)
    }, [])

    const handleDotClick = React.useCallback(
        (index: number) => {
            if (api) api.scrollTo(index)
        },
        [api],
    )

    return (
        <div className="min-h-screen bg-[#0B0A1F] text-white">
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="container mx-auto px-2 md:px-4 py-16"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-center mb-16"
                        >
                            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#6366F1] to-[#818CF8]">
                                Discover Our Powerful Features
                            </h1>
                            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                                Explore the robust tools and features that will help you effectively manage your finances in a world of
                                ever-changing currency rates.
                            </p>
                        </motion.div>

                        {isMobile ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="w-full mx-auto px-2"
                            >
                                <Carousel
                                    plugins={[plugin.current]}
                                    setApi={setApi}
                                    className="w-full"
                                    opts={{
                                        align: "center",
                                        loop: true,
                                    }}
                                >
                                    <CarouselContent>
                                        {features.map((feature, index) => (
                                            <CarouselItem key={feature.name} className="w-full">
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5, delay: 0.1 * index + 0.4 }}
                                                    className="p-1"
                                                >
                                                    <FeatureCard feature={feature} />
                                                </motion.div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                </Carousel>
                                <div className="flex justify-center mt-4">
                                    {features.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleDotClick(index)}
                                            className={`h-2 w-2 rounded-full mx-1 transition-colors ${
                                                index === activeIndex ? "bg-[#6366F1]" : "bg-[#2D2B52]"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="relative w-full"
                            >
                                <Carousel
                                    opts={{
                                        align: "start",
                                        loop: true,
                                    }}
                                    plugins={[plugin.current]}
                                    className="w-full"
                                >
                                    <CarouselContent className="-ml-2 md:-ml-4">
                                        {features.map((feature, index) => (
                                            <CarouselItem key={feature.name} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5, delay: 0.1 * index + 0.4 }}
                                                    className="p-1 h-full"
                                                >
                                                    <FeatureCard feature={feature} />
                                                </motion.div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                </Carousel>
                                <div className="flex justify-center gap-2 mt-4">
                                    {features.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleDotClick(index)}
                                            className={`h-2 w-2 rounded-full transition-colors ${
                                                index === activeIndex ? "bg-[#6366F1]" : "bg-[#2D2B52]"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            <LiveCurrencyRates />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                            className="text-center mt-16"
                        >
                            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
                            <Link href="/profile">
                                <Button className="bg-gradient-to-r from-[#6366F1] to-[#818CF8] hover:from-[#818CF8] hover:to-[#6366F1] text-white font-semibold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105">
                                    Try for Free
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="h-[96px]"></div>
        </div>
    )
}

