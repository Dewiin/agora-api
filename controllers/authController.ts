import bcrypt from "bcryptjs";
import { prisma } from "../config/prismaClient"

// services
import { generateTokens } from "../services/auth";
import { createSession } from "../services/auth";

// types
import type { Request, Response } from "express"

async function signup(
    req: Request, 
    res: Response
) {
    try {
        const { username, displayName, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await prisma.user.create({
            data: {
                username, 
                displayName,
                email,
                password: hashedPassword,
                provider: "LOCAL"
            }
        });
        if(!user) return res.status(400).json({
            error: "Server error creating user account." 
        });

        const { accessToken, refreshToken } = generateTokens(user);
        createSession(user, refreshToken);

        return res
        .status(200)
        .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        })
        .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        })
        .json({
            message: "User signed up!",
            user
        });
    } catch(err) {
        console.error("Error in signup: ", err);
        return res.status(500).json({
            message: "Server error signing up."
        });
    }
}

export const authController = {
    signup,
}