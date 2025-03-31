// components/UserMenu.tsx

"use client";

import React, { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, User, RefreshCw } from "lucide-react"; // Added RefreshCw icon
import Link from "next/link";
import { signOut, useSession } from "next-auth/react"; // Import signOut and useSession
import { cn } from "@/lib/utils"; // Utility function for conditional classNames
import Image from "next/image";
import { resetUserProgress } from "@/lib/progress-service"; // Import the reset function
import { toast } from "react-hot-toast"; // You might need to install this package if not already installed

interface CustomUser {
    id: string;
    email: string | null;
    name: string | null;
    role?: string;
}

interface CustomSession {
    user: CustomUser;
    expires: string;
}

const UserMenu: React.FC = () => {
    const { data: session } = useSession() as { data: CustomSession | null };
    const [isResetting, setIsResetting] = useState(false);

    // Hardcoded menu items
    const menuItems = [
        { label: "Update Profile", href: "/profile" },
        { label: "Support", href: "/profile" },
        // Add admin dashboard link conditionally
        ...(session?.user?.role === "admin" ? [
            { label: "Admin Dashboard", href: "/course/adminDashboard" }
        ] : [])
    ];

    if (!session) {
        return null;
    }

    // Handler for reset progress
    const handleResetProgress = async () => {
        if (confirm("Are you sure you want to reset all your course progress? This cannot be undone.")) {
            setIsResetting(true);
            
            try {
                const result = await resetUserProgress();
                
                if (result.success) {
                    const details = result.details || {};
                    const totalReset = (details.deletedVideos || 0) + 
                                       (details.deletedQuestions || 0) + 
                                       (details.deletedUnits || 0);
                                       
                    if (totalReset > 0) {
                        toast.success(`Progress reset: ${totalReset} items deleted (${details.deletedVideos || 0} videos, ${details.deletedQuestions || 0} questions, ${details.deletedUnits || 0} units)`);
                    } else {
                        toast.success("Your progress has been reset successfully");
                    }
                    
                    // Force refresh the page to show updated state
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    console.error("Reset failed:", result.details);
                    toast.error("Failed to reset progress. Please try again later.");
                }
            } catch (error) {
                console.error("Error resetting progress:", error);
                toast.error("An error occurred while resetting progress");
            } finally {
                setIsResetting(false);
            }
        }
    };

    return (
        <div className="fixed top-3 right-3 sm:right-6 sm:top-6 z-50">
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <button
                        className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full focus:outline-none"
                        aria-label="User Menu"
                    >
                        {/* Replace the src with your actual avatar URL or leave as undefined to use the default icon */}
                        <Image
                            width={100}
                            height={100}
                            src="/thomas-aquinas.jpeg" // Replace with your avatar image path or URL
                            alt="User Avatar"
                            className="w-full h-full rounded-full object-cover"
                        />
                        {/* Default User Icon for smaller screens or if avatar not available */}
                        <User className="w-2 h-2 sm:w-6 sm:h-6 text-gray-600 md:hidden" />
                        <ChevronDown className="ml-2 w-2 h-2 sm:w-4 sm:h-4 text-gray-600" />
                    </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Content
                    align="end"
                    sideOffset={5}
                    className="w-48 shadow-lg animate-fadeIn"
                >
                    {menuItems.map((item, index) => (
                        <DropdownMenu.Item key={index} className="group">
                            <Link
                                href={item.href}
                                className="flex items-center font-morion bg-white px-4 py-2 text-sm text-gray-700 hover:bg-secondary-foreground"
                            >
                                {item.label}
                            </Link>
                        </DropdownMenu.Item>
                    ))}
                    
                    {/* Reset Progress Button */}
                    <DropdownMenu.Item className="group">
                        <button
                            onClick={handleResetProgress}
                            disabled={isResetting}
                            className={cn(
                                "w-full text-left flex items-center px-4 py-2 text-sm font-morion text-red-600 bg-white hover:bg-red-50",
                                "focus:outline-none focus:bg-red-50",
                                isResetting && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {isResetting ? "Resetting..." : "Reset Progress"}
                        </button>
                    </DropdownMenu.Item>
                    
                    <DropdownMenu.Item className="group">
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className={cn(
                                "w-full text-left flex items-center px-4 py-2 text-sm font-morion text-black bg-white hover:bg-secondary-foreground hover:text-black",
                                "focus:outline-none focus:bg-secondary-foreground focus:text-black"
                            )}
                        >
                            Sign Out
                        </button>
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>
    );
};

export default UserMenu;
