import React, { useEffect, useRef } from "react";
import { PhoneCall, MessageCircle, X } from "lucide-react";
import { useApp } from "../context/AppContext";

interface SafetyScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAskCoach?: () => void;
}

export const SafetyScreenModal: React.FC<SafetyScreenModalProps> = ({
  isOpen,
  onClose,
  onOpenAskCoach,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="safety-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-[var(--surface)] text-[var(--text)] rounded-[20px] p-6 shadow-[var(--card-shadow-lg)] border border-[var(--border)] relative"
      >
        <button
          onClick={() => onClose()}
          aria-label="Close safety alert"
          className="absolute top-4 right-4 p-2 text-[var(--muted)] hover:text-[var(--text)] rounded-full hover:bg-[var(--subtle-surface)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pt-2 pb-4">
          <h2
            id="safety-title"
            className="text-2xl font-serif font-normal text-[var(--text)] mb-3"
          >
            We are here with you
          </h2>
          <p className="text-[16px] leading-[1.6] text-[var(--muted)] mb-6">
            What you are carrying right now deserves real support and attention. You do not have to carry it on your own.
          </p>

          <div className="space-y-4">
            {/* Direct helpline card */}
            <div className="p-4 rounded-xl bg-[var(--subtle-surface)] border border-[var(--border)]">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-[var(--text)] text-base">
                    Tele-MANAS Helpline
                  </div>
                  <div className="text-sm text-[var(--muted)] mt-0.5">
                    Free 24x7 Government of India mental health support
                  </div>
                  <a
                    href="tel:14416"
                    className="inline-flex items-center gap-2 mt-2 px-3.5 py-1.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    Call 14416 (or 1800 891 4416)
                  </a>
                </div>
              </div>
            </div>

            {/* Message Coach Pooja */}
            <div className="p-4 rounded-xl bg-[var(--subtle-surface)] border border-[var(--border)]">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-full bg-[var(--highlight-light)] text-[var(--highlight)] shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-[var(--text)] text-base">
                    Message Pooja Directly
                  </div>
                  <div className="text-sm text-[var(--muted)] mt-0.5">
                    Your note has been routed to Pooja&apos;s private queue.
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenAskCoach) onOpenAskCoach();
                    }}
                    className="inline-flex items-center gap-2 mt-2 px-3.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-sm font-medium hover:bg-[var(--subtle-surface)] transition-colors"
                  >
                    Open Private Chat
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => onClose()}
              className="text-sm text-[var(--subtle)] hover:text-[var(--text)] underline"
            >
              Return to HEAVEN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
