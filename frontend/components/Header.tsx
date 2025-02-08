"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, User, ShoppingCart, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Home", href: "/", icon: <Home className="w-6 h-6" /> },
  { name: "Products", href: "/profile", icon: <ShoppingCart className="w-6 h-6" /> },
  { name: "Features", href: "/test", icon: <Info className="w-6 h-6" /> },
  { name: "Profile", href: "/profile", icon: <User className="w-6 h-6" /> },
];

const hiddenBottomNavPages = ["/dashboard", "/settings"];

export default function Header() {
  const { user } = useTelegram();
  const [isTelegram, setIsTelegram] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTelegram(window.Telegram?.WebApp !== undefined);
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  return (
    <>
      {/* Header */}
      <header className="w-full bg-[#0a061d] border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-indigo-500" />
              </div>
              <span className="text-white font-bold text-xl">CRAPPO</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Info - Always visible, right-aligned */}
            <div className="flex items-center gap-4">
              {loading ? (
                <>
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-md hidden md:block" />
                </>
              ) : user ? (
                <>
                  <span className="text-gray-300 hidden md:block">{user.username || user.first_name}</span>
                  <Avatar>
                    <AvatarImage src={user.photo_url} alt={user.username || "User"} />
                    <AvatarFallback>{user.first_name[0]}</AvatarFallback>
                  </Avatar>
                </>
              ) : (
                <>
                  <span className="text-gray-300 hidden md:block">Guest</span>
                  <Avatar>
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      {!hiddenBottomNavPages.includes(pathname) && (
        <nav className="fixed bottom-0 left-0 w-full bg-[#0a061d] shadow-lg border-t border-gray-800 p-3 md:hidden z-50">
          <div className="container mx-auto">
            <div className="flex justify-around items-center">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex flex-col items-center text-gray-300 hover:text-white transition-colors"
                >
                  {item.icon}
                  <span className="text-xs mt-1">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </>
  );
}