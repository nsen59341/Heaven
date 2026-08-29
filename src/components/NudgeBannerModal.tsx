import React from "react";
import { Sparkles, X, ArrowRight } from "lucide-react";

interface NudgeBannerModalProps {
  message: string | null;
  onClose: () => void;
  onStartCheckIn: () => void;
}

export const NudgeBannerModal: React.FC<NudgeBannerModalProps> = ({
  message,
  onClose,
  onStartCheckIn,
}) => {
  if (!message) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="nudge-title"
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
    >
      <div className="w-full max-w-md bg-[var(--surface)] text-[var(--text)] rounded-[20px] p-6 shadow-[var(--card-shadow-lg)] border border-[var(--border)] relative">
        <button
          onClick={() => onClose()}
          aria-label="Dismiss message"
          className="absolute top-4 right-4 p-2 text-[var(--muted)] hover:text-[var(--text)] rounded-full hover:bg-[var(--subtle-surface)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 text-[var(--accent)] mb-3">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
            A Note from Pooja
          </span>
        </div>

        <h3 id="nudge-title" className="text-xl font-serif text-[var(--text)] mb-3">
          Welcome back
        </h3>

        <p className="text-[16px] leading-[1.6] text-[var(--muted)] mb-6">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onClose();
              onStartCheckIn();
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            <span>Take today&apos;s 60-second pause</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onClose()}
            className="py-3 px-4 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--subtle-surface)] transition-colors text-sm"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};
