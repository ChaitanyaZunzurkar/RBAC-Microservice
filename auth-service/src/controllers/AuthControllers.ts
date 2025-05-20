import { Request , Response } from 'express'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import redis from '../config/redis'
import { publishToQueue } from '../utils/rabbitmq';
import otp from 'otp-generator'
import { MailSender } from '../services/nodemailer'

const prisma = new PrismaClient()
dotenv.config()

const saltRound = 10;
interface userSignUpData {
    firstName: string
    lastName: string
    email: string
    role: 'ADMIN' | 'USER'
    confirmPassword: string
    password: string,
    otp: Number
}

interface userLoginData {
    email: string
    password: string
}

export async function signup(req: Request, res: Response):Promise<void> {
    try {
        const { firstName , lastName , email , role , confirmPassword , password , otp} = req.body as userSignUpData

        const existingUser = await prisma.user.findUnique({
            where: { email : email }
        })

        if(existingUser) {
            res.json({
                success:false,
                message: "Email already exists."
            })
            return 
        }

        const allowedRoles = ['ADMIN' , 'USER']

        if(!firstName || !lastName || !email || !role || !allowedRoles.includes(role) || !confirmPassword || !password || !otp) {
            res.status(400).json({
                success:false,
                message: "Please provide all the required info!"
            })
            return 
        }

        if(password !== confirmPassword) {
            res.status(400).json({
                success:false,
                message: "Password and confirmPassword should be same"
            })
            return 
        }

        const recentOTP = await prisma.otp_schema.findFirst({
            where: { email: email },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if(!recentOTP) {
            res.status(400).json({
                success:false,
                message: "OTP not found."
            })
            return 
        }

        if(Number(recentOTP?.otp) !== Number(otp)) {
            res.status(400).json({
                success:false,
                message: "Invalid OTP."
            })
            return 
        }

        const hashedPassword = await bcrypt.hash(password, saltRound)

        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                role,
                password: hashedPassword
            }
        })

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        }

        const jwtSecret = process.env.JWT_SECRET as string
        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET as string

        const accessToken = jwt.sign(payload , jwtSecret , {
            expiresIn: '15m'
        })

        const refreshToken = jwt.sign(payload , jwtRefreshSecret , {
            expiresIn: '7d'
        })

        redis.set(`accessToken:${user.id}` , accessToken)
        redis.expire(`accessToken:${user.id}`, 15 * 60)

        redis.set(`refreshToken:${user.id}` , refreshToken)
        redis.expire(`refreshToken:${user.id}`, 7 * 24 * 60 * 60)

        await publishToQueue('user.created' , {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        })

        res.status(200).json({
            success:true,
            message:"User created successfully",
            user,
            accessToken,
            refreshToken
        })

    } catch(err) {
        console.error("Error Occured while creating user" , err)
        res.status(500).json({
            success:false,
            message: "Signup Usuccessful"
        })
        return
    }
}

export async function signin(req: Request , res: Response):Promise<void> {
    try { 
        const { email , password } = req.body as userLoginData

        if(!email || !password) {
            res.status(400).json({
                success:false,
                message: "Please provide all the required info!"
            })
            return 
        }

        const user = await prisma.user.findUnique({
            where: { email : email }
        })
        
        if(!user) {
            res.status(400).json({
                success:false,
                message: "User does not exists."
            })
            return 
        }

        const hashedPassword = user.password
        const passwordMatch = await bcrypt.compare(password , hashedPassword)

        if(!passwordMatch) {
            res.status(400).json({
                success:false,
                message: "Invalid Credentials."
            })
            return 
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        }

        const jwtSecret = process.env.JWT_SECRET as string
        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET as string

        const accessToken = jwt.sign(payload , jwtSecret , {
            expiresIn: '15m'
        })

        const refreshToken = jwt.sign(payload , jwtRefreshSecret , {
            expiresIn: '7d'
        })

        redis.set(`accessToken:${user.id}` , accessToken)
        redis.expire(`accessToken:${user.id}`, 15 * 60)

        redis.set(`refreshToken:${user.id}` , refreshToken)
        redis.expire(`refreshToken:${user.id}`, 7 * 24 * 60 * 60)

        res.status(200).json({
            success:true,
            message:"user login successful.",
            accessToken,
            refreshToken
        })

    } catch(err) {
        console.error("Error Occured while login" , err)
        res.status(500).json({
            success:false,
            message: "login Usuccessful"
        })
        return 
    }
}

export async function refreshAccessToken(req: Request, res: Response):Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400).json({ 
            success: false, message: "Refresh token missing" 
        });
        return 
    }

    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET as string;

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, jwtRefreshSecret);
    } 
    catch (err) {
        res.status(403).json({ 
            success: false, 
            message: "Invalid or expired refresh token"
        });
        return 
    }

    if (typeof decoded !== 'object' || !('id' in decoded)) {
        res.status(403).json({ 
            success: false, 
            message: "Invalid refresh token payload"
        });
        return 
    }

    const storedRefreshToken = await redis.get(`refreshToken:${decoded.id}`);
    if (storedRefreshToken !== refreshToken) {
        res.status(403).json({ 
            success: false, 
            message: "Refresh token mismatch" 
        });
        return 
    }

    const jwtSecret = process.env.JWT_SECRET as string;
    const payload = { 
        id: decoded.id, 
        email: decoded.email, 
        role: decoded.role 
    }
    const newAccessToken = jwt.sign(payload, jwtSecret, { expiresIn: '15m' });

    await redis.set(`accessToken:${decoded.id}`, newAccessToken);
    await redis.expire(`accessToken:${decoded.id}`, 15 * 60);

    res.status(200).json({ 
        success: true, 
        accessToken: newAccessToken 
    });
    return 

  } catch (err) {
    console.error("Error in refreshAccessToken:", err);
    res.status(500).json({ 
        success: false, 
        message: "Could not refresh access token" 
    });
    return 
  }
}

export async function otpGenerator(req: Request , res:Response):Promise<void> {
    try {
        const { email } = req.body
        if(!email) {
            res.status(400).json({
                success:false,
                message:"Please provide all required details.",
            })
            return 
        }

        const existingUser = await prisma.user.findUnique({
            where: { email : email }
        })

        if(existingUser) {
            res.status(400).json({
                success:false,
                message:"Email alredy exists.",
            })
            return 
        }

        const OTP = otp.generate(6 , {
            upperCaseAlphabets: false,
            lowerCaseAlphabets:false,
            specialChars:false
        })

        const userOTP = await prisma.otp_schema.create({
            data: {
                email: email,
                otp: Number(OTP),
                expireTime: new Date(Date.now() + 5 * 60 * 1000), 
            },
        });

        const mailResponse = await MailSender(email, 'Sending OTP for email verification : ', `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #2a9df4;">Email Verification OTP</h2>
                <p style="font-size: 16px;">Your OTP code is:</p>
                <p style="font-size: 24px; font-weight: bold; color: #1a73e8; letter-spacing: 3px; margin: 10px 0;">${OTP}</p>
                <p style="font-size: 14px; color: #555;">This code is valid for 10 minutes.</p>
                <p style="font-size: 14px; color: #555;">If you did not request this, please ignore this email.</p>
            </div>
        `);

        res.status(200).json({
            success:true,
            message:"OTP Generated Successfully.",
            OTP
        })
        
    } catch (error) {
        console.log("Error Occured while generating otp." , error)
        res.status(500).json({ 
            success: false, 
            message: "Error Occured while generating otp." 
        });
        return 
    }
}

export async function logout(req:Request , res:Response):Promise<void> {
    try {
        const userId = req.params.id
        if(!userId) {
            res.status(500).json({ 
                success: false, 
                message: "user id does not found." 
            });
            return 
        }

        await redis.del(`accessToken:${userId}`)
        await redis.del(`refreshToken:${userId}`)

        res.status(200).json({
            success: true,
            message: "User logout successfully."
        })
    } catch(error) {
        res.status(500).json({ 
            success: false, 
            message: "Logout Fail" 
        });
        return 
    }
}