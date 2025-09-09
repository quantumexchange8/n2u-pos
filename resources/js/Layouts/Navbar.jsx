import NavLink from "@/Components/NavLink";
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import React from "react";
import { NotificationIcon } from "@/Components/Outline";
import Button from "@/Components/Button";

export default function Navbar({ user, showingNavigationDropdown }) {

    return (
        <nav className="border-b border-gray-100 bg-white">
            <div className="w-full px-4 py-5 flex justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full">
                        <img src="" alt="" className="rounded-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-neutral-900 font-bold text-lg">{user.name}</div>
                        <div className="text-neutral-400 text-xs">ID: {user.uid}</div>
                    </div>
                </div>
                <Button iconOnly pill size="md" variant="white">
                    <NotificationIcon />
                </Button>
            </div>
        </nav>
    )
}