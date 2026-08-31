import React, { useMemo } from "react";
import {
  Sparkles,
  Edit3,
  Share2,
  CheckCircle2,
  Users,
  Calendar,
  Flame,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { MOOD_SCALE, MoodScore, CheckIn } from "../types";
import { getLocalDateString } from "../utils/helpers";
import { getProgressReflectionsForUser } from "../utils/progressReflections";
import { ProgressReflectionCard } from "../components/ProgressReflectionCard";

interface TodayViewProps {
  onOpenCheckIn: () => void;
  onOpenEditCheckIn: (checkIn: CheckIn) => void;
  onOpenShareCard: (checkIn: CheckIn) => void;
  onOpenReset: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  onOpenCheckIn,
  onOpenEditCheckIn,
  onOpenShareCard,
  onOpenReset,
}) => {
  const {
    currentUser,
    activeChallenge,
    todayCheckIn,
    nextDayNumber,
    state,
    userStreak,
  } = useApp();

  const totalChallengeDays = activeChallenge?.days.length || 7;
  const currentDayAction =
    activeChallenge?.days.find((d) => d.dayNumber === nextDayNumber) ||
    activeChallenge?.days[0];

  // Count how many members checked in today
  const todayStr = getLocalDateString(new Date());
  const checkedInTodayCount = state.checkIns.filter((c) => c.date === todayStr).length;

  // Retrieve user's own historical Progress Reflections
  const progressReflections = useMemo(() => {
    return getProgressReflectionsForUser(
      currentUser.id,
      state.checkIns,
      state.posts,
      todayStr
    );
  }, [currentUser.id, state.checkIns, state.posts, todayStr]);

  // 7-mark week strip for past 7 days
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = getLocalDateString(d);
    const dayCheckIn = state.checkIns.find(
      (c) => c.userId === currentUser.id && c.date === dateStr
    );
    const dayLetter = ["S", "M", "T", "W", "T", "F", "S"][d.getDay()];
    const isToday = i === 6;

    return {
      dateStr,
      dayLetter,
      checkIn: dayCheckIn,
      isToday,
    };
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-150">
      {/* 7-Mark Week Rhythm Strip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)]">
        <div className="flex items-center justify-between mb-3 text-xs font-semibold text-[var(--subtle)]">
          <div className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
            <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>This Week&apos;s Rhythm</span>
          </div>
          <div className="flex items-center gap-1 text-[var(--accent)] font-semibold text-xs">
            <Flame className="w-3.5 h-3.5 text-[var(--highlight)]" />
            <span>{userStreak}d Streak</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {past7Days.map((item, index) => {
            const hasCheckIn = Boolean(item.checkIn);
            const moodColor = item.checkIn
              ? MOOD_SCALE[item.checkIn.moodScore].color
              : undefined;

            return (
              <div key={index} className="flex flex-col items-center">
                <span className="text-[11px] text-[var(--subtle)] mb-1.5 font-medium">
                  {item.dayLetter}
                </span>
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm transition-all ${
                    item.isToday ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--surface)] scale-105" : ""
                  }`}
                  style={{
                    backgroundColor: hasCheckIn ? moodColor : "var(--subtle-surface)",
                    color: hasCheckIn ? "#FFFFFF" : "var(--subtle)",
                    border: hasCheckIn ? "none" : "1.5px dashed var(--border)",
                  }}
                  title={
                    item.checkIn
                      ? `${item.dateStr}: ${MOOD_SCALE[item.checkIn.moodScore].word}`
                      : `${item.dateStr}: No check-in`
                  }
                >
                  {item.checkIn ? (
                    <span className="text-xs">{MOOD_SCALE[item.checkIn.moodScore].emoji}</span>
                  ) : (
                    <span className="text-[10px] opacity-40">·</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Challenge Main Card */}
      <section className="bg-[var(--surface)] rounded-[20px] p-6 sm:p-8 shadow-[var(--card-shadow)] border border-[var(--border)] space-y-6">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--subtle)] py-1 px-3 bg-[var(--subtle-surface)] rounded-full">
            Challenge: {activeChallenge?.title || "Daily Presence"}
          </span>
          <span className="text-xs text-[var(--accent)] font-semibold">
            Day {nextDayNumber} of {totalChallengeDays}
          </span>
        </div>

        {!todayCheckIn ? (
          /* UNCOMPLETED STATE */
          <div className="space-y-6">
            <h3 className="text-2xl sm:text-3xl font-serif text-[var(--text)] leading-snug">
              &ldquo;{currentDayAction?.oneMinuteAction}&rdquo;
            </h3>
            
            <p className="text-[var(--muted)] text-sm sm:text-base leading-relaxed">
              This small act of attention anchors you to the here and now, silencing the noise of the past and future.
            </p>

            <button
              onClick={() => onOpenCheckIn()}
              className="w-full bg-[var(--accent)] text-white font-bold py-4 rounded-xl hover:bg-[var(--accent-hover)] transition-shadow shadow-lg shadow-[#4D8B63]/20 flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              <span>Start Check-in</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* COMPLETED STATE */
          <div className="space-y-5">
            <div className="flex items-center gap-3 text-[var(--accent)] bg-[var(--subtle-surface)] p-4 rounded-xl border border-[var(--border)]">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="text-sm font-semibold">
                You completed today&apos;s check-in for Day {todayCheckIn.dayNumber}.
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--subtle-surface)] border border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--subtle)]">
                <span className="uppercase tracking-wider font-semibold text-[10px]">Your Discovery</span>
                <div className="flex items-center gap-1.5 font-medium text-[var(--text)]">
                  <span className="text-base">
                    {MOOD_SCALE[todayCheckIn.moodScore].emoji}
                  </span>
                  <span className="text-xs font-semibold">{MOOD_SCALE[todayCheckIn.moodScore].word}</span>
                </div>
              </div>

              <p className="font-serif italic text-base text-[var(--text)] leading-relaxed">
                &ldquo;{todayCheckIn.discovery}&rdquo;
              </p>

              {todayCheckIn.seenByCoach && (
                <div className="pt-2 border-t border-[var(--border)] text-xs text-[var(--accent)] flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Asha read this reflection</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => onOpenShareCard(todayCheckIn)}
                className="flex-1 py-3 px-4 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center gap-2 text-sm shadow-xs cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Status Card</span>
              </button>

              <button
                onClick={() => onOpenEditCheckIn(todayCheckIn)}
                className="py-3 px-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] font-semibold hover:bg-[var(--subtle-surface)] transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-[var(--muted)]" />
                <span>Edit Reflection</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Progress Reflections from User's Past Journey (1 week, 1 month, 3 months) */}
      {progressReflections.length > 0 && (
        <ProgressReflectionCard
          reflections={progressReflections}
          onOpenReset={onOpenReset}
          onOpenShareCard={onOpenShareCard}
        />
      )}

      {/* 60s Overwhelm Secondary Action Button */}
      <button
        onClick={() => onOpenReset()}
        className="flex items-center justify-center gap-3 w-full py-4 bg-transparent border-2 border-[var(--border)] rounded-2xl text-[var(--subtle)] font-medium hover:bg-[var(--surface)] hover:text-[var(--text)] transition-all cursor-pointer shadow-xs"
      >
        <Sparkles className="w-5 h-5 text-[var(--highlight)]" />
        <span>Feeling overwhelmed? Take a 60s pause</span>
      </button>

      {/* Community Activity Footer Snippet */}
      <div className="flex items-center justify-between text-xs text-[var(--subtle)] pt-2 px-1">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            <div className="w-6 h-6 rounded-full border-2 border-[var(--surface)] bg-[#E8B98A]"></div>
            <div className="w-6 h-6 rounded-full border-2 border-[var(--surface)] bg-[#8FB8A8]"></div>
            <div className="w-6 h-6 rounded-full border-2 border-[var(--surface)] bg-[#C9C08A]"></div>
          </div>
          <p>
            <strong className="font-bold text-[var(--text)]">{checkedInTodayCount} members</strong> checked in today
          </p>
        </div>
        <p className="text-[11px] text-[var(--subtle)]">© 2026 Saathi Collective</p>
      </div>
    </div>
  );
};
