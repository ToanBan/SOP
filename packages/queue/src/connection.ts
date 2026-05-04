import amqp, { Connection, Channel } from 'amqplib';

let connection: Connection | null = null;
let channel: Channel | null = null;

export const connectionQueue = async () => {
  const url = process.env.RABBITMQ_URL;

  if (!url) {
    throw new Error('RABBITMQ_URL is not defined');
  }

  if (connection && channel) {
    return { connection, channel };
  }

  try {
    const conn = await amqp.connect(url);
    const ch = await conn.createChannel();
    const exchangeName = 'chat_exchange';
    await ch.assertExchange(exchangeName, 'topic', { 
      durable: true 
    });
    connection = conn as any;
    channel = ch;

    conn.on('error', (err) => {
      console.error('RabbitMQ Connection Error:', err);
      connection = null;
      channel = null;
    });
    return { connection, channel };
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
    throw error;
  }
};