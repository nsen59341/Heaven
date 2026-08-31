import React, { useRef, useState, useEffect } from "react";
import { Download, Share2, X, Check, Sparkles } from "lucide-react";
import { CheckIn, Challenge, User, MOOD_SCALE } from "../types";

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  checkIn: CheckIn | undefined;
  challenge: Challenge | undefined;
  streak: number;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  user,
  checkIn,
  challenge,
  streak,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const firstName = user.name.split(" ")[0];
  const moodScore = checkIn?.moodScore || 5;
  const moodMeta = MOOD_SCALE[moodScore];
  const dayNumber = checkIn?.dayNumber || 1;
  const challengeTitle = challenge?.title || "Daily Check-in";

  // Function to render canvas and download PNG
  const handleDownload = () => {
    setIsGenerating(true);
    const canvas = document.createElement("canvas");
    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    // Draw background gradient using mood spectrum
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "#221D18");
    grad.addColorStop(0.3, "#2C251F");
    grad.addColorStop(0.7, "#352820");
    grad.addColorStop(1, "#181412");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Warm radial glow behind hero
    const glow = ctx.createRadialGradient(width / 2, 700, 50, width / 2, 700, 550);
    glow.addColorStop(0, "rgba(232, 149, 107, 0.25)");
    glow.addColorStop(0.6, "rgba(77, 139, 99, 0.15)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // Rounded frame
    ctx.strokeStyle = "rgba(239, 231, 220, 0.15)";
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, width - 120, height - 120);

    // Header badge
    ctx.fillStyle = "#E8956B";
    ctx.font = "600 34px Figtree, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SAATHI COMMUNITY · DAILY CHECK-IN", width / 2, 220);

    // Challenge & Day
    ctx.fillStyle = "#B8ACA0";
    ctx.font = "400 42px Figtree, sans-serif";
    ctx.fillText(`${challengeTitle} · Day ${dayNumber}`, width / 2, 300);

    // Hero Streak Number
    ctx.fillStyle = "#F7F2EB";
    ctx.font = "italic 700 240px Newsreader, serif";
    ctx.fillText(`${streak}`, width / 2, 680);

    // Streak label
    ctx.fillStyle = "#E8B98A";
    ctx.font = "500 48px Figtree, sans-serif";
    ctx.fillText(streak === 1 ? "Day One Completed" : "Days Unbroken Streak", width / 2, 780);

    // Member First Name
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "italic 600 80px Newsreader, serif";
    ctx.fillText(`${firstName}`, width / 2, 940);

    // Mood & reflection box
    const boxY = 1040;
    const boxH = 460;
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.roundRect(140, boxY, width - 280, boxH, 32);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Mood icon & word
    ctx.font = "52px sans-serif";
    ctx.fillText(`${moodMeta.emoji} ${moodMeta.word}`, width / 2, boxY + 110);

    // Discovery snippet
    if (checkIn?.discovery) {
      ctx.fillStyle = "#F7F2EB";
      ctx.font = "italic 400 40px Newsreader, Georgia, serif";
      const snippet = `"${checkIn.discovery.slice(0, 110)}${checkIn.discovery.length > 110 ? "..." : ""}"`;
      wrapText(ctx, snippet, width / 2, boxY + 220, width - 380, 56);
    } else {
      ctx.fillStyle = "#B8ACA0";
      ctx.font = "400 38px Figtree, sans-serif";
      ctx.fillText("Completed the 60-second micro-pause", width / 2, boxY + 240);
    }

    // Footer
    ctx.fillStyle = "#8F8475";
    ctx.font = "400 34px Figtree, sans-serif";
    ctx.fillText("One life coach · 60 seconds a day · saathicommunity.in", width / 2, height - 160);

    // App logo small
    ctx.fillStyle = "#4D8B63";
    ctx.font = "italic 700 48px Newsreader, serif";
    ctx.fillText("SAATHI", width / 2, height - 100);

    // Download trigger
    const link = document.createElement("a");
    link.download = `Saathi-${firstName}-Day${dayNumber}-Streak${streak}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setIsGenerating(false);
  };

  const handleShare = async () => {
    const text = `Day ${dayNumber} completed in Saathi! ${streak} days unbroken streak with coach Asha. 🌞`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Saathi Daily Check-in",
          text,
          url: window.location.href,
        });
      } catch {
        copyToClipboard(text);
      }
    } else {
      copyToClipboard(text);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-card-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
    >
      <div className="w-full max-w-sm my-auto bg-[var(--surface)] text-[var(--text)] rounded-[24px] p-5 shadow-2xl border border-[var(--border)] relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--highlight)]" />
            <h3 id="share-card-title" className="font-serif text-lg font-normal">
              Share Your Daily Milestone
            </h3>
          </div>
          <button
            onClick={() => onClose()}
            aria-label="Close share card"
            className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] rounded-full hover:bg-[var(--subtle-surface)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp Status Aspect Ratio Card (9:16 style preview) */}
        <div
          ref={cardRef}
          className="w-full rounded-[20px] p-6 text-center relative overflow-hidden shadow-lg border border-[#EFE7DC]/20 transition-all"
          style={{
            background: "linear-gradient(180deg, #221D18 0%, #2D251F 50%, #151210 100%)",
            color: "#F7F2EB",
          }}
        >
          {/* Subtle warm decorative aura */}
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-25"
            style={{ backgroundColor: moodMeta.color }}
          />

          <div className="relative z-10 space-y-4">
            <div className="text-[11px] font-semibold tracking-widest text-[#E8956B] uppercase">
              SAATHI · 60s Micro-Pause
            </div>

            <div>
              <div className="text-xs text-[#B8ACA0]">
                {challengeTitle} · Day {dayNumber}
              </div>
              <div className="text-6xl font-serif font-bold italic text-white my-1 tnum tracking-tight">
                {streak}
              </div>
              <div className="text-sm font-medium text-[#E8B98A]">
                {streak === 1 ? "Day One Completed" : "Days Unbroken"}
              </div>
            </div>

            <div className="text-2xl font-serif italic text-white/95">
              {firstName}
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">{moodMeta.emoji}</span>
                <span className="text-sm font-medium text-[#F7F2EB]">
                  {moodMeta.word}
                </span>
              </div>
              {checkIn?.discovery ? (
                <p className="text-xs text-[#B8ACA0] italic line-clamp-3 leading-relaxed">
                  &ldquo;{checkIn.discovery}&rdquo;
                </p>
              ) : (
                <p className="text-xs text-[#B8ACA0] leading-relaxed">
                  Paused for 60 seconds to find steady ground.
                </p>
              )}
            </div>

            <div className="pt-2 text-[10px] text-[#8F8475] flex items-center justify-between border-t border-white/10">
              <span className="font-serif italic text-sm text-[#6EAB84] font-bold">
                SAATHI
              </span>
              <span>with Asha V.</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? "Saving..." : "Save Image"}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--subtle-surface)] text-[var(--text)] text-sm font-medium hover:bg-[var(--surface)] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[var(--accent)]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share Status</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Canvas multiline text wrap helper
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + " ";
      currentY += lineHeight;
      if (currentY > y + lineHeight * 3) {
        ctx.fillText(line + "...", x, currentY);
        return;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}
