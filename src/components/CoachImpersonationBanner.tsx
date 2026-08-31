import React from "react";
import { Eye, ArrowLeft, Users, ShieldCheck } from "lucide-react";
import { useApp } from "../context/AppContext";

interface CoachImpersonationBannerProps {
  onOpenSwitcher?: () => void;
}

export const CoachImpersonationBanner: React.FC<CoachImpersonationBannerProps> = ({ onOpenSwitcher }) => {
  const { currentUser, isCoach, isCoachSession, coachImpersonatorId, exitCoachImpersonation } = useApp();

  // Show banner only if viewing as a member while coach impersonation is active
  if (isCoach || !isCoachSession || !coachImpersonatorId) {
    return null;
  }

  return (
    <div
      className="w-full bg-emerald-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-md z-40 relative border-b border-emerald-700/60"
      id="coach-impersonation-banner"
    >
      <div className="flex items-center gap-2">
        <div className="p-1 rounded bg-emerald-800 text-emerald-300">
          <Eye className="w-3.5 h-3.5" />
        </div>
        <span className="font-medium">
          <strong className="text-emerald-200">Coach Inspection Mode:</strong> Viewing app as <strong>{currentUser.name}</strong> ({currentUser.currentStreak}d streak)
        </span>
      </div>

      <div className="flex items-center gap-2">
        {onOpenSwitcher && (
          <button
            onClick={onOpenSwitcher}
            className="px-2.5 py-1 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Users className="w-3 h-3" />
            <span>Switch Member</span>
          </button>
        )}

        <button
          onClick={() => exitCoachImpersonation()}
          className="px-3 py-1 rounded-lg bg-white text-emerald-950 hover:bg-emerald-50 text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
          id="return-to-coach-btn"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Return to Coach Asha</span>
        </button>
      </div>
    </div>
  );
};
