"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStore } from "@/store/userStore";

interface UserProfileProps {
    joinDate: Date;
    loading: boolean;
}

export default function UserProfile({ joinDate, loading }: UserProfileProps) {
    const { user } = useUserStore();

    // Форматирование даты
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        }).format(date);
    };

    if (loading) {
        return (
            <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-24 bg-[#2D2B52]" />
                <Skeleton className="h-10 w-10 rounded-full bg-[#2D2B52]" />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
      <span className="text-gray-400 text-sm">
        {user ? user.username || user.first_name : "Guest"}
      </span>
            <Avatar className="border-2 border-[#6366F1] transition-colors duration-300">
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
        </div>
    );
}
