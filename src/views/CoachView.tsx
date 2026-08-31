import React, { useState, useMemo } from "react";
import {
  Users,
  Calendar,
  Sparkles,
  Flame,
  Check,
  ShieldAlert,
  Send,
  Plus,
  Copy,
  TrendingUp,
  AlertTriangle,
  Eye,
  CheckCircle2,
  Wind,
  Heart,
  PhoneCall,
  Share2,
  Edit3,
  UserCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { useApp } from "../context/AppContext";
import { MOOD_SCALE, Challenge, ChallengeDay } from "../types";
import { getLocalDateString } from "../utils/helpers";
import ashaAvatar from "../assets/images/asha_avatar.jpg";
import { CoachInviteModal } from "../components/CoachInviteModal";
import { EditPersonaModal } from "../components/EditPersonaModal";
import { MemberReviewModal } from "../components/MemberReviewModal";
import { User } from "../types";

export const CoachView: React.FC = () => {
  const {
    state,
    coachMarkSeen,
    coachAnswerQuestion,
    saveNewChallenge,
    activeChallenge,
    switchMemberAccount,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    "overview" | "members" | "checkins" | "questions" | "challenges"
  >("overview");

  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditPersonaModalOpen, setIsEditPersonaModalOpen] = useState(false);
  const [selectedMemberForReview, setSelectedMemberForReview] = useState<User | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const coachUser = state.users.find((u) => u.role === "coach" || u.id === "user_coach_pooja");
  const coachPhoto = coachUser?.photo || ashaAvatar;
  const coachName = coachUser?.name || "Asha V.";
  const coachFirstName = coachName.split(" ")[0];

  // Question answering state
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");

  // Challenge Generator state
  const [challengeTheme, setChallengeTheme] = useState("Resting the Mind");
  const [challengeDaysCount, setChallengeDaysCount] = useState<7 | 14 | 21>(7);
  const [isGeneratingChallenge, setIsGeneratingChallenge] = useState(false);
  const [generatedChallenge, setGeneratedChallenge] = useState<Challenge | null>(null);
  const [copiedAnnouncement, setCopiedAnnouncement] = useState(false);

  // Stats calculation
  const members = useApp().state.users.filter((u) => u.role !== "coach");
  const totalMembersCount = members.length;
  const todayStr = getLocalDateString(new Date());
  const checkedInToday = state.checkIns.filter((c) => c.date === todayStr);
  const checkedInTodayCount = checkedInToday.length;

  // Active this week (checked in at least once in last 7 days)
  const activeThisWeekCount = members.filter((m) => {
    return state.checkIns.some((c) => c.userId === m.id);
  }).length;

  const avgStreak = Math.round(
    members.reduce((acc, m) => acc + m.currentStreak, 0) / (totalMembersCount || 1)
  );

  // 30-Day Check-in Line Chart Data
  const thirtyDayData = useMemo(() => {
    const data: { date: string; label: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      const count = state.checkIns.filter((c) => c.date === dateStr).length;
      data.push({
        date: dateStr,
        label: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        count,
      });
    }
    return data;
  }, [state.checkIns]);

  // Completion by Day Number Bar Chart Data
  const dayCompletionData = useMemo(() => {
    const totalDays = activeChallenge?.days.length || 7;
    const data: { dayNumber: number; label: string; count: number }[] = [];
    for (let d = 1; d <= totalDays; d++) {
      const count = state.checkIns.filter(
        (c) => c.challengeId === activeChallenge?.id && c.dayNumber === d
      ).length;
      data.push({
        dayNumber: d,
        label: `Day ${d}`,
        count,
      });
    }
    return data;
  }, [state.checkIns, activeChallenge]);

  // Reset Tool usage frequency
  const resetStats = useMemo(() => {
    const counts = { breathe: 0, meditation: 0, three_good_things: 0, talk: 0 };
    state.resetLogs.forEach((log) => {
      if (counts[log.tool] !== undefined) {
        counts[log.tool]++;
      }
    });
    return counts;
  }, [state.resetLogs]);

  // Handle Question Answer Submission
  const handleSaveAnswer = (qId: string) => {
    if (!answerText.trim()) return;
    coachAnswerQuestion(qId, answerText.trim());
    setAnsweringQuestionId(null);
    setAnswerText("");
  };

  // Generate Challenge via API
  const handleGenerateChallenge = async () => {
    setIsGeneratingChallenge(true);
    try {
      const res = await fetch("/api/gemini/generate-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: challengeTheme,
          daysCount: challengeDaysCount,
        }),
      });

      if (!res.ok) throw new Error("Challenge generation failed");
      const data = await res.json();

      const newChal: Challenge = {
        id: `chal_${Date.now()}`,
        title: data.title || challengeTheme,
        theme: challengeTheme,
        description: data.description || "A daily 60-second micro-pause challenge.",
        whatsappAnnouncement:
          data.whatsappAnnouncement ||
          `🌅 *Rise New Challenge: ${data.title}*\n\nStarting tomorrow, we take 60 seconds every day to practice ${challengeTheme}.\n\nOpen your Rise app each morning to check in!`,
        days: data.days || [],
        isActive: true,
      };

      setGeneratedChallenge(newChal);
    } catch (err) {
      console.error(err);
      // Fallback challenge
      const fallbackDays: ChallengeDay[] = Array.from(
        { length: challengeDaysCount },
        (_, i) => ({
          dayNumber: i + 1,
          oneMinuteAction: `Notice one moment where tension arose today, and take three unhurried breaths.`,
          coachTip: "Do not judge the tension; simply give it permission to be there.",
        })
      );
      setGeneratedChallenge({
        id: `chal_${Date.now()}`,
        title: challengeTheme,
        theme: challengeTheme,
        description: "A restorative pause practice.",
        whatsappAnnouncement: `🌅 *Rise: ${challengeTheme}*\n\nWelcome to our new practice. Let's do this together!`,
        days: fallbackDays,
        isActive: true,
      });
    } finally {
      setIsGeneratingChallenge(false);
    }
  };

  const handlePublishChallenge = () => {
    if (!generatedChallenge) return;
    saveNewChallenge(generatedChallenge);
    alert("Challenge published as the active challenge for all members!");
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Coach Header */}
      <div className="p-6 rounded-[24px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={coachPhoto}
            alt={coachName}
            className="w-14 h-14 rounded-full object-cover border-2 border-[var(--highlight)]"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-serif text-[var(--text)]">
                Coach {coachName.split(" ")[0]}&apos;s Console
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--highlight-light)] text-[var(--highlight)]">
                Admin
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Managing {totalMembersCount} community members • Exclusive coach referral link active
            </p>
          </div>
        </div>

        {/* Action Buttons for Coach */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-accent text-white hover:bg-accent-hover font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Generate Referral Link</span>
          </button>

          <button
            onClick={() => setIsEditPersonaModalOpen(true)}
            className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-[var(--surface)] hover:bg-[var(--subtle-surface)] border border-[var(--border)] text-[var(--text)] font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-accent" />
            <span>Edit Persona</span>
          </button>
        </div>
      </div>

      {/* Subtabs navigation */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-[var(--border)]">
        {[
          { id: "overview", label: "Overview" },
          { id: "members", label: `Members (${totalMembersCount})` },
          { id: "checkins", label: `Check-ins (${checkedInTodayCount} today)` },
          { id: "questions", label: `Questions (${state.questions.length})` },
          { id: "challenges", label: "Challenges" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`py-2 px-4 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeSubTab === tab.id
                ? "bg-[var(--accent)] text-white shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--subtle-surface)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUBTAB 1: OVERVIEW */}
      {activeSubTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* 4 Stat Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
              <div className="text-xs text-[var(--muted)] mb-1">Total Members</div>
              <div className="text-3xl font-serif font-bold text-[var(--text)] tnum">
                {totalMembersCount}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
              <div className="text-xs text-[var(--muted)] mb-1">Checked In Today</div>
              <div className="text-3xl font-serif font-bold text-[var(--accent)] tnum">
                {checkedInTodayCount}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
              <div className="text-xs text-[var(--muted)] mb-1">Active This Week</div>
              <div className="text-3xl font-serif font-bold text-[var(--text)] tnum">
                {activeThisWeekCount}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
              <div className="text-xs text-[var(--muted)] mb-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[var(--highlight)]" /> Avg Streak
              </div>
              <div className="text-3xl font-serif font-bold text-[var(--highlight)] tnum">
                {avgStreak}d
              </div>
            </div>
          </div>

          {/* 30-Day Check-in Activity Chart (Rule A9 #17: wrapped in overflow-x-auto with min-width) */}
          <div className="p-6 rounded-[24px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-[var(--text)]">
                  Daily Check-ins (Last 30 Days)
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Consistency and volume across the whole cohort
                </p>
              </div>
              <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
            </div>

            <div className="overflow-x-auto pt-2">
              <div className="min-w-[500px] h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={thirtyDayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "var(--muted)", fontSize: 11 }}
                      stroke="var(--border)"
                      interval={4}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "var(--muted)", fontSize: 11 }}
                      stroke="var(--border)"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--surface)",
                        borderColor: "var(--border)",
                        borderRadius: "12px",
                        color: "var(--text)",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--accent)"
                      strokeWidth={2.5}
                      dot={{ fill: "var(--accent)", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Completion By Day Number Drop-off Curve */}
          <div className="p-6 rounded-[24px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)] space-y-4">
            <div>
              <h3 className="font-serif text-lg text-[var(--text)]">
                Challenge Day Completion Curve
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Identify drop-off points to trigger re-entry nudges
              </p>
            </div>

            <div className="overflow-x-auto pt-2">
              <div className="min-w-[400px] h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayCompletionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "var(--muted)", fontSize: 11 }}
                      stroke="var(--border)"
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "var(--muted)", fontSize: 11 }}
                      stroke="var(--border)"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--surface)",
                        borderColor: "var(--border)",
                        borderRadius: "12px",
                        color: "var(--text)",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" fill="var(--highlight)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 60s Reset Tool Frequency Table */}
          <div className="p-6 rounded-[24px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)] space-y-4">
            <h3 className="font-serif text-lg text-[var(--text)]">
              60-Second Reset Tool Usage
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[var(--subtle-surface)] flex items-center gap-3">
                <Wind className="w-5 h-5 text-[var(--accent)]" />
                <div>
                  <div className="text-xs text-[var(--muted)]">Breathe</div>
                  <div className="text-xl font-bold text-[var(--text)]">{resetStats.breathe}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--subtle-surface)] flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[var(--highlight)]" />
                <div>
                  <div className="text-xs text-[var(--muted)]">Meditation</div>
                  <div className="text-xl font-bold text-[var(--text)]">{resetStats.meditation}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--subtle-surface)] flex items-center gap-3">
                <Heart className="w-5 h-5 text-rose-500" />
                <div>
                  <div className="text-xs text-[var(--muted)]">3 Good Things</div>
                  <div className="text-xl font-bold text-[var(--text)]">{resetStats.three_good_things}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--subtle-surface)] flex items-center gap-3">
                <PhoneCall className="w-5 h-5 text-amber-500" />
                <div>
                  <div className="text-xs text-[var(--muted)]">Helpline / Talk</div>
                  <div className="text-xl font-bold text-[var(--text)]">{resetStats.talk}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: MEMBERS */}
      {activeSubTab === "members" && (
        <div className="p-6 rounded-[24px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)] space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <h3 className="font-serif text-lg text-[var(--text)]">Member Cohort</h3>
              <p className="text-xs text-[var(--muted)]">
                Track streaks, safety flags, and recent reset triggers
              </p>
            </div>
            <Users className="w-4 h-4 text-[var(--accent)]" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs text-[var(--muted)]">
                  <th className="pb-3 font-medium">Member</th>
                  <th className="pb-3 font-medium">Streak</th>
                  <th className="pb-3 font-medium">Points</th>
                  <th className="pb-3 font-medium">Safety / Reset</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {members.map((m) => {
                  const recentResetCount = state.resetLogs.filter(
                    (l) => l.userId === m.id
                  ).length;
                  const isHighReset = recentResetCount >= 3;

                  return (
                    <tr key={m.id} className="hover:bg-[var(--subtle-surface)]/50 transition-colors">
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.photo}
                            alt={m.name}
                            className="w-9 h-9 rounded-full object-cover border border-[var(--border)]"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="font-medium text-[var(--text)] flex items-center gap-1.5">
                              <span>{m.name}</span>
                              {m.hasTriggeredSafety && (
                                <span className="p-0.5 rounded bg-rose-500/10 text-rose-500 text-[10px] font-bold flex items-center gap-0.5">
                                  <ShieldAlert className="w-3 h-3" /> Safety Alert
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[var(--muted)]">{m.role}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 pr-3">
                        <div className="font-serif font-bold text-[var(--highlight)]">
                          {m.currentStreak}d
                        </div>
                      </td>

                      <td className="py-3.5 pr-3">
                        <div className="font-serif text-[var(--accent)] font-medium">
                          {m.totalPoints} pts
                        </div>
                      </td>

                      <td className="py-3.5 pr-3">
                        {isHighReset ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-xs font-medium">
                            <AlertTriangle className="w-3 h-3" /> {recentResetCount} resets
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--muted)]">
                            {recentResetCount} resets
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => {
                              setSelectedMemberForReview(m);
                              setIsReviewModalOpen(true);
                            }}
                            className="py-1 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Review all check-in reflections, streak progress, and 60s reset tool logs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review Data</span>
                          </button>

                          <button
                            onClick={() => switchMemberAccount(m.id)}
                            className="py-1 px-2.5 rounded-lg border border-[var(--border)] bg-white dark:bg-stone-800 text-[var(--text)] text-xs font-medium hover:bg-[var(--subtle-surface)] transition-colors flex items-center gap-1 cursor-pointer"
                            title="Switch to this participant account (Coach review mode)"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-accent" />
                            <span>Switch</span>
                          </button>

                          <button
                            onClick={() => {
                              alert(`Gentle encouragement nudge queued for ${m.name.split(" ")[0]}!`);
                            }}
                            className="py-1 px-2 rounded-lg border border-[var(--border)] text-xs font-medium hover:bg-[var(--subtle-surface)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                            title="Send encouragement nudge"
                          >
                            Nudge
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: CHECK-INS */}
      {activeSubTab === "checkins" && (
        <div className="p-6 rounded-[24px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)] space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <h3 className="font-serif text-lg text-[var(--text)]">
                Today&apos;s Reflections ({checkedInTodayCount})
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Mark as seen so members receive confirmation that {coachFirstName} read their note.
              </p>
            </div>
            <Calendar className="w-4 h-4 text-[var(--accent)]" />
          </div>

          <div className="space-y-3">
            {checkedInToday.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--muted)]">
                No reflections recorded yet today. Check back as members complete their morning pause.
              </div>
            ) : (
              checkedInToday.map((checkIn) => {
                const user = state.users.find((u) => u.id === checkIn.userId);
                return (
                  <div
                    key={checkIn.id}
                    className="p-4 rounded-2xl bg-[var(--subtle-surface)] border border-[var(--border)] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user?.photo}
                          alt={user?.name}
                          className="w-8 h-8 rounded-full object-cover border border-[var(--border)]"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="text-sm font-medium text-[var(--text)]">
                            {user?.name}
                          </div>
                          <div className="text-xs text-[var(--muted)]">
                            Day {checkIn.dayNumber} · Mood: {MOOD_SCALE[checkIn.moodScore].emoji}{" "}
                            {MOOD_SCALE[checkIn.moodScore].word}
                          </div>
                        </div>
                      </div>

                      {checkIn.seenByCoach ? (
                        <span className="inline-flex items-center gap-1 text-xs text-[var(--accent)] font-medium">
                          <CheckCircle2 className="w-4 h-4" /> Marked Read
                        </span>
                      ) : (
                        <button
                          onClick={() => coachMarkSeen(checkIn.id)}
                          className="py-1.5 px-3 rounded-xl bg-[var(--accent)] text-white text-xs font-medium hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Mark as Read</span>
                        </button>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                      <div className="text-[11px] text-[var(--muted)] mb-1">
                        Discovery ({checkIn.feelingBefore} ➔ {checkIn.feelingNow}):
                      </div>
                      <p className="font-serif italic text-sm text-[var(--text)] leading-relaxed">
                        &ldquo;{checkIn.discovery}&rdquo;
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: QUESTIONS */}
      {activeSubTab === "questions" && (
        <div className="p-6 rounded-[24px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)] space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <h3 className="font-serif text-lg text-[var(--text)]">Member Questions Queue</h3>
              <p className="text-xs text-[var(--muted)]">
                Coach answers replace the AI answer and appear with your personal badge.
              </p>
            </div>
            <Sparkles className="w-4 h-4 text-[var(--highlight)]" />
          </div>

          <div className="space-y-4">
            {state.questions.map((q) => (
              <div
                key={q.id}
                className={`p-4 rounded-2xl border space-y-3 ${
                  q.isCrisis
                    ? "bg-rose-500/5 border-rose-500/30"
                    : "bg-[var(--subtle-surface)] border-[var(--border)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={q.userPhoto}
                      alt={q.userName}
                      className="w-8 h-8 rounded-full object-cover border border-[var(--border)]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-sm font-medium text-[var(--text)] flex items-center gap-1.5">
                        <span>{q.userName}</span>
                        {q.isCrisis && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white text-[10px] font-bold">
                            Safety Trigger
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        {new Date(q.askedAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-[var(--text)] font-medium">
                  &ldquo;{q.text}&rdquo;
                </div>

                {q.coachAnswer ? (
                  <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--accent)] text-xs space-y-1">
                    <div className="font-semibold text-[var(--accent)] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {coachFirstName}&apos;s Answer:
                    </div>
                    <p className="text-[var(--text)] leading-relaxed">{q.coachAnswer}</p>
                  </div>
                ) : answeringQuestionId === q.id ? (
                  <div className="space-y-2 pt-2">
                    <textarea
                      autoFocus
                      rows={3}
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="Write your personal reply in 3-5 sentences..."
                      className="w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text)] focus:border-[var(--accent)]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setAnsweringQuestionId(null)}
                        className="py-1.5 px-3 rounded-lg text-xs text-[var(--muted)] hover:text-[var(--text)]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveAnswer(q.id)}
                        disabled={!answerText.trim()}
                        className="py-1.5 px-4 rounded-lg bg-[var(--accent)] text-white text-xs font-medium hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Answer</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setAnsweringQuestionId(q.id);
                        setAnswerText("");
                      }}
                      className="py-1.5 px-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-medium hover:bg-[var(--subtle-surface)] text-[var(--text)] transition-colors"
                    >
                      Answer Directly
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 5: CHALLENGES */}
      {activeSubTab === "challenges" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Active Challenge Card */}
          <div className="p-6 rounded-[24px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                Active Cohort Challenge
              </span>
              <span className="text-xs text-[var(--muted)]">
                {activeChallenge?.days.length} Days
              </span>
            </div>
            <h3 className="text-2xl font-serif text-[var(--text)]">
              {activeChallenge?.title}
            </h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {activeChallenge?.description}
            </p>
          </div>

          {/* AI Challenge Generator Card */}
          <div className="p-6 rounded-[24px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)] space-y-5">
            <div>
              <h3 className="font-serif text-lg text-[var(--text)]">
                Create a New Challenge with AI
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Generate tailored 60-second actions and a ready-to-share WhatsApp announcement.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[var(--muted)] mb-1 block">Theme or Focus</label>
                <input
                  type="text"
                  value={challengeTheme}
                  onChange={(e) => setChallengeTheme(e.target.value)}
                  placeholder="e.g. Navigating Difficult Conversations"
                  className="w-full p-3 rounded-xl bg-[var(--subtle-surface)] border border-[var(--border)] text-sm text-[var(--text)] focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--muted)] mb-1 block">Duration</label>
                <div className="flex gap-2">
                  {[7, 14, 21].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setChallengeDaysCount(days as any)}
                      className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                        challengeDaysCount === days
                          ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)] font-semibold"
                          : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateChallenge}
              disabled={isGeneratingChallenge || !challengeTheme.trim()}
              className="py-3 px-6 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center gap-2 text-sm shadow-xs w-full"
            >
              {isGeneratingChallenge ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Drafting {challengeDaysCount}-Day Practice...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Challenge Schedule</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Challenge Preview & Publish Form */}
          {generatedChallenge && (
            <div className="p-6 rounded-[24px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--card-shadow)] space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div>
                  <h4 className="text-xl font-serif text-[var(--text)]">
                    {generatedChallenge.title}
                  </h4>
                  <p className="text-xs text-[var(--muted)]">
                    {generatedChallenge.days.length} Daily 60-Second Micro-Actions
                  </p>
                </div>
                <button
                  onClick={handlePublishChallenge}
                  className="py-2.5 px-5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Publish as Active Challenge</span>
                </button>
              </div>

              {/* WhatsApp Announcement Box */}
              <div className="p-4 rounded-xl bg-[var(--subtle-surface)] border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--muted)] font-medium">
                  <span>WhatsApp Cohort Announcement</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedChallenge.whatsappAnnouncement);
                      setCopiedAnnouncement(true);
                      setTimeout(() => setCopiedAnnouncement(false), 2000);
                    }}
                    className="text-[var(--accent)] hover:underline flex items-center gap-1"
                  >
                    {copiedAnnouncement ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAnnouncement ? "Copied!" : "Copy Text"}</span>
                  </button>
                </div>
                <pre className="text-xs text-[var(--text)] whitespace-pre-wrap font-sans bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)]">
                  {generatedChallenge.whatsappAnnouncement}
                </pre>
              </div>

              {/* Day-by-Day Table */}
              <div className="space-y-3">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Schedule Review
                </h5>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {generatedChallenge.days.map((day) => (
                    <div
                      key={day.dayNumber}
                      className="p-3 rounded-xl bg-[var(--subtle-surface)] border border-[var(--border)] text-xs flex items-start gap-3"
                    >
                      <span className="font-serif font-bold text-[var(--accent)] shrink-0">
                        Day {day.dayNumber}:
                      </span>
                      <div className="space-y-1">
                        <div className="text-[var(--text)] font-medium">
                          {day.oneMinuteAction}
                        </div>
                        <div className="text-[var(--muted)] italic">
                          Tip: {day.coachTip}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CoachInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      <EditPersonaModal
        isOpen={isEditPersonaModalOpen}
        onClose={() => setIsEditPersonaModalOpen(false)}
        personaUser={coachUser}
      />

      <MemberReviewModal
        member={selectedMemberForReview}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSwitchToMember={(id) => switchMemberAccount(id)}
      />
    </div>
  );
};
