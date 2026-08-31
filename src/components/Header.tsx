import React from "react";
import { Sun, Moon, Sparkles, Flame, Palette } from "lucide-react";
import { useApp } from "../context/AppContext";

interface HeaderProps {
  onOpenReset: () => void;
  onOpenTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenReset, onOpenTheme }) => {
  const { currentUser, isCoach, userStreak, theme, toggleTheme } = useApp();

  // Time of day greeting
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const firstName = currentUser.name.split(" ")[0];

  // Rule A4: Second line is specific rather than praise
  let subline = "";
  if (isCoach) {
    subline = "Your community is practicing today.";
  } else if (userStreak === 0) {
    subline = "Here for today. That is all that matters.";
  } else if (userStreak === 1) {
    subline = "Day one. That is the hard one.";
  } else {
    subline = `Day ${userStreak}, and you have not missed one yet.`;
  }

  return (
    <header className="w-full flex items-center justify-between py-4 px-4 sm:px-8 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xs sticky top-0 z-20">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="md:hidden text-xs font-serif font-bold text-[var(--accent)] tracking-wider uppercase">
            Saathi ·
          </span>
          <h1 className="text-xl sm:text-2xl font-serif text-[var(--text)] tracking-tight truncate">
            {timeGreeting}, {firstName}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5 font-normal">
          {subline}
        </p>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Streak indicator on mobile */}
        {!isCoach && (
          <div className="md:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--subtle-surface)] border border-[var(--border)] text-xs text-[var(--text)]">
            <Flame className="w-3.5 h-3.5 text-[var(--highlight)]" />
            <span className="font-bold tnum">{userStreak}d</span>
          </div>
        )}

        {/* Theme customization button */}
        {onOpenTheme && (
          <button
            onClick={onOpenTheme}
            aria-label="Change theme colors"
            title="Change theme colors"
            className="p-2 rounded-xl text-[var(--subtle)] hover:text-[var(--accent)] hover:bg-[var(--subtle-surface)] transition-colors cursor-pointer"
          >
            <Palette className="w-4 h-4" />
          </button>
        )}

        {/* 60s Reset shortcut button */}
        <button
          onClick={() => onOpenReset()}
          aria-label="Open 60 second reset"
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--subtle-card)] text-[var(--text)] text-xs sm:text-sm font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[var(--highlight)]" />
          <span className="hidden sm:inline">60s Reset</span>
          <span className="sm:hidden">Reset</span>
        </button>

        {/* Theme Toggle on mobile */}
        <button
          onClick={() => toggleTheme()}
          aria-label={`Toggle theme, current is ${theme}`}
          className="md:hidden p-2 rounded-xl text-[var(--subtle)] hover:text-[var(--text)] hover:bg-[var(--subtle-surface)] transition-colors cursor-pointer"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

