import prisma from "@/db/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const roles = await prisma.role.findMany();
    return NextResponse.json({ roles }, { status: 200 });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles", details: (error as Error).message },
      { status: 500 }
    );
  }
}
