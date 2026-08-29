export type ThemeColorId = "sage" | "celestial" | "rose" | "lavender" | "amber" | "emerald";

export interface ThemeColorPalette {
  id: ThemeColorId;
  name: string;
  subtitle: string;
  swatch: {
    primary: string;
    highlight: string;
    bgPreview: string;
  };
  light: {
    accent: string;
    accentHover: string;
    accentLight: string;
    accentTint: string;
    highlight: string;
    highlightLight: string;
  };
  dark: {
    accent: string;
    accentHover: string;
    accentLight: string;
    accentTint: string;
    highlight: string;
    highlightLight: string;
  };
}

export const THEME_COLOR_PALETTES: ThemeColorPalette[] = [
  {
    id: "sage",
    name: "Sage & Clay",
    subtitle: "Calming forest green with warm terracotta",
    swatch: {
      primary: "#4D8B63",
      highlight: "#E8956B",
      bgPreview: "#F6EFE6",
    },
    light: {
      accent: "#4D8B63",
      accentHover: "#3E7351",
      accentLight: "#F0F7F2",
      accentTint: "#E6F2EA",
      highlight: "#E8956B",
      highlightLight: "#FDF3ED",
    },
    dark: {
      accent: "#6EAB84",
      accentHover: "#82BD97",
      accentLight: "#1F3326",
      accentTint: "#182A1F",
      highlight: "#E8956B",
      highlightLight: "#36251E",
    },
  },
  {
    id: "celestial",
    name: "Celestial Sky",
    subtitle: "Serene azure blue with golden dawn",
    swatch: {
      primary: "#31749E",
      highlight: "#E5A93C",
      bgPreview: "#EBF3F8",
    },
    light: {
      accent: "#31749E",
      accentHover: "#245B7E",
      accentLight: "#EEF6FA",
      accentTint: "#E1EEF6",
      highlight: "#E5A93C",
      highlightLight: "#FEF7EC",
    },
    dark: {
      accent: "#60A5D2",
      accentHover: "#7CB9E1",
      accentLight: "#1B2F3D",
      accentTint: "#142531",
      highlight: "#E5A93C",
      highlightLight: "#382D1D",
    },
  },
  {
    id: "rose",
    name: "Ethereal Rose",
    subtitle: "Dusty rose quartz with honey warmth",
    swatch: {
      primary: "#B45B6C",
      highlight: "#E59E48",
      bgPreview: "#F9ECEF",
    },
    light: {
      accent: "#B45B6C",
      accentHover: "#964555",
      accentLight: "#FDF0F3",
      accentTint: "#FBE2E7",
      highlight: "#E59E48",
      highlightLight: "#FEF5EB",
    },
    dark: {
      accent: "#DB7B8C",
      accentHover: "#E995A4",
      accentLight: "#3D1E25",
      accentTint: "#31161D",
      highlight: "#E59E48",
      highlightLight: "#382819",
    },
  },
  {
    id: "lavender",
    name: "Mystic Lavender",
    subtitle: "Deep calming amethyst with soft blush",
    swatch: {
      primary: "#6B58A6",
      highlight: "#E283AC",
      bgPreview: "#F2EFF9",
    },
    light: {
      accent: "#6B58A6",
      accentHover: "#544287",
      accentLight: "#F4F0FC",
      accentTint: "#ECE3FA",
      highlight: "#E283AC",
      highlightLight: "#FDF2F7",
    },
    dark: {
      accent: "#9D88DE",
      accentHover: "#B3A1E8",
      accentLight: "#2C2147",
      accentTint: "#221938",
      highlight: "#E283AC",
      highlightLight: "#391F2B",
    },
  },
  {
    id: "amber",
    name: "Sunlit Amber",
    subtitle: "Warm earthy ochre with vibrant sunburst",
    swatch: {
      primary: "#9C6A2E",
      highlight: "#D97746",
      bgPreview: "#F9F3EA",
    },
    light: {
      accent: "#9C6A2E",
      accentHover: "#7E521E",
      accentLight: "#FAF3E8",
      accentTint: "#F4E8D6",
      highlight: "#D97746",
      highlightLight: "#FDF2EC",
    },
    dark: {
      accent: "#D69F5A",
      accentHover: "#E4B478",
      accentLight: "#382613",
      accentTint: "#2D1D0C",
      highlight: "#D97746",
      highlightLight: "#382218",
    },
  },
  {
    id: "emerald",
    name: "Emerald Oasis",
    subtitle: "Deep grounding jade with warm sandstone",
    swatch: {
      primary: "#287A5E",
      highlight: "#DF9B52",
      bgPreview: "#EBF6F1",
    },
    light: {
      accent: "#287A5E",
      accentHover: "#1C5E47",
      accentLight: "#EDF8F3",
      accentTint: "#DDF1E7",
      highlight: "#DF9B52",
      highlightLight: "#FDF5ED",
    },
    dark: {
      accent: "#53BA96",
      accentHover: "#71C9AA",
      accentLight: "#163429",
      accentTint: "#0F281E",
      highlight: "#DF9B52",
      highlightLight: "#372718",
    },
  },
];
