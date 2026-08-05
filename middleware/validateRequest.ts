import { validationResult } from "express-validator";

// types
import type { Request, Response, NextFunction } from "express";

export function validateRequest(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()[0]?.msg,
        });
    }

    next();
} 