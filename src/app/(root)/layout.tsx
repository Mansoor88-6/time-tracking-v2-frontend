"use client";

import { Suspense } from "react";
import {
  SidebarProvider,
  Sidebar,
  useSidebarContext,
} from "@/components/Sidebar/Sidebar";
import { Header } from "@/components/Navbar/Header";
import Breadcrumb from "@/components/ui/Routing/Breadcrumb";
import AppLoading from "@/components/ui/Loading/AppLoading";

// import Loading from "./loading";
// import { Providers } from "@/lib/providers";

function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen, isMobile } = useSidebarContext();

  return (
    <div
      className={`flex-1 flex flex-col overflow-hidden transition-all duration-200 ease-in-out mobile-full-width ${
        isMobile ? "ml-0 w-full" : isOpen ? "ml-64" : "ml-16"
      }`}
    >
      {/* Header */}
      <Header />

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
        <div className="p-6">
          <Breadcrumb />
          <Suspense fallback={<AppLoading />}>
            {/* <Providers>{children}</Providers> */}
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default function CustomLayout({
  children,
  showTeamSwitcherDropdown = false,
}: Readonly<{
  children: React.ReactNode;
  showTeamSwitcherDropdown?: boolean;
}>) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        {/* Sidebar */}
        <Sidebar showTeamSwitcherDropdown={showTeamSwitcherDropdown} />

        {/* Main Content Area */}
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}
