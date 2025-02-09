"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Home, User, ShoppingCart, Info, Settings, Crown, Calendar, Sparkles, Globe, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { useTelegram } from "@/hooks/useTelegram"
import { useTelegramLanguage } from "@/hooks/useTelegramLanguage";
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

const navigation = [
  { name: "Home", href: "/", icon: <Home className="w-6 h-6" /> },
  { name: "Products", href: "/products", icon: <ShoppingCart className="w-6 h-6" /> },
  { name: "Features", href: "/test", icon: <Info className="w-6 h-6" /> },
  { name: "Profile", href: "/profile", icon: <User className="w-6 h-6" /> },
]

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
]

const hiddenBottomNavPages = ["/dashboard", "/settings"]

// Format date to "Month Day, Year"
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export default function Header() {
  const { user } = useTelegram()
  const [isTelegram, setIsTelegram] = useState(false)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const { language, setLanguage } = useTelegramLanguage();

  // Mock join date - replace with actual data from your backend
  const joinDate = new Date("2024-02-02")

  useEffect(() => {
    console.log("User data:", user);
    setTimeout(() => setLoading(false), 1000);
  }, [user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTelegram(window.Telegram?.WebApp !== undefined)
      setTimeout(() => setLoading(false), 1000)
    }
  }, [])

  return (
    <>
      {/* Header */}
      <header className="w-full bg-[#0B0A1F] border-b border-[#2D2B52] sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full border-2 border-[#6366F1] flex items-center justify-center transition-all duration-300 group-hover:border-[#818CF8]">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6366F1] to-[#818CF8] transition-all duration-300 group-hover:scale-110" />
              </div>
              <span className="text-white font-bold text-xl transition-colors duration-300 group-hover:text-[#818CF8]">
                CurrencyBot
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors duration-300 relative group text-sm font-medium"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#6366F1] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* User Info with Dropdown */}
            <div className="flex items-center gap-4">
              {loading ? (
                <>
                  <Skeleton className="h-6 w-24 bg-[#2D2B52]" />
                  <Skeleton className="h-10 w-10 rounded-full bg-[#2D2B52]" />
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-3 focus:outline-none group">
                    <span className="text-gray-400 group-hover:text-white transition-colors duration-300 text-sm">
                      {user ? user.username || user.first_name : "Guest"}
                    </span>
                    <Avatar className="border-2 border-[#6366F1] group-hover:border-[#818CF8] transition-colors duration-300">
                      {user ? (
                        <>
                          <AvatarImage src={user.photo_url} alt={user.username || "User"} />
                          <AvatarFallback className="bg-[#2D2B52] text-white">
                            {user.first_name?.[0] || "?"}
                          </AvatarFallback>
                        </>
                      ) : (
                        <AvatarFallback className="bg-[#2D2B52] text-white">?</AvatarFallback>
                      )}
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-80 bg-[#0B0A1F] text-gray-400 border border-[#2D2B52] shadow-xl"
                    align="end"
                  >
                    <div className="p-4 space-y-3">
                      {/* User Info Section */}
                      <div className="flex items-start gap-3">
                        <Avatar className="w-16 h-16 border-2 border-[#6366F1]">
                          {user ? (
                            <>
                              <AvatarImage src={user.photo_url} alt={user.username || "User"} />
                              <AvatarFallback className="bg-[#2D2B52] text-white text-xl">
                                {user.first_name?.[0] || "?"}
                              </AvatarFallback>
                            </>
                          ) : (
                            <AvatarFallback className="bg-[#2D2B52] text-white text-xl">?</AvatarFallback>
                          )}
                        </Avatar>
                        <div className="space-y-1">
                          <h3 className="text-white font-medium text-lg">
                            {user ? user.username || user.first_name : "Guest"}
                          </h3>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-[#6366F1]" />
                            <span>Joined {formatDate(joinDate)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Subscription Plan */}
                      <div className="bg-[#2D2B52]/30 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Crown className="w-5 h-5 text-[#6366F1]" />
                            <span className="text-white font-medium">Standard Plan</span>
                          </div>
                          <Badge className="bg-[#6366F1] hover:bg-[#818CF8] transition-colors">Active</Badge>
                        </div>
                        <div className="text-sm">Access to real-time exchange rates and basic features</div>
                      </div>

                      <DropdownMenuSeparator className="bg-[#2D2B52]" />

                      {/* Menu Items */}
                      <div className="space-y-1">
                        <DropdownMenuItem className="flex items-center gap-2 focus:bg-[#2D2B52] focus:text-white transition-colors duration-200 cursor-pointer h-9">
                          <User className="w-4 h-4" />
                          <span>Profile Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 focus:bg-[#2D2B52] focus:text-white transition-colors duration-200 cursor-pointer h-9">
                          <Settings className="w-4 h-4" />
                          <span>Preferences</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 focus:bg-[#2D2B52] focus:text-white transition-colors duration-200 cursor-pointer h-9">
                          <Sparkles className="w-4 h-4" />
                          <span>Upgrade Plan</span>
                        </DropdownMenuItem>

                        {/* Language Selector */}
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="flex  items-center gap-2 focus:bg-[#2D2B52] focus:text-white transition-colors duration-200 cursor-pointer h-9 w-full">
                            <Globe className="w-4 h-4" />
                            <span>Language</span>
                            <span className="ml-auto">{languages.find((lang) => lang.code === language)?.flag}</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent className="bg-[#0B0A1F] border border-[#2D2B52] shadow-xl text-white">
                              {languages.map((lang) => (
                                <DropdownMenuItem
                                  key={lang.code}
                                  className="flex items-center gap-2 focus:bg-[#2D2B52] focus:text-white transition-colors duration-200 cursor-pointer h-9"
                                  onClick={() => setLanguage(lang.code)}
                                >
                                  <span>{lang.flag}</span>
                                  <span>{lang.name}</span>
                                  {language === lang.code && <Check className="w-4 h-4 ml-auto" />}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      {!hiddenBottomNavPages.includes(pathname) && (
        <nav className="fixed bottom-0 left-0 w-full bg-[#0B0A1F] shadow-lg border-t border-[#2D2B52] p-3 md:hidden z-50">
          <div className="container mx-auto">
            <div className="flex justify-around items-center">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex flex-col items-center text-gray-400 hover:text-white transition-colors duration-300 group"
                >
                  <div className="relative">
                    {item.icon}
                    <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-[#6366F1] transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                  </div>
                  <span className="text-xs mt-1">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </>
  )
}

