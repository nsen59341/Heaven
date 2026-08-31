import { AppState, Challenge, CheckIn, CoachInvite, Post, PostComment, Question, ResetLog, User } from "../types";
import { getLocalDateString } from "../utils/helpers";
import ashaAvatar from "../assets/images/asha_avatar.jpg";

// Helper to subtract local days from today
export function getRelativeLocalDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const SEED_CHALLENGE: Challenge = {
  id: "chal_ground_01",
  title: "Finding Your Ground",
  theme: "Micro-Pauses in Daily Life",
  description: "A 7-day journey to build an unshakeable habit of 60-second pauses between the noise.",
  status: "active",
  isActive: true,
  createdAt: getRelativeLocalDateStr(25),
  whatsAppAnnouncement: "Starting tomorrow: 'Finding Your Ground' — 7 days of 60-second micro-pauses. No long journaling or heavy routines. Just one minute to breathe and notice where you are.",
  days: [
    {
      dayNumber: 1,
      title: "The Unclench",
      oneMinuteAction: "Drop your shoulders down 2 inches, unclamp your jaw, and let your hands rest flat on your thighs for 60 seconds.",
      reflectionQuestion: "Where in your body were you holding tension before you stopped?",
      coachNote: "Day one is about arriving. Don't try to feel peaceful, just feel whatever is there.",
    },
    {
      dayNumber: 2,
      title: "Three Slow Exhales",
      oneMinuteAction: "Inhale gently for 4 counts, then exhale slowly for 7 counts, three times in a row without rushing.",
      reflectionQuestion: "What changed in the space behind your eyes as you slowed down the exhale?",
      coachNote: "The longer exhale is your nervous system's brake pedal. Use it anytime.",
    },
    {
      dayNumber: 3,
      title: "Naming the Noise",
      oneMinuteAction: "Look around your space and name three neutral physical objects out loud before touching your phone.",
      reflectionQuestion: "What happens to the mental loop when you bring your senses into the physical room?",
      coachNote: "Grounding starts in the eyes and ears before it reaches the mind.",
    },
    {
      dayNumber: 4,
      title: "The 30-Second Doorway",
      oneMinuteAction: "Before opening the next door or app, pause with your hand still for three full breaths.",
      reflectionQuestion: "Did you notice an urge to rush past the threshold? What was behind it?",
      coachNote: "Thresholds are where we lose ourselves to urgency. Reclaim them.",
    },
    {
      dayNumber: 5,
      title: "Permission to Not Fix",
      oneMinuteAction: "Think of one unfinished task or uncomfortable feeling, and say silently: 'I don't have to fix this in the next 60 seconds.'",
      reflectionQuestion: "What is one thing that can wait 10 minutes without falling apart?",
      coachNote: "Day five is where most people try to rush. Keep it light today.",
    },
    {
      dayNumber: 6,
      title: "Cup in Both Hands",
      oneMinuteAction: "Hold your morning tea, coffee, or glass of water with both hands, noticing the warmth or cool weight.",
      reflectionQuestion: "What did you taste or notice that you usually swallow without sensing?",
      coachNote: "Simple sensory anchors break the trance of overthinking.",
    },
    {
      dayNumber: 7,
      title: "Carrying the Quiet",
      oneMinuteAction: "Place one hand over your heart or stomach and say thank you to yourself for showing up 7 days in a row.",
      reflectionQuestion: "Looking back at Day 1, what is one tiny shift you noticed in your reaction to daily stress?",
      coachNote: "You built something real this week. Carry it forward one breath at a time.",
    },
  ],
};

export const COACH_USER: User = {
  id: "user_coach_pooja",
  name: "Asha V.",
  email: "asha@saathicommunity.in",
  photo: ashaAvatar,
  role: "coach",
  joinedAt: getRelativeLocalDateStr(120),
  totalPoints: 1250,
  currentStreak: 45,
  longestStreak: 45,
  isSeedAccount: true,
  bio: "Certified Mindfulness & Executive Life Coach helping ambitious individuals build emotional calm, steady focus, and grounded presence.",
  specialty: "Somatic Grounding & Stress Resilience",
  location: "Bangalore, India",
  phone: "+91 98450 12345",
};

// 14 Indian members (mixed gender, ages 28-52)
export const SEED_MEMBERS: User[] = [
  // 1 Demo user: 21-day streak
  {
    id: "user_ananya_s",
    name: "Ananya S.",
    email: "ananya.s@example.com",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "member",
    joinedAt: getRelativeLocalDateStr(22),
    totalPoints: 495,
    currentStreak: 21,
    longestStreak: 21,
    isSeedAccount: true,
    age: 31,
    bio: "Product designer learning to pause before solving everyone's fire.",
  },
  // 4 members who checked in 6 or 7 of the last 7 days
  {
    id: "user_rohit_m",
    name: "Rohit M.",
    email: "rohit.m@example.com",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "member",
    joinedAt: getRelativeLocalDateStr(30),
    totalPoints: 340,
    currentStreak: 7,
    longestStreak: 12,
    isSeedAccount: true,
    age: 38,
    bio: "Engineering lead, finding calm before the daily standup.",
  },
  {
    id: "user_meera_k",
    name: "Meera K.",
    email: "meera.k@example.com",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    role: "member",
    joinedAt: getRelativeLocalDateStr(18),
    totalPoints: 280,
    currentStreak: 6,
    longestStreak: 8,
    isSeedAccount: true,
    age: 29,
    bio: "Architect & plant parent. Practicing breathing through revisions.",
  },
  {
    id: "user_arjun_n",
    name: "Arjun N.",
    email: "arjun.n@example.com",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "member",
    joinedAt: getRelativeLocalDateStr(25),
    totalPoints: 310,
    currentStreak: 7,
    longestStreak: 10,
    isSeedAccount: true,
    age: 44,
    bio: "Small business owner learning that stepping back makes clearer decisions.",
  },
  {
    id: "user_divya_r",
    name: "Divya R.",
    email: "divya.r@example.com",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    role: "member",
    joinedAt: getRelativeLocalDateStr(15),
    totalPoints: 260,
    currentStreak: 6,
    longestStreak: 6,
    isSeedAccount: true,
    age: 35,
    bio: "Freelance researcher, mom of two. Loving the 60-second breathing.",
  },
  // 4 members who checked in 3 or 4 days with gaps
  {
    id: "user_vikram_t",
    name: "Vikram T.",
    email: "vikram.t@example.com",
    photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    role: "member",
    joinedAt: getRelativeLocalDateStr(14),
    totalPoints: 140,
    currentStreak: 1,
    longestStreak: 3,
    isSeedAccount: true,
    age: 41,
    bio: "Consultant traveling frequently. Striving for steady mornings.",
  },
  {
    id: "user_priya_d",
    name: "Priya D.",
    email: "priya.d@example.com",
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    role: "member",
    joinedAt: getRelativeLocalDateStr(12),
    totalPoints: 110,
    currentStreak: 2,
    longestStreak: 4,
    isSeedAccount: true,
    age: 28,
    bio: "Content creator trying to unplug from notifications without guilt.",
  },
  {
    id: "user_karthik_b",
    name: "Karthik B.",
    email: "karthik.b@example.com",
    photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    role: "member",
    joinedAt: getRelativeLocalDateStr(10),
    totalPoints: 95,
    currentStreak: 0,
    longestStreak: 3,
    isSeedAccount: true,
    age: 33,
    bio: "Lawyer in corporate litigation. Seeking one quiet breath per afternoon.",
  },
  {
    id: "user_sneha_p",
    name: "Sneha P.",
    email: "sneha.p@example.com",
    photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80",
    role: "member",
    joinedAt: getRelativeLocalDateStr(9),
    totalPoints: 85,
    currentStreak: 1,
    longestStreak: 3,
    isSeedAccount: true,
    age: 37,
    bio: "Educator & curriculum coordinator.",
  },
  // 3 members whose last check-in was 5 to 9 days ago (gone quiet!)
  {
    id: "user_siddharth_j",
    name: "Siddharth J.",
    email: "siddharth.j@example.com",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    role: "member",
    joinedAt: getRelativeLocalDateStr(14),
    totalPoints: 60,
    currentStreak: 0,
    longestStreak: 4,
    isSeedAccount: true,
    age: 49,
    bio: "Operations director. Started strong on Day 1 but caught up in budget week.",
  },
  {
    id: "user_tanvi_g",
    name: "Tanvi G.",
    email: "tanvi.g@example.com",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    role: "member",
    joinedAt: getRelativeLocalDateStr(11),
    totalPoints: 45,
    currentStreak: 0,
    longestStreak: 3,
    isSeedAccount: true,
    age: 32,
    bio: "Marketing strategist. Went quiet after day 3.",
  },
  {
    id: "user_manish_k",
    name: "Manish K.",
    email: "manish.k@example.com",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    role: "member",
    joinedAt: getRelativeLocalDateStr(16),
    totalPoints: 50,
    currentStreak: 0,
    longestStreak: 3,
    isSeedAccount: true,
    age: 52,
    bio: "Senior analyst. Missed last 8 days due to family travel.",
  },
  // 2 members who joined yesterday with one check-in
  {
    id: "user_radhika_s",
    name: "Radhika S.",
    email: "radhika.s@example.com",
    photo: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80",
    role: "member",
    joinedAt: getRelativeLocalDateStr(1),
    totalPoints: 10,
    currentStreak: 1,
    longestStreak: 1,
    isSeedAccount: true,
    age: 30,
    bio: "Graphic designer, just stepped into the community.",
  },
  {
    id: "user_kabir_m",
    name: "Kabir M.",
    email: "kabir.m@example.com",
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    role: "member",
    joinedAt: getRelativeLocalDateStr(1),
    totalPoints: 10,
    currentStreak: 1,
    longestStreak: 1,
    isSeedAccount: true,
    age: 36,
    bio: "Writer and podcaster exploring unhurried mornings.",
  },
];

export function generateSeedCheckIns(): CheckIn[] {
  const checkIns: CheckIn[] = [];

  // Ananya S: 21 days arc (Days 20 ago to 0 ago)
  // Week 1: vague, low energy
  // Week 2: naming pattern (saying yes too fast)
  // Week 3: acting on it imperfectly
  // Repeated detail: "morning tea by the balcony before checking messages"
  const ananyaReflections = [
    // Week 1 (Days 20 to 14 ago)
    {
      before: "woke up feeling weighed down with back-to-back reviews and zero head space",
      disc: "i rush into email the minute i wake up. had morning tea by the balcony before checking messages, felt slightly less rushed.",
      now: "calmer, still tense in the shoulders",
      mood: 2 as const,
    },
    {
      before: "foggy head, feeling like i am already behind before 9am",
      disc: "dropped my shoulders three times during the design sync. felt silly but it actually helped my neck.",
      now: "a little lighter",
      mood: 2 as const,
    },
    {
      before: "tired, feeling reactive and jumping at every slack ping",
      disc: "took 60 seconds with my hands flat on the desk. the world did not stop spinning because i paused.",
      now: "steady",
      mood: 3 as const,
    },
    {
      before: "restless, mind spinning on quarterly goals",
      disc: "drank morning tea by the balcony before checking messages. watched two pigeons on the railing, breathed slowly.",
      now: "quieter inside",
      mood: 3 as const,
    },
    {
      before: "low energy, slept poorly after late working hours",
      disc: "walked around the living room without holding my phone. simple but hard to do.",
      now: "grounded",
      mood: 3 as const,
    },
    {
      before: "overwhelmed by five simultaneous requests",
      disc: "noticed how tight my chest gets when i hear the notification chime. named three objects in the room.",
      now: "a bit steadier",
      mood: 3 as const,
    },
    {
      before: "fatigued from the week",
      disc: "sat quietly for 60 seconds. realized half the urgency in my head is self-created.",
      now: "peaceful",
      mood: 4 as const,
    },
    // Week 2 (Days 13 to 7 ago): naming pattern
    {
      before: "anxious about taking on another team project",
      disc: "noticed i say yes to extra deliverables before checking my own capacity. the urge to please everyone without breathing first.",
      now: "clearer",
      mood: 3 as const,
    },
    {
      before: "tight jaw, anticipating conflicts in the product review",
      disc: "took three slow exhales in the hallway. remembered i can pause before agreeing to unreasonable deadlines.",
      now: "grounded",
      mood: 3 as const,
    },
    {
      before: "cloudy thoughts, feeling rushed",
      disc: "enjoyed morning tea by the balcony before checking messages. the sunlight on the plants felt like a reminder to slow down.",
      now: "steady and warm",
      mood: 4 as const,
    },
    {
      before: "feeling caught in old habits of over-explaining",
      disc: "caught myself drafting a 5-paragraph apology. deleted it and sent two clean sentences instead.",
      now: "relieved",
      mood: 4 as const,
    },
    {
      before: "scattered energy across four browser tabs",
      disc: "closed the tabs and sat with both feet on the floor. my reflex is always to do more when i feel anxious.",
      now: "settled",
      mood: 3 as const,
    },
    {
      before: "nervous about presentation feedback",
      disc: "unclenched my hands under the desk. the feedback was constructive and not a catastrophe.",
      now: "light",
      mood: 4 as const,
    },
    {
      before: "peaceful start, slightly hesitant",
      disc: "morning tea by the balcony before checking messages has become my favorite 10 minutes of the whole day.",
      now: "bright and grateful",
      mood: 5 as const,
    },
    // Week 3 (Days 6 to 0 ago): acting on it imperfectly
    {
      before: "woke up with a busy agenda",
      disc: "held my ground in the sprint planning meeting. said i would look into it tomorrow instead of committing immediately.",
      now: "confident",
      mood: 4 as const,
    },
    {
      before: "a little stressed by an urgent escalation",
      disc: "stepped away from slack for 5 minutes of quiet breathing. the issue got resolved without me panicking.",
      now: "steady",
      mood: 4 as const,
    },
    {
      before: "restless afternoon dip",
      disc: "drank a glass of cold water with both hands. didn't scroll social media once during the pause.",
      now: "refreshed",
      mood: 4 as const,
    },
    {
      before: "rushing between client demos",
      disc: "paused at the doorway before opening zoom. entered the meeting with lowered shoulders.",
      now: "clear",
      mood: 4 as const,
    },
    {
      before: "tired, but not anxious",
      disc: "morning tea by the balcony before checking messages. watching the morning sky while the kettle whistled felt grounding.",
      now: "bright",
      mood: 5 as const,
    },
    {
      before: "slight headache from screen time",
      disc: "closed my eyes for 60 seconds and let the sound of traffic outside pass through without judging it.",
      now: "peaceful",
      mood: 4 as const,
    },
    // Today's checkin (Day 0)
    {
      before: "steady and ready for the day",
      disc: "morning tea by the balcony before checking messages. day 21 and the urge to rush has truly softened.",
      now: "complete peace",
      mood: 5 as const,
    },
  ];

  ananyaReflections.forEach((item, index) => {
    const offset = 20 - index;
    const dayNum = (index % 7) + 1;
    checkIns.push({
      id: `checkin_ananya_${index + 1}`,
      userId: "user_ananya_s",
      challengeId: "chal_ground_01",
      dayNumber: dayNum,
      date: getRelativeLocalDateStr(offset),
      feelingBefore: item.before,
      discovery: item.disc,
      feelingNow: item.now,
      moodScore: item.mood,
      pointsAwarded: 10 + Math.min(25, index * 5) + (dayNum === 7 ? 50 : 0),
      seenByCoach: index < 19,
      coachNote: index === 19 ? "Such a beautiful shift, Ananya. Proud of your consistency." : undefined,
    });
  });

  // Ananya S historical milestones (1 month ago & 3 months ago)
  checkIns.push(
    {
      id: "checkin_ananya_30d",
      userId: "user_ananya_s",
      challengeId: "chal_ground_01",
      dayNumber: 7,
      date: getRelativeLocalDateStr(30),
      feelingBefore: "doubting whether 60 seconds a day could change anything",
      discovery: "realized that my body holds tension long after an argument is over. today i let my breath reach all the way down to my belly.",
      feelingNow: "softened and grounded",
      moodScore: 3,
      pointsAwarded: 60,
      seenByCoach: true,
      coachNote: "The belly breath is the bridge to the nervous system. Keep going.",
    },
    {
      id: "checkin_ananya_60d",
      userId: "user_ananya_s",
      challengeId: "chal_ground_01",
      dayNumber: 4,
      date: getRelativeLocalDateStr(60),
      feelingBefore: "frustrated by endless project revisions",
      discovery: "took 3 box breaths before replying to feedback. noticed that calm words invite calm replies.",
      feelingNow: "clear and composed",
      moodScore: 4,
      pointsAwarded: 25,
      seenByCoach: true,
    },
    {
      id: "checkin_ananya_90d",
      userId: "user_ananya_s",
      challengeId: "chal_ground_01",
      dayNumber: 1,
      date: getRelativeLocalDateStr(90),
      feelingBefore: "constantly anxious, checking phone late into the night",
      discovery: "put my phone across the room before sleeping. the silence felt frightening at first, then deeply comforting.",
      feelingNow: "peaceful awakening",
      moodScore: 3,
      pointsAwarded: 15,
      seenByCoach: true,
    }
  );

  // Rohit M (7 days active)
  for (let i = 6; i >= 0; i--) {
    checkIns.push({
      id: `checkin_rohit_${i}`,
      userId: "user_rohit_m",
      challengeId: "chal_ground_01",
      dayNumber: 7 - i,
      date: getRelativeLocalDateStr(i),
      feelingBefore: i % 2 === 0 ? "heavy standup calls ahead" : "quiet morning",
      discovery: "unclenched jaw while waiting for compiler to build. small micro-pause made a big difference.",
      feelingNow: "clear and composed",
      moodScore: (3 + (i % 3)) as any,
      pointsAwarded: 15,
      seenByCoach: true,
    });
  }

  // Meera K (6 days active)
  for (let i = 5; i >= 0; i--) {
    checkIns.push({
      id: `checkin_meera_${i}`,
      userId: "user_meera_k",
      challengeId: "chal_ground_01",
      dayNumber: 6 - i,
      date: getRelativeLocalDateStr(i),
      feelingBefore: "scrambling before site visit",
      discovery: "took 3 breaths by the drafting table. felt my feet on the wood floor.",
      feelingNow: "steady and centered",
      moodScore: 4,
      pointsAwarded: 15,
      seenByCoach: true,
    });
  }

  // Arjun N (7 days active)
  for (let i = 6; i >= 0; i--) {
    checkIns.push({
      id: `checkin_arjun_${i}`,
      userId: "user_arjun_n",
      challengeId: "chal_ground_01",
      dayNumber: 7 - i,
      date: getRelativeLocalDateStr(i),
      feelingBefore: "inventory delays causing stress",
      discovery: "held my cup with both hands without typing on whatsapp. felt my breathing slow down.",
      feelingNow: "grounded and ready",
      moodScore: (4 - (i % 2)) as any,
      pointsAwarded: 15,
      seenByCoach: true,
    });
  }

  // Divya R (6 days active)
  for (let i = 5; i >= 0; i--) {
    checkIns.push({
      id: `checkin_divya_${i}`,
      userId: "user_divya_r",
      challengeId: "chal_ground_01",
      dayNumber: 6 - i,
      date: getRelativeLocalDateStr(i),
      feelingBefore: "kids waking up, morning rush",
      discovery: "did the 4-7-8 breathing while boiling water. the kitchen felt calmer.",
      feelingNow: "light and patient",
      moodScore: 4,
      pointsAwarded: 15,
      seenByCoach: false,
    });
  }

  // Quiet members (last checkin was 5-9 days ago)
  // Siddharth J (6 days ago was last checkin)
  checkIns.push(
    {
      id: "checkin_sid_1",
      userId: "user_siddharth_j",
      challengeId: "chal_ground_01",
      dayNumber: 1,
      date: getRelativeLocalDateStr(9),
      feelingBefore: "racing thoughts",
      discovery: "felt tense in neck and back.",
      feelingNow: "a little easier",
      moodScore: 2,
      pointsAwarded: 10,
      seenByCoach: true,
    },
    {
      id: "checkin_sid_2",
      userId: "user_siddharth_j",
      challengeId: "chal_ground_01",
      dayNumber: 2,
      date: getRelativeLocalDateStr(8),
      feelingBefore: "tired after late flights",
      discovery: "three exhales helped relax eyes.",
      feelingNow: "steady",
      moodScore: 3,
      pointsAwarded: 15,
      seenByCoach: true,
    },
    {
      id: "checkin_sid_3",
      userId: "user_siddharth_j",
      challengeId: "chal_ground_01",
      dayNumber: 3,
      date: getRelativeLocalDateStr(6),
      feelingBefore: "overworked with annual budget",
      discovery: "named objects around desk.",
      feelingNow: "heavy still",
      moodScore: 2,
      pointsAwarded: 10,
      seenByCoach: false,
    }
  );

  // Tanvi G (7 days ago)
  checkIns.push({
    id: "checkin_tanvi_1",
    userId: "user_tanvi_g",
    challengeId: "chal_ground_01",
    dayNumber: 1,
    date: getRelativeLocalDateStr(7),
    feelingBefore: "anxious about campaign launch",
    discovery: "dropped shoulders. felt how high they were held.",
    feelingNow: "calmer",
    moodScore: 2,
    pointsAwarded: 10,
    seenByCoach: true,
  });

  // Manish K (8 days ago)
  checkIns.push({
    id: "checkin_manish_1",
    userId: "user_manish_k",
    challengeId: "chal_ground_01",
    dayNumber: 1,
    date: getRelativeLocalDateStr(8),
    feelingBefore: "stiff back and tired eyes",
    discovery: "paused before the next spreadsheet.",
    feelingNow: "steady",
    moodScore: 3,
    pointsAwarded: 10,
    seenByCoach: true,
  });

  // 2 users who joined yesterday
  checkIns.push(
    {
      id: "checkin_radhika_1",
      userId: "user_radhika_s",
      challengeId: "chal_ground_01",
      dayNumber: 1,
      date: getRelativeLocalDateStr(1),
      feelingBefore: "curious and slightly overwhelmed by new habits",
      discovery: "unclenched my jaw during tea. didn't realize how tightly i held my teeth together.",
      feelingNow: "softened and grounded",
      moodScore: 4,
      pointsAwarded: 10,
      seenByCoach: false,
    },
    {
      id: "checkin_kabir_1",
      userId: "user_kabir_m",
      challengeId: "chal_ground_01",
      dayNumber: 1,
      date: getRelativeLocalDateStr(1),
      feelingBefore: "distracted by news notifications",
      discovery: "put phone screen down for 60 seconds. the room became quiet again.",
      feelingNow: "steady",
      moodScore: 3,
      pointsAwarded: 10,
      seenByCoach: false,
    }
  );

  return checkIns;
}

export const SEED_POSTS: Post[] = [
  {
    id: "post_1",
    userId: "user_ananya_s",
    userName: "Ananya S.",
    userPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    text: "Day 21 milestone today. What shifted most was not how busy my week was, but that I stopped treating my morning tea as an obstacle to get past. Grateful for this quiet corner.",
    images: ["https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80"],
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    reactions: ["user_rohit_m", "user_meera_k", "user_divya_r", "user_coach_pooja"],
    isSeed: true,
  },
  {
    id: "post_2",
    userId: "user_rohit_m",
    userName: "Rohit M.",
    userPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    text: "Did the 4-7-8 breathing right before my leadership review. My heart usually pounds in my throat; today my voice stayed steady the whole 30 minutes.",
    createdAt: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
    reactions: ["user_ananya_s", "user_arjun_n"],
    isSeed: true,
  },
  {
    id: "post_3",
    userId: "user_divya_r",
    userName: "Divya R.",
    userPhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    text: "Three good things from today:\n1. Sunbeam on the kitchen counter\n2. Daughter laughing at the dog's silly jump\n3. Sending the invoice with zero anxiety",
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    reactions: ["user_meera_k", "user_ananya_s", "user_coach_pooja"],
    isSeed: true,
  },
  {
    id: "post_4",
    userId: "user_meera_k",
    userName: "Meera K.",
    userPhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    text: "A sketch from today's pause between drawing site plans. When I step back for 60 seconds, the whole composition becomes clearer.",
    images: ["https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80"],
    createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    reactions: ["user_ananya_s", "user_rohit_m"],
    isSeed: true,
  },
  {
    id: "post_5",
    userId: "user_arjun_n",
    userName: "Arjun N.",
    userPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    text: "Learned that 'I will look at this after lunch' is a complete and polite sentence. Don't have to scramble on someone else's timeline.",
    createdAt: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
    reactions: ["user_divya_r", "user_rohit_m", "user_coach_pooja"],
    isSeed: true,
  },
  {
    id: "post_6",
    userId: "user_priya_d",
    userName: "Priya D.",
    userPhoto: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    text: "Turned off lock screen previews on my phone. First evening in months without phantom vibrations.",
    createdAt: new Date(Date.now() - 52 * 3600 * 1000).toISOString(),
    reactions: ["user_ananya_s"],
    isSeed: true,
  },
  {
    id: "post_7",
    userId: "user_vikram_t",
    userName: "Vikram T.",
    userPhoto: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    text: "Airport delay in Delhi. Instead of fuming at the gate board, sat with noise cancelling and did 4 rounds of box breathing. Felt the blood pressure drop.",
    createdAt: new Date(Date.now() - 65 * 3600 * 1000).toISOString(),
    reactions: ["user_arjun_n", "user_ananya_s"],
    isSeed: true,
  },
  {
    id: "post_8",
    userId: "user_radhika_s",
    userName: "Radhika S.",
    userPhoto: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80",
    text: "First day check-in done! The unclench exercise revealed how stiff my jaw was all afternoon. Excited to be here.",
    createdAt: new Date(Date.now() - 78 * 3600 * 1000).toISOString(),
    reactions: ["user_ananya_s", "user_coach_pooja"],
    isSeed: true,
  },
  {
    id: "post_9",
    userId: "user_coach_pooja",
    userName: "Asha V.",
    userPhoto: ashaAvatar,
    text: "A gentle reminder for everyone midway through their week: you don't need a 45-minute meditation to reset your nervous system. One full, unhurried exhale in the hallway is enough to bring you back.",
    createdAt: new Date(Date.now() - 90 * 3600 * 1000).toISOString(),
    reactions: ["user_ananya_s", "user_rohit_m", "user_divya_r", "user_meera_k", "user_arjun_n"],
    isSeed: true,
  },
  {
    id: "post_ananya_7d",
    userId: "user_ananya_s",
    userName: "Ananya S.",
    userPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    text: "Reflecting on Day 14: The urge to say 'yes' to everything was simply fear in disguise. Choosing one clean, quiet pause before replying has given me my evenings back.",
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    reactions: ["user_coach_pooja", "user_meera_k", "user_rohit_m"],
    isSeed: true,
  },
  {
    id: "post_ananya_30d",
    userId: "user_ananya_s",
    userName: "Ananya S.",
    userPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    text: "One month into this practice. I used to think grounding meant sitting still in a quiet room. Now I know it's feeling my feet on the carpet during a tense Zoom call.",
    images: ["https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80"],
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    reactions: ["user_coach_pooja", "user_arjun_n", "user_divya_r"],
    isSeed: true,
  },
  {
    id: "post_ananya_90d",
    userId: "user_ananya_s",
    userName: "Ananya S.",
    userPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    text: "First week starting out: feeling completely scattered, but willing to try one minute of silence before opening my inbox. Hoping this creates a ripple.",
    createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
    reactions: ["user_coach_pooja"],
    isSeed: true,
  },
];

export const SEED_COMMENTS: PostComment[] = [
  {
    id: "comment_1_1",
    postId: "post_1",
    userId: "user_rohit_m",
    userName: "Rohit M.",
    userPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    text: "Huge milestone Ananya! The morning tea ritual has been a game-changer for me as well.",
    createdAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    reactions: ["user_ananya_s", "user_divya_r"],
  },
  {
    id: "comment_1_2",
    postId: "post_1",
    userId: "user_coach_pooja",
    userName: "Asha V.",
    userPhoto: ashaAvatar,
    text: "21 unbroken days of arriving back in your own body, Ananya. So proud of your quiet consistency.",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    reactions: ["user_ananya_s", "user_meera_k", "user_rohit_m"],
  },
  {
    id: "comment_1_3",
    postId: "post_1",
    userId: "user_ananya_s",
    userName: "Ananya S.",
    userPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    text: "Thank you Coach Asha! Having this circle makes all the difference.",
    createdAt: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
    reactions: ["user_coach_pooja"],
    parentId: "comment_1_2", // Threaded reply
  },
  {
    id: "comment_2_1",
    postId: "post_2",
    userId: "user_ananya_s",
    userName: "Ananya S.",
    userPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    text: "Stealing this for my next client pitch. The 4-7-8 rhythm works like magic.",
    createdAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
    reactions: ["user_rohit_m"],
  },
  {
    id: "comment_3_1",
    postId: "post_3",
    userId: "user_coach_pooja",
    userName: "Asha V.",
    userPhoto: ashaAvatar,
    text: "Sending an invoice with zero anxiety is a major nervous system win! 🌿",
    createdAt: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
    reactions: ["user_divya_r"],
  },
  {
    id: "comment_9_1",
    postId: "post_9",
    userId: "user_meera_k",
    userName: "Meera K.",
    userPhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    text: "Needed to hear this today. Kept postponing my pause because I didn't have 20 minutes.",
    createdAt: new Date(Date.now() - 85 * 3600 * 1000).toISOString(),
    reactions: ["user_coach_pooja", "user_ananya_s"],
  },
  {
    id: "comment_9_2",
    postId: "post_9",
    userId: "user_coach_pooja",
    userName: "Asha V.",
    userPhoto: ashaAvatar,
    text: "Even a single conscious exhale counts Meera. It restarts the baseline.",
    createdAt: new Date(Date.now() - 82 * 3600 * 1000).toISOString(),
    reactions: ["user_meera_k"],
    parentId: "comment_9_1", // Threaded reply
  },
];

export const SEED_COACH_INVITE: CoachInvite = {
  code: "SAATHI-ASHA-2026",
  coachId: "user_coach_pooja",
  createdAt: getRelativeLocalDateStr(30),
  description: "Official Coach Asha V. Private Practice Circle on Saathi",
  active: true,
  redeemedCount: 14,
};

export const SEED_QUESTIONS: Question[] = [
  {
    id: "q_1",
    userId: "user_priya_d",
    userName: "Priya D.",
    userPhoto: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    text: "How do I handle guilt when saying no to family weekend plans to rest?",
    askedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    coachAnswer: "Rest is not a reward you earn after exhausting yourself; it's the baseline. You can say 'I'd love to see you all, but my body needs a quiet evening this weekend' with warmth and without apology.",
    answeredAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    isPublished: true,
  },
  {
    id: "q_2",
    userId: "user_siddharth_j",
    userName: "Siddharth J.",
    userPhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    text: "I missed four days in a row because of travel and felt embarrassed to log back in.",
    askedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    coachAnswer: "There is no attendance record here Siddharth, only your own breath. Day one is always right now whenever you sit down.",
    answeredAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    isPublished: true,
  },
];

export const SEED_RESET_LOGS: ResetLog[] = [
  // Ananya used 3 times in past 7 days
  {
    id: "log_ananya_1",
    userId: "user_ananya_s",
    tool: "breathe",
    timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    moodBefore: 2,
    moodAfter: 4,
  },
  {
    id: "log_ananya_2",
    userId: "user_ananya_s",
    tool: "three_good_things",
    timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    moodBefore: 3,
    moodAfter: 5,
  },
  {
    id: "log_ananya_3",
    userId: "user_ananya_s",
    tool: "meditation",
    timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    moodBefore: 2,
    moodAfter: 4,
    detail: "Overwhelmed with presentation prep",
  },
  // Priya used 5 times (signal to coach!)
  {
    id: "log_priya_1",
    userId: "user_priya_d",
    tool: "breathe",
    timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    moodBefore: 1,
    moodAfter: 3,
  },
  {
    id: "log_priya_2",
    userId: "user_priya_d",
    tool: "talk",
    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    moodBefore: 1,
  },
  {
    id: "log_priya_3",
    userId: "user_priya_d",
    tool: "meditation",
    timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    moodBefore: 2,
    moodAfter: 3,
  },
  {
    id: "log_priya_4",
    userId: "user_priya_d",
    tool: "breathe",
    timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    moodBefore: 1,
    moodAfter: 2,
  },
  {
    id: "log_priya_5",
    userId: "user_priya_d",
    tool: "three_good_things",
    timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    moodBefore: 2,
    moodAfter: 3,
  },
];

export function createInitialAppState(): AppState {
  return {
    users: [COACH_USER, ...SEED_MEMBERS],
    currentUserId: "user_coach_pooja", // Default signed-in as Coach Asha
    challenges: [SEED_CHALLENGE],
    activeChallengeId: SEED_CHALLENGE.id,
    checkIns: generateSeedCheckIns(),
    questions: SEED_QUESTIONS,
    chatMessages: [
      {
        id: "msg_init_1",
        userId: "user_ananya_s",
        sender: "user",
        text: "Hi Asha, I'm finding it hard to separate urgency from real importance at work.",
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: "msg_init_2",
        userId: "user_ananya_s",
        sender: "coach",
        text: "Hi Ananya. What was one thing today that felt urgent in the moment, but didn't actually need you right away?",
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 1000 * 60 * 15).toISOString(),
      },
    ],
    posts: SEED_POSTS,
    comments: SEED_COMMENTS,
    coachInvite: SEED_COACH_INVITE,
    theme: "light",
    themeColor: "sage",
    resetLogs: SEED_RESET_LOGS,
    savedMeditations: [
      {
        id: "med_1",
        userId: "user_ananya_s",
        situation: "Racing thoughts before a design review",
        title: "Releasing the Outcome",
        script: [
          "Let your hands rest flat on the table, feeling the solid surface beneath your palms. [pause 4s]",
          "You have prepared what you could; the rest belongs to the conversation. [pause 5s]",
          "Breathe in through your nose for four counts... and let the breath fall out. [pause 6s]",
          "Your worth in this room is not measured by having an immediate answer to every critique. [pause 6s]",
          "Take one more steady breath, and step into the meeting with open shoulders. [pause 4s]",
        ],
        createdAt: getRelativeLocalDateStr(4),
      },
    ],
    nudgesShown: {},
    gateAccessUnlocked: true,
    gateAccessCode: "SAATHI-ASHA-2026",
  };
}
