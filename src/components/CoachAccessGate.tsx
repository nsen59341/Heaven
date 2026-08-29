import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { KeyRound, ShieldCheck, Sparkles, CheckCircle2, AlertCircle, ArrowRight, UserCheck, Heart } from "lucide-react";
import { useApp } from "../context/AppContext";
import poojaAvatar from "../assets/images/pooja_avatar.jpg";

export const CoachAccessGate: React.FC = () => {
  const { unlockAccessGate, setCurrentUser, state } = useApp();
  const [memberName, setMemberName] = useState("");
  const [showDirectJoin, setShowDirectJoin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCode = state.coachInvite?.code || "HEAVEN-POOJA-2026";

  const handleMemberJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || memberName.trim().length < 2) {
      setErrorMsg("Please enter your name to set up your personal profile.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    setTimeout(() => {
      const res = unlockAccessGate(activeCode, memberName.trim());
      if (res.success) {
        setSuccessMsg(`Welcome, ${memberName.trim()}! Your personal profile is ready.`);
      } else {
        setErrorMsg(res.message);
        setIsSubmitting(false);
      }
    }, 400);
  };

  const handleEnterAsCoach = () => {
    unlockAccessGate(activeCode);
    setCurrentUser("user_coach_pooja");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-white dark:bg-[#1C1815] text-stone-900 dark:text-stone-100 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8"
        id="coach-access-gate-card"
      >
        {/* Top Banner with Coach Pooja info */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-stone-50 to-white dark:from-stone-900/90 dark:to-[#1C1815] border-b border-stone-200 dark:border-stone-800 text-center relative">
          <div className="mx-auto w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-emerald-600 to-amber-500 shadow-lg mb-4 relative">
            <img
              src={poojaAvatar}
              alt="Coach Pooja"
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-600 text-white shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Private Practice Cohort</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Coach Pooja&apos;s Circle
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-sm mx-auto font-normal">
            HEAVEN is an exclusive daily space for 60-second micro-pauses, reflective check-ins, and personal coach guidance.
          </p>
        </div>

        {/* Body / Action Form */}
        <div className="p-6 sm:p-8 space-y-6">
          <AnimatePresence mode="wait">
            {successMsg ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-serif font-bold text-emerald-900 dark:text-emerald-200">
                  Access Granted!
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
                  {successMsg}
                </p>
              </motion.div>
            ) : showDirectJoin ? (
              <form onSubmit={handleMemberJoinSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm font-semibold text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    autoFocus
                  />
                  {errorMsg && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium pt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDirectJoin(false)}
                    className="py-3 px-4 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !memberName.trim()}
                    className="flex-1 py-3 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{isSubmitting ? "Creating Space..." : "Enter My Personal Space"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowDirectJoin(true)}
                  className="w-full py-4 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  id="gate-join-link-btn"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Join Coach Pooja&apos;s Circle</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800"></div>
                  <span className="text-[11px] uppercase font-bold text-stone-400">or</span>
                  <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800"></div>
                </div>

                <button
                  type="button"
                  onClick={handleEnterAsCoach}
                  className="w-full py-3 px-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 text-xs font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  id="gate-coach-signin-btn"
                >
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  <span>Enter as Coach Pooja</span>
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-stone-50 dark:bg-stone-900/60 border-t border-stone-200 dark:border-stone-800 text-center">
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Protected cohort · Access granted via Coach Pooja&apos;s direct shareable referral link.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
