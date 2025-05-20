import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config();

export async function MailSender(email:string , title:string , body: string) {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })

        const info = await transporter.sendMail({
            from:'Chaitanya Zunzurkar',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        })
    } catch(error) {
        console.error("Error Occoured while sending mail." , error)
    }
}


