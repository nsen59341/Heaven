import React, { useState } from "react";
import {
  Sun,
  MessageCircle,
  Users,
  User as UserIcon,
  Shield,
  Moon,
  Flame,
  UserCheck,
  RotateCcw,
  Sparkles,
  Palette,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export type TabType = "today" | "ask" | "community" | "me" | "coach";

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenReset: () => void;
  onOpenTheme?: () => void;
  onOpenCoachInvite?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenReset,
  onOpenTheme,
  onOpenCoachInvite,
}) => {
  const {
    currentUser,
    isCoach,
    isCoachSession,
    coachImpersonatorId,
    state,
    setCurrentUser,
    switchMemberAccount,
    theme,
    toggleTheme,
    userStreak,
    resetAllData,
  } = useApp();

  const [showUserSwitcher, setShowUserSwitcher] = useState(false);

  const navItems = [
    { id: "today" as TabType, label: "Today", icon: Sun },
    { id: "ask" as TabType, label: "Ask", icon: MessageCircle },
    { id: "community" as TabType, label: "Community", icon: Users },
    { id: "me" as TabType, label: "Me", icon: UserIcon },
    ...(isCoachSession ? [{ id: "coach" as TabType, label: "Coach", icon: Shield }] : []),
  ];

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-[280px] border-r border-[var(--border)] bg-[var(--surface)] shrink-0 h-screen sticky top-0 p-8 select-none justify-between">
        <div className="flex flex-col">
          {/* Brand & User Header */}
          <div className="flex items-center justify-between mb-8">
            <div
              onClick={() => {
                if (isCoachSession) {
                  setShowUserSwitcher(true);
                }
              }}
              className={`flex items-center gap-3 ${
                isCoachSession ? "cursor-pointer group" : "cursor-default"
              }`}
              role={isCoachSession ? "button" : undefined}
              tabIndex={isCoachSession ? 0 : undefined}
              title={isCoachSession ? "Coach Review: Switch participant account" : "Your HEAVEN profile"}
            >
              {currentUser.photo ? (
                <img
                  src={currentUser.photo}
                  alt={currentUser.name}
                  className={`w-10 h-10 rounded-full object-cover border border-[var(--border)] ${
                    isCoachSession ? "group-hover:ring-2 group-hover:ring-[var(--accent)]" : ""
                  } transition-all`}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[var(--highlight)] flex items-center justify-center text-white font-bold text-lg">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="font-bold text-sm text-[var(--text)] uppercase tracking-wider font-serif">
                  HEAVEN
                </h2>
                <p className="text-[var(--subtle)] text-xs truncate max-w-[130px]">
                  {currentUser.role === "coach" ? "Coach Pooja" : currentUser.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
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
              <button
                onClick={() => toggleTheme()}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                className="p-2 rounded-xl text-[var(--subtle)] hover:text-[var(--text)] hover:bg-[var(--subtle-surface)] transition-colors cursor-pointer"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Current Streak Feature Display */}
          {!isCoach && (
            <div className="mb-8 select-none">
              <p className="text-[var(--subtle)] text-[10px] uppercase tracking-[0.2em] mb-2 font-semibold flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-[var(--highlight)]" />
                <span>Current Streak</span>
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-serif text-[var(--text)] tracking-tighter tnum">
                  {userStreak}
                </span>
                <span className="text-[var(--accent)] font-semibold text-sm">
                  {userStreak === 1 ? "day" : "days"}
                </span>
              </div>
              <p className="text-[var(--muted)] text-xs mt-1.5 flex items-center justify-between">
                <span>Longest: {currentUser.longestStreak} days</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                  {currentUser.totalPoints} pts
                </span>
              </p>
            </div>
          )}

          {/* 60s Reset Action Button */}
          <button
            onClick={() => onOpenReset()}
            className="w-full py-2.5 px-4 mb-6 rounded-xl border border-[var(--border)] bg-[var(--subtle-card)] text-[var(--text)] text-xs font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--highlight)]" />
            <span>60-Second Reset</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left ${
                    isActive
                      ? "bg-[var(--subtle-surface)] text-[var(--accent)] font-semibold"
                      : "text-[var(--muted)] hover:bg-[var(--subtle-surface)] hover:text-[var(--text)]"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Support & Community & Reset Demo Data */}
        <div className="space-y-3 pt-4">
          <div className="p-3.5 bg-[var(--subtle-card)] rounded-2xl border border-[var(--border)]">
            <p className="text-[10px] text-[var(--subtle)] uppercase font-bold tracking-wider mb-1.5">
              Support & Community
            </p>
            <button
              onClick={() => onOpenReset()}
              className="w-full text-left text-xs font-medium text-[var(--muted)] flex items-center justify-between hover:text-[var(--text)] transition-colors cursor-pointer"
            >
              <span>Feeling Overwhelmed?</span>
              <Sparkles className="w-3.5 h-3.5 text-[var(--highlight)]" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--subtle)] px-1">
            <button
              onClick={() => {
                if (confirm("Reset app state to default 14 members seed data?")) {
                  resetAllData();
                }
              }}
              className="flex items-center gap-1 hover:text-[var(--text)] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data</span>
            </button>
            <span>v1.0</span>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[46px] rounded-xl transition-all ${
                isActive
                  ? "text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""}`} />
              <span className="text-[11px] font-medium mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= USER SWITCHER MODAL ================= */}
      {showUserSwitcher && isCoachSession && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="switcher-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-[var(--surface)] text-[var(--text)] rounded-[24px] p-6 shadow-[var(--card-shadow-lg)] border border-[var(--border)] max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[var(--accent)]" />
                <h3 id="switcher-title" className="font-serif text-lg font-bold">
                  Coach Review: Switch Account
                </h3>
              </div>
              <button
                onClick={() => setShowUserSwitcher(false)}
                className="text-xs text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-[var(--muted)] mb-3">
              Switch to any participant account to review their daily reflections, check-in history, and reset logs from their perspective:
            </p>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {state.users.map((u) => {
                const isSelected = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      if (u.role === "coach") {
                        setCurrentUser(u.id);
                      } else {
                        switchMemberAccount(u.id);
                      }
                      setShowUserSwitcher(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent-light)]"
                        : "border-[var(--border)] hover:bg-[var(--subtle-surface)]"
                    }`}
                  >
                    <img
                      src={u.photo}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover border border-[var(--border)] shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-[var(--text)] truncate">
                          {u.name}
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                            u.role === "coach"
                              ? "bg-[var(--highlight-light)] text-[var(--highlight)]"
                              : "bg-[var(--subtle-surface)] text-[var(--muted)]"
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--muted)] mt-0.5">
                        {u.role === "coach"
                          ? "Guide & Administrator"
                          : `Streak: ${u.currentStreak}d · ${u.totalPoints} pts`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
