import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Mic,
  MicOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Share2,
  Check,
  Flame,
} from "lucide-react";
import confetti from "canvas-confetti";
import { MOOD_SCALE, MoodScore, CheckIn, Challenge } from "../types";
import { useApp } from "../context/AppContext";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCheckIn?: CheckIn;
  challenge?: Challenge;
  dayNumber: number;
  onOpenShareCard: (checkIn: CheckIn) => void;
  onOpenReset: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  existingCheckIn,
  challenge,
  dayNumber,
  onOpenShareCard,
  onOpenReset,
}) => {
  const { submitCheckIn, userStreak } = useApp();

  // Form State
  const [step, setStep] = useState<1 | 2 | 3 | "gentle" | "celebrate">(1);
  const [moodBefore, setMoodBefore] = useState<MoodScore>(3);
  const [feelingBeforeWords, setFeelingBeforeWords] = useState("");
  const [discovery, setDiscovery] = useState("");
  const [moodNow, setMoodNow] = useState<MoodScore>(4);
  const [feelingNowWords, setFeelingNowWords] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedCheckInResult, setSavedCheckInResult] = useState<CheckIn | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // Animated points count up state
  const [displayPoints, setDisplayPoints] = useState(0);

  // Rule A9 #15: A modal's reset effect must depend on the open transition only!
  const prevIsOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      if (existingCheckIn) {
        setMoodBefore(existingCheckIn.moodScore || 3);
        setFeelingBeforeWords(existingCheckIn.feelingBefore || "");
        setDiscovery(existingCheckIn.discovery || "");
        setMoodNow(existingCheckIn.moodScore || 4);
        setFeelingNowWords(existingCheckIn.feelingNow || "");
      } else {
        setMoodBefore(3);
        setFeelingBeforeWords("");
        setDiscovery("");
        setMoodNow(4);
        setFeelingNowWords("");
      }
      setStep(1);
      setSavedCheckInResult(null);
      setPointsAwarded(0);
      setDisplayPoints(0);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, existingCheckIn]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Points counter effect on celebrate step
  useEffect(() => {
    if (step === "celebrate" && pointsAwarded > 0) {
      let current = 0;
      const stepValue = Math.max(1, Math.floor(pointsAwarded / 20));
      const timer = setInterval(() => {
        current += stepValue;
        if (current >= pointsAwarded) {
          setDisplayPoints(pointsAwarded);
          clearInterval(timer);
        } else {
          setDisplayPoints(current);
        }
      }, 35);

      // Trigger soft celebratory confetti
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#4D8B63", "#E8956B", "#E8B98A", "#8FB8A8"],
        });
      } catch {}

      return () => clearInterval(timer);
    }
  }, [step, pointsAwarded]);

  // Speech Recognition transcription
  const toggleSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onstart = () => setIsVoiceListening(true);
    recognition.onend = () => setIsVoiceListening(false);
    recognition.onerror = () => setIsVoiceListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDiscovery((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  const handleStep3Next = async () => {
    // If moodNow is 1 or 2, show gentle reset offer first
    if ((moodNow === 1 || moodNow === 2) && !existingCheckIn) {
      setStep("gentle");
      return;
    }

    await performSave();
  };

  const performSave = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitCheckIn({
        feelingBefore: feelingBeforeWords || MOOD_SCALE[moodBefore].word,
        discovery: discovery.trim() || "Paused for 60 seconds to find steady ground.",
        feelingNow: feelingNowWords || MOOD_SCALE[moodNow].word,
        moodScore: moodNow,
        isEdit: Boolean(existingCheckIn),
      });

      if ("flagged" in result) {
        onClose();
        return;
      }

      setSavedCheckInResult(result.checkIn);
      setPointsAwarded(result.pointsAwarded);
      setStep("celebrate");
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentDayChallenge =
    challenge?.days.find((d) => d.dayNumber === dayNumber) || challenge?.days[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkin-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto"
    >
      <div className="w-full max-w-lg my-auto bg-[var(--surface)] text-[var(--text)] rounded-[24px] p-6 shadow-[var(--card-shadow-lg)] border border-[var(--border)] relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
              Day {dayNumber} of {challenge?.days.length || 7}
            </span>
            <span className="text-xs text-[var(--muted)]">·</span>
            <span className="text-xs text-[var(--muted)] truncate max-w-[200px]">
              {challenge?.title}
            </span>
          </div>
          <button
            onClick={() => onClose()}
            aria-label="Close check-in"
            className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] rounded-full hover:bg-[var(--subtle-surface)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress bar */}
        {step !== "celebrate" && step !== "gentle" && (
          <div className="flex items-center gap-1.5 mb-6">
            <div
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                step >= 1 ? "bg-[var(--accent)]" : "bg-[var(--border)]"
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                step >= 2 ? "bg-[var(--accent)]" : "bg-[var(--border)]"
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                step >= 3 ? "bg-[var(--accent)]" : "bg-[var(--border)]"
              }`}
            />
          </div>
        )}

        {/* STEP 1: Feeling before */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[var(--muted)]">Step 1 of 3</span>
              <h3
                id="checkin-modal-title"
                className="text-2xl font-serif text-[var(--text)]"
              >
                How were you feeling before you started today?
              </h3>
            </div>

            {/* Weather Mood Selector */}
            <div className="grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as MoodScore[]).map((score) => {
                const m = MOOD_SCALE[score];
                const isSelected = moodBefore === score;
                return (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setMoodBefore(score)}
                    className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent-light)] scale-105 shadow-xs"
                        : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--subtle-surface)]"
                    }`}
                  >
                    <span className="text-3xl">{m.emoji}</span>
                    <span className="text-xs font-medium text-[var(--text)] mt-1.5">
                      {m.word}
                    </span>
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={feelingBeforeWords}
              onChange={(e) => setFeelingBeforeWords(e.target.value)}
              placeholder="Optional: words describing what was going on..."
              className="w-full p-3.5 rounded-xl bg-[var(--subtle-surface)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--subtle)] text-[16px] focus:border-[var(--accent)]"
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 py-3 px-6 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Discovery */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[var(--muted)]">Step 2 of 3</span>
              <h3 className="text-2xl font-serif text-[var(--text)]">
                What did you discover?
              </h3>
              {currentDayChallenge && (
                <div className="p-3 rounded-xl bg-[var(--subtle-surface)] border border-[var(--border)] text-xs text-[var(--muted)] leading-relaxed">
                  <span className="font-semibold text-[var(--text)]">Today&apos;s action:</span>{" "}
                  {currentDayChallenge.oneMinuteAction}
                </div>
              )}
            </div>

            <div className="relative">
              <textarea
                autoFocus
                value={discovery}
                onChange={(e) => setDiscovery(e.target.value)}
                placeholder="What did you notice during your 60-second pause?"
                rows={4}
                className="w-full p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--subtle)] text-[16px] focus:border-[var(--accent)] resize-none"
              />
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                aria-label={isVoiceListening ? "Stop speech dictation" : "Dictate speech"}
                className={`absolute bottom-3 right-3 p-2.5 rounded-xl border transition-colors ${
                  isVoiceListening
                    ? "bg-red-500 text-white border-red-600 animate-pulse"
                    : "bg-[var(--subtle-surface)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]"
                }`}
              >
                {isVoiceListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 py-2.5 px-4 text-sm text-[var(--muted)] hover:text-[var(--text)]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 py-3 px-6 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Feeling Now */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[var(--muted)]">Step 3 of 3</span>
              <h3 className="text-2xl font-serif text-[var(--text)]">
                How are you feeling now?
              </h3>
            </div>

            {/* Weather Mood Selector */}
            <div className="grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as MoodScore[]).map((score) => {
                const m = MOOD_SCALE[score];
                const isSelected = moodNow === score;
                return (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setMoodNow(score)}
                    className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent-light)] scale-105 shadow-xs"
                        : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--subtle-surface)]"
                    }`}
                  >
                    <span className="text-3xl">{m.emoji}</span>
                    <span className="text-xs font-medium text-[var(--text)] mt-1.5">
                      {m.word}
                    </span>
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={feelingNowWords}
              onChange={(e) => setFeelingNowWords(e.target.value)}
              placeholder="Optional: words describing how you feel now..."
              className="w-full p-3.5 rounded-xl bg-[var(--subtle-surface)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--subtle)] text-[16px] focus:border-[var(--accent)]"
            />

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 py-2.5 px-4 text-sm text-[var(--muted)] hover:text-[var(--text)]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={handleStep3Next}
                disabled={isSubmitting}
                className="flex items-center gap-2 py-3 px-6 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
              >
                <span>{isSubmitting ? "Saving..." : "Complete Check-in"}</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* GENTLE SCREEN (Only for Mood 1 or 2 on Step 3) */}
        {step === "gentle" && (
          <div className="space-y-6 text-center py-4 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-[#7FA3C4]/15 text-[#7FA3C4] flex items-center justify-center text-3xl mx-auto">
              🌧️
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif text-[var(--text)]">
                That sounds heavy. Sixty seconds?
              </h3>
              <p className="text-[16px] text-[var(--muted)] max-w-xs mx-auto">
                Would you like to try a 60-second breathing pause before wrapping up?
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => {
                  performSave();
                  onOpenReset();
                }}
                className="py-3 px-6 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
              >
                Yes, open 60-second pause
              </button>
              <button
                onClick={performSave}
                className="py-2.5 text-sm text-[var(--muted)] hover:text-[var(--text)]"
              >
                No thanks, just save it
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Celebration Screen */}
        {step === "celebrate" && (
          <div className="space-y-6 text-center py-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-3xl font-serif text-[var(--text)]">
                Check-in Complete
              </h3>
              <p className="text-sm text-[var(--muted)]">
                Day {dayNumber} of {challenge?.title}
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
              <div className="p-4 rounded-2xl bg-[var(--subtle-surface)] border border-[var(--border)]">
                <div className="text-xs text-[var(--muted)] mb-1">Points Earned</div>
                <div className="text-3xl font-serif font-bold text-[var(--accent)] tnum">
                  +{displayPoints}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--subtle-surface)] border border-[var(--border)]">
                <div className="text-xs text-[var(--muted)] mb-1 flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[var(--highlight)]" /> Streak
                </div>
                <div className="text-3xl font-serif font-bold text-[var(--highlight)] tnum">
                  {userStreak} {userStreak === 1 ? "day" : "days"}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {savedCheckInResult && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenShareCard(savedCheckInResult);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] font-medium hover:bg-[var(--subtle-surface)] transition-colors flex items-center justify-center gap-2 text-sm shadow-xs"
                >
                  <Share2 className="w-4 h-4 text-[var(--highlight)]" />
                  <span>Share Card</span>
                </button>
              )}
              <button
                onClick={() => onClose()}
                className="flex-1 py-3 px-6 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors text-sm"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
