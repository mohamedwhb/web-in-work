// lib/jwt.ts
import jwt from "jsonwebtoken";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
	throw new Error("Missing JWT secrets in env");
}

export function signAccessToken(payload: object) {
	return jwt.sign(payload, JWT_ACCESS_SECRET, {
		expiresIn: JWT_ACCESS_EXPIRES_IN || "15m", // 15 minutes
	} as jwt.SignOptions);
}

export function signRefreshToken(payload: object) {
	return jwt.sign(payload, JWT_REFRESH_SECRET, {
		expiresIn: JWT_REFRESH_EXPIRES_IN || "7d", // 7 days
	} as jwt.SignOptions);
}

export function verifyAccessToken(token: string) {
	try {
		return jwt.verify(token, JWT_ACCESS_SECRET);
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			throw error;
		}
		throw new Error("Invalid access token");
	}
}

export function verifyRefreshToken(token: string) {
	try {
		return jwt.verify(token, JWT_REFRESH_SECRET);
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			throw error;
		}
		throw new Error("Invalid refresh token");
	}
}
