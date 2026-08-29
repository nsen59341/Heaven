import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Flame,
  Award,
  Trophy,
  Calendar,
  Sparkles,
  Wind,
  Heart,
  PhoneCall,
  ShieldAlert,
  CheckCircle2,
  Eye,
  LogIn,
  AlertTriangle,
  Clock,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { User, CheckIn, ResetLog, MOOD_SCALE } from "../types";

interface MemberReviewModalProps {
  member: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSwitchToMember: (memberId: string) => void;
}

export const MemberReviewModal: React.FC<MemberReviewModalProps> = ({
  member,
  isOpen,
  onClose,
  onSwitchToMember,
}) => {
  const { state, coachMarkSeen } = useApp();
  const [activeTab, setActiveTab] = useState<"checkins" | "resets">("checkins");

  if (!isOpen || !member) return null;

  // Member's check-ins sorted latest first
  const memberCheckIns = state.checkIns
    .filter((c) => c.userId === member.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Member's reset logs sorted latest first
  const memberResetLogs = state.resetLogs
    .filter((r) => r.userId === member.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Count reset tools
  const resetCounts = {
    breathe: memberResetLogs.filter((r) => r.tool === "breathe").length,
    meditation: memberResetLogs.filter((r) => r.tool === "meditation").length,
    three_good_things: memberResetLogs.filter((r) => r.tool === "three_good_things").length,
    talk: memberResetLogs.filter((r) => r.tool === "talk").length,
  };

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case "breathe":
        return <Wind className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case "meditation":
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case "three_good_things":
        return <Heart className="w-4 h-4 text-rose-500" />;
      case "talk":
        return <PhoneCall className="w-4 h-4 text-sky-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-stone-500" />;
    }
  };

  const getToolName = (tool: string) => {
    switch (tool) {
      case "breathe":
        return "60s Box Breathing";
      case "meditation":
        return "Custom Micro-Meditation";
      case "three_good_things":
        return "3 Good Things";
      case "talk":
        return "Helpline / Counselor Talk";
      default:
        return tool;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl bg-white dark:bg-[#1E1A17] text-stone-900 dark:text-stone-100 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]"
          id="member-review-modal"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-stone-50 dark:bg-stone-900/90 border-b border-stone-200 dark:border-stone-800 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <img
                src={member.photo}
                alt={member.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-600/40 shadow-xs shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 truncate">
                    {member.name}
                  </h3>
                  {member.hasTriggeredSafety && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Safety Alert
                    </span>
                  )}
                  {member.invitedByCode && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                      {member.invitedByCode}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {member.email} · Joined {member.joinDate || member.joinedAt?.slice(0, 10)}
                  {member.location ? ` · ${member.location}` : ""}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
              aria-label="Close review modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Metrics Quick Stats */}
          <div className="p-5 sm:p-6 bg-stone-100/60 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs text-center">
              <div className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1 mb-0.5">
                <Flame className="w-3 h-3 text-amber-500" /> Current Streak
              </div>
              <div className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {member.currentStreak} days
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs text-center">
              <div className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1 mb-0.5">
                <Award className="w-3 h-3 text-emerald-600" /> Longest Streak
              </div>
              <div className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {member.longestStreak} days
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs text-center">
              <div className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1 mb-0.5">
                <Trophy className="w-3 h-3 text-amber-500" /> Total Points
              </div>
              <div className="text-xl font-serif font-bold text-emerald-700 dark:text-emerald-400">
                {member.totalPoints} pts
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs text-center">
              <div className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1 mb-0.5">
                <Sparkles className="w-3 h-3 text-rose-500" /> 60s Resets
              </div>
              <div className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {memberResetLogs.length} logs
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="px-6 pt-4 border-b border-stone-200 dark:border-stone-800 flex items-center gap-4">
            <button
              onClick={() => setActiveTab("checkins")}
              className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "checkins"
                  ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 font-extrabold"
                  : "border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Check-In Reflections ({memberCheckIns.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("resets")}
              className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "resets"
                  ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 font-extrabold"
                  : "border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Reset Tool Usage ({memberResetLogs.length})</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {activeTab === "checkins" && (
              <div className="space-y-3.5">
                {memberCheckIns.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-900 rounded-2xl">
                    No check-ins recorded yet for this member.
                  </div>
                ) : (
                  memberCheckIns.map((ci) => {
                    const mood = MOOD_SCALE[ci.moodScore];
                    return (
                      <div
                        key={ci.id}
                        className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                              Day {ci.dayNumber}
                            </span>
                            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                              {ci.date}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className="px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1"
                              style={{ backgroundColor: `${mood.color}20`, color: mood.color }}
                            >
                              <span>{mood.emoji}</span>
                              <span>{mood.word}</span>
                            </span>

                            {!ci.seenByCoach ? (
                              <button
                                onClick={() => coachMarkSeen(ci.id)}
                                className="px-2 py-1 rounded-md bg-stone-200 dark:bg-stone-800 hover:bg-emerald-600 hover:text-white text-[10px] font-bold text-stone-700 dark:text-stone-300 transition-colors cursor-pointer flex items-center gap-1"
                                title="Mark as reviewed by Coach"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Mark Seen</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Seen</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                          <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80">
                            <div className="text-[10px] font-bold uppercase text-stone-400 mb-1">
                              Arrived Feeling
                            </div>
                            <div className="text-stone-800 dark:text-stone-200 font-medium">
                              {ci.feelingBefore}
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80">
                            <div className="text-[10px] font-bold uppercase text-stone-400 mb-1">
                              What was Noticed / Discovery
                            </div>
                            <div className="text-stone-800 dark:text-stone-200 font-medium">
                              {ci.discovery}
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80">
                            <div className="text-[10px] font-bold uppercase text-stone-400 mb-1">
                              Leaving Feeling
                            </div>
                            <div className="text-stone-800 dark:text-stone-200 font-medium">
                              {ci.feelingNow}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === "resets" && (
              <div className="space-y-4">
                {/* Reset Tools Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-2">
                    <Wind className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-[10px] text-stone-500">Breathing</div>
                      <div className="text-sm font-bold">{resetCounts.breathe}</div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="text-[10px] text-stone-500">Meditation</div>
                      <div className="text-sm font-bold">{resetCounts.meditation}</div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <div>
                      <div className="text-[10px] text-stone-500">3 Good Things</div>
                      <div className="text-sm font-bold">{resetCounts.three_good_things}</div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-sky-500" />
                    <div>
                      <div className="text-[10px] text-stone-500">Helpline / Talk</div>
                      <div className="text-sm font-bold">{resetCounts.talk}</div>
                    </div>
                  </div>
                </div>

                {memberResetLogs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-900 rounded-2xl">
                    No 60-second reset tool sessions logged yet for this member.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {memberResetLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                          log.isCrisis
                            ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200"
                            : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 shrink-0">
                            {getToolIcon(log.tool)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold truncate flex items-center gap-1.5">
                              <span>{getToolName(log.tool)}</span>
                              {log.isCrisis && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-bold uppercase">
                                  Crisis Flag
                                </span>
                              )}
                            </div>
                            {log.detail && (
                              <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                                {log.detail}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-[11px] text-stone-400 dark:text-stone-500 font-mono shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(log.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Action: Switch to this Member's Account */}
          <div className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-stone-500 dark:text-stone-400 text-center sm:text-left">
              <span>Switching into this account enables Coach Inspection Mode.</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => {
                  onSwitchToMember(member.id);
                  onClose();
                }}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                id="switch-to-member-btn"
              >
                <LogIn className="w-4 h-4 text-white" />
                <span className="text-white">Switch to {member.name.split(" ")[0]}'s Account</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
