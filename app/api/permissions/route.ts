import prisma from "@/db/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const role = searchParams.get("role");

	if (!role) {
		return NextResponse.json({ error: "Missing role" }, { status: 400 });
	}

	const result = await prisma.role.findUnique({
		where: { key: role },
		select: {
			rolePermissions: {
				select: {
					key: true,
				},
			},
		},
	});

	if (!result) {
		return NextResponse.json({ error: "Role not found" }, { status: 404 });
	}

	return NextResponse.json({
		permissions: result.rolePermissions.map((rp) => rp.key),
	});
}
