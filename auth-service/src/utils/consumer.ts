import { getChannel } from './rabbitmq'

export async function consumeUserSignupEvents() {
    const channel = getChannel();
    const queue = 'user.created';

    await channel.assertQueue(queue , { durable: true });

    channel.consume(queue , (msg) => {
        if(msg) {
            const user = JSON.parse(msg.content.toString())
            console.log("Received user signup: " , user)

            channel.ack(msg)
        }
    })
}
