import { NextResponse } from "next/server";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(userSettings).limit(1);
    if (rows.length === 0) {
      const inserted = await db.insert(userSettings).values({}).returning();
      return NextResponse.json(inserted[0]);
    }
    return NextResponse.json(rows[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const rows = await db.select().from(userSettings).limit(1);
    if (rows.length === 0) {
      const inserted = await db.insert(userSettings).values(body).returning();
      return NextResponse.json(inserted[0]);
    }
    const updated = await db
      .update(userSettings)
      .set(body)
      .where(eq(userSettings.id, rows[0].id))
      .returning();
    return NextResponse.json(updated[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
