export interface ThemeColors {
  bg: string;
  bgSecondary: string;
  accent: string;
  accentLight: string;
  text: string;
  textSecondary: string;
  card: string;
  cardBorder: string;
  success: string;
  danger: string;
}

export interface Theme {
  id: string;
  label: string;
  emoji: string;
  light: ThemeColors;
  dark: ThemeColors;
}

export const THEMES: Theme[] = [
  {
    id: "bluish",
    label: "Bluish",
    emoji: "💙",
    light: {
      bg: "#E8F4FD",
      bgSecondary: "#D0E8F7",
      accent: "#1B3A5C",
      accentLight: "#3B6B9C",
      text: "#0D1B2A",
      textSecondary: "#4A6A8A",
      card: "#FFFFFF",
      cardBorder: "#B8D8F0",
      success: "#22C55E",
      danger: "#EF4444",
    },
    dark: {
      bg: "#0D1B2A",
      bgSecondary: "#162A3E",
      accent: "#00B4D8",
      accentLight: "#0099B8",
      text: "#E8F4FD",
      textSecondary: "#8BAFC4",
      card: "#1B2D42",
      cardBorder: "#2A4258",
      success: "#22C55E",
      danger: "#EF4444",
    },
  },
  {
    id: "pinkish",
    label: "Pinkish",
    emoji: "💗",
    light: {
      bg: "#FDF2F8",
      bgSecondary: "#FCE7F3",
      accent: "#BE5985",
      accentLight: "#D87AAA",
      text: "#2D1B2E",
      textSecondary: "#8B5A7C",
      card: "#FFFFFF",
      cardBorder: "#F5C6E0",
      success: "#22C55E",
      danger: "#EF4444",
    },
    dark: {
      bg: "#2D1B2E",
      bgSecondary: "#3D2640",
      accent: "#FF69B4",
      accentLight: "#E050A0",
      text: "#FDF2F8",
      textSecondary: "#C89AB4",
      card: "#3D2640",
      cardBorder: "#5A3860",
      success: "#22C55E",
      danger: "#EF4444",
    },
  },
  {
    id: "greenish",
    label: "Greenish",
    emoji: "💚",
    light: {
      bg: "#F0FDF4",
      bgSecondary: "#DCFCE7",
      accent: "#166534",
      accentLight: "#22883E",
      text: "#0F2414",
      textSecondary: "#4A7A5A",
      card: "#FFFFFF",
      cardBorder: "#BBF0C8",
      success: "#22C55E",
      danger: "#EF4444",
    },
    dark: {
      bg: "#0F2414",
      bgSecondary: "#1A3520",
      accent: "#84CC16",
      accentLight: "#6AA812",
      text: "#F0FDF4",
      textSecondary: "#8BBF8A",
      card: "#1A3520",
      cardBorder: "#2A5230",
      success: "#22C55E",
      danger: "#EF4444",
    },
  },
  {
    id: "purplish",
    label: "Purplish",
    emoji: "💜",
    light: {
      bg: "#F8F4FF",
      bgSecondary: "#EDE5FF",
      accent: "#6B21A5",
      accentLight: "#8B44CC",
      text: "#1A0B2E",
      textSecondary: "#7A5AA0",
      card: "#FFFFFF",
      cardBorder: "#D4BCF0",
      success: "#22C55E",
      danger: "#EF4444",
    },
    dark: {
      bg: "#1A0B2E",
      bgSecondary: "#2A1640",
      accent: "#C084FC",
      accentLight: "#A060E0",
      text: "#F8F4FF",
      textSecondary: "#B898D0",
      card: "#2A1640",
      cardBorder: "#3D2858",
      success: "#22C55E",
      danger: "#EF4444",
    },
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) || THEMES[1];
}

export function getColors(themeId: string, mode: string): ThemeColors {
  const theme = getTheme(themeId);
  return mode === "dark" ? theme.dark : theme.light;
}
