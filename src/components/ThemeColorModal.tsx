import React from "react";
import { Check, Palette, Sparkles, X, Sun, Moon } from "lucide-react";
import { useApp } from "../context/AppContext";
import { THEME_COLOR_PALETTES, ThemeColorId } from "../data/themeColors";

interface ThemeColorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeColorModal: React.FC<ThemeColorModalProps> = ({ isOpen, onClose }) => {
  const { theme, themeColor, setThemeColor, toggleTheme } = useApp();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-modal-title"
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow-lg)] p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--subtle-surface)] flex items-center justify-center text-[var(--accent)] border border-[var(--border)]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 id="theme-modal-title" className="text-xl sm:text-2xl font-serif text-[var(--text)] font-semibold">
                Appearance & Theme
              </h3>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Personalize Saathi with your preferred natural ambiance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close theme modal"
            className="p-2 rounded-full text-[var(--subtle)] hover:text-[var(--text)] hover:bg-[var(--subtle-surface)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Light / Dark Mode Quick Switch */}
        <div className="p-4 rounded-2xl bg-[var(--subtle-card)] border border-[var(--border)] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[var(--text)] block">
              Display Mode
            </span>
            <span className="text-[11px] text-[var(--muted)]">
              Currently using {theme === "dark" ? "Dark Calm" : "Light Serene"} mode
            </span>
          </div>

          <button
            onClick={() => toggleTheme()}
            className="flex items-center gap-2 py-2 px-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] transition-all cursor-pointer shadow-xs"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[var(--highlight)]" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Theme Color Palette Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--subtle)]">
              Palette Selection
            </span>
            <span className="text-[11px] text-[var(--muted)] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[var(--highlight)]" /> 6 Curated Tones
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THEME_COLOR_PALETTES.map((palette) => {
              const isSelected = themeColor === palette.id;
              const activeAccent = theme === "dark" ? palette.dark.accent : palette.light.accent;
              const activeHighlight = theme === "dark" ? palette.dark.highlight : palette.light.highlight;

              return (
                <button
                  key={palette.id}
                  onClick={() => setThemeColor(palette.id)}
                  className={`p-4 rounded-2xl border text-left transition-all relative group cursor-pointer flex flex-col justify-between h-32 ${
                    isSelected
                      ? "border-[var(--accent)] bg-[var(--subtle-surface)] ring-2 ring-[var(--accent)]/20 shadow-xs"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--subtle-card)]"
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    {/* Color Swatch Dots */}
                    <div className="flex items-center gap-1.5 p-1 rounded-full bg-[var(--surface)]/80 border border-[var(--border)]">
                      <span
                        className="w-4 h-4 rounded-full shadow-xs"
                        style={{ backgroundColor: activeAccent }}
                      />
                      <span
                        className="w-4 h-4 rounded-full shadow-xs"
                        style={{ backgroundColor: activeHighlight }}
                      />
                    </div>

                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                      {palette.name}
                    </h4>
                    <p className="text-[11px] text-[var(--muted)] line-clamp-1 mt-0.5">
                      {palette.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-[var(--accent)] text-white font-semibold text-sm hover:bg-[var(--accent-hover)] transition-colors shadow-xs cursor-pointer text-center"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
