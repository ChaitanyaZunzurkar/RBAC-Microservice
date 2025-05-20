import { getChannel } from './rabbitmq';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function consumeUserSignupEvents() {
  const channel = getChannel();
  const queue = 'user.created';

  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, async (msg) => {
    if (msg) {
      const user = JSON.parse(msg.content.toString());
      console.log('Received user signup event:', user);

      try {
        await prisma.user.upsert({
          where: { id: user.id },
          update: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
          },
          create: user,
        });

        channel.ack(msg);
      } catch (error) {
        console.error('Failed to save user:', error);
      }
    }
  });
}
