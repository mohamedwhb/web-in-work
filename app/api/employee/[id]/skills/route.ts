import prisma from "@/db/prisma";
import { NextResponse } from "next/server";

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const { skill, level } = await req.json();

		const newSkill = await prisma.skill.create({
			data: {
				name: skill,
				level: Number.parseInt(level),
				employees: {
					connect: {
						id,
					},
				},
			},
		});

		return NextResponse.json({ newSkill });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Failed to create skill" },
			{ status: 500 },
		);
	}
}
