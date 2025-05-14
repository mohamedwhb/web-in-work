import { type Duration, Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

export async function getUserIp() {
	const headersList = await headers();
	const ip =
		headersList.get("x-forwarded-for")?.split(",")[0] ||
		headersList.get("x-real-ip") ||
		"127.0.0.1";
	return ip;
}

export async function getRateLimit(limit = 10, time = "1 m") {
	if (process.env.NODE_ENV === "development") {
		return { success: true };
	}
	const redis = Redis.fromEnv();

	const ratelimit = new Ratelimit({
		redis,
		limiter: Ratelimit.slidingWindow(limit, time as Duration),
	});

	const ip = await getUserIp();
	const { success } = await ratelimit.limit(ip);
	return { success };
}
