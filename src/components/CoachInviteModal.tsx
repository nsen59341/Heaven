import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Copy, Check, Share2, Users, ShieldCheck, X, Link as LinkIcon, MessageSquare, Sparkles, User, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";

interface CoachInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoachInviteModal: React.FC<CoachInviteModalProps> = ({ isOpen, onClose }) => {
  const { state } = useApp();
  const invite = state.coachInvite || {
    code: "SAATHI-ASHA-2026",
    coachId: "user_coach_pooja",
    createdAt: new Date().toISOString(),
    description: "Official Coach Asha V. Private Practice Circle on Saathi",
    active: true,
    redeemedCount: 14,
  };

  const [recipientName, setRecipientName] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFullMsg, setCopiedFullMsg] = useState(false);

  if (!isOpen) return null;

  const trimmedName = recipientName.trim();
  const isNameValid = trimmedName.length >= 2;

  // Person-specific shareable link that grants instant personal profile access
  const shareableJoinUrl = isNameValid
    ? `${window.location.origin}/?join=${encodeURIComponent(invite.code)}&name=${encodeURIComponent(trimmedName)}`
    : "";

  const fullShareText = `Hi ${trimmedName || "there"},\n\nI would love to invite you to join my private daily mindfulness and micro-pauses circle on Saathi.\n\n✨ Open your personal space here: ${shareableJoinUrl}\n\nLooking forward to practicing together with you! — Coach Asha`;

  const handleCopyLink = () => {
    if (!isNameValid) return;
    navigator.clipboard.writeText(shareableJoinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopyFullMessage = () => {
    if (!isNameValid) return;
    navigator.clipboard.writeText(fullShareText);
    setCopiedFullMsg(true);
    setTimeout(() => setCopiedFullMsg(false), 2200);
  };

  const handleShareNative = async () => {
    if (!isNameValid) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join Coach Asha's Circle on Saathi`,
          text: fullShareText,
          url: shareableJoinUrl,
        });
      } catch (e) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    if (!isNameValid) return;
    const encoded = encodeURIComponent(fullShareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-white dark:bg-[#1E1A17] text-stone-900 dark:text-stone-100 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-6"
          id="coach-invite-modal"
        >
          {/* Header */}
          <div className="p-6 bg-stone-50 dark:bg-stone-900/90 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700 dark:bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                <LinkIcon className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                  Generate Member Referral Link
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                  Create a personalized join link for a new cohort member
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              id="close-coach-invite-btn"
              aria-label="Close share modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Required Recipient Name Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span>Member Name <strong className="text-emerald-700 dark:text-emerald-400">* (Required)</strong></span>
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Priya Sharma or Dr. Mehta"
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm font-semibold text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                  id="referral-recipient-name-input"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                When they click the link, their personalized member profile will be created and opened automatically.
              </p>
            </div>

            {/* Direct Shareable Link Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Personalized Shareable Link
              </label>
              {isNameValid ? (
                <div className="p-3 bg-stone-100 dark:bg-stone-900 rounded-2xl border border-emerald-300 dark:border-emerald-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="font-mono text-xs text-emerald-800 dark:text-emerald-300 truncate select-all px-1">
                    {shareableJoinUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
                    id="copy-share-link-btn"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-white" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-3.5 bg-stone-100 dark:bg-stone-900/60 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 flex items-center gap-2.5 text-stone-500 dark:text-stone-400 text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Enter the member&apos;s name above to generate their unique join link.</span>
                </div>
              )}
            </div>

            {/* Share Options */}
            <div className="space-y-2.5 pt-2 border-t border-stone-200 dark:border-stone-800">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Share With Member
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleWhatsAppShare}
                  disabled={!isNameValid}
                  className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                  id="share-whatsapp-btn"
                >
                  <MessageSquare className="w-4 h-4 text-white" />
                  <span>Send via WhatsApp</span>
                </button>

                <button
                  onClick={handleShareNative}
                  disabled={!isNameValid}
                  className="p-3 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-stone-900 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                  id="share-native-btn"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share via Device</span>
                </button>
              </div>

              <button
                onClick={handleCopyFullMessage}
                disabled={!isNameValid}
                className="w-full py-2.5 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed text-stone-800 dark:text-stone-200 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                id="copy-full-msg-btn"
              >
                {copiedFullMsg ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                <span>{copiedFullMsg ? "Copied Invite Message!" : "Copy Full Invite Message"}</span>
              </button>
            </div>

            {/* Info Badge */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {invite.redeemedCount || 14} Members Joined
                  </div>
                  <div className="text-[11px] text-stone-500">Active in Coach Asha&apos;s circle</div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cohort Active</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-sm transition-colors cursor-pointer shadow-sm"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};


