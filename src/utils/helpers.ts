import { CheckIn } from "../types";

/**
 * Rule A9 #5: Never use toISOString().split("T")[0] for a calendar day.
 * Always construct YYYY-MM-DD from local getFullYear/getMonth/getDate.
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Days difference between two YYYY-MM-DD strings in local days
 */
export function daysBetween(dateStr1: string, dateStr2: string): number {
  const d1 = parseLocalDate(dateStr1);
  const d2 = parseLocalDate(dateStr2);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((d2.getTime() - d1.getTime()) / msPerDay);
}

/**
 * Rule A9 #1: Crisis detection with \w* stems
 * Must match: "I am suicidal", "I think about suicide", "I am being abused", "he abuses me"
 * Must NOT match: "I killed it in my presentation", "I want to dye my hair"
 */
export function isCrisisText(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  const normalized = text.toLowerCase();
  
  const crisisPatterns = [
    /\bsuicid\w*/i,
    /\babus\w*/i,
    /\bself[- ]?harm\w*/i,
    /\bkill(?:ing)?\s+(?:myself|oneself)\b/i,
    /\bend\s+my\s+life\b/i,
    /\bwant\s+to\s+die\b/i,
    /\bhurt(?:ing)?\s+myself\b/i,
  ];

  return crisisPatterns.some((pattern) => pattern.test(normalized));
}

/**
 * Sanity test verification for Rule A9 #1
 */
export function runCrisisAssertionTests(): boolean {
  const mustFlag = [
    "I am suicidal",
    "I think about suicide",
    "I am being abused",
    "he abuses me",
    "I want to commit suicide",
    "experiencing abusive treatment",
  ];

  const mustPass = [
    "I killed it in my presentation",
    "I want to dye my hair",
    "That was a killer workout",
    "The bus was late today",
    "I felt steady and peaceful",
  ];

  const flagResults = mustFlag.every((s) => isCrisisText(s) === true);
  const passResults = mustPass.every((s) => isCrisisText(s) === false);

  return flagResults && passResults;
}

/**
 * Rule A9 #9 & #10:
 * Calculate current streak & points
 * Base checkin points: 10
 * Streak bonus beyond day 1: min(25, (streak - 1) * 5)
 * Challenge completion bonus: 50 (if dayNumber === totalDays)
 */
export function calculateStreakAndPoints(
  existingCheckIns: CheckIn[],
  userId: string,
  todayStr: string,
  isChallengeComplete: boolean,
  isEditingExistingTodayCheckIn: boolean
): { currentStreak: number; pointsToAward: number } {
  const userCheckIns = existingCheckIns
    .filter((c) => c.userId === userId)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Find unique check-in dates
  const uniqueDates = Array.from(new Set(userCheckIns.map((c) => c.date))).sort();

  if (isEditingExistingTodayCheckIn) {
    // If editing today's check-in, streak doesn't change, 0 extra points awarded
    return {
      currentStreak: computeStreakFromDates(uniqueDates, todayStr),
      pointsToAward: 0,
    };
  }

  // Adding a new check-in today:
  const datesWithToday = Array.from(new Set([...uniqueDates, todayStr])).sort();
  const currentStreak = computeStreakFromDates(datesWithToday, todayStr);

  const basePoints = 10;
  const streakBonus = Math.min(25, Math.max(0, (currentStreak - 1) * 5));
  const completionBonus = isChallengeComplete ? 50 : 0;
  const pointsToAward = basePoints + streakBonus + completionBonus;

  return { currentStreak, pointsToAward };
}

export function computeStreakFromDates(sortedUniqueDates: string[], referenceDate: string): number {
  if (sortedUniqueDates.length === 0) return 0;

  // If the latest check-in is not today or yesterday, streak is broken
  const lastDate = sortedUniqueDates[sortedUniqueDates.length - 1];
  const gapToRef = daysBetween(lastDate, referenceDate);

  if (gapToRef > 1) {
    return 0; // Streak broken
  }

  let streak = 1;
  for (let i = sortedUniqueDates.length - 1; i > 0; i--) {
    const current = sortedUniqueDates[i];
    const prev = sortedUniqueDates[i - 1];
    if (daysBetween(prev, current) === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function formatRelativeTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 60) return "just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  } catch {
    return "recently";
  }
}

/**
 * Client-side image compression to Keep localStorage healthy
 */
export function compressImageFile(file: File, maxDim = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(img.src);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
