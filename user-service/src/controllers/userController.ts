import { Request , Response } from 'express';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// allow anyone to view other user profile 
export async function getUser(req:Request , res:Response): Promise<void> {
    try {
        const id = req.params.id;
        if(!id) {
            res.status(400).json({
                success:false,
                message:"Id does not found."
            })
            return 
        }

        const user = await prisma.user.findUnique({ 
            where: { id }
        });

        if (!user) {
            res.status(404).json({ 
                message: 'User not found' 
            });
            return 
        } 

        res.json({
            success:true,
            message: "User found",
            user
        });
    } 
    catch (error) {
        res.status(500).json({ 
            message: 'Server error'
        });
        return 
    }
}

// allow user to update its own profile 
export async function updateUser(req:Request , res:Response): Promise<void> {
    try {
        const id = req.params.id;
        if(!id) {
            res.status(400).json({
                success:false,
                message:"Id does not found."
            })
            return 
        }


        const { firstName, lastName, email , address , phone } = req.body;
 
        if (!firstName && !lastName && !email && !address && !phone) {
            res.status(400).json({
                success: false,
                message: "At least one field must be provided to update.",
            });
            return 
        }

        const user = await prisma.user.findUnique({
            where: { id: id }
        })

        if(!user) {
            res.status(400).json({
                success:false,
                message:"User does not found."
            })
            return 
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { 
                firstName, 
                lastName, 
                email, 
                phone,
                address
            },
        });

        res.json({
            success:true,
            message: "User updated successfully.",
            user:updatedUser
        });
  } 
  catch (error) {
    res.status(500).json({ 
        success:false,
        message: "server error"
    });
  }
}

// allow admin to list all the user
export async function getAllUser(req:Request , res:Response): Promise<void> {
    try {
        console.log("working")
        const allUsers = await prisma.user.findMany()

        console.log(allUsers)

        if (allUsers?.length === 0) {
            res.status(404).json({
                success: false,
                message: "No users found."
            });
            return 
        }

        res.json({
            success:true,
            message: "All user fetch successfully.",
            allUsers
        });
  } 
  catch (error) {
    res.status(500).json({ 
        success:false,
        message: 'Server error' 
    });
  }
}

