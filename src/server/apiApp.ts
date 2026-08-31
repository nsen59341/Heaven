import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export const apiApp = express();

apiApp.use(express.json({ limit: "10mb" }));

// Server-side Gemini client helper
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Model fallback list to handle transient 503 high demand or quota errors
const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
  "gemini-3.7-flash",
];

async function generateWithModelFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
): Promise<{ text: string; modelUsed: string } | null> {
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      console.warn(
        `Model ${model} temporarily unavailable (${err?.status || err?.message}), attempting alternative...`
      );
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  return null;
}

// Crisis / Safety screening regex
export function testCrisisText(text: string): boolean {
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

// Router to handle paths with or without /api or /.netlify/functions/api prefix
const router = express.Router();

// 1. Health endpoint
router.get("/health", (req, res) => {
  const ai = getGeminiClient();
  res.json({
    status: "ok",
    time: new Date().toISOString(),
    aiConfigured: Boolean(ai),
  });
});

// 2. Safety screening endpoint
router.post("/safety/screen", (req, res) => {
  try {
    const { text } = req.body || {};
    const flagged = testCrisisText(text || "");
    res.json({ flagged });
  } catch {
    res.json({ flagged: true });
  }
});

// 3. Ask Asha (Chat) endpoint
router.post("/gemini/ask", async (req, res) => {
  try {
    const { message, history, memberName, recentCheckIns, previousOpenings } = req.body || {};

    if (testCrisisText(message || "")) {
      return res.json({
        flagged: true,
        reply: "",
      });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are speaking as a life coach named Asha to a member of her community, in a chat. Warm, direct, and human. You talk the way a person texts, not the way a wellness app writes.

Match the length of your reply to the length of what they said:
- A greeting, or a few words with nothing in them, gets one short line back and a question. Under 15 words. Example: "Hi [first name]. What is going on today?"
- A short factual question gets two or three sentences.
- A real problem, described properly, gets up to about 120 words. Never more.

Never answer a greeting with an exercise, an instruction or a technique.

Do not open with a technique. Do not end every message with a breathing suggestion or a reflective prompt. Most messages should end with either a plain statement or one genuine question, and sometimes with nothing at all.

Ask before you advise. If someone describes a problem in one line, ask one question about it before offering anything.

Never say "notice the sensation of", "give yourself permission to", "hold space", "sit with it", "lean into", "journey", or "I hear you". These are the phrases that make this sound like software.

Use their first name occasionally, not in every message. Do not restate their question back to them. Do not number your points or use bullet lists. Write in short paragraphs.

Refer to what they wrote in their recent check-ins only when it is genuinely relevant, and refer to it naturally, the way someone who remembered would.

You are not a therapist. Never diagnose. If a message suggests self-harm, abuse, violence or a medical emergency, stop and trigger the safety screen instead of replying.`;

    const contextNotes = [];
    if (memberName) contextNotes.push(`Member's name: ${memberName}`);
    if (recentCheckIns && recentCheckIns.length > 0) {
      contextNotes.push(`Member's recent check-ins:\n${JSON.stringify(recentCheckIns, null, 2)}`);
    }
    if (previousOpenings && previousOpenings.length > 0) {
      contextNotes.push(
        `Recent message openings used (DO NOT repeat these openings):\n- ${previousOpenings.join("\n- ")}`
      );
    }

    const contents: any[] = [];
    if (contextNotes.length > 0) {
      contents.push({
        role: "user",
        parts: [{ text: `[Background context about the member:\n${contextNotes.join("\n\n")}]` }],
      });
      contents.push({
        role: "model",
        parts: [{ text: `Understood. I will keep this in mind naturally.` }],
      });
    }

    const recentMessages = Array.isArray(history) ? history.slice(-10) : [];
    for (const msg of recentMessages) {
      contents.push({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: message || "Hello" }],
    });

    let reply = "";
    let isFallback = false;

    if (ai) {
      const generated = await generateWithModelFallback(ai, {
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (generated?.text) {
        reply = generated.text.trim();
      }
    }

    if (!reply) {
      isFallback = true;
      const firstName = memberName || "there";
      const trimmed = (message || "").trim().toLowerCase();
      if (trimmed.length < 20) {
        reply = `Hi ${firstName}. What is going on today?`;
      } else {
        reply = `I hear you, ${firstName}. That sounds like a lot to carry all at once. What feels like the one piece of this that's most in your control right now?`;
      }
    }

    if (testCrisisText(reply)) {
      return res.json({ flagged: true, reply: "" });
    }

    res.json({ reply, isFallback });
  } catch (error: any) {
    console.error("Ask error:", error);
    const member = req.body?.memberName || "there";
    res.json({
      reply: `Hi ${member}. What is on your mind today?`,
      isFallback: true,
    });
  }
});

// 4. Custom 3-minute Situation Meditation generator
router.post("/gemini/meditation", async (req, res) => {
  try {
    const { situation, memberName } = req.body || {};
    if (testCrisisText(situation || "")) {
      return res.json({ flagged: true });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You write short, gentle 3-minute spoken meditations for a life coach named Asha.
Write a personalized meditation script tailored strictly to the user's specific situation.
The script must consist of 6-9 spoken lines/sentences.
Each line must end with a realistic pause duration tag like "[pause 4s]" or "[pause 6s]".
Tone: Grounded, soothing, warm, unhurried, human. No mystical clichés or generic jargon.`;

    let title = "Centering in the Present";
    let script: string[] = [
      "Find a comfortable seat, and let your hands rest gently in your lap. [pause 4s]",
      `Whatever is happening around ${situation ? `"${situation.slice(0, 35)}..."` : "today"}, let it wait outside the room for three minutes. [pause 5s]`,
      "Notice where your body touches the surface beneath you. You are steady and supported right here. [pause 5s]",
      "Take a slow breath in through your nose... and let it softly drift out. [pause 6s]",
      "You do not have to solve or fix anything in this single moment. You only need to breathe. [pause 6s]",
      "Feel the quiet rhythm of your natural breath, steady and unhurried. [pause 6s]",
      "When you feel ready, gently soften your shoulders, and open your eyes. [pause 4s]",
    ];
    let isFallback = true;

    if (ai) {
      const generated = await generateWithModelFallback(ai, {
        contents: `The member ${memberName ? `(${memberName})` : ""} is experiencing this situation: "${situation}". Write a 3-minute meditation script for them with title and lines.`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A calming 3-5 word title" },
              script: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of 6 to 9 sentences, each ending with [pause Xs]",
              },
            },
            required: ["title", "script"],
          },
        },
      });

      if (generated?.text) {
        try {
          const parsed = JSON.parse(generated.text);
          if (parsed.script && Array.isArray(parsed.script) && parsed.script.length > 0) {
            title = parsed.title || title;
            script = parsed.script;
            isFallback = false;
          }
        } catch {}
      }
    }

    res.json({
      title,
      script,
      isFallback,
    });
  } catch (error: any) {
    console.error("Meditation error:", error);
    res.json({
      title: "Grounding in the Present",
      script: [
        "Take a slow breath in, and let your body settle into this seat. [pause 4s]",
        "Whatever brought tension into your day, leave it outside for three minutes. [pause 5s]",
        "Feel the breath flow in... and drift out softly. [pause 6s]",
        "You are steady, capable, and right where you need to be. [pause 5s]",
      ],
      isFallback: true,
    });
  }
});

// 5. Weekly personal letter generator
router.post("/gemini/weekly-letter", async (req, res) => {
  try {
    const { memberName, checkIns } = req.body || {};
    if (!checkIns || !Array.isArray(checkIns) || checkIns.length === 0) {
      return res.status(400).json({ error: "Need at least one check-in for the letter" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are life coach Asha writing a warm, deeply personal weekly letter to a member of your community (${memberName}).
Requirements:
1. Length: Roughly 200 words.
2. You MUST quote at least two exact phrases the member wrote in their check-ins (use quotation marks).
3. Name one specific, tangible thing that changed between their earliest entry and their latest entry in this set.
4. Tone: Warm, insightful, observational, human, encouraging without false hype.
5. Format: Dear [Name], 2-3 short heartfelt paragraphs, followed by "Warmly, Asha".`;

    let letter = "";
    let isFallback = true;

    if (ai) {
      const generated = await generateWithModelFallback(ai, {
        contents: `Here are the member's check-ins from the past week:\n${JSON.stringify(checkIns, null, 2)}\n\nPlease write the personal weekly letter now.`,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (generated?.text) {
        letter = generated.text.trim();
        isFallback = false;
      }
    }

    if (!letter) {
      const earliest = checkIns[checkIns.length - 1];
      const latest = checkIns[0];
      const sampleQuote1 = latest?.discovery || "taking things one step at a time";
      const sampleQuote2 = earliest?.discovery || "learning to notice";

      letter = `Dear ${memberName || "friend"},\n\nLooking back at your reflections over the past week, there is a distinct rhythm taking shape. Early in the week you noted "${sampleQuote2}", navigating the tension between what needed doing and what you were holding.\n\nBy your latest check-in, you captured something clarifying: "${sampleQuote1}". That subtle shift from reacting to observing is where real steadiness begins to take root.\n\nKeep honoring these 60-second moments.\n\nWarmly, Asha`;
    }

    res.json({ letter, isFallback });
  } catch (error: any) {
    console.error("Weekly letter error:", error);
    const member = req.body?.memberName || "friend";
    res.json({
      letter: `Dear ${member},\n\nThank you for consistently showing up for your daily reflections this week. Honoring these small pauses makes all the difference.\n\nWarmly, Asha`,
      isFallback: true,
    });
  }
});

// 6. Challenge Generator for Coach
router.post("/gemini/generate-challenge", async (req, res) => {
  try {
    const { theme, daysCount } = req.body || {};
    const count = parseInt(daysCount) || 7;
    const ai = getGeminiClient();

    const systemInstruction = `You are helping life coach Asha design a structured ${count}-day mindfulness/coaching challenge for her community members.
For each day:
- title: concise and evocative (3-6 words)
- oneMinuteAction: an actionable micro-step that can genuinely be completed in 60 seconds (no complicated equipment or long tasks)
- reflectionQuestion: a thoughtful question to reflect on in 2-3 sentences.
Also provide a short title, a 2-sentence description, and a plain-language WhatsApp announcement for members with no marketing hype or corporate buzzwords.`;

    let title = `${theme || "Daily Grounding"}`;
    let description = `A ${count}-day micro-practice challenge exploring ${theme || "mindfulness"} in daily life.`;
    let whatsAppAnnouncement = `🌅 *Rise: ${theme || "New Challenge"}*\n\nStarting tomorrow, we take 60 seconds every day to practice ${theme || "grounding"}.\n\nOpen your Rise app each morning to check in!`;
    let days = Array.from({ length: count }, (_, i) => ({
      dayNumber: i + 1,
      title: `Day ${i + 1}: ${theme || "Micro-Pause"} Practice`,
      oneMinuteAction: "Set down what you are holding, soften your shoulders, and take three unhurried breaths.",
      reflectionQuestion: "What is one thought you were holding onto that you can release right now?",
    }));
    let isFallback = true;

    if (ai) {
      const generated = await generateWithModelFallback(ai, {
        contents: `Theme: "${theme || "Daily Resilience"}". Length: ${count} days. Generate a complete unique challenge.`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              whatsAppAnnouncement: { type: Type.STRING },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    oneMinuteAction: { type: Type.STRING },
                    reflectionQuestion: { type: Type.STRING },
                  },
                  required: ["dayNumber", "title", "oneMinuteAction", "reflectionQuestion"],
                },
              },
            },
            required: ["title", "description", "whatsAppAnnouncement", "days"],
          },
        },
      });

      if (generated?.text) {
        try {
          const parsed = JSON.parse(generated.text);
          if (parsed.days && Array.isArray(parsed.days) && parsed.days.length > 0) {
            title = parsed.title || title;
            description = parsed.description || description;
            whatsAppAnnouncement = parsed.whatsAppAnnouncement || whatsAppAnnouncement;
            days = parsed.days;
            isFallback = false;
          }
        } catch {}
      }
    }

    res.json({
      title,
      description,
      whatsAppAnnouncement,
      days,
      isFallback,
    });
  } catch (error: any) {
    console.error("Challenge gen error:", error);
    res.json({
      title: "Daily Presence",
      description: "A 7-day micro-practice challenge.",
      whatsAppAnnouncement: "Join our 7-day challenge in Rise!",
      days: Array.from({ length: 7 }, (_, i) => ({
        dayNumber: i + 1,
        title: `Day ${i + 1}: Micro-Pause`,
        oneMinuteAction: "Pause and take three deep breaths.",
        reflectionQuestion: "What did you notice?",
      })),
      isFallback: true,
    });
  }
});

// 7. Automatic Nudge Message Generator
router.post("/gemini/nudge-message", async (req, res) => {
  try {
    const { memberName, daysMissed, dayToResume } = req.body || {};
    const ai = getGeminiClient();

    const systemInstruction = `You are life coach Asha writing a gentle re-entry nudge to a community member who missed ${daysMissed || 2} days.
Rule: NEVER phrase it as punishment or loss ("you lost your streak", "you failed").
Phrase it warmly as an invitation: "Day ${dayToResume || 5} is where most people stop; here is the one-minute version to get back in."
Keep it to 2-3 short, reassuring sentences. Maximum 45 words.`;

    let message = `Hi ${memberName || "there"} — day ${dayToResume || 5} is often where the initial push slows down, and that's completely natural. Here is a 60-second check-in whenever you're ready to step back in.`;
    let isFallback = true;

    if (ai) {
      const generated = await generateWithModelFallback(ai, {
        contents: `Member name: ${memberName}, missed days: ${daysMissed}, next day: ${dayToResume}. Write the re-entry message.`,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (generated?.text) {
        message = generated.text.trim();
        isFallback = false;
      }
    }

    res.json({ message, isFallback });
  } catch (error: any) {
    console.error("Nudge error:", error);
    const member = req.body?.memberName || "there";
    res.json({
      message: `Hi ${member}, day ${req.body?.dayToResume || 5} is right here waiting whenever you have 60 seconds.`,
      isFallback: true,
    });
  }
});

// 8. TTS endpoint
router.post("/gemini/tts", async (req, res) => {
  try {
    const { text } = req.body || {};
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ audio: null, isFallback: true });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: (text || "").slice(0, 500) }] }],
      config: {
        responseModalities: ["AUDIO" as any],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    res.json({ audio: base64Audio, isFallback: false });
  } catch {
    res.json({ audio: null, isFallback: true });
  }
});

// Mount router on various prefixes so it works regardless of gateway / Netlify rewrite behavior
apiApp.use("/api", router);
apiApp.use("/.netlify/functions/api", router);
apiApp.use("/", router);
