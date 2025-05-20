import express from 'express'
import { connectRabbitMQ } from './src/utils/rabbitmq'
import { consumeUserSignupEvents } from './src/utils/userConsumer'
import * as dotenv from 'dotenv'
import userRoutes from './src/routes/userRoutes'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api/v1/user', userRoutes)

async function startServer() {
  try {
    await connectRabbitMQ()
    consumeUserSignupEvents()

    app.listen(PORT, () => {
      console.log(`user-server is running at port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
