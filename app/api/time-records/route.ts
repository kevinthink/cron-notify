import { createHash, timingSafeEqual } from "node:crypto";
import { connection } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { TimeRecord } from "@/models/TimeRecord";

function sha256(value: string) {
  return createHash("sha256").update(value).digest();
}

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;

  // Reject everything if the secret is missing, rather than leaving the API open.
  if (!secret) {
    console.error("CRON_SECRET is not set");
    return false;
  }

  const header = request.headers.get("authorization") ?? "";

  // Hash first so both buffers have equal length for timingSafeEqual.
  return timingSafeEqual(sha256(header), sha256(`Bearer ${secret}`));
}

export async function GET(request: Request) {
  // GET handlers can be prerendered with Cache Components. Wait for a real
  // request so the build never writes a record and every call saves a new one.
  await connection();

  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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
