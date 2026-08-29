import React, { useState } from "react";
import {
  Sparkles,
  Heart,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  ArrowRight,
  Share2,
  Wind,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { ProgressReflectionItem, MoodScore, MOOD_SCALE, CheckIn } from "../types";
import { useApp } from "../context/AppContext";

interface ProgressReflectionCardProps {
  reflections: ProgressReflectionItem[];
  onOpenReset?: () => void;
  onOpenShareCard?: (checkIn: CheckIn) => void;
  className?: string;
}

export const ProgressReflectionCard: React.FC<ProgressReflectionCardProps> = ({
  reflections,
  onOpenReset,
  onOpenShareCard,
  className = "",
}) => {
  const { currentUser, state } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isBreathingPause, setIsBreathingPause] = useState(false);

  if (!reflections || reflections.length === 0 || isDismissed) {
    return null;
  }

  const currentReflection = reflections[Math.min(currentIndex, reflections.length - 1)];
  const hasMultiple = reflections.length > 1;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reflections.length);
    setIsBreathingPause(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reflections.length) % reflections.length);
    setIsBreathingPause(false);
  };

  // Find corresponding check-in if user wants to share
  const matchingCheckIn =
    currentReflection.type === "checkin"
      ? state.checkIns.find((c) => c.id === currentReflection.sourceId)
      : undefined;

  return (
    <section
      className={`relative overflow-hidden rounded-[24px] bg-gradient-to-b from-[var(--surface)] to-[var(--subtle-surface)] border border-[var(--border)] shadow-[var(--card-shadow)] p-6 sm:p-7 space-y-5 transition-all animate-in fade-in duration-200 ${className}`}
      aria-label="Progress Reflection from your past journey"
    >
      {/* Decorative subtle ambient spiritual glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-[var(--highlight)]/5 rounded-full blur-2xl pointer-events-none -ml-12 -mb-12" />

      {/* Header bar */}
      <div className="relative flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--highlight-light)] text-[var(--highlight)] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-semibold text-sm sm:text-base text-[var(--text)]">
                Echo from Your Journey
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                {currentReflection.timeAgoLabel}
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted)] flex items-center gap-1.5 mt-0.5">
              <Lock className="w-3 h-3 text-accent shrink-0" />
              <span>Private reflection from your personal archive</span>
            </p>
          </div>
        </div>

        {/* Carousel controls & Dismiss button */}
        <div className="flex items-center gap-1.5">
          {hasMultiple && (
            <div className="flex items-center gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-full px-1.5 py-0.5 text-xs text-[var(--muted)] mr-1">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous past reflection"
                className="p-1 rounded-full hover:bg-[var(--subtle-surface)] text-[var(--text)] transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] px-1 font-medium">
                {currentIndex + 1} of {reflections.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next past reflection"
                className="p-1 rounded-full hover:bg-[var(--subtle-surface)] text-[var(--text)] transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            title="Dismiss for now"
            className="p-1.5 rounded-full text-[var(--subtle)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Quote / Resurfaced Content */}
      <div className="relative p-5 sm:p-6 rounded-2xl bg-[var(--surface)]/90 backdrop-blur-xs border border-[var(--border)]/90 space-y-3.5">
        <div className="flex items-center justify-between text-xs text-[var(--subtle)]">
          <span className="font-serif italic text-accent font-medium text-xs sm:text-sm">
            {currentReflection.milestoneTitle}
          </span>
          <div className="flex items-center gap-2">
            {currentReflection.moodScore && MOOD_SCALE[currentReflection.moodScore] && (
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--subtle-surface)] border border-[var(--border)] text-[var(--text)]"
                title={`Recorded mood: ${MOOD_SCALE[currentReflection.moodScore].word}`}
              >
                <span>{MOOD_SCALE[currentReflection.moodScore].emoji}</span>
                <span>{MOOD_SCALE[currentReflection.moodScore].word}</span>
              </span>
            )}
            <span className="text-[11px] text-[var(--subtle)] font-medium">
              {new Date(currentReflection.date).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* The Reflection Quote */}
        <p className="font-serif text-base sm:text-lg text-[var(--text)] leading-relaxed italic">
          &ldquo;{currentReflection.text}&rdquo;
        </p>

        {/* Secondary Context (e.g. before/after state or attached photo) */}
        {currentReflection.secondaryText && (
          <div className="text-xs text-[var(--muted)] pt-1 border-t border-[var(--border)]/60 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[var(--subtle-surface)] text-[var(--subtle)]">
              State
            </span>
            <span className="italic">{currentReflection.secondaryText}</span>
          </div>
        )}

        {/* If community post had images */}
        {currentReflection.images && currentReflection.images.length > 0 && (
          <div className="pt-2 flex items-center gap-2 overflow-x-auto">
            {currentReflection.images.map((imgUrl, i) => (
              <img
                key={i}
                src={imgUrl}
                alt="Past memory"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[var(--border)] shadow-xs"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
        )}
      </div>

      {/* Grounding Affirmation & Inquiries */}
      <div className="relative flex items-start gap-2.5 p-3.5 rounded-xl bg-accent/10 border border-accent/20">
        <Compass className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-serif leading-relaxed">
          {currentReflection.affirmationPrompt}
        </p>
      </div>

      {/* Gentle Breathing Micro-Moment inline toggle */}
      {isBreathingPause && (
        <div className="p-4 rounded-xl bg-[var(--subtle-surface)] border border-[var(--border)] space-y-3 text-center animate-in fade-in">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider">
            <Wind className="w-4 h-4 animate-pulse" />
            <span>Unhurried Grounding Breath</span>
          </div>
          <p className="text-xs text-[var(--text)] font-serif italic max-w-md mx-auto">
            Breathe in for 4 counts, holding reverence for who you were... exhale for 6 counts, releasing what you no longer carry.
          </p>
          <button
            type="button"
            onClick={() => setIsBreathingPause(false)}
            className="text-[11px] font-medium text-accent hover:underline"
          >
            Finished pause
          </button>
        </div>
      )}

      {/* Action footer */}
      <div className="relative flex items-center justify-between gap-3 pt-1 text-xs">
        <div className="flex items-center gap-2">
          {!isBreathingPause && (
            <button
              type="button"
              onClick={() => setIsBreathingPause(true)}
              className="py-2 px-3.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--subtle-surface)] border border-[var(--border)] text-[var(--text)] font-medium text-xs flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Wind className="w-3.5 h-3.5 text-accent" />
              <span>Honor with 1 Breath</span>
            </button>
          )}

          {matchingCheckIn && onOpenShareCard && (
            <button
              type="button"
              onClick={() => onOpenShareCard(matchingCheckIn)}
              className="py-2 px-3.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--subtle-surface)] border border-[var(--border)] text-[var(--text)] font-medium text-xs flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5 text-accent" />
              <span>Create Share Card</span>
            </button>
          )}
        </div>

        {hasMultiple && (
          <button
            type="button"
            onClick={handleNext}
            className="text-xs text-accent hover:underline font-medium flex items-center gap-1"
          >
            <span>Next past memory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </section>
  );
};
