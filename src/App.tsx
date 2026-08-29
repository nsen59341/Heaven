import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navigation, TabType } from "./components/Navigation";
import { Header } from "./components/Header";
import { TodayView } from "./views/TodayView";
import { AskView } from "./views/AskView";
import { CommunityView } from "./views/CommunityView";
import { MeView } from "./views/MeView";
import { CoachView } from "./views/CoachView";
import { CheckInModal } from "./components/CheckInModal";
import { ShareCardModal } from "./components/ShareCardModal";
import { ResetModal } from "./components/ResetModal";
import { SafetyScreenModal } from "./components/SafetyScreenModal";
import { NudgeBannerModal } from "./components/NudgeBannerModal";
import { ThemeColorModal } from "./components/ThemeColorModal";
import { CoachAccessGate } from "./components/CoachAccessGate";
import { CoachImpersonationBanner } from "./components/CoachImpersonationBanner";
import { CoachInviteModal } from "./components/CoachInviteModal";
import { CheckIn } from "./types";

function MainContent() {
  const {
    currentUser,
    isCoach,
    isCoachSession,
    isGateUnlocked,
    activeChallenge,
    todayCheckIn,
    nextDayNumber,
    userStreak,
    safetyScreenTriggered,
    dismissSafetyScreen,
    activeNudgeMessage,
    dismissNudge,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>(() =>
    currentUser.role === "coach" ? "coach" : "today"
  );

  // Modals state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkInToEdit, setCheckInToEdit] = useState<CheckIn | undefined>(undefined);
  const [isShareCardOpen, setIsShareCardOpen] = useState(false);
  const [shareCardCheckIn, setShareCardCheckIn] = useState<CheckIn | undefined>(undefined);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isCoachInviteOpen, setIsCoachInviteOpen] = useState(false);

  // If role changes away from coach while on coach tab and not in coach session, fallback to today
  if (!isCoachSession && activeTab === "coach") {
    setActiveTab("today");
  }

  const handleOpenCheckIn = () => {
    setCheckInToEdit(undefined);
    setIsCheckInOpen(true);
  };

  const handleOpenEditCheckIn = (checkIn: CheckIn) => {
    setCheckInToEdit(checkIn);
    setIsCheckInOpen(true);
  };

  const handleOpenShareCard = (checkIn: CheckIn) => {
    setShareCardCheckIn(checkIn);
    setIsShareCardOpen(true);
  };

  const handleOpenReset = () => {
    setIsResetOpen(true);
  };

  const handleOpenTheme = () => {
    setIsThemeOpen(true);
  };

  const handleOpenCoachInvite = () => {
    setIsCoachInviteOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text)] flex flex-col md:flex-row antialiased selection:bg-[var(--accent-light)] selection:text-[var(--accent)]">
      {/* Desktop Sidebar & Mobile Bottom Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenReset={handleOpenReset}
        onOpenTheme={handleOpenTheme}
        onOpenCoachInvite={handleOpenCoachInvite}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8 bg-gradient-to-br from-[#FFFCF7] to-[#FBF3EA] dark:from-[#1A1714] dark:to-[#221D18]">
        {/* Coach Impersonation / Review Banner (if viewing as member) */}
        <CoachImpersonationBanner />

        {/* Header */}
        <Header onOpenReset={handleOpenReset} onOpenTheme={handleOpenTheme} />

        {/* Tab Views */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "today" && (
            <TodayView
              onOpenCheckIn={handleOpenCheckIn}
              onOpenEditCheckIn={handleOpenEditCheckIn}
              onOpenShareCard={handleOpenShareCard}
              onOpenReset={handleOpenReset}
            />
          )}

          {activeTab === "ask" && <AskView />}

          {activeTab === "community" && <CommunityView />}

          {activeTab === "me" && (
            <MeView
              onOpenShareCard={handleOpenShareCard}
              onOpenThemeModal={handleOpenTheme}
            />
          )}

          {activeTab === "coach" && isCoachSession && <CoachView />}
        </div>
      </main>

      {/* Access Gate (Protected Cohort) */}
      {!isGateUnlocked && <CoachAccessGate />}

      {/* Modals & Overlays */}
      <CoachInviteModal
        isOpen={isCoachInviteOpen}
        onClose={() => setIsCoachInviteOpen(false)}
      />
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        existingCheckIn={checkInToEdit}
        challenge={activeChallenge}
        dayNumber={checkInToEdit ? checkInToEdit.dayNumber : nextDayNumber}
        onOpenShareCard={handleOpenShareCard}
        onOpenReset={handleOpenReset}
      />

      <ShareCardModal
        isOpen={isShareCardOpen}
        onClose={() => setIsShareCardOpen(false)}
        user={currentUser}
        checkIn={shareCardCheckIn || todayCheckIn}
        challenge={activeChallenge}
        streak={userStreak}
      />

      <ResetModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onOpenAskCoach={() => setActiveTab("ask")}
      />

      <SafetyScreenModal
        isOpen={safetyScreenTriggered}
        onClose={() => dismissSafetyScreen()}
        onOpenAskCoach={() => {
          dismissSafetyScreen();
          setActiveTab("ask");
        }}
      />

      <NudgeBannerModal
        message={activeNudgeMessage}
        onClose={() => dismissNudge()}
        onStartCheckIn={() => {
          dismissNudge();
          handleOpenCheckIn();
        }}
      />

      <ThemeColorModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
