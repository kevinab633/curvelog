"use client";
import { useState, useEffect, useCallback } from "react";
import type { ThemeColors } from "@/lib/themes";
import { WORKOUTS, DAY_LABELS } from "@/lib/workouts";

interface CalendarViewProps {
  colors: ThemeColors;
  schedule: string[];
  programStartDate: string;
  onSelectDate: (dateStr: string, workoutType: string) => void;
  onBack: () => void;
}

interface LogEntry {
  dateStr: string;
  workoutType: string;
  exerciseIndex: number;
  completed: boolean;
}

export default function CalendarView({
  colors,
  schedule,
  programStartDate,
  onSelectDate,
  onBack,
}: CalendarViewProps) {
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());
  const [partialDates, setPartialDates] = useState<Set<string>>(new Set());

  const loadLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/logs");
      const data: LogEntry[] = await res.json();
      if (!Array.isArray(data)) return;

      const byDate: Record<string, LogEntry[]> = {};
      for (const l of data) {
        if (!byDate[l.dateStr]) byDate[l.dateStr] = [];
        byDate[l.dateStr].push(l);
      }

      const completed = new Set<string>();
      const partial = new Set<string>();

      for (const [dateStr, entries] of Object.entries(byDate)) {
        const wt = entries[0]?.workoutType;
        if (!wt) continue;
        const workout = WORKOUTS[wt];
        if (!workout) continue;
        const totalEx = workout.exercises.length;
        const completedEx = entries.filter((e) => e.completed).length;
        if (completedEx >= totalEx && totalEx > 0) {
          completed.add(dateStr);
        } else if (completedEx > 0) {
          partial.add(dateStr);
        }
      }

      setCompletedDates(completed);
      setPartialDates(partial);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const startDate = programStartDate ? new Date(programStartDate + "T00:00:00") : new Date();

  // Generate 12 weeks
  const weeks: Date[][] = [];
  for (let w = 0; w < 12; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(startDate);
      day.setDate(day.getDate() + w * 7 + d);
      week.push(day);
    }
    weeks.push(week);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

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
          📅 12-Week Calendar
        </h1>
      </div>

      {/* Legend */}
      <div className="px-4 mb-4 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ background: colors.success }} />
          <span style={{ color: colors.textSecondary }}>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ background: colors.accent }} />
          <span style={{ color: colors.textSecondary }}>In Progress</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full border" style={{ borderColor: colors.cardBorder }} />
          <span style={{ color: colors.textSecondary }}>Upcoming</span>
        </div>
      </div>

      {/* Day headers */}
      <div className="px-4 grid grid-cols-7 gap-1 mb-2">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="text-center text-xs font-semibold" style={{ color: colors.textSecondary }}>
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div className="px-4 space-y-4">
        {weeks.map((week, wIdx) => (
          <div key={wIdx}>
            <p className="text-xs font-bold mb-2" style={{ color: colors.accent }}>
              Week {wIdx + 1}
            </p>
            <div className="grid grid-cols-7 gap-1">
              {week.map((day, dIdx) => {
                const ds = formatDate(day);
                const isToday = formatDate(day) === formatDate(today);
                const isCompleted = completedDates.has(ds);
                const isPartial = partialDates.has(ds);
                const workoutType = schedule[dIdx] || "rest";
                const isPast = day < today;

                return (
                  <button
                    key={dIdx}
                    onClick={() => onSelectDate(ds, workoutType)}
                    className="aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition-all active:scale-90 border"
                    style={{
                      background: isCompleted
                        ? colors.success + "20"
                        : isPartial
                        ? colors.accent + "15"
                        : isToday
                        ? colors.accent + "10"
                        : colors.card,
                      borderColor: isToday
                        ? colors.accent
                        : isCompleted
                        ? colors.success + "50"
                        : colors.cardBorder,
                      borderWidth: isToday ? 2 : 1,
                    }}
                  >
                    <span className="font-bold" style={{ color: colors.text, fontSize: 11 }}>
                      {day.getDate()}
                    </span>
                    {isCompleted && <span className="text-[8px]">✅</span>}
                    {isPartial && !isCompleted && <span className="text-[8px]">🔵</span>}
                    {!isCompleted && !isPartial && isPast && (
                      <span className="text-[8px]" style={{ color: colors.textSecondary }}>
                        {DAY_LABELS[workoutType]?.substring(0, 3)}
                      </span>
                    )}
                    {!isPast && !isCompleted && !isPartial && (
                      <span className="text-[8px]" style={{ color: colors.textSecondary }}>
                        {DAY_LABELS[workoutType]?.substring(0, 3)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
