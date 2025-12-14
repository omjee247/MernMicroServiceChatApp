import amqp from 'amqplib';

let channel : amqp.Channel;

export const connectRabbitMq = async () => {

    try{

        const connection = await amqp.connect({

            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST,
            port: Number(process.env.RABBITMQ_PORT),
            username: process.env.RABBITMQ_USERNAME,
            password : process.env.RABBITMQ_PASSWORD, 

        });

        channel = await connection.createChannel();
        console.log("RabbitMQ connected successfully");
    }
    catch(error){
        console.error("RabbitMQ connection failed", error);
    }
}

export const publishToQueue = async (queue: string, message: any) => {

    if(!channel){
        throw new Error("RabbitMQ channel is not initialized");
    }
    try{
        await channel.assertQueue(queue, { durable : true});
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)),{
            persistent: true,
        });
        console.log(`Message sent to queue ${queue}`);
    }
    catch(error){
        console.error(`Failed to send message to queue ${queue}`, error);
    }

};