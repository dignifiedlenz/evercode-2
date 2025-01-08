// components/UserMenu.tsx

"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, User } from "lucide-react"; // Icons from lucide-react
import Link from "next/link";
import { signOut, useSession } from "next-auth/react"; // Import signOut and useSession
import { cn } from "@/lib/utils"; // Utility function for conditional classNames
import Image from "next/image";

const UserMenu: React.FC = () => {

    const { data: session } = useSession();
  // Hardcoded menu items
  const menuItems = [
    { label: "Update Profile", href: "/profile" },
    { label: "Support", href: "/profile" }
  ];


  if (!session) {
    return null;
  }


  return (
    <div className="fixed top-6 right-6 z-50">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="flex items-center justify-center w-12 h-12 rounded-full "
            aria-label="User Menu"
          >
            {/* Replace the src with your actual avatar URL or leave as undefined to use the default icon */}
            <Image
            width={100}
            height={100}
              src="/thomas-aquinas.jpeg" // Replace with your avatar image path or URL
              alt="User Avatar"
              className="w-full h-full rounded-full object-cover hidden md:block"
            />
            {/* Default User Icon for smaller screens or if avatar not available */}
            <User className="w-6 h-6 text-gray-600 md:hidden" />
            <ChevronDown className="ml-2 w-4 h-4 text-gray-600" />
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
                className={cn(
                  "flex items-center font-custom2 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-secondary-foreground"
                  
                )}
              >
                {item.label}
              </Link>
            </DropdownMenu.Item>

          ))}
          <DropdownMenu.Item className="group">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className={cn(
                "w-full text-left flex items-center px-4 py-2 text-sm font-custom2 text-black bg-white hover:bg-secondary-foreground hover:text-black",
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
