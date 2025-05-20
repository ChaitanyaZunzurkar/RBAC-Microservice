import amqp from 'amqplib'

let channel: amqp.Channel;

export async function connectRabbitMQ() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost')
    channel = await connection.createChannel();
    console.log("RabbitMQ connected");
}

export function  getChannel(): amqp.Channel {
    if(!channel) {
        throw new Error('RabbitMQ channel not initialized')
    }
    return  channel
}

export async function publishToQueue(queueName: string , data: object) {
    const ch = getChannel();
    await ch.assertQueue(queueName , { durable: true });
    ch.sendToQueue(queueName , Buffer.from(JSON.stringify(data)) , { persistent: true });
}