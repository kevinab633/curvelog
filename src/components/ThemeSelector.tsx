"use client";
import { useState } from "react";
import { THEMES, getColors } from "@/lib/themes";

interface ThemeSelectorProps {
  currentTheme: string;
  currentMode: string;
  onSelect: (theme: string, mode: string) => void;
  onClose?: () => void;
  showClose?: boolean;
}

export default function ThemeSelector({
  currentTheme,
  currentMode,
  onSelect,
  onClose,
  showClose,
}: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [selectedMode, setSelectedMode] = useState(currentMode);

  const previewColors = getColors(selectedTheme, selectedMode);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4 modal-overlay"
      style={{ background: previewColors.bg }}
    >
      {showClose && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: previewColors.bgSecondary }}
        >
          <svg className="w-5 h-5" fill="none" stroke={previewColors.text} strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="w-full max-w-md">
        <h2
          className="text-2xl font-bold text-center mb-2"
          style={{ color: previewColors.text }}
        >
          🎨 Choose Your Theme
        </h2>
        <p className="text-center mb-8" style={{ color: previewColors.textSecondary }}>
          Pick a color that motivates you
        </p>

        {/* Theme Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {THEMES.map((theme) => {
            const tc = getColors(theme.id, selectedMode);
            const isSelected = selectedTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className="p-4 rounded-2xl border-2 transition-all active:scale-95"
                style={{
                  background: tc.card,
                  borderColor: isSelected ? tc.accent : tc.cardBorder,
                  boxShadow: isSelected ? `0 0 0 2px ${tc.accent}40` : "none",
                }}
              >
                <div className="text-2xl mb-2">{theme.emoji}</div>
                <div className="font-semibold text-sm" style={{ color: tc.text }}>
                  {theme.label}
                </div>
                <div className="flex gap-1 mt-2 justify-center">
                  <div className="w-4 h-4 rounded-full" style={{ background: tc.accent }} />
                  <div className="w-4 h-4 rounded-full" style={{ background: tc.bg }} />
                  <div className="w-4 h-4 rounded-full" style={{ background: tc.bgSecondary }} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Light/Dark Toggle */}
        <div
          className="flex rounded-2xl p-1 mb-8"
          style={{ background: previewColors.bgSecondary }}
        >
          <button
            onClick={() => setSelectedMode("light")}
            className="flex-1 py-3 rounded-xl font-semibold transition-all text-sm"
            style={{
              background: selectedMode === "light" ? previewColors.card : "transparent",
              color: selectedMode === "light" ? previewColors.text : previewColors.textSecondary,
            }}
          >
            ☀️ Light Mode
          </button>
          <button
            onClick={() => setSelectedMode("dark")}
            className="flex-1 py-3 rounded-xl font-semibold transition-all text-sm"
            style={{
              background: selectedMode === "dark" ? previewColors.card : "transparent",
              color: selectedMode === "dark" ? previewColors.text : previewColors.textSecondary,
            }}
          >
            🌙 Dark Mode
          </button>
        </div>

        {/* Confirm Button */}
        <button
          onClick={() => onSelect(selectedTheme, selectedMode)}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all active:scale-95"
          style={{ background: previewColors.accent }}
        >
          Apply Theme ✨
        </button>
      </div>
    </div>
  );
}
