"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";

const navigation = [
  { name: "Products", href: "/profile" },
  { name: "Features", href: "/test" },
  { name: "About", href: "/test" },
  { name: "Contact", href: "/test" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useTelegram();
  const [isTelegram, setIsTelegram] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTelegram(window.Telegram?.WebApp !== undefined);
      setTimeout(() => setLoading(false), 1000); // Эмуляция загрузки
    }
  }, []);

  return (
    <header className="w-full bg-[#0a061d] border-b border-gray-800 sticky top-0 z-50">
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

          {/* User Info */}
          <div className="flex items-center gap-4">
            {loading ? (
              // Скелетон загрузки
              <>
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-md" />
              </>
            ) : user ? (
              // Пользователь из Telegram
              <>
                <span className="text-gray-300">{user.username || user.first_name}</span>
                <Avatar>
                  <AvatarImage src={user.photo_url} alt={user.username || "User"} />
                  <AvatarFallback>{user.first_name[0]}</AvatarFallback>
                </Avatar>
              </>
            ) : (
              // Если сайт открыт НЕ в Telegram, показываем заглушку
              <>
                <span className="text-gray-300">Guest</span>
                <Avatar>
                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="sm" className="text-white">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-[#0a061d] border-gray-800 p-0">
              <div className="flex flex-col h-full">
                {/* Mobile Navigation */}
                <nav className="flex flex-col py-8 px-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-gray-300 hover:text-white py-4 text-lg border-b border-gray-800"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
