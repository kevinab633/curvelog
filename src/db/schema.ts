import { pgTable, serial, text, integer, boolean, date, timestamp, json, real } from "drizzle-orm/pg-core";

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  theme: text("theme").notNull().default("pinkish"),
  mode: text("mode").notNull().default("light"),
  onboardingDone: boolean("onboarding_done").notNull().default(false),
  programStartDate: date("program_start_date"),
  reminderEnabled: boolean("reminder_enabled").notNull().default(true),
  weeklySchedule: json("weekly_schedule").$type<string[]>().default([
    "lower1", "recovery", "lower2", "recovery", "lower3", "flexible", "rest"
  ]),
  saturdayChoice: text("saturday_choice").default("upper"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workoutLogs = pgTable("workout_logs", {
  id: serial("id").primaryKey(),
  dateStr: date("date_str").notNull(),
  workoutType: text("workout_type").notNull(),
  exerciseIndex: integer("exercise_index").notNull(),
  completed: boolean("completed").notNull().default(false),
  setsCompleted: integer("sets_completed").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const measurements = pgTable("measurements", {
  id: serial("id").primaryKey(),
  dateStr: date("date_str").notNull(),
  waistInches: real("waist_inches").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const progressPhotos = pgTable("progress_photos", {
  id: serial("id").primaryKey(),
  dateStr: date("date_str").notNull(),
  photoType: text("photo_type").notNull(),
  dataUrl: text("data_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
