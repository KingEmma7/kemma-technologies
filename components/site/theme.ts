export type Appearance = "light" | "dark" | "system";
export type Palette = "powder" | "golden" | "electric";
export const THEME_KEY = "kemma-theme";
export const PALETTE_KEY = "kemma-palette";

export const PALETTES: { id: Palette; name: string; colors: [string, string, string] }[] = [
  { id: "powder", name: "Powder + Poppy", colors: ["#dce7f1", "#f06b50", "#1f283d"] },
  { id: "golden", name: "Golden Paper", colors: ["#f7f3e9", "#e6aa24", "#492e50"] },
  { id: "electric", name: "Electric Editorial", colors: ["#fffaf1", "#1f3fd2", "#f1b821"] },
];

export function palette(value: string | null): Palette {
  return value === "golden" || value === "electric" ? value : "powder";
}

export function applyPalette(choice: Palette) {
  document.documentElement.dataset.palette = choice;
  document.dispatchEvent(new Event("kemma:palette"));
}

export function appearance(value: string | null): Appearance {
  return value === "dark" || value === "system" ? value : "light";
}
export function applyAppearance(preference: Appearance) {
  const root = document.documentElement;
  const theme =
    preference === "system"
      ? matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : preference;
  root.dataset.theme = theme;
  root.dataset.themePreference = preference;
  root.style.colorScheme = theme;
  document.dispatchEvent(new Event("kemma:theme"));
}
// Runs before first paint; color direction and day/night mode are independent.
export const themeScript = `(function(){var p='light',c='powder';try{var v=localStorage.getItem('${THEME_KEY}');if(v==='light'||v==='dark'||v==='system')p=v;var w=localStorage.getItem('${PALETTE_KEY}');if(w==='powder'||w==='golden'||w==='electric')c=w;}catch(e){}var t=p==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;var r=document.documentElement;r.dataset.theme=t;r.dataset.themePreference=p;r.dataset.palette=c;r.style.colorScheme=t;})();`;
