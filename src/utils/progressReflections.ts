import { CheckIn, Post, ProgressReflectionItem, MoodScore } from "../types";
import { getLocalDateString, daysBetween } from "./helpers";

const AFFIRMATION_PROMPTS = [
  "Notice how much has softened in your spirit since this day.",
  "What felt overwhelming then has made space for new steadiness now.",
  "A gentle reminder that your quiet consistency was working even when you couldn't feel it.",
  "Honor the person who showed up on this day; they carried you to who you are today.",
  "Breathe into where you were then, and give gratitude for how far you've arrived.",
  "Your peace wasn't built in a single leap, but in micro-moments just like this one.",
  "Look how faithfully you have held space for your own nervous system.",
  "The seeds of presence you planted back then are still blooming today.",
];

interface IntervalDef {
  key: string;
  minDays: number;
  maxDays: number;
  label: string;
  checkInMilestone: string;
  postMilestone: string;
}

const MEANINGFUL_INTERVALS: IntervalDef[] = [
  {
    key: "1_week",
    minDays: 6,
    maxDays: 10,
    label: "1 week ago",
    checkInMilestone: "One week ago, you observed...",
    postMilestone: "One week ago, you shared with the circle...",
  },
  {
    key: "2_weeks",
    minDays: 11,
    maxDays: 18,
    label: "2 weeks ago",
    checkInMilestone: "Two weeks ago, you noticed...",
    postMilestone: "Two weeks ago, you reflected with the circle...",
  },
  {
    key: "3_weeks",
    minDays: 19,
    maxDays: 25,
    label: "3 weeks ago",
    checkInMilestone: "Three weeks ago, you discovered...",
    postMilestone: "Three weeks ago, you posted...",
  },
  {
    key: "1_month",
    minDays: 26,
    maxDays: 45,
    label: "1 month ago",
    checkInMilestone: "One month ago, you wrote...",
    postMilestone: "One month ago, you shared this milestone...",
  },
  {
    key: "2_months",
    minDays: 46,
    maxDays: 75,
    label: "2 months ago",
    checkInMilestone: "Two months ago, you wrote...",
    postMilestone: "Two months ago, you shared with the circle...",
  },
  {
    key: "3_months",
    minDays: 76,
    maxDays: 110,
    label: "3 months ago",
    checkInMilestone: "Three months ago, you captured this truth...",
    postMilestone: "Three months ago, you shared this reflection...",
  },
  {
    key: "6_months",
    minDays: 150,
    maxDays: 220,
    label: "6 months ago",
    checkInMilestone: "Half a year ago, you wrote...",
    postMilestone: "Six months ago, you shared with the circle...",
  },
  {
    key: "1_year",
    minDays: 300,
    maxDays: 400,
    label: "1 year ago",
    checkInMilestone: "One year ago, you documented this journey...",
    postMilestone: "One year ago today, you shared...",
  },
];

/**
 * Returns progress reflections for the given user, pulling strictly from their own past check-ins
 * and community posts at meaningful milestones (1 week, 2 weeks, 1 month, 3 months, etc.).
 * Guarantees privacy: only returns items matching userId.
 */
export function getProgressReflectionsForUser(
  userId: string,
  checkIns: CheckIn[],
  posts: Post[],
  referenceDateStr: string = getLocalDateString(new Date())
): ProgressReflectionItem[] {
  if (!userId) return [];

  // Strictly user's own data
  const userCheckIns = checkIns.filter(
    (c) => c.userId === userId && Boolean(c.discovery && c.discovery.trim())
  );

  const userPosts = posts.filter(
    (p) => p.userId === userId && Boolean(p.text && p.text.trim())
  );

  const results: ProgressReflectionItem[] = [];

  // For each interval, find the best candidate (either check-in or post)
  MEANINGFUL_INTERVALS.forEach((interval, intervalIdx) => {
    // Check-in candidates
    const checkInCandidates = userCheckIns
      .map((c) => {
        const days = daysBetween(c.date, referenceDateStr);
        return { item: c, days };
      })
      .filter((c) => c.days >= interval.minDays && c.days <= interval.maxDays)
      .sort((a, b) => Math.abs(a.days - (interval.minDays + interval.maxDays) / 2) - Math.abs(b.days - (interval.minDays + interval.maxDays) / 2));

    // Post candidates
    const postCandidates = userPosts
      .map((p) => {
        const postDateStr = getLocalDateString(new Date(p.createdAt));
        const days = daysBetween(postDateStr, referenceDateStr);
        return { item: p, days, postDateStr };
      })
      .filter((p) => p.days >= interval.minDays && p.days <= interval.maxDays)
      .sort((a, b) => Math.abs(a.days - (interval.minDays + interval.maxDays) / 2) - Math.abs(b.days - (interval.minDays + interval.maxDays) / 2));

    const prompt = AFFIRMATION_PROMPTS[intervalIdx % AFFIRMATION_PROMPTS.length];

    // Prefer check-in or post based on presence
    if (checkInCandidates.length > 0) {
      const best = checkInCandidates[0];
      const c = best.item;
      let secondary: string | undefined;
      if (c.feelingBefore && c.feelingNow) {
        secondary = `Arrived: "${c.feelingBefore}" → Left: "${c.feelingNow}"`;
      }

      results.push({
        id: `reflection_checkin_${c.id}_${interval.key}`,
        type: "checkin",
        sourceId: c.id,
        date: c.date,
        daysAgo: best.days,
        timeAgoLabel: interval.label,
        milestoneTitle: interval.checkInMilestone,
        text: c.discovery,
        secondaryText: secondary,
        moodScore: c.moodScore as MoodScore,
        dayNumber: c.dayNumber,
        affirmationPrompt: prompt,
      });
    } else if (postCandidates.length > 0) {
      const best = postCandidates[0];
      const p = best.item;

      results.push({
        id: `reflection_post_${p.id}_${interval.key}`,
        type: "post",
        sourceId: p.id,
        date: best.postDateStr,
        daysAgo: best.days,
        timeAgoLabel: interval.label,
        milestoneTitle: interval.postMilestone,
        text: p.text,
        images: p.images,
        affirmationPrompt: prompt,
      });
    }
  });

  // If no exact interval matched, but user has an entry older than 6 days that hasn't been resurfaced,
  // find the most poignant past entry and assign a clean human label
  if (results.length === 0) {
    const olderCheckIns = userCheckIns
      .map((c) => ({ item: c, days: daysBetween(c.date, referenceDateStr) }))
      .filter((c) => c.days >= 6)
      .sort((a, b) => b.days - a.days);

    if (olderCheckIns.length > 0) {
      const best = olderCheckIns[0];
      const c = best.item;
      const weeksAgo = Math.max(1, Math.round(best.days / 7));
      const label = weeksAgo === 1 ? "1 week ago" : `${weeksAgo} weeks ago`;

      results.push({
        id: `reflection_checkin_${c.id}_fallback`,
        type: "checkin",
        sourceId: c.id,
        date: c.date,
        daysAgo: best.days,
        timeAgoLabel: label,
        milestoneTitle: `${label.charAt(0).toUpperCase() + label.slice(1)}, you wrote...`,
        text: c.discovery,
        secondaryText: c.feelingBefore ? `Arrived: "${c.feelingBefore}" → Left: "${c.feelingNow}"` : undefined,
        moodScore: c.moodScore as MoodScore,
        dayNumber: c.dayNumber,
        affirmationPrompt: AFFIRMATION_PROMPTS[0],
      });
    }
  }

  return results;
}
