"use client";
import type { ThemeColors } from "@/lib/themes";

interface SettingsScreenProps {
  colors: ThemeColors;
  reminderEnabled: boolean;
  onBack: () => void;
  onChangeTheme: () => void;
  onEditSchedule: () => void;
  onReset: () => void;
  onExport: () => void;
  onReplayTutorial: () => void;
  onToggleReminder: () => void;
}

export default function SettingsScreen({
  colors,
  reminderEnabled,
  onBack,
  onChangeTheme,
  onEditSchedule,
  onReset,
  onExport,
  onReplayTutorial,
  onToggleReminder,
}: SettingsScreenProps) {
  return (
    <div className="min-h-screen pb-8" style={{ background: colors.bg }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3" style={{ background: colors.bg }}>
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: colors.bgSecondary }}
        >
          <svg className="w-5 h-5" fill="none" stroke={colors.text} strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold" style={{ color: colors.text }}>
          ⚙️ Settings
        </h1>
      </div>

      <div className="px-4 space-y-3">
        {/* Theme */}
        <button
          onClick={onChangeTheme}
          className="w-full p-4 rounded-2xl text-left flex items-center gap-4 active:scale-[0.98] transition-all"
          style={{ background: colors.card, border: `1px solid ${colors.cardBorder}` }}
        >
          <span className="text-2xl">🎨</span>
          <div>
            <p className="font-semibold" style={{ color: colors.text }}>Change Theme</p>
            <p className="text-xs" style={{ color: colors.textSecondary }}>Switch colors & light/dark mode</p>
          </div>
          <svg className="w-5 h-5 ml-auto" fill="none" stroke={colors.textSecondary} strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Schedule */}
        <button
          onClick={onEditSchedule}
          className="w-full p-4 rounded-2xl text-left flex items-center gap-4 active:scale-[0.98] transition-all"
          style={{ background: colors.card, border: `1px solid ${colors.cardBorder}` }}
        >
          <span className="text-2xl">📅</span>
          <div>
            <p className="font-semibold" style={{ color: colors.text }}>Edit Weekly Schedule</p>
            <p className="text-xs" style={{ color: colors.textSecondary }}>Customize workout days</p>
          </div>
          <svg className="w-5 h-5 ml-auto" fill="none" stroke={colors.textSecondary} strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Reminder Toggle */}
        <div
          className="p-4 rounded-2xl flex items-center gap-4"
          style={{ background: colors.card, border: `1px solid ${colors.cardBorder}` }}
        >
          <span className="text-2xl">🔔</span>
          <div className="flex-1">
            <p className="font-semibold" style={{ color: colors.text }}>Daily Reminders</p>
            <p className="text-xs" style={{ color: colors.textSecondary }}>Get notified about workouts</p>
          </div>
          <button
            onClick={onToggleReminder}
            className="w-14 h-8 rounded-full p-1 transition-all"
            style={{ background: reminderEnabled ? colors.accent : colors.bgSecondary }}
          >
            <div
              className="w-6 h-6 rounded-full bg-white shadow transition-all"
              style={{ transform: reminderEnabled ? "translateX(24px)" : "translateX(0)" }}
            />
          </button>
        </div>

        {/* Tutorial */}
        <button
          onClick={onReplayTutorial}
          className="w-full p-4 rounded-2xl text-left flex items-center gap-4 active:scale-[0.98] transition-all"
          style={{ background: colors.card, border: `1px solid ${colors.cardBorder}` }}
        >
          <span className="text-2xl">📖</span>
          <div>
            <p className="font-semibold" style={{ color: colors.text }}>Replay Tutorial</p>
            <p className="text-xs" style={{ color: colors.textSecondary }}>View onboarding again</p>
          </div>
          <svg className="w-5 h-5 ml-auto" fill="none" stroke={colors.textSecondary} strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Export */}
        <button
          onClick={onExport}
          className="w-full p-4 rounded-2xl text-left flex items-center gap-4 active:scale-[0.98] transition-all"
          style={{ background: colors.card, border: `1px solid ${colors.cardBorder}` }}
        >
          <span className="text-2xl">📊</span>
          <div>
            <p className="font-semibold" style={{ color: colors.text }}>Export Progress Data</p>
            <p className="text-xs" style={{ color: colors.textSecondary }}>Download as CSV file</p>
          </div>
          <svg className="w-5 h-5 ml-auto" fill="none" stroke={colors.textSecondary} strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Reset */}
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
              onReset();
            }
          }}
          className="w-full p-4 rounded-2xl text-left flex items-center gap-4 active:scale-[0.98] transition-all"
          style={{ background: colors.danger + "10", border: `1px solid ${colors.danger}30` }}
        >
          <span className="text-2xl">🗑️</span>
          <div>
            <p className="font-semibold" style={{ color: colors.danger }}>Reset 12-Week Program</p>
            <p className="text-xs" style={{ color: colors.textSecondary }}>Clear all progress data</p>
          </div>
        </button>

        {/* App info */}
        <div className="text-center pt-8 pb-4">
          <p className="text-sm font-bold" style={{ color: colors.textSecondary }}>
            CurveLog v1.0
          </p>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            Your 12-Week Curves Journey
          </p>
        </div>
      </div>
    </div>
  );
}
