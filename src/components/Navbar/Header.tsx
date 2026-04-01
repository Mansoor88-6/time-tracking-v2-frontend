"use client";

import * as React from "react";
import { MdPerson, MdMenu } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";

function Header() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const displayName =
    user?.name || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || "";
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .join("")
      .slice(0, 2) || "U";

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4">
      {/* Left side - Sidebar trigger and separator */}
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
      </div>

      {/* Center search bar for desktop */}
      <div className="hidden flex-1 items-center justify-center md:flex">
        <SearchBar showSuggestions className="max-w-xl" />
      </div>

      {/* Right side - Search (mobile), Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile search dialog */}
        <div className="md:hidden">
          <SearchDialog />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <MdPerson className="h-4 w-4 text-slate-900 dark:text-slate-100" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 max-w-[90vw]">
            <DropdownMenuLabel className="flex items-center space-x-3 p-3">
              <div className="w-12 h-12 bg-slate-300 dark:bg-slate-500 text-slate-800 dark:text-slate-100 rounded-full flex items-center justify-center text-primary-foreground text-lg font-medium">
                {initials}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-50">
                  {displayName}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {displayEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => router.push("/logout")}
            >
              <FiLogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// Import the useSidebarContext from CustomSidebar
import { useSidebarContext } from "../Sidebar/Sidebar";
import { SearchBar } from "./SearchBar";
import { SearchDialog } from "./SearchDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu/DropdownMenu";
import { FiLogOut } from "react-icons/fi";

// Sidebar Trigger Component (imported from CustomSidebar)
function SidebarTrigger() {
  const { toggleSidebar } = useSidebarContext();

  return (
    <button
      onClick={toggleSidebar}
      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
    >
      <MdMenu className="h-4 w-4 text-slate-900 dark:text-slate-100" />
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  );
}

export { Header };
