import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  ShieldAlert,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { ChatMessage } from "../types";
import ashaAvatar from "../assets/images/asha_avatar.jpg";

export const AskView: React.FC = () => {
  const { currentUser, state, sendChatMessage } = useApp();
  const coachUser = state.users.find((u) => u.role === "coach" || u.id === "user_coach_pooja");
  const coachPhoto = coachUser?.photo || ashaAvatar;
  const coachName = coachUser?.name || "Asha V.";
  const coachFirstName = coachName.split(" ")[0];

  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages for current user
  const userMessages = state.chatMessages.filter(
    (m) => m.userId === currentUser.id
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [userMessages.length, isSending]);

  // Voice dictation using Speech Recognition
  const toggleSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  // Text to Speech playback
  const handleSpeakMessage = (msgId: string, text: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Text to speech is not supported in this browser.");
      return;
    }

    if (activeSpeechId === msgId) {
      window.speechSynthesis.cancel();
      setActiveSpeechId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 0.95;
    utterance.onend = () => setActiveSpeechId(null);
    utterance.onerror = () => setActiveSpeechId(null);

    setActiveSpeechId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const textToSend = inputText;
    setInputText("");
    setIsSending(true);

    try {
      await sendChatMessage(textToSend);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen max-w-3xl mx-auto w-full">
      {/* Header Info Bar (Honesty Notice Rule A9 #4) */}
      <div className="p-3.5 px-4 sm:px-6 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={coachPhoto}
              alt={coachName}
              className="w-9 h-9 rounded-full object-cover border border-[var(--border)]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--accent)] border-2 border-[var(--surface)]" />
          </div>
          <div>
            <div className="text-sm font-serif font-medium text-[var(--text)] flex items-center gap-1.5">
              <span>Ask {coachFirstName}</span>
              <Sparkles className="w-3.5 h-3.5 text-[var(--highlight)]" />
            </div>
            <div className="text-[11px] text-[var(--muted)]">
              AI companion trained in {coachFirstName}’s grounding philosophy
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[var(--subtle)] bg-[var(--subtle-surface)] py-1 px-2.5 rounded-lg border border-[var(--border)]">
          <Info className="w-3 h-3 text-[var(--accent)]" />
          <span className="hidden sm:inline">24x7 Guided Responses</span>
        </div>
      </div>

      {/* Chat Continuous Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {userMessages.length === 0 && (
          <div className="text-center py-12 space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center mx-auto text-2xl">
              🌿
            </div>
            <h3 className="font-serif text-2xl text-[var(--text)]">
              How can I help you today?
            </h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Ask about working through a difficult conversation, navigating procrastination, or finding steady ground in your routine.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              {[
                "I feel overwhelmed with work and don't know where to start.",
                "How do I maintain my grounding when conversations get tense?",
                "I missed two days and I am feeling guilty about it.",
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputText(prompt);
                  }}
                  className="text-left text-xs p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--subtle-surface)] text-[var(--text)] transition-colors"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {userMessages.map((msg, index) => {
          const isUser = msg.sender === "user";
          const showDateHeader =
            index === 0 ||
            new Date(msg.timestamp).toDateString() !==
              new Date(userMessages[index - 1].timestamp).toDateString();

          return (
            <React.Fragment key={msg.id}>
              {showDateHeader && (
                <div className="text-center my-4">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--subtle)] bg-[var(--subtle-surface)] py-0.5 px-2.5 rounded-full border border-[var(--border)]">
                    {new Date(msg.timestamp).toLocaleDateString("en-IN", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}

              <div
                className={`flex gap-3 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <img
                    src={coachPhoto}
                    alt={coachFirstName}
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-1 border border-[var(--border)]"
                    referrerPolicy="no-referrer"
                  />
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-[20px] p-4 text-[15px] leading-relaxed shadow-xs relative group ${
                    isUser
                      ? "bg-[var(--accent)] text-white rounded-tr-none"
                      : "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  <div
                    className={`flex items-center justify-between gap-3 mt-2 text-[10px] ${
                      isUser ? "text-white/80" : "text-[var(--subtle)]"
                    }`}
                  >
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    {!isUser && (
                      <button
                        onClick={() => handleSpeakMessage(msg.id, msg.text)}
                        aria-label={activeSpeechId === msg.id ? "Stop voice" : "Read aloud"}
                        className="p-1 rounded hover:bg-[var(--subtle-surface)] text-[var(--muted)] hover:text-[var(--text)] transition-colors flex items-center gap-1"
                      >
                        {activeSpeechId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-[var(--accent)]" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* Typing indicator */}
        {isSending && (
          <div className="flex gap-3 justify-start items-center">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
              alt="Asha"
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-[var(--border)]"
              referrerPolicy="no-referrer"
            />
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-[var(--surface)] border border-[var(--border)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input composer Bar */}
      <div className="p-3 sm:p-4 border-t border-[var(--border)] bg-[var(--surface)]">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            aria-label={isListening ? "Stop voice listening" : "Dictate with voice"}
            className={`p-3 rounded-xl border transition-colors shrink-0 ${
              isListening
                ? "bg-red-500 text-white border-red-600 animate-pulse"
                : "bg-[var(--subtle-surface)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]"
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Type your question for ${coachFirstName}...`}
            className="flex-1 p-3.5 rounded-xl bg-[var(--subtle-surface)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--subtle)] text-[15px] focus:border-[var(--accent)]"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            aria-label="Send question"
            className="p-3.5 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-40 transition-all shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
