import React, { useState, useMemo } from "react";
import {
  Flame,
  Trophy,
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
  X,
  Play,
  Share2,
  Palette,
  Check,
  Edit3,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { THEME_COLOR_PALETTES, ThemeColorId } from "../data/themeColors";
import { MOOD_SCALE, MoodScore, CheckIn, SavedMeditation } from "../types";
import { getLocalDateString } from "../utils/helpers";
import { EditPersonaModal } from "../components/EditPersonaModal";
import { CoachInviteModal } from "../components/CoachInviteModal";
import { getProgressReflectionsForUser } from "../utils/progressReflections";
import { ProgressReflectionCard } from "../components/ProgressReflectionCard";

interface MeViewProps {
  onOpenShareCard: (checkIn: CheckIn) => void;
  onOpenThemeModal?: () => void;
}

export const MeView: React.FC<MeViewProps> = ({
  onOpenShareCard,
  onOpenThemeModal,
}) => {
  const { currentUser, state, userStreak, theme, themeColor, setThemeColor } = useApp();

  // State for modals
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isCoachInviteOpen, setIsCoachInviteOpen] = useState(false);

  // State for day bead selection (Detail panel BELOW grid, Rule A9 #12)
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Weekly letter state
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [weeklyLetter, setWeeklyLetter] = useState<string | null>(null);
  const [showLetterModal, setShowLetterModal] = useState(false);

  // Expandable sections
  const [showAllCheckIns, setShowAllCheckIns] = useState(false);
  const [activeMeditation, setActiveMeditation] = useState<SavedMeditation | null>(null);

  // Member's all checkins
  const userCheckIns = state.checkIns
    .filter((c) => c.userId === currentUser.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Retrieve user's own historical Progress Reflections
  const progressReflections = useMemo(() => {
    return getProgressReflectionsForUser(
      currentUser.id,
      state.checkIns,
      state.posts,
      getLocalDateString(new Date())
    );
  }, [currentUser.id, state.checkIns, state.posts]);

  // Build a 4-week (28-day) bead grid: 7 rows (Sun to Sat) x 4 columns (weeks)
  const today = new Date();
  const dayBeadsGrid: { dateStr: string; dayIndex: number; checkIn?: CheckIn }[] = [];

  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(d);
    const checkIn = userCheckIns.find((c) => c.date === dateStr);
    dayBeadsGrid.push({
      dateStr,
      dayIndex: d.getDay(),
      checkIn,
    });
  }

  // Selected check-in object
  const selectedCheckIn = userCheckIns.find((c) => c.date === selectedDateStr);

  // Generate weekly letter from Gemini
  const handleGenerateWeeklyLetter = async () => {
    setIsGeneratingLetter(true);
    setShowLetterModal(true);

    try {
      const recentCheckIns = userCheckIns.slice(0, 7);
      const res = await fetch("/api/gemini/weekly-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkIns: recentCheckIns,
          memberName: currentUser.name.split(" ")[0],
        }),
      });

      if (!res.ok) throw new Error("Weekly letter failed");
      const data = await res.json();
      setWeeklyLetter(data.letter || "You have practiced with deep honesty this week.");
    } catch (err) {
      console.error(err);
      setWeeklyLetter(
        `Dear ${currentUser.name.split(" ")[0]},\n\nLooking back over your reflections this week, there is a clear and steady rhythm emerging in how you meet each day. You noted discovering the quiet in between tasks and giving yourself space to pause.\n\nNotice the shift: from rushing straight through the morning tension to taking sixty seconds to notice where you are. That subtle pause is where steady confidence is born.\n\nKeep grounding yourself in these micro-moments.\n\nWarmly,\nAsha`
      );
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Profile Header & Stats */}
      <div className="p-6 rounded-[24px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.photo}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-accent shadow-xs shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-serif text-[var(--text)]">
                  {currentUser.name}
                </h2>
                {currentUser.role === "coach" && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                    Coach
                  </span>
                )}
              </div>
              <div className="text-xs text-[var(--muted)] mt-0.5">
                Saathi Community · Practicing since {currentUser.joinDate}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="py-2 px-3.5 rounded-xl border border-[var(--border)] bg-[var(--subtle-surface)] hover:bg-[var(--surface)] text-[var(--text)] text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-accent" />
              <span>{currentUser.role === "coach" ? "Edit Persona" : "Edit Profile"}</span>
            </button>

            {currentUser.role === "coach" && (
              <button
                onClick={() => setIsCoachInviteOpen(true)}
                className="py-2 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Generate Shareable Link</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Metric Tiles */}
        <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[var(--border)]">
          <div className="p-3 rounded-2xl bg-[var(--subtle-surface)] text-center">
            <div className="text-[11px] text-[var(--muted)] flex items-center justify-center gap-1 mb-1">
              <Flame className="w-3.5 h-3.5 text-[var(--highlight)]" /> Streak
            </div>
            <div className="text-2xl font-serif font-bold text-[var(--highlight)] tnum">
              {userStreak}d
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[var(--subtle-surface)] text-center">
            <div className="text-[11px] text-[var(--muted)] flex items-center justify-center gap-1 mb-1">
              <Award className="w-3.5 h-3.5 text-[var(--accent)]" /> Longest
            </div>
            <div className="text-2xl font-serif font-bold text-[var(--text)] tnum">
              {currentUser.longestStreak}d
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[var(--subtle-surface)] text-center">
            <div className="text-[11px] text-[var(--muted)] flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> Points
            </div>
            <div className="text-2xl font-serif font-bold text-[var(--accent)] tnum">
              {currentUser.totalPoints}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Reflections from User's Past Journey (1 week, 1 month, 3 months) */}
      {progressReflections.length > 0 && (
        <ProgressReflectionCard
          reflections={progressReflections}
          onOpenShareCard={onOpenShareCard}
        />
      )}

      {/* "Your Last Few Weeks" Bead Grid (Rule A5 & Rule A9 #12) */}
      <div className="p-6 rounded-[24px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg text-[var(--text)]">
              Your Last Few Weeks
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Each bead represents a day. Tap any day to inspect your reflection below.
            </p>
          </div>
          <Calendar className="w-4 h-4 text-[var(--accent)]" />
        </div>

        {/* 28-day bead grid */}
        <div className="pt-2">
          <div className="grid grid-cols-7 gap-2.5 sm:gap-3 max-w-sm mx-auto">
            {["S", "M", "T", "W", "T", "F", "S"].map((l, i) => (
              <span key={i} className="text-center text-[10px] font-semibold text-[var(--muted)]">
                {l}
              </span>
            ))}

            {dayBeadsGrid.map((bead, i) => {
              const isSelected = selectedDateStr === bead.dateStr;
              const hasCheckIn = Boolean(bead.checkIn);
              const color = bead.checkIn
                ? MOOD_SCALE[bead.checkIn.moodScore].color
                : "transparent";

              return (
                <button
                  key={i}
                  onClick={() =>
                    setSelectedDateStr(isSelected ? null : bead.dateStr)
                  }
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs transition-all ${
                    isSelected
                      ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--surface)] scale-110"
                      : ""
                  }`}
                  style={{
                    backgroundColor: color,
                    border: hasCheckIn
                      ? "none"
                      : "1px dashed var(--border)",
                  }}
                  title={`${bead.dateStr}: ${
                    bead.checkIn
                      ? MOOD_SCALE[bead.checkIn.moodScore].word
                      : "No check-in"
                  }`}
                >
                  {bead.checkIn ? (
                    <span className="text-[11px] drop-shadow-xs">
                      {MOOD_SCALE[bead.checkIn.moodScore].emoji}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* DETAIL PANEL BELOW GRID (Rule A9 #12: Never a floating popover) */}
        {selectedDateStr && (
          <div className="p-4 rounded-2xl bg-[var(--subtle-surface)] border border-[var(--border)] mt-4 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <div className="text-xs font-semibold text-[var(--text)]">
                Reflection for {selectedDateStr}
              </div>
              <button
                onClick={() => setSelectedDateStr(null)}
                className="text-xs text-[var(--muted)] hover:text-[var(--text)]"
              >
                Close
              </button>
            </div>

            {selectedCheckIn ? (
              <div className="space-y-3">
                {/* Mood Scale labeled Heavy and Bright at ends with no numbers/legend */}
                <div>
                  <div className="flex justify-between text-[11px] text-[var(--muted)] font-medium mb-1">
                    <span>Heavy</span>
                    <span className="font-semibold text-[var(--text)]">
                      {MOOD_SCALE[selectedCheckIn.moodScore].emoji}{" "}
                      {MOOD_SCALE[selectedCheckIn.moodScore].word}
                    </span>
                    <span>Bright</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden flex">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(selectedCheckIn.moodScore / 5) * 100}%`,
                        backgroundColor:
                          MOOD_SCALE[selectedCheckIn.moodScore].color,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs text-[var(--muted)]">Discovery:</div>
                  <p className="font-serif italic text-sm text-[var(--text)] leading-relaxed bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)]">
                    &ldquo;{selectedCheckIn.discovery}&rdquo;
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-[var(--accent)] font-medium">
                    +{selectedCheckIn.pointsAwarded} points awarded
                  </span>
                  <button
                    onClick={() => onOpenShareCard(selectedCheckIn)}
                    className="text-xs text-[var(--text)] hover:text-[var(--accent)] flex items-center gap-1 font-medium"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Card</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[var(--muted)] py-2">
                No check-in recorded for this calendar day.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Appearance & Theme Colors Palette */}
      <div className="p-6 rounded-[24px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--subtle-surface)] text-[var(--accent)]">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-[var(--text)]">
                Theme & Color Palette
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Choose the aesthetic mood for your daily practice
              </p>
            </div>
          </div>

          {onOpenThemeModal && (
            <button
              onClick={onOpenThemeModal}
              className="text-xs text-[var(--accent)] hover:underline font-semibold cursor-pointer"
            >
              Customize
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {THEME_COLOR_PALETTES.map((palette) => {
            const isSelected = (themeColor || "sage") === palette.id;
            const activeAccent =
              theme === "dark" ? palette.dark.accent : palette.light.accent;
            const activeHighlight =
              theme === "dark" ? palette.dark.highlight : palette.light.highlight;

            return (
              <button
                key={palette.id}
                onClick={() => setThemeColor(palette.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 relative ${
                  isSelected
                    ? "border-[var(--accent)] bg-[var(--subtle-surface)] ring-2 ring-[var(--accent)]/20 shadow-xs"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--subtle-card)]"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 p-1 rounded-full bg-[var(--surface)] border border-[var(--border)]">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-xs"
                      style={{ backgroundColor: activeAccent }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-xs"
                      style={{ backgroundColor: activeHighlight }}
                    />
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-[var(--text)] truncate">
                    {palette.name}
                  </div>
                  <div className="text-[10px] text-[var(--muted)] truncate">
                    {palette.subtitle.split("with")[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* "A Letter About Your Week" (Rule A5) */}
      <div className="p-6 rounded-[24px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-serif text-lg text-[var(--text)]">
            A Letter About Your Week
          </h3>
          <p className="text-xs text-[var(--muted)] max-w-sm leading-relaxed">
            Asha reviews your reflections from the past 7 days, quotes your discoveries, and notes the quiet shifts.
          </p>
        </div>

        <button
          onClick={handleGenerateWeeklyLetter}
          className="py-3 px-5 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors text-sm shrink-0 flex items-center gap-2 shadow-xs"
        >
          <Sparkles className="w-4 h-4" />
          <span>Read Weekly Letter</span>
        </button>
      </div>

      {/* Saved Meditations Replay */}
      {state.savedMeditations.filter((m) => m.userId === currentUser.id).length > 0 && (
        <div className="p-6 rounded-[24px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)] space-y-4">
          <h3 className="font-serif text-lg text-[var(--text)]">
            Saved 3-Minute Meditations
          </h3>
          <div className="space-y-2">
            {state.savedMeditations
              .filter((m) => m.userId === currentUser.id)
              .map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 rounded-xl bg-[var(--subtle-surface)] border border-[var(--border)] flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-medium text-[var(--text)]">
                      {med.title}
                    </div>
                    <div className="text-xs text-[var(--muted)] mt-0.5">
                      For: &ldquo;{med.situation}&rdquo; · {med.createdAt}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveMeditation(med)}
                    className="p-2 rounded-lg bg-[var(--accent-light)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors"
                    aria-label={`Replay ${med.title}`}
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Past Reflections List (Expandable) */}
      <div className="p-6 rounded-[24px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)] space-y-4">
        <button
          onClick={() => setShowAllCheckIns(!showAllCheckIns)}
          className="w-full flex items-center justify-between text-left"
        >
          <div>
            <h3 className="font-serif text-lg text-[var(--text)]">
              Everything You Have Written
            </h3>
            <p className="text-xs text-[var(--muted)]">
              {userCheckIns.length} recorded daily check-ins
            </p>
          </div>
          {showAllCheckIns ? (
            <ChevronUp className="w-5 h-5 text-[var(--muted)]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[var(--muted)]" />
          )}
        </button>

        {showAllCheckIns && (
          <div className="space-y-3 pt-2 border-t border-[var(--border)] animate-in fade-in duration-150">
            {userCheckIns.map((checkIn) => (
              <div
                key={checkIn.id}
                className="p-4 rounded-xl bg-[var(--subtle-surface)] border border-[var(--border)] space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                  <span>Day {checkIn.dayNumber} · {checkIn.date}</span>
                  <div className="flex items-center gap-1">
                    <span>{MOOD_SCALE[checkIn.moodScore].emoji}</span>
                    <span className="font-medium text-[var(--text)]">
                      {MOOD_SCALE[checkIn.moodScore].word}
                    </span>
                  </div>
                </div>
                <p className="font-serif italic text-sm text-[var(--text)] leading-relaxed">
                  &ldquo;{checkIn.discovery}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Letter Reading Modal */}
      {showLetterModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="letter-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
        >
          <div className="w-full max-w-xl my-auto bg-[var(--surface)] text-[var(--text)] rounded-[24px] p-6 sm:p-8 shadow-2xl border border-[var(--border)] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowLetterModal(false)}
              aria-label="Close weekly letter"
              className="absolute top-5 right-5 p-2 text-[var(--muted)] hover:text-[var(--text)] rounded-full hover:bg-[var(--subtle-surface)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[var(--accent)] mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Weekly Reflection Synthesis
              </span>
            </div>

            <h3 id="letter-title" className="text-2xl font-serif text-[var(--text)] mb-6">
              A Note On Your Week
            </h3>

            {isGeneratingLetter ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin mx-auto" />
                <p className="text-sm text-[var(--muted)]">
                  Asha is reviewing your reflections and writing your letter...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-[var(--subtle-surface)] border border-[var(--border)] font-serif text-[17px] leading-[1.8] text-[var(--text)] whitespace-pre-wrap">
                  {weeklyLetter}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowLetterModal(false)}
                    className="py-2.5 px-6 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved Meditation Player Modal */}
      {activeMeditation && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Meditation player"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-[var(--surface)] text-[var(--text)] rounded-[24px] p-6 shadow-2xl border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h4 className="font-serif text-lg font-medium">{activeMeditation.title}</h4>
              <button
                onClick={() => setActiveMeditation(null)}
                className="p-1.5 text-[var(--muted)] hover:text-[var(--text)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[var(--muted)] italic">
              &ldquo;{activeMeditation.situation}&rdquo;
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {activeMeditation.script.map((line, idx) => (
                <p key={idx} className="text-sm font-serif text-[var(--text)] leading-relaxed">
                  {line.replace(/\[pause.*?\]/gi, "")}
                </p>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  if ("speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                    const fullText = activeMeditation.script
                      .map((l) => l.replace(/\[pause.*?\]/gi, ""))
                      .join(" ");
                    const utt = new SpeechSynthesisUtterance(fullText);
                    utt.rate = 0.85;
                    window.speechSynthesis.speak(utt);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>Play Guided Audio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <EditPersonaModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        personaUser={currentUser}
      />

      <CoachInviteModal
        isOpen={isCoachInviteOpen}
        onClose={() => setIsCoachInviteOpen(false)}
      />
    </div>
  );
};
