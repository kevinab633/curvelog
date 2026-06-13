"use client";
import { useState } from "react";
import { DAY_NAMES, DAY_LABELS } from "@/lib/workouts";
import type { ThemeColors } from "@/lib/themes";

interface ScheduleEditorProps {
  schedule: string[];
  colors: ThemeColors;
  onSave: (schedule: string[]) => void;
  onClose: () => void;
}

const OPTIONS = ["lower1", "lower2", "lower3", "recovery", "rest", "upper", "flexible"];

export default function ScheduleEditor({
  schedule,
  colors,
  onSave,
  onClose,
}: ScheduleEditorProps) {
  const [draft, setDraft] = useState([...schedule]);
  const [error, setError] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const validate = (sched: string[]): string => {
    const lowerDays = sched.filter((d) =>
      ["lower1", "lower2", "lower3"].includes(d)
    );
    const unique = new Set(lowerDays);
    if (unique.size < lowerDays.length) {
      return "Cannot have duplicate Lower Body days";
    }
    return "";
  };

  const handleChange = (idx: number, val: string) => {
    const next = [...draft];
    next[idx] = val;
    setError(validate(next));
    setDraft(next);
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);

  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const next = [...draft];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, moved);
    setError(validate(next));
    setDraft(next);
    setDragIdx(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-overlay"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 slide-up max-h-[90vh] overflow-y-auto"
        style={{ background: colors.card }}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold" style={{ color: colors.text }}>
            📅 Edit Weekly Schedule
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: colors.bgSecondary }}
          >
            ✕
          </button>
        </div>

        <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
          Drag to reorder or use dropdowns. No duplicate Lower Body days allowed.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm font-medium" style={{ background: "#FEE2E2", color: "#DC2626" }}>
            {error}
          </div>
        )}

        <div className="space-y-2 mb-6">
          {draft.map((day, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(idx)}
              className="flex items-center gap-3 p-3 rounded-xl cursor-grab active:cursor-grabbing border transition-all"
              style={{
                background: colors.bgSecondary,
                borderColor: dragIdx === idx ? colors.accent : "transparent",
              }}
            >
              <div className="text-lg cursor-grab" style={{ color: colors.textSecondary }}>
                ⠿
              </div>
              <div className="flex-shrink-0 w-24">
                <span className="text-sm font-semibold" style={{ color: colors.text }}>
                  {DAY_NAMES[idx]}
                </span>
              </div>
              <select
                value={day}
                onChange={(e) => handleChange(idx, e.target.value)}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium border-none outline-none"
                style={{
                  background: colors.card,
                  color: colors.text,
                }}
              >
                {OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {DAY_LABELS[opt]}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl font-semibold"
            style={{ background: colors.bgSecondary, color: colors.text }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const err = validate(draft);
              if (err) {
                setError(err);
                return;
              }
              onSave(draft);
            }}
            className="flex-1 py-3 rounded-2xl font-semibold text-white active:scale-95 transition-all"
            style={{ background: colors.accent }}
            disabled={!!error}
          >
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
