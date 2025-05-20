import jwt , { JwtPayload  } from 'jsonwebtoken'
import express, { Request , Response , NextFunction } from 'express'
import redis from '../config/redis'
import dotenv from 'dotenv'
dotenv.config()

declare global {
    namespace Express {
        interface Request {
            user? : JwtPayload | string;
        }
    }
}

export async function authMiddleware(req: Request, res: Response , next: NextFunction ) {
    try {
        const token = req.cookies?.token || req.body?.token || req.header("Authorization")?.replace("Bearer ", "")
        const jwtSecret = process.env.JWT_SECRET as string

        if(!token) {
            return res.status(400).json({
                success:false,
                message: "Token not found."
            })
        }

        try {
            const decoded = jwt.verify(token , jwtSecret) as JwtPayload
            if (typeof decoded === 'object' && 'id' in decoded) {
                const storedToken = await redis.get(`accessToken:${decoded.id}`)

                if(storedToken !== token) {
                    return res.status(401).json({ 
                        success:false,
                        message: 'Invalid token' 
                    });
                }
            }

            req.user = decoded
        } catch(err) {
            return res.status(500).json({
                success:false,
                message: "Invalid or expired token."
            })
        }
        next();
    } catch(err) {
        return res.status(500).json({
            success:false,
            message: "Invalid or expired token."
        })
    }
}

export async function userVerify(req: Request, res: Response , next: NextFunction) {
    if(typeof req?.user === 'object' && req?.user !== null && 'role' in req?.user) {
        if(req?.user?.role !== 'USER') {
            return res.status(401).json({
                success:false,
                message:"This is Protected route for user."
            })
        }
    }
    next();
}

export async function AdminVerify(req:Request , res:Response , next: NextFunction) {
    if(typeof req?.user === 'object' && req?.user !== null && 'role' in req?.user) {
        if(req?.user?.role !== 'ADMIN') {
            return res.status(401).json({
                success:false,
                message:"This is Protected route for Admin."
            })
        }
    }
    next();
}
