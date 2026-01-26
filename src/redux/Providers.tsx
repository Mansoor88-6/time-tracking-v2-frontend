"use client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, Suspense } from "react";
import { store } from "./store";
import { ThemeProvider } from "@/components/Theme/ThemeProvider";
import ToastContainerTheme from "@/components/Theme/ToastContainerTheme";

const queryClient = new QueryClient();

export function AppStateProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={"Loading..."}>{children}</Suspense>
          <ToastContainerTheme />
        </QueryClientProvider>
      </Provider>
    </ThemeProvider>
  );
}
