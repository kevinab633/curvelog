export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  video: string;
  isBonus?: boolean;
}

export interface Workout {
  id: string;
  title: string;
  subtitle: string;
  exercises: Exercise[];
  warning?: string;
}

export const WORKOUTS: Record<string, Workout> = {
  lower1: {
    id: "lower1",
    title: "Lower Body Day 1",
    subtitle: "Glute Focus",
    exercises: [
      { name: "Glute Bridge", sets: 3, reps: "15-20 reps", video: "/glute-bridge.mp4" },
      { name: "Step-Up", sets: 3, reps: "12-15 reps per leg", video: "/step-up.mp4" },
      { name: "Cable Kickback", sets: 3, reps: "15-20 reps per leg", video: "/cable-kickback.mp4" },
      { name: "Side-Lying Leg Lift", sets: 3, reps: "20 reps per leg", video: "/side-lying-leg-lift.mp4" },
      { name: "Bodyweight Squat (Wide Stance)", sets: 3, reps: "15-20 reps", video: "/bodyweight-squat.mp4" },
      { name: "Stomach Vacuum", sets: 5, reps: "30-second holds", video: "/stomach-vacuum.mp4", isBonus: true },
    ],
  },
  lower2: {
    id: "lower2",
    title: "Lower Body Day 2",
    subtitle: "Hip Dip Focus",
    exercises: [
      { name: "Clamshell", sets: 3, reps: "20 reps per side", video: "/clamshell.mp4" },
      { name: "Seated Hip Abduction", sets: 3, reps: "15-20 reps", video: "/seated-hip-abduction.mp4" },
      { name: "Bulgarian Split Squat", sets: 3, reps: "10-12 reps per leg", video: "/bulgarian-split-squat.mp4" },
      { name: "Standing Cable Abduction", sets: 3, reps: "15-20 reps per leg", video: "/standing-cable-abduction.mp4" },
      { name: "Glute Bridge with Band", sets: 3, reps: "20 reps", video: "/glute-bridge-band.mp4" },
      { name: "Stomach Vacuum", sets: 5, reps: "30-second holds", video: "/stomach-vacuum.mp4", isBonus: true },
    ],
  },
  lower3: {
    id: "lower3",
    title: "Lower Body Day 3",
    subtitle: "Full Curves",
    exercises: [
      { name: "Hip Thrust", sets: 3, reps: "12-15 reps", video: "/hip-thrust.mp4" },
      { name: "Leg Press (High Feet)", sets: 3, reps: "15-20 reps", video: "/leg-press.mp4" },
      { name: "Walking Lunge", sets: 3, reps: "12 reps per leg", video: "/walking-lunge.mp4" },
      { name: "Donkey Kick", sets: 3, reps: "15-20 reps per leg", video: "/donkey-kick.mp4" },
      { name: "Sumo Squat", sets: 3, reps: "12-15 reps", video: "/sumo-squat.mp4" },
      { name: "Stomach Vacuum", sets: 5, reps: "30-second holds", video: "/stomach-vacuum.mp4", isBonus: true },
    ],
  },
  recovery: {
    id: "recovery",
    title: "Active Recovery",
    subtitle: "Mobility & Posture",
    exercises: [
      { name: "Walk", sets: 1, reps: "25-30 minutes", video: "" },
      { name: "Stomach Vacuum", sets: 5, reps: "30-second holds", video: "/stomach-vacuum.mp4" },
      { name: "Wall Angels", sets: 1, reps: "10 reps", video: "/wall-angel.mp4" },
      { name: "Pelvic Tilts", sets: 1, reps: "15 reps", video: "/pelvic-tilt.mp4" },
    ],
  },
  rest: {
    id: "rest",
    title: "Rest Day",
    subtitle: "Recovery & Stomach Vacuums",
    exercises: [
      { name: "Stomach Vacuum", sets: 5, reps: "30-second holds", video: "/stomach-vacuum.mp4" },
    ],
  },
  upper: {
    id: "upper",
    title: "Upper Body Maintenance",
    subtitle: "Light Upper Body",
    exercises: [
      { name: "Push-Up (Knees)", sets: 2, reps: "8-12 reps", video: "/push-up.mp4" },
      { name: "Seated Cable Row", sets: 2, reps: "12-15 reps", video: "/seated-cable-row.mp4" },
      { name: "Face Pull", sets: 2, reps: "15 reps", video: "/face-pull.mp4" },
      { name: "Plank", sets: 2, reps: "30-45 seconds", video: "" },
    ],
    warning: "⚠️ Do not do lateral raises, overhead press, or wide-grip pull-ups — these widen shoulders.",
  },
  flexible: {
    id: "flexible",
    title: "Saturday (Flexible)",
    subtitle: "Choose your activity",
    exercises: [],
  },
};

export const DAY_LABELS: Record<string, string> = {
  lower1: "Lower Body Day 1",
  lower2: "Lower Body Day 2",
  lower3: "Lower Body Day 3",
  recovery: "Active Recovery",
  rest: "Rest",
  upper: "Upper Body",
  flexible: "Flexible",
};

export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const DEFAULT_SCHEDULE = ["lower1", "recovery", "lower2", "recovery", "lower3", "flexible", "rest"];
