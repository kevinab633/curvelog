"use client";
import { useState, useEffect, useCallback } from "react";
import VideoPlayer from "./VideoPlayer";
import type { ThemeColors } from "@/lib/themes";
import { WORKOUTS } from "@/lib/workouts";

interface ExerciseLog {
  exerciseIndex: number;
  completed: boolean;
  setsCompleted: number;
}

interface WorkoutScreenProps {
  workoutType: string;
  dateStr: string;
  colors: ThemeColors;
  saturdayChoice: string;
  onBack: () => void;
  onChangeSaturdayChoice?: (c: string) => void;
}

const localKey = (dateStr: string, type: string) => `logs_${dateStr}_${type}`;

function loadLocal(dateStr: string, type: string): ExerciseLog[] {
  try {
    const raw = localStorage.getItem(localKey(dateStr, type));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocal(dateStr: string, type: string, logs: ExerciseLog[]) {
  try {
    localStorage.setItem(localKey(dateStr, type), JSON.stringify(logs));
  } catch {}
}

export default function WorkoutScreen({
  workoutType,
  dateStr,
  colors,
  saturdayChoice,
  onBack,
  onChangeSaturdayChoice,
}: WorkoutScreenProps) {
  const [logs, setLogs] = useState<ExerciseLog[]>(() => loadLocal(dateStr, 
    workoutType === "flexible"
      ? "upper"
      : workoutType
  ));
  const [loading, setLoading] = useState(false);
  const [walkTimer, setWalkTimer] = useState(0);
  const [walkActive, setWalkActive] = useState(false);

  const effectiveType =
    workoutType === "flexible"
      ? saturdayChoice === "rest"
        ? "rest"
        : saturdayChoice === "walk"
        ? "recovery"
        : "upper"
      : workoutType;

  const workout = WORKOUTS[effectiveType];

  const fetchLogs = useCallback(async () => {
    // Always load from localStorage first (works offline)
    const local = loadLocal(dateStr, effectiveType);
    if (local.length > 0) setLogs(local);

    // Try to sync from server
    try {
      const res = await fetch(`/api/logs?date=${dateStr}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const serverLogs = data
          .filter((d: { workoutType: string }) => d.workoutType === effectiveType)
          .map((d: { exerciseIndex: number; completed: boolean; setsCompleted: number }) => ({
            exerciseIndex: d.exerciseIndex,
            completed: d.completed,
            setsCompleted: d.setsCompleted,
          }));
        if (serverLogs.length > 0) {
          setLogs(serverLogs);
          saveLocal(dateStr, effectiveType, serverLogs);
        }
      }
    } catch {
      // offline - local data already loaded above
    } finally {
      setLoading(false);
    }
  }, [dateStr, effectiveType]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!walkActive) return;
    const interval = setInterval(() => {
      setWalkTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [walkActive]);

  const toggleExercise = async (idx: number) => {
    const existing = logs.find((l) => l.exerciseIndex === idx);
    const newCompleted = !existing?.completed;
    const newSets = newCompleted ? (workout?.exercises[idx]?.sets || 0) : 0;

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }

    const newLogs = [...logs];
    const existingIdx = newLogs.findIndex((l) => l.exerciseIndex === idx);
    if (existingIdx >= 0) {
      newLogs[existingIdx] = { exerciseIndex: idx, completed: newCompleted, setsCompleted: newSets };
    } else {
      newLogs.push({ exerciseIndex: idx, completed: newCompleted, setsCompleted: newSets });
    }
    setLogs(newLogs);
    saveLocal(dateStr, effectiveType, newLogs);

    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateStr,
          workoutType: effectiveType,
          exerciseIndex: idx,
          completed: newCompleted,
          setsCompleted: newSets,
        }),
      });
    } catch {
      // offline - saved locally above
    }
  };

  const updateSets = async (idx: number, sets: number) => {
    const maxSets = workout?.exercises[idx]?.sets || 0;
    const clampedSets = Math.max(0, Math.min(sets, maxSets));
    const completed = clampedSets >= maxSets;

    const newLogs = [...logs];
    const existingIdx = newLogs.findIndex((l) => l.exerciseIndex === idx);
    if (existingIdx >= 0) {
      newLogs[existingIdx] = { exerciseIndex: idx, completed, setsCompleted: clampedSets };
    } else {
      newLogs.push({ exerciseIndex: idx, completed, setsCompleted: clampedSets });
    }
    setLogs(newLogs);
    saveLocal(dateStr, effectiveType, newLogs);

    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateStr,
          workoutType: effectiveType,
          exerciseIndex: idx,
          completed,
          setsCompleted: clampedSets,
        }),
      });
    } catch {
      // offline - saved locally above
    }
  };

  const completedCount = logs.filter((l) => l.completed).length;
  const totalExercises = workout?.exercises.length || 0;
  const allDone = totalExercises > 0 && completedCount >= totalExercises;

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!workout) return null;

  return (
    <div className="min-h-screen pb-8" style={{ background: colors.bg }}>
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
        <div className="flex-1">
          <h1 className="text-lg font-bold" style={{ color: colors.text }}>
            {workout.title}
          </h1>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            {workout.subtitle}
          </p>
        </div>
        {totalExercises > 0 && (
          <div
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: allDone ? colors.success + "20" : colors.accent + "20",
              color: allDone ? colors.success : colors.accent,
            }}
          >
            {completedCount}/{totalExercises}
          </div>
        )}
      </div>

      {workoutType === "flexible" && onChangeSaturdayChoice && (
        <div className="mx-4 mb-4 p-4 rounded-2xl" style={{ background: colors.card, border: `1px solid ${colors.cardBorder}` }}>
          <p className="text-sm font-semibold mb-3" style={{ color: colors.text }}>
            Choose today&apos;s activity:
          </p>
          <div className="flex gap-2">
            {[
              { val: "upper", label: "💪 Upper Body" },
              { val: "rest", label: "😴 Rest" },
              { val: "walk", label: "🚶 Walk Only" },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => onChangeSaturdayChoice(opt.val)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: saturdayChoice === opt.val ? colors.accent : colors.bgSecondary,
                  color: saturdayChoice === opt.val ? "#fff" : colors.text,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {workout.warning && (
        <div
          className="mx-4 mb-4 p-4 rounded-2xl text-sm font-medium"
          style={{ background: "#FEF3C7", color: "#92400E" }}
        >
          {workout.warning}
        </div>
      )}

      {effectiveType === "recovery" && (
        <div className="mx-4 mb-4 p-4 rounded-2xl text-center" style={{ background: colors.card, border: `1px solid ${colors.cardBorder}` }}>
          <p className="text-sm font-semibold mb-2" style={{ color: colors.text }}>🚶 Walk Timer (25-30 min)</p>
          <p className="text-4xl font-mono font-bold mb-3" style={{ color: colors.accent }}>
            {formatTime(walkTimer)}
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setWalkActive(!walkActive)}
              className="px-6 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: walkActive ? colors.danger : colors.accent }}
            >
              {walkActive ? "⏸ Pause" : "▶ Start"}
            </button>
            <button
              onClick={() => { setWalkTimer(0); setWalkActive(false); }}
              className="px-6 py-2 rounded-xl text-sm font-semibold"
              style={{ background: colors.bgSecondary, color: colors.text }}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {totalExercises > 0 && (
        <div className="mx-4 mb-4">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: colors.bgSecondary }}>
            <div
              className="h-full rounded-full transition-all duration-500 progress-animate"
              style={{
                width: `${(completedCount / totalExercises) * 100}%`,
                background: allDone ? colors.success : colors.accent,
              }}
            />
          </div>
        </div>
      )}

      {allDone && (
        <div className="mx-4 mb-4 p-4 rounded-2xl text-center" style={{ background: colors.success + "15" }}>
          <p className="text-2xl mb-1">🎉</p>
          <p className="font-bold" style={{ color: colors.success }}>
            Workout Complete!
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: colors.bgSecondary, borderTopColor: colors.accent }} />
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {workout.exercises.map((ex, idx) => {
            const log = logs.find((l) => l.exerciseIndex === idx);
            const isCompleted = log?.completed || false;
            const setsCompleted = log?.setsCompleted || 0;

            return (
              <div
                key={idx}
                className="rounded-2xl overflow-hidden border transition-all"
                style={{
                  background: colors.card,
                  borderColor: isCompleted ? colors.success + "60" : colors.cardBorder,
                }}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleExercise(idx)}
                      className="mt-0.5 w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center border-2 transition-all"
                      style={{
                        background: isCompleted ? colors.success : "transparent",
                        borderColor: isCompleted ? colors.success : colors.cardBorder,
                      }}
                    >
                      {isCompleted && (
                        <svg className="w-4 h-4 text-white check-animate" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className="font-semibold text-base"
                          style={{
                            color: isCompleted ? colors.success : colors.text,
                            textDecoration: isCompleted ? "line-through" : "none",
                          }}
                        >
                          {ex.name}
                        </h3>
                        {ex.isBonus && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                            style={{ background: colors.accent + "20", color: colors.accent }}
                          >
                            BONUS
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
                        {ex.sets} sets × {ex.reps}
                      </p>

                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                          Sets:
                        </span>
                        <div className="flex gap-1">
                          {Array.from({ length: ex.sets }, (_, i) => (
                            <button
                              key={i}
                              onClick={() => updateSets(idx, i < setsCompleted ? i : i + 1)}
                              className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                              style={{
                                background: i < setsCompleted ? colors.accent : colors.bgSecondary,
                                color: i < setsCompleted ? "#fff" : colors.textSecondary,
                              }}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {ex.video && (
                    <div className="mt-3">
                      <VideoPlayer
                        src={ex.video}
                        name={ex.name}
                        accentColor={colors.accent}
                        cardBg={colors.bgSecondary}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
