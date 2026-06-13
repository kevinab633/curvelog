"use client";
import { useState, useEffect, useCallback } from "react";
import { getColors, type ThemeColors } from "@/lib/themes";
import { WORKOUTS, DAY_LABELS, DAY_NAMES, DEFAULT_SCHEDULE } from "@/lib/workouts";
import Onboarding from "@/components/Onboarding";
import ThemeSelector from "@/components/ThemeSelector";
import ScheduleEditor from "@/components/ScheduleEditor";
import WorkoutScreen from "@/components/WorkoutScreen";
import CalendarView from "@/components/CalendarView";
import ProgressScreen from "@/components/ProgressScreen";
import SettingsScreen from "@/components/SettingsScreen";

interface Settings {
  id: number;
  theme: string;
  mode: string;
  onboardingDone: boolean;
  programStartDate: string | null;
  reminderEnabled: boolean;
  weeklySchedule: string[];
  saturdayChoice: string;
}

type Screen =
  | { type: "dashboard" }
  | { type: "workout"; workoutType: string; dateStr: string }
  | { type: "calendar" }
  | { type: "progress" }
  | { type: "settings" };

export default function Home() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>({ type: "dashboard" });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);
  const [todayLogCount, setTodayLogCount] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
      if (!data.onboardingDone) {
        setShowOnboarding(true);
      }
    } catch {
      // use defaults
      setSettings({
        id: 0,
        theme: "pinkish",
        mode: "light",
        onboardingDone: false,
        programStartDate: null,
        reminderEnabled: true,
        weeklySchedule: DEFAULT_SCHEDULE,
        saturdayChoice: "upper",
      });
      setShowOnboarding(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(
    async (updates: Partial<Settings>) => {
      const newSettings = { ...settings, ...updates } as Settings;
      setSettings(newSettings);
      try {
        await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
      } catch {
        // ignore
      }
    },
    [settings]
  );

  // Load today's completion status
  const loadTodayStatus = useCallback(async () => {
    if (!settings) return;
    const today = new Date().toISOString().split("T")[0];
    try {
      const res = await fetch(`/api/logs?date=${today}`);
      const data = await res.json();
      if (!Array.isArray(data)) return;

      const todayDow = getTodayDayOfWeek(settings);
      const workoutType = resolveWorkoutType(todayDow, settings);
      const workout = WORKOUTS[workoutType];
      if (!workout) return;

      const total = workout.exercises.length;
      const done = data.filter(
        (d: { workoutType: string; completed: boolean }) =>
          d.workoutType === workoutType && d.completed
      ).length;

      setTodayTotal(total);
      setTodayLogCount(done);
      setCompletedToday(total > 0 && done >= total);
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    if (settings && screen.type === "dashboard") {
      loadTodayStatus();
    }
  }, [settings, screen, loadTodayStatus]);

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FDF2F8" }}>
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🍑</div>
          <p className="text-lg font-bold text-pink-800">CurveLog</p>
          <p className="text-sm text-pink-600 mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  const colors: ThemeColors = getColors(settings.theme, settings.mode);
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const schedule = settings.weeklySchedule || DEFAULT_SCHEDULE;

  // Calculate current week
  const startDate = settings.programStartDate
    ? new Date(settings.programStartDate + "T00:00:00")
    : today;
  const daysSinceStart = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / 86400000));
  const currentWeek = Math.min(12, Math.floor(daysSinceStart / 7) + 1);

  // Get today's workout
  const todayDow = getTodayDayOfWeek(settings);
  const todayWorkoutType = schedule[todayDow] || "rest";
  const todayWorkout = resolveWorkoutType(todayDow, settings);
  const todayWorkoutData = WORKOUTS[todayWorkout];

  // Onboarding
  if (showOnboarding) {
    return (
      <Onboarding
        colors={colors}
        onComplete={() => {
          setShowOnboarding(false);
          setShowThemeSelector(true);
        }}
      />
    );
  }

  // Theme selector
  if (showThemeSelector) {
    return (
      <ThemeSelector
        currentTheme={settings.theme}
        currentMode={settings.mode}
        showClose={settings.onboardingDone}
        onClose={() => setShowThemeSelector(false)}
        onSelect={async (theme, mode) => {
          const updates: Partial<Settings> = { theme, mode, onboardingDone: true };
          if (!settings.programStartDate) {
            // Set program start to the most recent Monday
            const now = new Date();
            const dow = now.getDay();
            const mondayOffset = dow === 0 ? -6 : 1 - dow;
            const monday = new Date(now);
            monday.setDate(now.getDate() + mondayOffset);
            updates.programStartDate = monday.toISOString().split("T")[0];
          }
          await updateSettings(updates);
          setShowThemeSelector(false);
        }}
      />
    );
  }

  // Schedule editor
  if (showScheduleEditor) {
    return (
      <ScheduleEditor
        schedule={schedule}
        colors={colors}
        onSave={(newSchedule) => {
          updateSettings({ weeklySchedule: newSchedule });
          setShowScheduleEditor(false);
        }}
        onClose={() => setShowScheduleEditor(false)}
      />
    );
  }

  // Workout screen
  if (screen.type === "workout") {
    return (
      <WorkoutScreen
        workoutType={screen.workoutType}
        dateStr={screen.dateStr}
        colors={colors}
        saturdayChoice={settings.saturdayChoice || "upper"}
        onBack={() => setScreen({ type: "dashboard" })}
        onChangeSaturdayChoice={(c) => updateSettings({ saturdayChoice: c })}
      />
    );
  }

  // Calendar screen
  if (screen.type === "calendar") {
    return (
      <CalendarView
        colors={colors}
        schedule={schedule}
        programStartDate={settings.programStartDate || todayStr}
        onSelectDate={(dateStr, workoutType) =>
          setScreen({ type: "workout", workoutType, dateStr })
        }
        onBack={() => setScreen({ type: "dashboard" })}
      />
    );
  }

  // Progress screen
  if (screen.type === "progress") {
    return (
      <ProgressScreen
        colors={colors}
        onBack={() => setScreen({ type: "dashboard" })}
      />
    );
  }

  // Settings screen
  if (screen.type === "settings") {
    return (
      <SettingsScreen
        colors={colors}
        reminderEnabled={settings.reminderEnabled}
        onBack={() => setScreen({ type: "dashboard" })}
        onChangeTheme={() => {
          setScreen({ type: "dashboard" });
          setShowThemeSelector(true);
        }}
        onEditSchedule={() => {
          setScreen({ type: "dashboard" });
          setShowScheduleEditor(true);
        }}
        onReset={async () => {
          await Promise.all([
            fetch("/api/logs", { method: "DELETE" }),
            fetch("/api/measurements", { method: "DELETE" }),
            fetch("/api/photos", { method: "DELETE" }),
          ]);
          const now = new Date();
          const dow = now.getDay();
          const mondayOffset = dow === 0 ? -6 : 1 - dow;
          const monday = new Date(now);
          monday.setDate(now.getDate() + mondayOffset);
          await updateSettings({
            programStartDate: monday.toISOString().split("T")[0],
          });
          setScreen({ type: "dashboard" });
        }}
        onExport={() => {
          window.open("/api/export", "_blank");
        }}
        onReplayTutorial={() => {
          setScreen({ type: "dashboard" });
          setShowOnboarding(true);
        }}
        onToggleReminder={() => {
          updateSettings({ reminderEnabled: !settings.reminderEnabled });
        }}
      />
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen pb-24" style={{ background: colors.bg }}>
      {/* Top Bar */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            🍑 CurveLog
          </h1>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => setScreen({ type: "settings" })}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: colors.bgSecondary }}
        >
          <svg className="w-5 h-5" fill="none" stroke={colors.text} strokeWidth={2} viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Week progress bar */}
      <div className="mx-4 mb-4 p-4 rounded-2xl" style={{ background: colors.card, border: `1px solid ${colors.cardBorder}` }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold" style={{ color: colors.text }}>
            Week {currentWeek} of 12
          </span>
          <span className="text-xs font-semibold" style={{ color: colors.accent }}>
            {Math.round((currentWeek / 12) * 100)}%
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: colors.bgSecondary }}>
          <div
            className="h-full rounded-full transition-all duration-1000 progress-animate"
            style={{
              width: `${(currentWeek / 12) * 100}%`,
              background: `linear-gradient(90deg, ${colors.accent}, ${colors.accentLight})`,
            }}
          />
        </div>
      </div>

      {/* Today's Workout Card */}
      <div className="mx-4 mb-4">
        <button
          onClick={() =>
            setScreen({ type: "workout", workoutType: todayWorkoutType, dateStr: todayStr })
          }
          className="w-full p-5 rounded-2xl text-left active:scale-[0.98] transition-all"
          style={{
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentLight})`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-xs font-semibold mb-1 uppercase tracking-wider">
                Today&apos;s Workout
              </p>
              <h2 className="text-xl font-bold text-white mb-1">
                {todayWorkoutData?.title || "Rest Day"}
              </h2>
              <p className="text-white/80 text-sm">
                {todayWorkoutData?.subtitle || "Take it easy"}
              </p>
            </div>
            <div className="text-right">
              {completedToday ? (
                <div className="text-4xl">✅</div>
              ) : todayTotal > 0 ? (
                <div>
                  <div className="text-4xl mb-1">💪</div>
                  <p className="text-white/80 text-xs">
                    {todayLogCount}/{todayTotal}
                  </p>
                </div>
              ) : (
                <div className="text-4xl">😴</div>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="mx-4 mb-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => setScreen({ type: "calendar" })}
          className="p-4 rounded-2xl text-left active:scale-[0.98] transition-all"
          style={{ background: colors.card, border: `1px solid ${colors.cardBorder}` }}
        >
          <span className="text-2xl">📅</span>
          <p className="font-semibold text-sm mt-2" style={{ color: colors.text }}>
            Calendar
          </p>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            12-week view
          </p>
        </button>
        <button
          onClick={() => setScreen({ type: "progress" })}
          className="p-4 rounded-2xl text-left active:scale-[0.98] transition-all"
          style={{ background: colors.card, border: `1px solid ${colors.cardBorder}` }}
        >
          <span className="text-2xl">📈</span>
          <p className="font-semibold text-sm mt-2" style={{ color: colors.text }}>
            Progress
          </p>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            Measurements & Photos
          </p>
        </button>
      </div>

      {/* Edit Schedule */}
      <div className="mx-4 mb-4">
        <button
          onClick={() => setShowScheduleEditor(true)}
          className="w-full p-3 rounded-2xl flex items-center gap-3 active:scale-[0.98] transition-all"
          style={{ background: colors.card, border: `1px solid ${colors.cardBorder}` }}
        >
          <span className="text-xl">✏️</span>
          <span className="font-semibold text-sm" style={{ color: colors.text }}>
            Edit Week Schedule
          </span>
          <svg className="w-4 h-4 ml-auto" fill="none" stroke={colors.textSecondary} strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekly Overview */}
      <div className="mx-4 mb-4">
        <h3 className="text-sm font-bold mb-3" style={{ color: colors.text }}>
          This Week
        </h3>
        <div className="space-y-2">
          {schedule.map((workoutType, idx) => {
            const dayDate = new Date(startDate);
            const weekStart = Math.floor(daysSinceStart / 7) * 7;
            dayDate.setDate(startDate.getDate() + weekStart + idx);
            const dateStr = dayDate.toISOString().split("T")[0];
            const isToday = dateStr === todayStr;
            const workout = WORKOUTS[resolveWorkoutType(idx, settings)];

            return (
              <button
                key={idx}
                onClick={() =>
                  setScreen({ type: "workout", workoutType, dateStr })
                }
                className="w-full p-3 rounded-xl flex items-center gap-3 active:scale-[0.98] transition-all"
                style={{
                  background: isToday ? colors.accent + "15" : colors.card,
                  border: `1px solid ${isToday ? colors.accent + "40" : colors.cardBorder}`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                  style={{
                    background: isToday ? colors.accent : colors.bgSecondary,
                    color: isToday ? "#fff" : colors.text,
                  }}
                >
                  {DAY_NAMES[idx].substring(0, 3)}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold" style={{ color: colors.text }}>
                    {DAY_LABELS[workoutType]}
                  </p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    {workout?.subtitle || ""}
                  </p>
                </div>
                {isToday && (
                  <span
                    className="text-[10px] px-2 py-1 rounded-full font-bold"
                    style={{ background: colors.accent, color: "#fff" }}
                  >
                    TODAY
                  </span>
                )}
                <svg className="w-4 h-4" fill="none" stroke={colors.textSecondary} strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Nav */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 py-3 flex justify-around border-t"
        style={{ background: colors.card, borderColor: colors.cardBorder }}
      >
        <button
          onClick={() => setScreen({ type: "dashboard" })}
          className="flex flex-col items-center gap-1"
        >
          <svg className="w-6 h-6" fill="none" stroke={colors.accent} strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-semibold" style={{ color: colors.accent }}>Home</span>
        </button>
        <button
          onClick={() => setScreen({ type: "calendar" })}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-xl">📅</span>
          <span className="text-[10px] font-semibold" style={{ color: colors.textSecondary }}>Calendar</span>
        </button>
        <button
          onClick={() =>
            setScreen({ type: "workout", workoutType: todayWorkoutType, dateStr: todayStr })
          }
          className="flex flex-col items-center gap-1 -mt-4"
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: colors.accent }}
          >
            <span className="text-2xl">💪</span>
          </div>
          <span className="text-[10px] font-semibold" style={{ color: colors.textSecondary }}>Workout</span>
        </button>
        <button
          onClick={() => setScreen({ type: "progress" })}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-xl">📈</span>
          <span className="text-[10px] font-semibold" style={{ color: colors.textSecondary }}>Progress</span>
        </button>
        <button
          onClick={() => setScreen({ type: "settings" })}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-xl">⚙️</span>
          <span className="text-[10px] font-semibold" style={{ color: colors.textSecondary }}>Settings</span>
        </button>
      </div>
    </div>
  );
}

function getTodayDayOfWeek(settings: Settings): number {
  if (!settings.programStartDate) return 0;
  const start = new Date(settings.programStartDate + "T00:00:00");
  const today = new Date();
  const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
  return ((diff % 7) + 7) % 7;
}

function resolveWorkoutType(dayIndex: number, settings: Settings): string {
  const schedule = settings.weeklySchedule || DEFAULT_SCHEDULE;
  const wt = schedule[dayIndex] || "rest";
  if (wt === "flexible") {
    const choice = settings.saturdayChoice || "upper";
    if (choice === "rest") return "rest";
    if (choice === "walk") return "recovery";
    return "upper";
  }
  return wt;
}
