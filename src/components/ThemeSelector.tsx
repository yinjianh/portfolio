import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export function ThemeSelector() {
  const { appliedTheme, setThemeMode } = useTheme();
  const isDark = appliedTheme === "midnight";
  const Icon = isDark ? Sun : Moon;
  const title = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      onClick={() => setThemeMode(isDark ? "warm" : "midnight")}
      title={title}
      aria-label={title}
      className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150"
      style={{
        background: "transparent",
        color: "hsl(var(--muted-foreground))",
        boxShadow: "none",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.color = "hsl(var(--foreground))";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.color = "hsl(var(--muted-foreground))";
      }}
    >
      <Icon size={16} />
    </button>
  );
}
