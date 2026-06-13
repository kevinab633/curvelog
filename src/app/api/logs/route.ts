import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { workoutLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const dateStr = req.nextUrl.searchParams.get("date");
    if (dateStr) {
      const rows = await db.select().from(workoutLogs).where(eq(workoutLogs.dateStr, dateStr));
      return NextResponse.json(rows);
    }
    const rows = await db.select().from(workoutLogs);
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dateStr, workoutType, exerciseIndex, completed, setsCompleted } = body;

    const existing = await db
      .select()
      .from(workoutLogs)
      .where(
        and(
          eq(workoutLogs.dateStr, dateStr),
          eq(workoutLogs.workoutType, workoutType),
          eq(workoutLogs.exerciseIndex, exerciseIndex)
        )
      );

    if (existing.length > 0) {
      const updated = await db
        .update(workoutLogs)
        .set({ completed, setsCompleted })
        .where(eq(workoutLogs.id, existing[0].id))
        .returning();
      return NextResponse.json(updated[0]);
    }

    const inserted = await db
      .insert(workoutLogs)
      .values({ dateStr, workoutType, exerciseIndex, completed, setsCompleted })
      .returning();
    return NextResponse.json(inserted[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.delete(workoutLogs);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete logs" }, { status: 500 });
  }
}
