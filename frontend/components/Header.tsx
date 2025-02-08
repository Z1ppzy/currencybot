"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
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
              <Link key={item.name} href={item.href} className="text-gray-300 hover:text-white transition-colors">
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Info (Telegram Avatar & Username) */}
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-300">{user.username || user.first_name}</span>
              {user.photo_url && (
                <img
                  src={user.photo_url}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full border-2 border-indigo-500"
                />
              )}
            </div>
          ) : (
            <Button variant="outline" className="text-gray-300 hover:text-white">
              Login
            </Button>
          )}

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

                {/* Mobile Auth Buttons */}
                <div className="mt-auto p-6 space-y-4">
                  <Button variant="outline" className="w-full text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
                    Login
                  </Button>
                  <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-full" onClick={() => setIsOpen(false)}>
                    Register
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
