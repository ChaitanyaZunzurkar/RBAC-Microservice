import { getChannel } from '../utils/rabbitmq'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function consumeRoleAssignedEvents() {
  const channel = getChannel();
  const queue = 'role.assigned';

  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, async (msg) => {
    if (msg) {
      const { userId, roleId } = JSON.parse(msg.content.toString());
      console.log('Received role assigned event:', { userId, roleId });

      try {
        await prisma.userRole.upsert({
          where: {
            userId_roleId: {
              userId,
              roleId,
            }
          },
          update: {},
          create: {
            userId,
            roleId,
          },
        });

        channel.ack(msg);
      } catch (error) {
        console.error('Failed to assign role:', error);
      }
    }
  });
}