"use client";

import * as React from "react";
import {
  MdNotifications,
  MdMessage,
  MdPerson,
  MdSettings,
  MdCreditCard,
  MdLogout,
  MdMenu,
} from "react-icons/md";

// Mock data for notifications and messages
const mockNotifications = [
  {
    id: 1,
    type: "message",
    title: "New message from John Doe",
    description: "Hey, can we schedule a meeting for tomorrow?",
    time: "2 min ago",
    unread: true,
    avatar: "JD",
  },
  {
    id: 2,
    type: "like",
    title: "Sarah liked your post",
    description: "Your latest project update was liked",
    time: "15 min ago",
    unread: true,
    avatar: "SM",
  },
  {
    id: 3,
    type: "system",
    title: "System update available",
    description: "Version 2.1.0 is ready to install",
    time: "1 hour ago",
    unread: false,
    avatar: "SYS",
  },
  {
    id: 4,
    type: "reminder",
    title: "Meeting reminder",
    description: "Team standup in 30 minutes",
    time: "2 hours ago",
    unread: false,
    avatar: "CAL",
  },
];

const mockMessages = [
  {
    id: 1,
    sender: "John Doe",
    message: "Hey, can we schedule a meeting for tomorrow?",
    time: "2 min ago",
    unread: true,
    avatar: "JD",
    online: true,
  },
  {
    id: 2,
    sender: "Sarah Miller",
    message: "The design mockups are ready for review",
    time: "15 min ago",
    unread: true,
    avatar: "SM",
    online: true,
  },
  {
    id: 3,
    sender: "Mike Johnson",
    message: "Thanks for the feedback on the proposal",
    time: "1 hour ago",
    unread: false,
    avatar: "MJ",
    online: false,
  },
  {
    id: 4,
    sender: "Emily Chen",
    message: "Can you review the latest changes?",
    time: "3 hours ago",
    unread: false,
    avatar: "EC",
    online: false,
  },
];

function Header() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [messages, setMessages] = useState(mockMessages);

  const unreadNotifications = notifications.filter((n) => n.unread).length;
  const unreadMessages = messages.filter((m) => m.unread).length;

  const markNotificationAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markMessageAsRead = (id: number) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, unread: false } : m))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setMessages((prev) => prev.map((m) => ({ ...m, unread: false })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <FiMessageSquare className="h-4 w-4 text-blue-500" />;
      case "like":
        return <FiHeart className="h-4 w-4 text-red-500" />;
      case "system":
        return <FiSettings className="h-4 w-4 text-gray-500" />;
      case "reminder":
        return <FiBell className="h-4 w-4 text-yellow-500" />;
      default:
        return <FiBell className="h-4 w-4 text-gray-500" />;
    }
  };

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

      {/* Right side - Notifications, Messages, Theme, MdPerson Menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile search dialog */}
        <div className="md:hidden">
          <SearchDialog />
        </div>

        {/* Messages Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <FiMessageSquare className="h-5 w-5 text-slate-900 dark:text-slate-100" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-w-[90vw]">
            <DropdownMenuLabel className="flex items-center justify-between">
              Messages
              {unreadMessages > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto overflow-x-hidden">
              {messages.map((message) => (
                <div key={message.id}>
                  <DropdownMenuItem
                    className="flex items-start space-x-3 p-3 cursor-pointer"
                    onClick={() => markMessageAsRead(message.id)}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-slate-300 dark:bg-slate-500 rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                        {message.avatar}
                      </div>
                      {message.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground truncate">
                          {message.sender}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {message.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {message.message}
                      </p>
                    </div>
                    {message.unread && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>
              ))}
            </div>
            <DropdownMenuItem className="text-center text-primary">
              View all messages
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <FiBell className="h-5 w-5 text-slate-900 dark:text-slate-100" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-w-[90vw]">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              {unreadNotifications > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto overflow-x-hidden">
              {notifications.map((notification) => (
                <div key={notification.id}>
                  <DropdownMenuItem
                    className="flex items-start space-x-3 p-3 cursor-pointer"
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                      {notification.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getNotificationIcon(notification.type)}
                          <p className="text-sm font-medium text-foreground truncate">
                            {notification.title}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {notification.description}
                      </p>
                    </div>
                    {notification.unread && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>
              ))}
            </div>
            <DropdownMenuItem className="text-center text-primary">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Separator */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

        {/* Theme Switch - Placeholder */}
        <ThemeSwitch />

        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <MdPerson className="h-4 w-4 text-slate-900 dark:text-slate-100" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 max-w-[90vw]">
            <DropdownMenuLabel className="flex items-center space-x-3 p-3">
              <div className="w-12 h-12 bg-slate-300 dark:bg-slate-500 text-slate-800 dark:text-slate-100 rounded-full flex items-center justify-center text-primary-foreground text-lg font-medium">
                AD
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-50">
                  Admin
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  admin@mail.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <FiUser className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FiSettings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FiCreditCard className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FiShield className="mr-2 h-4 w-4" />
                Security
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <FiHelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FiMail className="mr-2 h-4 w-4" />
                Contact Us
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
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
import ThemeSwitch from "../Theme/ThemeSwitcher";
import { SearchBar } from "./SearchBar";
import { SearchDialog } from "./SearchDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu/DropdownMenu";
import {
  FiBell,
  FiChevronDown,
  FiCreditCard,
  FiHeart,
  FiHelpCircle,
  FiLogOut,
  FiMail,
  FiMessageSquare,
  FiSettings,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { useState } from "react";

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
