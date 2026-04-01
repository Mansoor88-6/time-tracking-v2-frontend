"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ProvidersProps
  extends React.ComponentProps<typeof NextThemesProvider> {
  children: React.ReactNode;
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "light",
  enableSystem = false,
  forcedTheme = "light",
  disableTransitionOnChange = true,
  ...props
}: ProvidersProps) {
  return (
    <NextThemesProvider
      {...props}
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      forcedTheme={forcedTheme}
      disableTransitionOnChange={disableTransitionOnChange}
    >
      {children}
    </NextThemesProvider>
  );
}
