import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import {
  AppState,
  Challenge,
  ChatMessage,
  CheckIn,
  MoodScore,
  Post,
  Question,
  ResetLog,
  ResetTool,
  SavedMeditation,
  ThemeColorId,
  User,
} from "../types";
import {
  createInitialAppState,
} from "../data/seedData";
import {
  THEME_COLOR_PALETTES,
} from "../data/themeColors";
import {
  calculateStreakAndPoints,
  daysBetween,
  getLocalDateString,
  isCrisisText,
} from "../utils/helpers";

const STORAGE_KEY = "saathi_app_state_v1";

interface AppContextType {
  state: AppState;
  currentUser: User;
  isCoach: boolean;
  activeChallenge: Challenge | undefined;
  todayCheckIn: CheckIn | undefined;
  todayStr: string;
  userStreak: number;
  userCompletedDaysCount: number;
  nextDayNumber: number;
  safetyScreenTriggered: boolean;
  safetySource: string;
  theme: "dark" | "light";
  themeColor: ThemeColorId;
  activeNudgeMessage: string | null;
  // Access Gate State
  isGateUnlocked: boolean;
  gateAccessCode: string | null;
  unlockAccessGate: (code: string, memberName?: string) => { success: boolean; message: string };
  lockAccessGate: () => void;
  // Coach Inspection & Impersonation Session
  isCoachSession: boolean;
  coachImpersonatorId: string | null;
  switchMemberAccount: (userId: string) => void;
  exitCoachImpersonation: () => void;
  // 7-day Inactivity state & actions
  daysSinceLastCheckIn: number;
  inactivityAlertOpen: boolean;
  setInactivityAlertOpen: (open: boolean) => void;
  triggerSimulatedInactivity: () => void;
  dismissInactivityAlert: () => void;
  // Actions
  toggleTheme: () => void;
  setThemeColor: (colorId: ThemeColorId) => void;
  setCurrentUser: (userId: string) => void;
  updateUserProfile: (userId: string, updates: Partial<User>) => void;
  updateCoachInvite: (updates: Partial<AppState["coachInvite"]>) => void;
  redeemCoachInvite: (code: string) => { success: boolean; message: string };
  triggerSafetyScreen: (source?: string) => void;
  dismissSafetyScreen: () => void;
  submitCheckIn: (payload: {
    feelingBefore: string;
    discovery: string;
    feelingNow: string;
    moodScore: MoodScore;
    isEdit?: boolean;
  }) => Promise<{ checkIn: CheckIn; pointsAwarded: number } | { flagged: true }>;
  addPost: (text: string, images?: string[]) => Promise<{ flagged?: boolean }>;
  toggleReaction: (postId: string) => void;
  addComment: (postId: string, text: string, parentId?: string) => Promise<{ flagged?: boolean }>;
  toggleCommentReaction: (commentId: string) => void;
  sendChatMessage: (text: string) => Promise<{ flagged?: boolean; isFallback?: boolean }>;
  logResetUsage: (log: Omit<ResetLog, "id" | "userId" | "timestamp">) => void;
  saveMeditation: (med: Omit<SavedMeditation, "id" | "userId" | "createdAt">) => void;
  coachMarkSeen: (checkInId: string) => void;
  coachAnswerQuestion: (questionId: string, answer: string) => void;
  saveNewChallenge: (challenge: Challenge) => void;
  dismissNudge: () => void;
  resetAllData: () => void;
}

function getMemberAvatarForName(name: string): string {
  const avatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i)) % avatars.length;
  }
  return avatars[hash];
}

function resolveMemberFromUrl(baseState: AppState, urlName: string, urlJoinCode?: string | null): AppState {
  const cleanName = urlName.trim();
  const slugId = "user_" + cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "user_member";
  const code = (urlJoinCode?.trim() || baseState.coachInvite?.code || "SAATHI-ASHA-2026").toUpperCase();

  const existingUserIndex = baseState.users.findIndex(
    (u) => u.id === slugId || u.name.toLowerCase() === cleanName.toLowerCase()
  );

  let updatedUsers = [...baseState.users];
  if (existingUserIndex >= 0) {
    const existing = updatedUsers[existingUserIndex];
    updatedUsers[existingUserIndex] = {
      ...existing,
      invitedByCode: code,
      role: "member",
    };
  } else {
    const newMember: User = {
      id: slugId,
      name: cleanName,
      email: `${slugId.replace("user_", "")}@example.com`,
      photo: getMemberAvatarForName(cleanName),
      role: "member",
      joinedAt: new Date().toISOString(),
      joinDate: new Date().toISOString().slice(0, 10),
      totalPoints: 20,
      currentStreak: 0,
      longestStreak: 0,
      isSeedAccount: false,
      invitedByCode: code,
      bio: "Mindfulness practitioner in Coach Asha's circle",
      location: "India",
    };
    updatedUsers.push(newMember);
  }

  return {
    ...baseState,
    users: updatedUsers,
    currentUserId: slugId,
    gateAccessUnlocked: true,
    gateAccessCode: code,
  };
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    let urlName: string | null = null;
    let urlJoin: string | null = null;
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        urlName = params.get("name")?.trim() || null;
        urlJoin = params.get("join") || params.get("invite") || params.get("code") || params.get("ref");
      } catch (e) {}
    }

    const initial = createInitialAppState();
    let baseState: AppState = initial;

    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("heaven_app_state_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        const coachInitial = initial.users.find(x => x.id === "user_coach_pooja" || x.role === "coach") || initial.users[0];
        
        baseState = {
          ...initial,
          ...parsed,
          currentUserId: (parsed.currentUserId && parsed.currentUserId !== "user_ananya_s") ? parsed.currentUserId : "user_coach_pooja",
          users: (parsed.users || initial.users).map((u: User) => {
            if (u.id === "user_coach_pooja" || u.role === "coach") {
              return {
                ...u,
                name: (u.name === "Pooja V." || u.name === "Pooja") ? "Asha V." : (u.name || "Asha V."),
                email: (u.email === "pooja@heavencommunity.in" || !u.email) ? "asha@saathicommunity.in" : u.email,
                photo: (!u.photo || u.photo.includes("images.unsplash.com/photo-1573496359142-b8d87734a5a2")) ? coachInitial.photo : u.photo,
              };
            }
            if (u.bio && (u.bio.includes("Pooja") || u.bio.includes("HEAVEN"))) {
              return {
                ...u,
                bio: u.bio.replace(/Pooja/g, "Asha").replace(/HEAVEN/g, "Saathi"),
              };
            }
            return u;
          }),
          comments: (parsed.comments && parsed.comments.length > 0 ? parsed.comments : initial.comments).map((c: any) => {
            if (c.userName === "Pooja V." || c.userName === "Pooja") {
              return { ...c, userName: "Asha V." };
            }
            return c;
          }),
          coachInvite: {
            ...initial.coachInvite,
            ...(parsed.coachInvite || {}),
            code: (!parsed.coachInvite?.code || parsed.coachInvite?.code === "HEAVEN-POOJA-2026") ? "SAATHI-ASHA-2026" : parsed.coachInvite.code,
            description: (parsed.coachInvite?.description?.includes("Pooja") || parsed.coachInvite?.description?.includes("HEAVEN") || !parsed.coachInvite?.description) 
              ? "Official Coach Asha V. Private Practice Circle on Saathi" 
              : parsed.coachInvite.description,
          },
        };
      }
    } catch (e) {
      console.error("Failed to load saved state:", e);
    }

    if (urlName) {
      return resolveMemberFromUrl(baseState, urlName, urlJoin);
    }

    return baseState;
  });

  const [safetyScreenTriggered, setSafetyScreenTriggered] = useState(false);
  const [safetySource, setSafetySource] = useState<string>("app");
  const [activeNudgeMessage, setActiveNudgeMessage] = useState<string | null>(null);
  const [inactivityAlertOpen, setInactivityAlertOpen] = useState(false);
  const [coachImpersonatorId, setCoachImpersonatorId] = useState<string | null>(null);

  // Auto-parse URL referral join link with mandatory name parameter (?name=...&join=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlName = params.get("name")?.trim();
      const urlCode = params.get("join") || params.get("invite") || params.get("code") || params.get("ref");

      if (urlName) {
        setState((prev) => resolveMemberFromUrl(prev, urlName, urlCode));
        setCoachImpersonatorId(null);
      } else if (urlCode !== null) {
        const clean = (urlCode.trim() || "SAATHI-ASHA-2026").toUpperCase();
        setState((prev) => ({
          ...prev,
          gateAccessUnlocked: true,
          gateAccessCode: clean,
          users: prev.users.map((u) =>
            u.id === prev.currentUserId ? { ...u, invitedByCode: clean } : u
          ),
        }));
      }
    } catch (e) {
      console.error("Error parsing URL join link:", e);
    }
  }, [state.coachInvite?.code]);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to persist state:", e);
    }
  }, [state]);

  // Sync theme class and color palette CSS variables to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    const currentPaletteId = state.themeColor || "sage";
    const palette =
      THEME_COLOR_PALETTES.find((p) => p.id === currentPaletteId) ||
      THEME_COLOR_PALETTES[0];
    const isDark = state.theme === "dark";
    const colors = isDark ? palette.dark : palette.light;

    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--accent-hover", colors.accentHover);
    root.style.setProperty("--accent-light", colors.accentLight);
    root.style.setProperty("--accent-tint", colors.accentTint);
    root.style.setProperty("--highlight", colors.highlight);
    root.style.setProperty("--highlight-light", colors.highlightLight);
  }, [state.theme, state.themeColor]);

  // Current local calendar day string (Rule A9 #5)
  const todayStr = useMemo(() => getLocalDateString(new Date()), []);

  const currentUser = useMemo(() => {
    return state.users.find((u) => u.id === state.currentUserId) || state.users[0];
  }, [state.users, state.currentUserId]);

  const isCoach = currentUser.role === "coach";
  const isCoachSession = isCoach || coachImpersonatorId === "user_coach_pooja";

  // Access Gate verification: Coach always has access; members need unlocked flag or invite code
  const isGateUnlocked = useMemo(() => {
    if (isCoach || isCoachSession) return true;
    if (state.gateAccessUnlocked === true) return true;
    if (currentUser.invitedByCode) return true;
    return false;
  }, [isCoach, isCoachSession, state.gateAccessUnlocked, currentUser.invitedByCode]);

  const activeChallenge = useMemo(() => {
    return (
      state.challenges.find((c) => c.id === state.activeChallengeId) ||
      state.challenges[0]
    );
  }, [state.challenges, state.activeChallengeId]);

  // Member's completed check-ins for active challenge
  const userCheckInsForChallenge = useMemo(() => {
    return state.checkIns.filter(
      (c) => c.userId === currentUser.id && c.challengeId === activeChallenge?.id
    );
  }, [state.checkIns, currentUser.id, activeChallenge?.id]);

  const todayCheckIn = useMemo(() => {
    return state.checkIns.find(
      (c) => c.userId === currentUser.id && c.date === todayStr
    );
  }, [state.checkIns, currentUser.id, todayStr]);

  // Rule A9 #6: Never hardcode the day number. Derive it from member's completed check-ins
  const nextDayNumber = useMemo(() => {
    if (todayCheckIn) return todayCheckIn.dayNumber;
    const totalChallengeDays = activeChallenge?.days.length || 7;
    return Math.min(totalChallengeDays, userCheckInsForChallenge.length + 1);
  }, [todayCheckIn, userCheckInsForChallenge.length, activeChallenge?.days.length]);

  const userStreak = currentUser.currentStreak;
  const userCompletedDaysCount = userCheckInsForChallenge.length;

  // Inactivity calculation
  const userCheckInsSorted = useMemo(() => {
    return state.checkIns
      .filter((c) => c.userId === currentUser.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [state.checkIns, currentUser.id]);

  const latestCheckInDate = userCheckInsSorted[0]?.date || (currentUser.joinedAt ? currentUser.joinedAt.slice(0, 10) : todayStr);
  const daysSinceLastCheckIn = useMemo(() => {
    return Math.max(0, daysBetween(latestCheckInDate, todayStr));
  }, [latestCheckInDate, todayStr]);

  // 7-day automatic inactivity detection
  useEffect(() => {
    if (isCoach) return;
    if (daysSinceLastCheckIn >= 7) {
      const dismissedOn = state.inactivityAlertDismissedAt?.[currentUser.id];
      if (!dismissedOn || dismissedOn !== todayStr) {
        setInactivityAlertOpen(true);
      }
    }
  }, [daysSinceLastCheckIn, isCoach, currentUser.id, state.inactivityAlertDismissedAt, todayStr]);

  const triggerSimulatedInactivity = useCallback(() => {
    setInactivityAlertOpen(true);
  }, []);

  const dismissInactivityAlert = useCallback(() => {
    setInactivityAlertOpen(false);
    setState((prev) => ({
      ...prev,
      inactivityAlertDismissedAt: {
        ...(prev.inactivityAlertDismissedAt || {}),
        [currentUser.id]: todayStr,
      },
    }));
  }, [currentUser.id, todayStr]);

  // Rule A6b: Automatic Nudge detection when member opens app
  useEffect(() => {
    if (isCoach) return;

    // Check member's checkins
    const userCheckIns = state.checkIns
      .filter((c) => c.userId === currentUser.id)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (userCheckIns.length === 0) return;

    const lastCheckIn = userCheckIns[userCheckIns.length - 1];
    const gap = daysBetween(lastCheckIn.date, todayStr);

    // If missed 2 or more days, and nudge hasn't been shown for this lapse
    if (gap >= 2) {
      const lastNudgeDate = state.nudgesShown[currentUser.id];
      if (!lastNudgeDate || daysBetween(lastNudgeDate, todayStr) >= 2) {
        // Fetch nudge message via API
        fetch("/api/gemini/nudge-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberName: currentUser.name.split(" ")[0],
            daysMissed: gap,
            dayToResume: nextDayNumber,
          }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.message) {
              setActiveNudgeMessage(data.message);
              setState((prev) => ({
                ...prev,
                nudgesShown: {
                  ...prev.nudgesShown,
                  [currentUser.id]: todayStr,
                },
              }));
            }
          })
          .catch(() => {
            setActiveNudgeMessage(
              `Hi ${currentUser.name.split(" ")[0]} — day ${nextDayNumber} is where many people pause, and that's completely natural. Here is a 60-second check-in whenever you're ready.`
            );
          });
      }
    }
  }, [currentUser.id, isCoach, todayStr, nextDayNumber, state.checkIns]);

  const toggleTheme = useCallback(() => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === "dark" ? "light" : "dark",
    }));
  }, []);

  const setThemeColor = useCallback((colorId: ThemeColorId) => {
    setState((prev) => ({
      ...prev,
      themeColor: colorId,
    }));
  }, []);

  const setCurrentUser = useCallback((userId: string) => {
    setState((prev) => ({
      ...prev,
      currentUserId: userId,
    }));
    setActiveNudgeMessage(null);
  }, []);

  const triggerSafetyScreen = useCallback((source = "user") => {
    setSafetyScreenTriggered(true);
    setSafetySource(source);
    // Flag user in coach view
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === prev.currentUserId ? { ...u, hasTriggeredSafety: true } : u
      ),
      resetLogs: [
        {
          id: `crisis_${Date.now()}`,
          userId: prev.currentUserId,
          tool: "talk",
          timestamp: new Date().toISOString(),
          isCrisis: true,
          detail: `Safety triggered from ${source}`,
        },
        ...prev.resetLogs,
      ],
    }));
  }, []);

  const dismissSafetyScreen = useCallback(() => {
    setSafetyScreenTriggered(false);
  }, []);

  const dismissNudge = useCallback(() => {
    setActiveNudgeMessage(null);
  }, []);

  // Submit or edit check-in
  const submitCheckIn = useCallback(
    async ({
      feelingBefore,
      discovery,
      feelingNow,
      moodScore,
      isEdit = false,
    }: {
      feelingBefore: string;
      discovery: string;
      feelingNow: string;
      moodScore: MoodScore;
      isEdit?: boolean;
    }) => {
      // 1. Safety screen client check
      const fullText = `${feelingBefore} ${discovery} ${feelingNow}`;
      if (isCrisisText(fullText)) {
        triggerSafetyScreen("checkin");
        return { flagged: true as const };
      }

      // 2. Safety screen server check (fail-closed)
      try {
        const safetyRes = await fetch("/api/safety/screen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: fullText }),
        });
        if (!safetyRes.ok) {
          triggerSafetyScreen("checkin");
          return { flagged: true as const };
        }
        const safetyData = await safetyRes.json();
        if (safetyData.flagged) {
          triggerSafetyScreen("checkin");
          return { flagged: true as const };
        }
      } catch (err) {
        // Fail closed
        triggerSafetyScreen("checkin");
        return { flagged: true as const };
      }

      const totalChallengeDays = activeChallenge?.days.length || 7;
      const isChallengeComplete = nextDayNumber === totalChallengeDays;

      // Calculate streak & points
      const { currentStreak, pointsToAward } = calculateStreakAndPoints(
        state.checkIns,
        currentUser.id,
        todayStr,
        isChallengeComplete,
        isEdit
      );

      let savedCheckIn: CheckIn;

      if (isEdit && todayCheckIn) {
        // Rule A9 #8: Editing a check-in must not award points again.
        savedCheckIn = {
          ...todayCheckIn,
          feelingBefore,
          discovery,
          feelingNow,
          moodScore,
          // keep pointsAwarded unchanged
        };

        setState((prev) => ({
          ...prev,
          checkIns: prev.checkIns.map((c) => (c.id === todayCheckIn.id ? savedCheckIn : c)),
        }));
      } else {
        savedCheckIn = {
          id: `checkin_${currentUser.id}_${Date.now()}`,
          userId: currentUser.id,
          challengeId: activeChallenge?.id || "chal_ground_01",
          dayNumber: nextDayNumber,
          date: todayStr,
          feelingBefore,
          discovery,
          feelingNow,
          moodScore,
          pointsAwarded: pointsToAward,
          seenByCoach: false,
        };

        setState((prev) => {
          const updatedUsers = prev.users.map((u) => {
            if (u.id === prev.currentUserId) {
              const newTotal = u.totalPoints + pointsToAward;
              const newLongest = Math.max(u.longestStreak, currentStreak);
              return {
                ...u,
                totalPoints: newTotal,
                currentStreak,
                longestStreak: newLongest,
              };
            }
            return u;
          });

          return {
            ...prev,
            users: updatedUsers,
            checkIns: [savedCheckIn, ...prev.checkIns],
          };
        });
      }

      return { checkIn: savedCheckIn, pointsAwarded: isEdit ? 0 : pointsToAward };
    },
    [
      activeChallenge?.days.length,
      activeChallenge?.id,
      currentUser.id,
      nextDayNumber,
      state.checkIns,
      todayCheckIn,
      todayStr,
      triggerSafetyScreen,
    ]
  );

  // Add Community post
  const addPost = useCallback(
    async (text: string, images: string[] = []) => {
      if (isCrisisText(text)) {
        // Rule A9 #3: A crisis message must never reach the community feed. It goes to private question queue!
        setState((prev) => ({
          ...prev,
          questions: [
            {
              id: `q_crisis_${Date.now()}`,
              userId: prev.currentUserId,
              userName: currentUser.name,
              userPhoto: currentUser.photo,
              text,
              askedAt: new Date().toISOString(),
              isPublished: false,
              isCrisis: true,
            },
            ...prev.questions,
          ],
        }));
        triggerSafetyScreen("post");
        return { flagged: true };
      }

      const newPost: Post = {
        id: `post_${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userPhoto: currentUser.photo,
        text,
        images: images.slice(0, 4),
        createdAt: new Date().toISOString(),
        reactions: [],
      };

      setState((prev) => ({
        ...prev,
        posts: [newPost, ...prev.posts],
      }));

      return { flagged: false };
    },
    [currentUser.id, currentUser.name, currentUser.photo, triggerSafetyScreen]
  );

  // Toggle reaction on post
  const toggleReaction = useCallback(
    (postId: string) => {
      setState((prev) => ({
        ...prev,
        posts: prev.posts.map((p) => {
          if (p.id !== postId) return p;
          const hasReacted = p.reactions.includes(currentUser.id);
          const newReactions = hasReacted
            ? p.reactions.filter((id) => id !== currentUser.id)
            : [...p.reactions, currentUser.id];
          return { ...p, reactions: newReactions };
        }),
      }));
    },
    [currentUser.id]
  );

  // Add comment to post (with threaded reply support)
  const addComment = useCallback(
    async (postId: string, text: string, parentId?: string) => {
      if (isCrisisText(text)) {
        triggerSafetyScreen("comment");
        return { flagged: true };
      }

      const newComment: AppState["comments"][0] = {
        id: `comment_${Date.now()}`,
        postId,
        userId: currentUser.id,
        userName: currentUser.name,
        userPhoto: currentUser.photo,
        text: text.trim(),
        createdAt: new Date().toISOString(),
        reactions: [],
        parentId,
      };

      setState((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newComment],
      }));

      return { flagged: false };
    },
    [currentUser.id, currentUser.name, currentUser.photo, triggerSafetyScreen]
  );

  // Toggle reaction on comment
  const toggleCommentReaction = useCallback(
    (commentId: string) => {
      setState((prev) => ({
        ...prev,
        comments: (prev.comments || []).map((c) => {
          if (c.id !== commentId) return c;
          const hasLiked = (c.reactions || []).includes(currentUser.id);
          const newReactions = hasLiked
            ? c.reactions.filter((id) => id !== currentUser.id)
            : [...(c.reactions || []), currentUser.id];
          return { ...c, reactions: newReactions };
        }),
      }));
    },
    [currentUser.id]
  );

  // Update user profile details & picture
  const updateUserProfile = useCallback(
    (userId: string, updates: Partial<User>) => {
      setState((prev) => {
        const updatedUsers = prev.users.map((u) => (u.id === userId ? { ...u, ...updates } : u));
        // If name or photo changed, update posts and comments authored by this user
        let updatedPosts = prev.posts;
        let updatedComments = prev.comments || [];
        if (updates.name || updates.photo) {
          updatedPosts = prev.posts.map((p) =>
            p.userId === userId
              ? {
                  ...p,
                  userName: updates.name || p.userName,
                  userPhoto: updates.photo || p.userPhoto,
                }
              : p
          );
          updatedComments = updatedComments.map((c) =>
            c.userId === userId
              ? {
                  ...c,
                  userName: updates.name || c.userName,
                  userPhoto: updates.photo || c.userPhoto,
                }
              : c
          );
        }

        return {
          ...prev,
          users: updatedUsers,
          posts: updatedPosts,
          comments: updatedComments,
        };
      });
    },
    []
  );

  // Update coach invite settings
  const updateCoachInvite = useCallback(
    (updates: Partial<AppState["coachInvite"]>) => {
      setState((prev) => ({
        ...prev,
        coachInvite: {
          ...prev.coachInvite,
          ...updates,
        },
      }));
    },
    []
  );

  // Redeem coach invite code / unlock gate
  const unlockAccessGate = useCallback(
    (code: string, memberName?: string) => {
      const cleanCode = code.trim().toUpperCase();
      const currentCode = (state.coachInvite?.code || "SAATHI-ASHA-2026").toUpperCase();

      if (
        cleanCode === currentCode ||
        cleanCode.startsWith("SAATHI") ||
        cleanCode.startsWith("HEAVEN") ||
        cleanCode === "ASHA" ||
        cleanCode === "ASHA2026" ||
        cleanCode === "POOJA" ||
        cleanCode === "POOJA2026"
      ) {
        setState((prev) => {
          let next = { ...prev };
          if (memberName && memberName.trim().length >= 2) {
            next = resolveMemberFromUrl(next, memberName.trim(), cleanCode);
          } else {
            next.gateAccessUnlocked = true;
            next.gateAccessCode = cleanCode;
            next.users = prev.users.map((u) =>
              u.id === prev.currentUserId ? { ...u, invitedByCode: cleanCode } : u
            );
          }
          return {
            ...next,
            coachInvite: {
              ...next.coachInvite,
              redeemedCount: (next.coachInvite?.redeemedCount || 0) + 1,
            },
          };
        });
        return { success: true, message: `Access unlocked! Welcome to Coach Asha's private circle.` };
      }
      return { success: false, message: "Invalid invite code. Please enter the invite code provided by Coach Asha." };
    },
    [state.coachInvite]
  );

  const lockAccessGate = useCallback(() => {
    setState((prev) => ({
      ...prev,
      gateAccessUnlocked: false,
      gateAccessCode: undefined,
    }));
  }, []);

  const redeemCoachInvite = unlockAccessGate;

  // Coach member switching actions
  const switchMemberAccount = useCallback((userId: string) => {
    setCoachImpersonatorId("user_coach_pooja");
    setState((prev) => ({
      ...prev,
      currentUserId: userId,
    }));
    setActiveNudgeMessage(null);
  }, []);

  const exitCoachImpersonation = useCallback(() => {
    setCoachImpersonatorId(null);
    setState((prev) => ({
      ...prev,
      currentUserId: "user_coach_pooja",
    }));
    setActiveNudgeMessage(null);
  }, []);

  // Send message in Ask tab (Gemini life coach)
  const sendChatMessage = useCallback(
    async (text: string) => {
      if (isCrisisText(text)) {
        // Route to coach queue
        setState((prev) => ({
          ...prev,
          questions: [
            {
              id: `q_crisis_${Date.now()}`,
              userId: prev.currentUserId,
              userName: currentUser.name,
              userPhoto: currentUser.photo,
              text,
              askedAt: new Date().toISOString(),
              isPublished: false,
              isCrisis: true,
            },
            ...prev.questions,
          ],
          chatMessages: [
            ...prev.chatMessages,
            {
              id: `msg_${Date.now()}`,
              userId: prev.currentUserId,
              sender: "user",
              text,
              timestamp: new Date().toISOString(),
            },
          ],
        }));
        triggerSafetyScreen("ask");
        return { flagged: true };
      }

      const userMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        userId: currentUser.id,
        sender: "user",
        text,
        timestamp: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        chatMessages: [...prev.chatMessages, userMsg],
      }));

      try {
        const userCheckIns = state.checkIns
          .filter((c) => c.userId === currentUser.id)
          .slice(0, 5);

        const recentOpenings = state.chatMessages
          .filter((m) => m.userId === currentUser.id && (m.sender === "coach" || m.sender === "ai"))
          .slice(-4)
          .map((m) => m.text.slice(0, 30));

        const res = await fetch("/api/gemini/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: state.chatMessages.filter((m) => m.userId === currentUser.id).slice(-10),
            memberName: currentUser.name.split(" ")[0],
            recentCheckIns: userCheckIns,
            previousOpenings: recentOpenings,
          }),
        });

        if (!res.ok) {
          throw new Error("Ask API request failed");
        }

        const data = await res.json();
        if (data.flagged) {
          triggerSafetyScreen("ask_ai");
          return { flagged: true };
        }

        const aiReply: ChatMessage = {
          id: `msg_ai_${Date.now()}`,
          userId: currentUser.id,
          sender: "ai",
          text: data.reply || "I am right here with you. Tell me what feels most pressing right now.",
          timestamp: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          chatMessages: [...prev.chatMessages, aiReply],
        }));

        return { flagged: false, isFallback: data.isFallback };
      } catch (err) {
        console.error("Ask error:", err);
        // Fallback message
        const fallbackReply: ChatMessage = {
          id: `msg_ai_fb_${Date.now()}`,
          userId: currentUser.id,
          sender: "ai",
          text: `Hi ${currentUser.name.split(" ")[0]}. What is going on today?`,
          timestamp: new Date().toISOString(),
        };
        setState((prev) => ({
          ...prev,
          chatMessages: [...prev.chatMessages, fallbackReply],
        }));
        return { flagged: false, isFallback: true };
      }
    },
    [currentUser.id, currentUser.name, currentUser.photo, state.chatMessages, state.checkIns, triggerSafetyScreen]
  );

  // Log 60-second reset tool usage
  const logResetUsage = useCallback(
    (log: Omit<ResetLog, "id" | "userId" | "timestamp">) => {
      const newLog: ResetLog = {
        id: `reset_${Date.now()}`,
        userId: currentUser.id,
        timestamp: new Date().toISOString(),
        ...log,
      };

      setState((prev) => {
        // If tool was 3 good things, award 10 points!
        let updatedUsers = prev.users;
        if (log.tool === "three_good_things") {
          updatedUsers = prev.users.map((u) =>
            u.id === prev.currentUserId ? { ...u, totalPoints: u.totalPoints + 10 } : u
          );
        }
        return {
          ...prev,
          users: updatedUsers,
          resetLogs: [newLog, ...prev.resetLogs],
        };
      });
    },
    [currentUser.id]
  );

  // Save generated meditation
  const saveMeditation = useCallback(
    (med: Omit<SavedMeditation, "id" | "userId" | "createdAt">) => {
      const newMed: SavedMeditation = {
        id: `med_${Date.now()}`,
        userId: currentUser.id,
        createdAt: getLocalDateString(new Date()),
        ...med,
      };
      setState((prev) => ({
        ...prev,
        savedMeditations: [newMed, ...prev.savedMeditations],
      }));
    },
    [currentUser.id]
  );

  // Coach action: Mark check-in seen
  const coachMarkSeen = useCallback((checkInId: string) => {
    setState((prev) => ({
      ...prev,
      checkIns: prev.checkIns.map((c) => (c.id === checkInId ? { ...c, seenByCoach: true } : c)),
    }));
  }, []);

  // Coach action: Answer question
  const coachAnswerQuestion = useCallback((questionId: string, answer: string) => {
    setState((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              coachAnswer: answer,
              answeredAt: new Date().toISOString(),
              isPublished: true,
            }
          : q
      ),
    }));
  }, []);

  // Coach action: Save challenge
  const saveNewChallenge = useCallback((challenge: Challenge) => {
    setState((prev) => ({
      ...prev,
      challenges: [challenge, ...prev.challenges.map((c) => ({ ...c, isActive: false }))],
      activeChallengeId: challenge.id,
    }));
  }, []);

  // Reset to clean seed data
  const resetAllData = useCallback(() => {
    const initial = createInitialAppState();
    setState(initial);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = {
    state,
    currentUser,
    isCoach,
    activeChallenge,
    todayCheckIn,
    todayStr,
    userStreak,
    userCompletedDaysCount,
    nextDayNumber,
    safetyScreenTriggered,
    safetySource,
    theme: state.theme,
    themeColor: state.themeColor || "sage",
    activeNudgeMessage,
    // Access Gate
    isGateUnlocked,
    gateAccessCode: state.gateAccessCode || null,
    unlockAccessGate,
    lockAccessGate,
    // Coach Session & Impersonation
    isCoachSession,
    coachImpersonatorId,
    switchMemberAccount,
    exitCoachImpersonation,
    daysSinceLastCheckIn,
    inactivityAlertOpen,
    setInactivityAlertOpen,
    triggerSimulatedInactivity,
    dismissInactivityAlert,
    toggleTheme,
    setThemeColor,
    setCurrentUser,
    updateUserProfile,
    updateCoachInvite,
    redeemCoachInvite,
    triggerSafetyScreen,
    dismissSafetyScreen,
    submitCheckIn,
    addPost,
    toggleReaction,
    addComment,
    toggleCommentReaction,
    sendChatMessage,
    logResetUsage,
    saveMeditation,
    coachMarkSeen,
    coachAnswerQuestion,
    saveNewChallenge,
    dismissNudge,
    resetAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
