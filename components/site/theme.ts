export type Appearance = "light" | "dark" | "system";
export const THEME_KEY = "kemma-theme";
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
// Runs before first paint; returning visitors keep their existing theme choice.
export const themeScript = `(function(){var p='light';try{var v=localStorage.getItem('${THEME_KEY}');if(v==='light'||v==='dark'||v==='system')p=v;}catch(e){}var t=p==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;var r=document.documentElement;r.dataset.theme=t;r.dataset.themePreference=p;r.style.colorScheme=t;})();`;
