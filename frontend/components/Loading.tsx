"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface LoadingScreenProps {
    isLoading: boolean
    onLoadingComplete: () => void
}

export default function Loading({ isLoading, onLoadingComplete }: LoadingScreenProps) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        if (!isLoading) return

        const timer = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress >= 100) {
                    clearInterval(timer)
                    onLoadingComplete()
                    return 100
                }
                return prevProgress + 1
            })
        }, 50)
        return () => clearInterval(timer)
    }, [isLoading, onLoadingComplete])

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-gradient-to-br from-[#0B0A1F] via-[#1C1B33] to-[#2D2B52] flex flex-col items-center justify-center z-50"
                >
                    <div className="w-full max-w-md px-4 space-y-8">
                        <motion.div
                            className="text-center space-y-4"
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <div className="relative w-32 h-32 mx-auto">
                                <motion.div
                                    className="absolute inset-0 rounded-full bg-gradient-to-br from-[#6366F1] to-[#818CF8] opacity-20"
                                    animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                />
                                <motion.div
                                    className="absolute inset-2 rounded-full bg-gradient-to-br from-[#6366F1] to-[#818CF8] opacity-40"
                                    animate={{ scale: [1, 1.1, 1], rotate: -360 }}
                                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                />
                                <motion.div
                                    className="absolute inset-4 rounded-full bg-gradient-to-br from-[#6366F1] to-[#818CF8]"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                >
                                    <div className="w-full h-full rounded-full bg-[#0B0A1F] flex items-center justify-center">
                    <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#818CF8]">
                      CB
                    </span>
                                    </div>
                                </motion.div>
                            </div>
                            <motion.h1
                                className="text-4xl font-bold text-white"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                            >
                                CurrencyBot
                            </motion.h1>
                            <p className="text-lg text-gray-300">Preparing your financial insights...</p>
                        </motion.div>
                        <div className="relative pt-1">
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-[#2D2B52]">
                                <motion.div
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#6366F1] to-[#818CF8]"
                                    style={{ width: `${progress}%` }}
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>
                        <motion.p
                            className="text-center text-gray-400"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                        >
                            Loading... {progress}%
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

