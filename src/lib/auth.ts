import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";

export const auth = betterAuth({ database: prismaAdapter(db, { provider: "postgresql" }), emailAndPassword: { enabled: true }, trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"], advanced: { useSecureCookies: process.env.NODE_ENV === "production", defaultCookieAttributes: { sameSite: "lax", httpOnly: true, secure: process.env.NODE_ENV === "production" } } });
