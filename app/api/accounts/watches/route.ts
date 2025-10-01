import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Watch } from "@/types/database";

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);

    // 🔎 Récupération des query params
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const query: Partial<Watch> = {};
    if (userId) query.userId = userId;

    const watches = await db.collection<Watch>("watches").find(query).toArray();

    return NextResponse.json({ success: true, data: watches });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);

    const body = await req.json();
    const now = new Date();

    const newWatch: Omit<Watch, "_id"> = {
      ...body,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection<Watch>("watches").insertOne(newWatch);

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...newWatch },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
