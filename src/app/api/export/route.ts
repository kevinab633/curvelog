import { NextResponse } from "next/server";
import { db } from "@/db";
import { workoutLogs, measurements } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const logs = await db.select().from(workoutLogs).orderBy(asc(workoutLogs.dateStr));
    const meas = await db.select().from(measurements).orderBy(asc(measurements.dateStr));

    let csv = "Type,Date,Workout,Exercise Index,Completed,Sets Completed\n";
    for (const l of logs) {
      csv += `workout,${l.dateStr},${l.workoutType},${l.exerciseIndex},${l.completed},${l.setsCompleted}\n`;
    }
    csv += "\nType,Date,Waist (inches)\n";
    for (const m of meas) {
      csv += `measurement,${m.dateStr},${m.waistInches}\n`;
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=curvelog-progress.csv",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
