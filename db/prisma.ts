import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";
import { passwordExtension } from "./middlewares/password-extension";

// Attach WebSocket constructor for Neon Serverless
neonConfig.webSocketConstructor = ws;

// Singleton cache on the global object to prevent multiple instances in dev
declare global {
	// eslint-disable-next-line no-var
	var cachedPrisma: PrismaClient;
}

const connectionString = `${process.env.DATABASE_URL}`;

// Initialize the Neon adapter with connection string
const adapter = new PrismaNeon({ connectionString });

// Instantiate Prisma Client with Neon adapter, logging, and any extensions
const prismaClient: PrismaClient =
	global.cachedPrisma ?? new PrismaClient({ adapter });

// Apply custom password extension
const prisma = prismaClient.$extends(passwordExtension) as PrismaClient;

if (process.env.NODE_ENV !== "production") {
	global.cachedPrisma = prismaClient;
}

export default prisma;
