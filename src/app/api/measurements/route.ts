import { NextResponse } from "next/server";
import { db } from "@/db";
import { measurements } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(measurements).orderBy(asc(measurements.dateStr));
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch measurements" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const inserted = await db
      .insert(measurements)
      .values({ dateStr: body.dateStr, waistInches: body.waistInches })
      .returning();
    return NextResponse.json(inserted[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save measurement" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.delete(measurements);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete measurements" }, { status: 500 });
  }
}
