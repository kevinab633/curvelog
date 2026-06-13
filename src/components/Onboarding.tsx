"use client";
import { useState } from "react";
import type { ThemeColors } from "@/lib/themes";

interface OnboardingProps {
  colors: ThemeColors;
  onComplete: () => void;
}

const SLIDES = [
  {
    emoji: "✅",
    title: "Track Your Workouts",
    desc: "Check off completed exercises during each workout. Track your sets and reps to stay on top of your progress.",
  },
  {
    emoji: "📅",
    title: "Edit Your Schedule",
    desc: "Customize which workouts fall on which days. The default schedule is optimized but you can rearrange it to fit your life.",
  },
  {
    emoji: "🎨",
    title: "Choose Your Theme",
    desc: "Pick from 4 color themes, each with light and dark modes. Change anytime from Settings.",
  },
  {
    emoji: "📈",
    title: "12-Week Journey",
    desc: "Track progress over 12 weeks with calendar views, measurements, and progress photos. You've got this!",
  },
];

export default function Onboarding({ colors, onComplete }: OnboardingProps) {
  const [slide, setSlide] = useState(0);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: colors.bg }}
    >
      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-12">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === slide ? 32 : 8,
                background: i === slide ? colors.accent : colors.cardBorder,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center">
          <div className="text-7xl mb-6">{SLIDES[slide].emoji}</div>
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: colors.text }}
          >
            {SLIDES[slide].title}
          </h2>
          <p
            className="text-lg leading-relaxed mb-12"
            style={{ color: colors.textSecondary }}
          >
            {SLIDES[slide].desc}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {slide > 0 && (
            <button
              onClick={() => setSlide(slide - 1)}
              className="flex-1 py-4 rounded-2xl font-semibold text-lg transition-all"
              style={{
                background: colors.bgSecondary,
                color: colors.text,
              }}
            >
              Back
            </button>
          )}
          <button
            onClick={() => {
              if (slide < SLIDES.length - 1) {
                setSlide(slide + 1);
              } else {
                onComplete();
              }
            }}
            className="flex-1 py-4 rounded-2xl font-semibold text-lg text-white transition-all active:scale-95"
            style={{ background: colors.accent }}
          >
            {slide < SLIDES.length - 1 ? "Next" : "Let's Go! 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
}
