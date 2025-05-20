import express from 'express'
import authRoutes from './src/routes/authRoutes'
import cookieParser from 'cookie-parser'
import { connectRabbitMQ } from './src/utils/rabbitmq'
import { consumeUserSignupEvents } from './src/utils/consumer'
import * as dotenv from 'dotenv'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

app.use('/api/v1/auth', authRoutes)

async function startServer() {
  try {
    await connectRabbitMQ()
    await consumeUserSignupEvents()

    app.listen(PORT, () => {
      console.log(`auth-server is running at port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
