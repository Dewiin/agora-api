import jwt from "jsonwebtoken"

// types
import type { Request, Response, NextFunction } from "express"

export async function verifyAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const accessToken = req.cookies.accessToken;
        if(!accessToken) return res.status(404).json({ message: "Token is missing." })
    
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY!);
        if (!decoded || typeof decoded !== 'object') return res.status(400).json({ error: 'Token is invalid!' });
        
        req.user = decoded;
        
        next();
    } catch (err: any) {
        console.error("Unexpected error:", err);
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ 
                message: "Token expired" 
            });
        }
        return res.status(500).json({ message: "Server error verifying user authentication." });
    }    
}