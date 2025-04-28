// components/UserMenu.tsx

"use client";

import React, { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, User, RefreshCw, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { resetUserProgress } from "@/app/actions/progress";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { User as UserType } from '@/types/user'

const UserMenu: React.FC = () => {
    const { user, loading, signOut } = useAuth();
    const [isResetting, setIsResetting] = useState(false);
    const router = useRouter();

    // Add console log for debugging
    console.log('UserMenu Render:', { loading, user });

    // Hardcoded menu items
    const menuItems = [
        { label: "Update Profile", href: "/profile" },
        { label: "Support", href: "/profile" },
        // Add admin dashboard link conditionally
        ...(user?.role === "admin" ? [
            { label: "Admin Dashboard", href: "/admin/controlPanel" }
        ] : [])
    ];

    const handleSignOut = async () => {
        console.log('Sign out button clicked');
        try {
            console.log('Attempting to sign out...');
            await signOut();
            console.log('Sign out successful');
            toast.success('Signed out successfully', {
                description: 'Redirecting to sign in page...'
            });
        } catch (error) {
            console.error('Sign out error:', error);
            toast.error('Sign out failed', {
                description: 'An unexpected error occurred'
            });
        }
    };

    // Handler for reset progress (uses imported Supabase action)
    const handleResetProgress = async () => {
        if (confirm("Are you sure you want to reset all your course progress? This cannot be undone.")) {
            setIsResetting(true);
            try {
                const result = await resetUserProgress(); // Calls the server action

                if (result.success) {
                    toast.success('Progress reset', {
                        description: 'Your course progress has been reset successfully'
                    });
                    // Force refresh the page to show updated state
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    console.error("Reset failed:", result.error);
                    toast.error('Reset failed', {
                        description: result.error || 'An unknown error occurred'
                    });
                }
            } catch (error) {
                console.error("Error calling resetUserProgress action:", error);
                toast.error('Reset failed', {
                    description: 'An error occurred while resetting progress'
                });
            } finally {
                setIsResetting(false);
            }
        }
    };

    if (loading || !user) {
        // Add log before returning null
        console.log('UserMenu: Returning null because loading or no user.', { loading, hasUser: !!user });
        return null;
    }

    // --- Get Avatar URL --- 
    // Using hardcoded default avatar for now
    const avatarUrl = "/thomas-aquinas.jpeg"; 

    return (
        <div className="fixed top-3 right-3 sm:right-6 sm:top-6 z-50">
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <button
                        className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/20 hover:bg-black/30 focus:outline-none transition-colors"
                        aria-label="User Menu"
                    >
                        <Image
                            width={48}
                            height={48}
                            src={avatarUrl}
                            alt={user.firstName || "User Avatar"}
                            className="w-full h-full rounded-full object-cover border-2 border-transparent group-hover:border-secondary transition-colors duration-300"
                        />
                    </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Content
                    align="end"
                    sideOffset={5}
                    className="w-56 bg-black/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-zinc-800 text-white font-morion animate-fadeIn z-50"
                >
                    <div className="px-3 py-2 border-b border-zinc-700 mb-1">
                        <p className="text-xs text-white/60">Signed in as</p>
                        <p className="text-sm font-medium text-white truncate">{user.email || 'No Email'}</p>
                    </div>

                    {menuItems.map((item, index) => (
                        <DropdownMenu.Item key={index} asChild className="focus:outline-none">
                            <Link
                                href={item.href}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/90 hover:text-white hover:bg-white/10 rounded cursor-pointer focus:bg-white/10 focus:text-white"
                            >
                                {item.label}
                            </Link>
                        </DropdownMenu.Item>
                    ))}

                    <DropdownMenu.Separator className="h-px bg-zinc-700 my-1" />
                    <DropdownMenu.Item onSelect={(e) => e.preventDefault()} className="focus:outline-none">
                        <button
                            onClick={handleResetProgress}
                            disabled={isResetting}
                            className={cn(
                                "w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm rounded cursor-pointer",
                                "text-red-400 hover:text-red-300 hover:bg-white/10 focus:bg-white/10 focus:text-red-300",
                                isResetting && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <RefreshCw className="w-4 h-4" />
                            {isResetting ? "Resetting..." : "Reset Progress"}
                        </button>
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator className="h-px bg-zinc-700 my-1" />
                    <DropdownMenu.Item onClick={handleSignOut} className="focus:outline-none">
                        <div
                            className={cn(
                                "w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm rounded cursor-pointer",
                                "text-white/90 hover:text-white hover:bg-white/10 focus:bg-white/10 focus:text-white"
                            )}
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </div>
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>
    );
};

export default UserMenu;
