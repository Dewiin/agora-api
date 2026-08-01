import { prisma } from "../config/prismaClient"

// types
import type { Request, Response } from "express"

async function signup(
    req: Request, 
    res: Response
) {
    try {
        const { username, displayName, email, password } = req.body;
        
        const user = await prisma.user.create({
            data: {
                username, 
                displayName,
                email,
                password,
                provider: "LOCAL"
            }
        });
        if(!user) return res.status(400).json({
            error: "Server error creating user account." 
        });

        return res
        .status(200)
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