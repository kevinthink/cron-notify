import { connection } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { TimeRecord } from "@/models/TimeRecord";

export async function GET() {
  // GET handlers can be prerendered with Cache Components. Wait for a real
  // request so the build never writes a record and every call saves a new one.
  await connection();

  try {
    await connectToDatabase();
    const record = await TimeRecord.create({});

    return Response.json(
      { id: record.id, recordedAt: record.recordedAt },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to save time record:", error);

    return Response.json(
      { error: "Failed to save time record" },
      { status: 500 },
    );
  }
}
