/**
 * Theme type definitions
 */

export type ColorName =
  | "blue"
  | "purple"
  | "green"
  | "orange"
  | "red"
  | "cyan"
  | "yellow"
  | "indigo"
  | "teal"
  | "coral"
  | "navy"
  | "pink"
  | "gray"
  | "slate";

export type ChartColorName = "teal" | "coral" | "yellow" | "navy" | "pink";

export type CategoryName = "productive" | "unproductive" | "neutral";

export type SemanticColorName =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "info";

export interface ColorVariants {
  bg: string;
  border: string;
  text: string;
  icon?: string;
  badge?: string;
  button?: string;
  accent?: string;
}

export interface ThemeColors {
  semantic: {
    primary: {
      base: string;
      light: string;
      lighter: string;
      dark: string;
      darker: string;
      button?: string;
    };
    secondary: {
      base: string;
      light: string;
      dark: string;
    };
    accent: string;
    success: ColorVariants;
    warning: ColorVariants;
    error: ColorVariants;
    info: ColorVariants;
  };
  chart: {
    teal: string;
    coral: string;
    yellow: string;
    navy: string;
    pink: string;
  };
  category: {
    productive: ColorVariants;
    unproductive: ColorVariants;
    neutral: ColorVariants;
  };
  palette: Record<ColorName, ColorVariants>;
  background: {
    light: {
      bg: string;
      card: string;
      text: string;
    };
    dark: {
      bg: string;
      card: string;
      text: string;
    };
  };
}
