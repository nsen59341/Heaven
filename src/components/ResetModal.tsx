import React, { useState, useEffect, useRef } from "react";
import {
  Wind,
  Sparkles,
  Heart,
  PhoneCall,
  X,
  Play,
  Pause,
  RotateCcw,
  Mic,
  MicOff,
  Check,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react";
import { MOOD_SCALE, MoodScore, ResetTool, SavedMeditation } from "../types";
import { useApp } from "../context/AppContext";

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTool?: ResetTool | null;
  onOpenAskCoach?: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({
  isOpen,
  onClose,
  initialTool = null,
  onOpenAskCoach,
}) => {
  const { currentUser, logResetUsage, saveMeditation, addPost, triggerSafetyScreen } = useApp();
  const [activeTool, setActiveTool] = useState<ResetTool | null>(initialTool);

  // Breathing state
  const [breathMode, setBreathMode] = useState<"box" | "478">("box");
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Rest">("Inhale");
  const [phaseSeconds, setPhaseSeconds] = useState(4);
  const [totalSecondsLeft, setTotalSecondsLeft] = useState(60);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [postBreathMood, setPostBreathMood] = useState<MoodScore | null>(null);
  const [isBreathDone, setIsBreathDone] = useState(false);

  // Custom Meditation state
  const [situationText, setSituationText] = useState("");
  const [isGeneratingMeditation, setIsGeneratingMeditation] = useState(false);
  const [currentMeditation, setCurrentMeditation] = useState<{ title: string; script: string[] } | null>(null);
  const [meditationSentenceIndex, setMeditationSentenceIndex] = useState(0);
  const [isMeditationPlaying, setIsMeditationPlaying] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Three Good Things state
  const [goodStep, setGoodStep] = useState<1 | 2 | 3 | 4>(1);
  const [thing1, setThing1] = useState("");
  const [thing2, setThing2] = useState("");
  const [thing3, setThing3] = useState("");
  const [isPostedToCommunity, setIsPostedToCommunity] = useState(false);

  // Reset states on open/close (Rule A9 #15)
  useEffect(() => {
    if (isOpen) {
      setActiveTool(initialTool);
      setIsBreathingActive(false);
      setTotalSecondsLeft(60);
      setIsBreathDone(false);
      setPostBreathMood(null);
      setGoodStep(1);
      setThing1("");
      setThing2("");
      setThing3("");
      setIsPostedToCommunity(false);
      setCurrentMeditation(null);
      setMeditationSentenceIndex(0);
      setIsMeditationPlaying(false);
    }
  }, [isOpen, initialTool]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeTool) {
          setActiveTool(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeTool, onClose]);

  // Breathing Loop Engine (Offline capable, zero network!)
  useEffect(() => {
    if (!isBreathingActive || isBreathDone) return;

    const interval = setInterval(() => {
      setTotalSecondsLeft((prevTotal) => {
        if (prevTotal <= 1) {
          setIsBreathingActive(false);
          setIsBreathDone(true);
          logResetUsage({ tool: "breathe" });
          return 0;
        }
        return prevTotal - 1;
      });

      setPhaseSeconds((prevSec) => {
        if (prevSec > 1) {
          return prevSec - 1;
        }

        // Phase transitions with haptics
        if (navigator.vibrate) {
          try {
            navigator.vibrate(40);
          } catch {}
        }

        if (breathMode === "box") {
          // 4s Inhale -> 4s Hold -> 4s Exhale -> 4s Hold
          if (breathPhase === "Inhale") {
            setBreathPhase("Hold");
            return 4;
          } else if (breathPhase === "Hold") {
            setBreathPhase("Exhale");
            return 4;
          } else if (breathPhase === "Exhale") {
            setBreathPhase("Rest");
            return 4;
          } else {
            setBreathPhase("Inhale");
            return 4;
          }
        } else {
          // 4-7-8 Breathing: 4s Inhale -> 7s Hold -> 8s Exhale
          if (breathPhase === "Inhale") {
            setBreathPhase("Hold");
            return 7;
          } else if (breathPhase === "Hold") {
            setBreathPhase("Exhale");
            return 8;
          } else {
            setBreathPhase("Inhale");
            return 4;
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingActive, isBreathDone, breathPhase, breathMode, logResetUsage]);

  // Speech to text for situation
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
      setSituationText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  // Generate Personalized Meditation
  const handleGenerateMeditation = async () => {
    if (!situationText.trim()) return;
    setIsGeneratingMeditation(true);

    try {
      const res = await fetch("/api/gemini/meditation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: situationText,
          memberName: currentUser.name.split(" ")[0],
        }),
      });

      if (!res.ok) throw new Error("Failed to generate meditation");
      const data = await res.json();

      if (data.flagged) {
        triggerSafetyScreen("meditation");
        return;
      }

      setCurrentMeditation({
        title: data.title || "Centering Your Mind",
        script: data.script || [],
      });
      setMeditationSentenceIndex(0);
      setIsMeditationPlaying(true);

      // Save to saved meditations & logs
      saveMeditation({
        situation: situationText,
        title: data.title || "Centering Your Mind",
        script: data.script || [],
      });
      logResetUsage({
        tool: "meditation",
        detail: situationText.slice(0, 100),
      });
    } catch (err) {
      console.error(err);
      // Fallback
      setCurrentMeditation({
        title: "A Grounding Pause",
        script: [
          "Take a slow breath in, and let your body settle into this seat. [pause 4s]",
          "Whatever brought tension into your morning, leave it outside for three minutes. [pause 5s]",
          "Feel the breath flow in... and drift out softly. [pause 6s]",
          "You are steady, capable, and right where you need to be. [pause 5s]",
        ],
      });
      setIsMeditationPlaying(true);
    } finally {
      setIsGeneratingMeditation(false);
    }
  };

  // Meditation step reader with pauses
  useEffect(() => {
    if (!isMeditationPlaying || !currentMeditation) return;

    const rawLine = currentMeditation.script[meditationSentenceIndex];
    if (!rawLine) {
      setIsMeditationPlaying(false);
      return;
    }

    // Extract spoken text and pause duration
    const pauseMatch = rawLine.match(/\[pause\s+(\d+)s?\]/i);
    const pauseSec = pauseMatch ? parseInt(pauseMatch[1]) : 4;
    const spokenText = rawLine.replace(/\[pause.*?\]/gi, "").trim();

    // Speak sentence if not muted
    if (!isAudioMuted && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = 0.85;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    }

    // Advance after reading duration + pause duration
    const readingTime = Math.max(3000, spokenText.length * 75);
    const timer = setTimeout(() => {
      if (meditationSentenceIndex < currentMeditation.script.length - 1) {
        setMeditationSentenceIndex((prev) => prev + 1);
      } else {
        setIsMeditationPlaying(false);
      }
    }, readingTime + pauseSec * 1000);

    return () => clearTimeout(timer);
  }, [isMeditationPlaying, currentMeditation, meditationSentenceIndex, isAudioMuted]);

  // Finish Three Good Things
  const handleCompleteThreeThings = (shareToFeed: boolean) => {
    logResetUsage({
      tool: "three_good_things",
      detail: `${thing1} | ${thing2} | ${thing3}`,
    });

    if (shareToFeed) {
      addPost(
        `Three good things from today:\n1. ${thing1}\n2. ${thing2}\n3. ${thing3}`
      );
      setIsPostedToCommunity(true);
    }
    setGoodStep(4);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
      className="fixed inset-0 z-50 flex flex-col bg-[var(--app-bg)] text-[var(--text)] overflow-y-auto"
    >
      {/* Full screen header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] max-w-4xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <span className="font-serif italic font-bold text-xl text-[var(--accent)]">
            HEAVEN
          </span>
          <span className="text-xs text-[var(--muted)] border-l border-[var(--border)] pl-2.5">
            60-Second Reset
          </span>
        </div>
        <button
          onClick={() => {
            if (activeTool) setActiveTool(null);
            else onClose();
          }}
          aria-label="Close 60s reset"
          className="p-2 text-[var(--muted)] hover:text-[var(--text)] rounded-full hover:bg-[var(--subtle-surface)] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl w-full mx-auto">
        {/* Main 4-card chooser */}
        {!activeTool && (
          <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <h2
                id="reset-modal-title"
                className="text-3xl sm:text-4xl font-serif text-[var(--text)]"
              >
                What would help right now?
              </h2>
              <p className="text-[16px] text-[var(--muted)]">
                Pick one practice for the next sixty seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* 1. Breathe */}
              <button
                onClick={() => {
                  setActiveTool("breathe");
                  setIsBreathingActive(true);
                }}
                className="flex flex-col text-left p-6 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-lg)] transition-all group"
              >
                <div className="p-3 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] w-fit mb-4">
                  <Wind className="w-6 h-6" />
                </div>
                <div className="font-serif text-xl text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                  Breathe
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">
                  1 min · Box breathing & 4-7-8
                </div>
                <p className="text-sm text-[var(--subtle)] mt-3 leading-relaxed">
                  A guided visual circle that expands and contracts to steady your nervous system.
                </p>
              </button>

              {/* 2. Meditation */}
              <button
                onClick={() => setActiveTool("meditation")}
                className="flex flex-col text-left p-6 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-lg)] transition-all group"
              >
                <div className="p-3 rounded-xl bg-[var(--highlight-light)] text-[var(--highlight)] w-fit mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="font-serif text-xl text-[var(--text)] group-hover:text-[var(--highlight)] transition-colors">
                  A meditation for this
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">
                  3 min · Personalized by situation
                </div>
                <p className="text-sm text-[var(--subtle)] mt-3 leading-relaxed">
                  Type what is happening; Pooja’s AI creates an unhurried 3-minute guided audio pause.
                </p>
              </button>

              {/* 3. Three Good Things */}
              <button
                onClick={() => setActiveTool("three_good_things")}
                className="flex flex-col text-left p-6 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-lg)] transition-all group"
              >
                <div className="p-3 rounded-xl bg-[var(--subtle-surface)] text-[var(--text)] w-fit mb-4">
                  <Heart className="w-6 h-6" />
                </div>
                <div className="font-serif text-xl text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                  Three good things
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">
                  1 min · +10 points
                </div>
                <p className="text-sm text-[var(--subtle)] mt-3 leading-relaxed">
                  Name three micro-moments that went right today, and optional share to the feed.
                </p>
              </button>

              {/* 4. Talk to someone */}
              <button
                onClick={() => setActiveTool("talk")}
                className="flex flex-col text-left p-6 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-lg)] transition-all group"
              >
                <div className="p-3 rounded-xl bg-[var(--subtle-surface)] text-[var(--accent)] w-fit mb-4">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div className="font-serif text-xl text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                  Talk to someone
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">
                  Immediate 24x7 support
                </div>
                <p className="text-sm text-[var(--subtle)] mt-3 leading-relaxed">
                  Free Government of India Tele-MANAS helpline and private message to Pooja.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* TOOL 1: Breathe */}
        {activeTool === "breathe" && (
          <div className="w-full max-w-md flex flex-col items-center text-center space-y-6 animate-in fade-in duration-200">
            {!isBreathDone ? (
              <>
                {/* Mode Selector */}
                <div className="flex items-center gap-2 p-1 rounded-xl bg-[var(--subtle-surface)] border border-[var(--border)]">
                  <button
                    onClick={() => {
                      setBreathMode("box");
                      setBreathPhase("Inhale");
                      setPhaseSeconds(4);
                    }}
                    className={`py-1.5 px-4 rounded-lg text-xs font-medium transition-all ${
                      breathMode === "box"
                        ? "bg-[var(--surface)] text-[var(--text)] shadow-xs"
                        : "text-[var(--muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    Box Breathing (4-4-4-4)
                  </button>
                  <button
                    onClick={() => {
                      setBreathMode("478");
                      setBreathPhase("Inhale");
                      setPhaseSeconds(4);
                    }}
                    className={`py-1.5 px-4 rounded-lg text-xs font-medium transition-all ${
                      breathMode === "478"
                        ? "bg-[var(--surface)] text-[var(--text)] shadow-xs"
                        : "text-[var(--muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    4-7-8 Calming
                  </button>
                </div>

                {/* Animated Breathing Circle */}
                <div className="relative w-64 h-64 flex items-center justify-center my-6">
                  {/* Outer glow aura */}
                  <div
                    className={`absolute inset-0 rounded-full bg-[var(--accent)] opacity-20 blur-xl transition-transform duration-1000 ${
                      breathPhase === "Inhale" || breathPhase === "Hold"
                        ? "scale-110"
                        : "scale-75"
                    }`}
                  />

                  {/* SVG Progress Ring */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      className="stroke-[var(--border)] fill-none stroke-[4px]"
                    />
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      className="stroke-[var(--accent)] fill-none stroke-[4px] transition-all duration-1000"
                      strokeDasharray={2 * Math.PI * 120}
                      strokeDashoffset={
                        2 * Math.PI * 120 * (1 - totalSecondsLeft / 60)
                      }
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Expanding & Contracting Inner Ball */}
                  <div
                    className={`w-44 h-44 rounded-full bg-[var(--surface)] border-2 border-[var(--accent)] shadow-lg flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${
                      breathPhase === "Inhale"
                        ? "scale-110 bg-[var(--accent-light)]"
                        : breathPhase === "Hold"
                        ? "scale-110"
                        : "scale-85 bg-[var(--surface)]"
                    }`}
                  >
                    <div className="font-serif text-2xl font-medium text-[var(--text)] capitalize">
                      {breathPhase}
                    </div>
                    <div className="text-3xl font-serif italic text-[var(--accent)] mt-1 tnum">
                      {phaseSeconds}s
                    </div>
                  </div>
                </div>

                <div className="text-sm text-[var(--muted)]">
                  {totalSecondsLeft} seconds remaining
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsBreathingActive(!isBreathingActive)}
                    className="flex items-center gap-2 py-2.5 px-6 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    {isBreathingActive ? (
                      <>
                        <Pause className="w-4 h-4" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" /> Resume
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setTotalSecondsLeft(60);
                      setPhaseSeconds(4);
                      setBreathPhase("Inhale");
                      setIsBreathingActive(true);
                    }}
                    className="p-2.5 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--subtle-surface)] transition-colors"
                    aria-label="Restart breathing timer"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              /* Breath Completed Reflection */
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="p-3 rounded-full bg-[var(--accent-light)] text-[var(--accent)] w-fit mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif text-[var(--text)]">
                  How is it now?
                </h3>
                <p className="text-[16px] text-[var(--muted)]">
                  Notice any change in your shoulders, jaw, or breath.
                </p>

                {/* Mood selector */}
                <div className="flex justify-center gap-3">
                  {([1, 2, 3, 4, 5] as MoodScore[]).map((score) => {
                    const m = MOOD_SCALE[score];
                    const isSelected = postBreathMood === score;
                    return (
                      <button
                        key={score}
                        onClick={() => setPostBreathMood(score)}
                        className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                          isSelected
                            ? "border-[var(--accent)] bg-[var(--accent-light)] scale-105"
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

                <button
                  onClick={() => onClose()}
                  className="py-3 px-8 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}

        {/* TOOL 2: A Meditation For This */}
        {activeTool === "meditation" && (
          <div className="w-full max-w-lg space-y-6 animate-in fade-in duration-200">
            {!currentMeditation ? (
              <div className="space-y-4">
                <div className="text-center space-y-1.5">
                  <h3 className="text-2xl font-serif text-[var(--text)]">
                    What is on your mind?
                  </h3>
                  <p className="text-sm text-[var(--muted)]">
                    Describe your situation in a sentence or two.
                  </p>
                </div>

                <div className="relative">
                  <textarea
                    value={situationText}
                    onChange={(e) => setSituationText(e.target.value)}
                    placeholder="e.g. Back to back meetings and I'm feeling reactive and drained..."
                    rows={4}
                    className="w-full p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--subtle)] focus:border-[var(--accent)] transition-all resize-none text-[16px]"
                  />
                  <button
                    onClick={toggleSpeechRecognition}
                    aria-label={isVoiceListening ? "Stop voice transcription" : "Start voice transcription"}
                    className={`absolute bottom-3 right-3 p-2.5 rounded-xl border transition-colors ${
                      isVoiceListening
                        ? "bg-red-500 text-white border-red-600 animate-pulse"
                        : "bg-[var(--subtle-surface)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]"
                    }`}
                  >
                    {isVoiceListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateMeditation}
                    disabled={isGeneratingMeditation || !situationText.trim()}
                    className="flex-1 py-3 px-6 rounded-xl bg-[var(--highlight)] text-white font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isGeneratingMeditation ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>Crafting meditation...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Begin 3-Minute Pause</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Active Meditation Player */
              <div className="text-center space-y-8 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                  <div className="text-left">
                    <h4 className="font-serif text-lg text-[var(--text)]">
                      {currentMeditation.title}
                    </h4>
                    <span className="text-xs text-[var(--muted)]">
                      Line {meditationSentenceIndex + 1} of {currentMeditation.script.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsAudioMuted(!isAudioMuted)}
                    className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--subtle-surface)] transition-colors"
                    aria-label={isAudioMuted ? "Unmute voice" : "Mute voice"}
                  >
                    {isAudioMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                {/* Soft pulsing audio orb */}
                <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[var(--highlight)] opacity-20 animate-ping duration-1000" />
                  <div className="w-36 h-36 rounded-full bg-[var(--surface)] border-2 border-[var(--highlight)] shadow-xl flex items-center justify-center text-3xl">
                    🕊️
                  </div>
                </div>

                {/* Current sentence displayed in large soft type */}
                <div className="min-h-[100px] flex items-center justify-center px-4">
                  <p className="font-serif italic text-xl sm:text-2xl text-[var(--text)] leading-relaxed">
                    &ldquo;{currentMeditation.script[meditationSentenceIndex]?.replace(/\[pause.*?\]/gi, "")}&rdquo;
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setIsMeditationPlaying(!isMeditationPlaying)}
                    className="py-2.5 px-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--subtle-surface)] transition-colors font-medium flex items-center gap-2 text-sm"
                  >
                    {isMeditationPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isMeditationPlaying ? "Pause" : "Resume"}</span>
                  </button>
                  <button
                    onClick={() => onClose()}
                    className="py-2.5 px-6 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors text-sm"
                  >
                    Finish
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TOOL 3: Three Good Things */}
        {activeTool === "three_good_things" && (
          <div className="w-full max-w-md space-y-6 animate-in fade-in duration-200">
            {goodStep < 4 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                  <span>Three Good Things · +10 Points</span>
                  <span>Step {goodStep} of 3</span>
                </div>

                <div className="text-left space-y-1">
                  <h3 className="text-2xl font-serif text-[var(--text)]">
                    {goodStep === 1 && "What is one thing that went right today?"}
                    {goodStep === 2 && "What is a second micro-moment you appreciated?"}
                    {goodStep === 3 && "And a third small positive from today?"}
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Even something as small as a warm cup of coffee or an unhurried breath.
                  </p>
                </div>

                {goodStep === 1 && (
                  <input
                    type="text"
                    autoFocus
                    value={thing1}
                    onChange={(e) => setThing1(e.target.value)}
                    placeholder="e.g. Finished the project proposal on time..."
                    className="w-full p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)] text-[16px]"
                  />
                )}
                {goodStep === 2 && (
                  <input
                    type="text"
                    autoFocus
                    value={thing2}
                    onChange={(e) => setThing2(e.target.value)}
                    placeholder="e.g. Enjoyed my lunch without checking email..."
                    className="w-full p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)] text-[16px]"
                  />
                )}
                {goodStep === 3 && (
                  <input
                    type="text"
                    autoFocus
                    value={thing3}
                    onChange={(e) => setThing3(e.target.value)}
                    placeholder="e.g. Sunlight coming through the window..."
                    className="w-full p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)] text-[16px]"
                  />
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (goodStep === 1 && thing1.trim()) setGoodStep(2);
                      else if (goodStep === 2 && thing2.trim()) setGoodStep(3);
                      else if (goodStep === 3 && thing3.trim()) handleCompleteThreeThings(false);
                    }}
                    disabled={
                      (goodStep === 1 && !thing1.trim()) ||
                      (goodStep === 2 && !thing2.trim()) ||
                      (goodStep === 3 && !thing3.trim())
                    }
                    className="w-full py-3 px-6 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
                  >
                    {goodStep === 3 ? "Complete & Save" : "Next"}
                  </button>
                </div>
              </div>
            ) : (
              /* Card Summary */
              <div className="space-y-6 text-center animate-in fade-in duration-200">
                <div className="p-3 rounded-full bg-[var(--accent-light)] text-[var(--accent)] w-fit mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif text-[var(--text)]">
                  Three Good Things Recorded
                </h3>
                <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-left space-y-3 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="text-[var(--accent)] font-bold">1.</span>
                    <span className="text-sm text-[var(--text)]">{thing1}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[var(--accent)] font-bold">2.</span>
                    <span className="text-sm text-[var(--text)]">{thing2}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[var(--accent)] font-bold">3.</span>
                    <span className="text-sm text-[var(--text)]">{thing3}</span>
                  </div>
                </div>

                {!isPostedToCommunity ? (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleCompleteThreeThings(true)}
                      className="py-3 px-6 rounded-xl bg-[var(--highlight)] text-white font-medium hover:opacity-90 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Send className="w-4 h-4" />
                      <span>Post to Community Feed</span>
                    </button>
                    <button
                      onClick={() => onClose()}
                      className="py-2.5 px-4 text-xs text-[var(--muted)] hover:text-[var(--text)]"
                    >
                      Keep Private & Return
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] text-sm font-medium flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Shared with community!
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TOOL 4: Talk to someone */}
        {activeTool === "talk" && (
          <div className="w-full max-w-md space-y-6 text-left animate-in fade-in duration-200">
            <div className="text-center space-y-1.5">
              <h3 className="text-2xl font-serif text-[var(--text)]">
                You are not alone
              </h3>
              <p className="text-sm text-[var(--muted)]">
                Reach out to someone who is ready to listen.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] shrink-0">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-base text-[var(--text)]">
                      Tele-MANAS Helpline
                    </h4>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      Government of India 24x7 mental health counselling service. Free, confidential, multi-lingual.
                    </p>
                    <a
                      href="tel:14416"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
                    >
                      Call 14416
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-xl bg-[var(--highlight-light)] text-[var(--highlight)] shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-base text-[var(--text)]">
                      Message Coach Pooja
                    </h4>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      Share what you are going through directly in Pooja’s private question queue.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        if (onOpenAskCoach) onOpenAskCoach();
                      }}
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--subtle-surface)] text-[var(--text)] text-sm font-medium hover:bg-[var(--surface)] transition-colors"
                    >
                      Open Private Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => onClose()}
                className="text-xs text-[var(--subtle)] hover:text-[var(--text)] underline"
              >
                Close and return to HEAVEN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
