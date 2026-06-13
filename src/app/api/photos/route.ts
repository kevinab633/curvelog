import { NextResponse } from "next/server";
import { db } from "@/db";
import { progressPhotos } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(progressPhotos).orderBy(asc(progressPhotos.dateStr));
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const inserted = await db
      .insert(progressPhotos)
      .values({ dateStr: body.dateStr, photoType: body.photoType, dataUrl: body.dataUrl })
      .returning();
    return NextResponse.json(inserted[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save photo" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.delete(progressPhotos);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete photos" }, { status: 500 });
  }
}
