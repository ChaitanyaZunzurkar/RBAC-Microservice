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

export async function authMiddleware(req: Request, res: Response , next: NextFunction ): Promise<void> {
    try {
        const token = req.cookies?.token || req.body?.token || req.header("Authorization")?.replace("Bearer ", "")
        const jwtSecret = process.env.JWT_SECRET as string

        if(!token) {
            res.status(401).json({
                success:false,
                message: "Token not found."
            })
            return 
        }

        try {
            const decoded = jwt.verify(token , jwtSecret) as JwtPayload
            if (typeof decoded === 'object' && 'id' in decoded) {
                const storedToken = await redis.get(`accessToken:${decoded.id}`)
                
                if(storedToken !== token) {
                    res.status(401).json({ 
                        success:false,
                        message: 'Invalid token' 
                    });
                    return 
                }
            }

            req.user = decoded
        } catch(err) {
            res.status(500).json({
                success:false,
                message: "Invalid or expired token."
            })
            return 
        }
        next();
    } catch(err) {
        res.status(500).json({
            success:false,
            message: "Invalid or expired token."
        })
        return 
    }
}

export async function userVerify(req: Request, res: Response , next: NextFunction): Promise<void> {
    if(typeof req?.user === 'object' && req?.user !== null && 'role' in req?.user) {
        if(req?.user?.role !== 'USER' || req.user.role !== 'ADMIN') {
            res.status(401).json({
                success:false,
                message:"This is Protected route for user."
            })
            return 
        }
    }
    next();
}

export async function AdminVerify(req:Request , res:Response , next: NextFunction): Promise<void> {
    if(typeof req?.user === 'object' && req?.user !== null && 'role' in req?.user) {
        if(req?.user?.role !== 'ADMIN' && req?.user?.role !== 'USER') {
            res.status(401).json({
                success:false,
                message:"This is Protected route for Admin."
            })
            return 
        }
    }
    next();
}

export function AccessOwnResources(req: Request, res: Response, next: NextFunction): void {
  if (req.user && typeof req.user === 'object' && req.user.id !== req.params.id && !(req.user.role === 'ADMIN')) {
    res.status(403).json({ 
        success: false, 
        message: "Access denied." 
    });
    return 
  }
  next();
}
