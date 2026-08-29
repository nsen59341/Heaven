export type Role = "member" | "coach";
export type MoodScore = 1 | 2 | 3 | 4 | 5;
export type TabType = "today" | "ask" | "community" | "me" | "coach";
export type ResetTool = "breathe" | "meditation" | "three_good_things" | "talk";

export interface MoodMeta {
  score: MoodScore;
  emoji: string;
  word: string;
  color: string;
}

export const MOOD_SCALE: Record<MoodScore, MoodMeta> = {
  1: { score: 1, emoji: "🌧️", word: "Heavy", color: "#7FA3C4" },
  2: { score: 2, emoji: "🌥️", word: "Low", color: "#8FB8A8" },
  3: { score: 3, emoji: "🌤️", word: "Steady", color: "#C9C08A" },
  4: { score: 4, emoji: "☀️", word: "Light", color: "#E8B98A" },
  5: { score: 5, emoji: "🌞", word: "Bright", color: "#E8956B" },
};

export interface User {
  id: string;
  name: string;
  email: string;
  photo: string;
  role: Role;
  joinedAt: string; // ISO date string or YYYY-MM-DD
  joinDate?: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  isSeedAccount: boolean;
  age?: number;
  bio?: string;
  specialty?: string;
  location?: string;
  phone?: string;
  hasTriggeredSafety?: boolean;
  invitedByCode?: string;
}

export interface DayChallenge {
  dayNumber: number;
  title?: string;
  oneMinuteAction: string;
  reflectionQuestion?: string;
  coachNote?: string;
  coachTip?: string;
}

export type ChallengeDay = DayChallenge;

export interface Challenge {
  id: string;
  title: string;
  theme?: string;
  description: string;
  days: DayChallenge[];
  createdAt?: string;
  isActive?: boolean;
  status?: "active" | "draft" | "past";
  whatsAppAnnouncement?: string;
  whatsappAnnouncement?: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  challengeId: string;
  dayNumber: number;
  date: string; /* YYYY-MM-DD local format */
  feelingBefore: string;
  discovery: string;
  feelingNow: string;
  moodScore: MoodScore;
  pointsAwarded: number;
  seenByCoach: boolean;
  coachNote?: string;
}

export interface Question {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  text: string;
  askedAt: string;
  aiAnswer?: string;
  coachAnswer?: string;
  answeredAt?: string;
  isPublished: boolean;
  isCrisis?: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  text: string;
  createdAt: string;
  reactions: string[]; /* array of userIds */
  parentId?: string; /* for threaded replies to another comment */
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  text: string;
  images?: string[]; /* max 4 */
  createdAt: string;
  reactions: string[]; /* array of userIds */
  isSeed?: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  sender: "user" | "ai" | "coach";
  text: string;
  timestamp: string;
}

export interface ResetLog {
  id: string;
  userId: string;
  tool: ResetTool;
  timestamp: string;
  moodBefore?: MoodScore;
  moodAfter?: MoodScore;
  detail?: string;
  isCrisis?: boolean;
}

export interface SavedMeditation {
  id: string;
  userId: string;
  situation: string;
  title: string;
  script: string[];
  createdAt: string;
}

export type ThemeColorId = "sage" | "celestial" | "rose" | "lavender" | "amber" | "emerald";

export interface CoachInvite {
  code: string;
  coachId: string;
  createdAt: string;
  description?: string;
  active: boolean;
  redeemedCount?: number;
}

export interface ProgressReflectionItem {
  id: string;
  type: "checkin" | "post";
  sourceId: string;
  date: string;
  daysAgo: number;
  timeAgoLabel: string; // e.g. "1 week ago", "1 month ago", "3 months ago"
  milestoneTitle: string; // e.g. "One month ago, you observed...", "One week ago, you shared with the circle..."
  text: string;
  secondaryText?: string; // e.g. "Arrived feeling: heavy • Left feeling: calmer"
  moodScore?: MoodScore;
  dayNumber?: number;
  images?: string[];
  affirmationPrompt: string;
}

export interface AppState {
  users: User[];
  currentUserId: string;
  challenges: Challenge[];
  activeChallengeId: string;
  checkIns: CheckIn[];
  questions: Question[];
  chatMessages: ChatMessage[];
  posts: Post[];
  comments: PostComment[];
  coachInvite: CoachInvite;
  theme: "dark" | "light";
  themeColor?: ThemeColorId;
  resetLogs: ResetLog[];
  savedMeditations: SavedMeditation[];
  nudgesShown: Record<string, string>; // userId -> lastNudgeDate YYYY-MM-DD
  inactivityAlertDismissedAt?: Record<string, string>; // userId -> date YYYY-MM-DD
  gateAccessUnlocked?: boolean;
  gateAccessCode?: string;
}
