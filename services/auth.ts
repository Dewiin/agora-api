import jwt from "jsonwebtoken"
import crypto from "crypto"

// config
import { redis } from "../config/redisConfig";

// types
import type { User } from "../generated/prisma/client";

export function generateTokens(user: User) {
    const accessToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "30d" }
    );

    return { accessToken, refreshToken };
}

export async function createSession(user: User, refreshToken: string) {
    const hashedRefreshToken = await crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

    await redis.set(
        `refresh:${user.id}`,
        hashedRefreshToken,
        {
            EX: 60 * 60 * 24 * 30, // 30 days
        }
    );
}