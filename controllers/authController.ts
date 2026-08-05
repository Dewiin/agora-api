import bcrypt from "bcryptjs";
import passport from "passport";
import { prisma } from "@/config/prismaClient"

// services
import { generateTokens } from "@/services/auth";
import { createSession, deleteSession } from "@/services/auth";

// types
import type { Request, Response } from "express"
import type { User } from "@/generated/prisma/client";

async function signup(
    req: Request, 
    res: Response
) {
    try {
        const { firstName, lastName, username, password } = req.body;
        const displayName = firstName + ' ' + lastName;

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await prisma.user.create({
            data: {
                username, 
                displayName,
                password: hashedPassword,
                provider: "LOCAL"
            }
        });
        if(!user) return res.status(400).json({
            message: "Server error creating user account." 
        });

        const { accessToken, refreshToken } = generateTokens(user);
        createSession(user, refreshToken);

        return res
        .status(201)
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
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName
            }
        });
    } catch(err) {
        console.error("Error in signup: ", err);
        return res.status(500).json({
            message: "Server error signing up."
        });
    }
}

async function login(
    req: Request,
    res: Response
) {
    try {
        passport.authenticate("local", async (err: any, user: User, info: any) => {
            if(err) return res.status(500).json({ message: "Authentication failed." });
            if(!user) return res.status(400).json({ message: info.message });
            
            const { accessToken, refreshToken } = generateTokens(user);
            await createSession(user, refreshToken);

            return res.status(200)
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
                message: "User logged in!",
                user: {
                    id: user.id,
                    username: user.username,
                    displayName: user.displayName
                }
            });
        })(req, res);
    } catch(err) {
        console.error("Error in login: ", err);
        return res.status(500).json({
            message: "Server error logging in."
        });
    }
}

async function logout(
    req: Request,
    res: Response
) {
    try {
        const user = req.user as User;

        await deleteSession(user);
        
        return res.status(200)
        .clearCookie("refreshToken")
        .clearCookie("accessToken")
        .json({
            message: "User successfully logged out!"
        });
    } catch(err) {
        console.error("Error in logout: ", err);
        return res.status(500).json({
            message: "Server error logging out."
        });
    }
}

export const authController = {
    signup,
    login,
    logout
}