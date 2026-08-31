import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Sparkles, X, Compass, Calendar, Coffee } from "lucide-react";
import { useApp } from "../context/AppContext";

interface InactivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  daysInactive: number;
}

export const InactivityModal: React.FC<InactivityModalProps> = ({
  isOpen,
  onClose,
  daysInactive,
}) => {
  const { currentUser } = useApp();

  if (!isOpen) return null;

  const firstName = currentUser.name.split(" ")[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-surface rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden"
          id="inactivity-checkin-modal"
        >
          {/* Header Banner */}
          <div className="relative p-6 pb-5 bg-gradient-to-br from-amber-500/10 via-accent/10 to-transparent border-b border-stone-200/80 dark:border-stone-800">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Close"
              id="close-inactivity-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-accent/20 text-accent flex items-center justify-center shadow-inner">
                <Heart className="w-6 h-6 fill-accent/30 text-accent" />
              </div>
              <div>
                <span className="text-xs font-semibold tracking-wider text-accent uppercase">
                  Saathi Check-In
                </span>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  Welcome back, {firstName}
                </h3>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-sm leading-relaxed space-y-2">
              <p className="font-medium text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-accent" />
                We noticed it's been {daysInactive > 0 ? `${daysInactive} days` : "a while"} since your last check-in.
              </p>
              <p className="text-stone-600 dark:text-stone-400">
                Life gets loud and full — and in Saathi, taking time away is never something you have to make up for or feel guilty about. Day one is always right now.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                How would you like to arrive today?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={onClose}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-accent/50 hover:bg-accent/5 dark:hover:bg-accent/10 transition-all text-left group"
                  id="inactivity-action-breathe-btn"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                      60-Second Reset
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">
                      Quick pause with zero pressure
                    </div>
                  </div>
                </button>

                <button
                  onClick={onClose}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-accent/50 hover:bg-accent/5 dark:hover:bg-accent/10 transition-all text-left group"
                  id="inactivity-action-checkin-btn"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                      Today's Micro-Pause
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">
                      Resume where you left off
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Coach quote */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-accent-tint/60 border border-accent/20">
              <Compass className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-xs text-stone-700 dark:text-stone-300 italic">
                "There is no backlog to clear. Just one unhurried breath in this present moment." — Coach Asha
              </p>
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-accent text-white font-medium hover:bg-accent-hover transition-colors shadow-sm text-sm"
              id="inactivity-continue-btn"
            >
              I'm Ready, Let's Begin
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
