const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'transaction-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const producer = kafka.producer();
let isConnected = false;

async function connectProducer() {
  try {
    await producer.connect();
    isConnected = true;
    console.log(' Kafka Producer connected');
  } catch (err) {
    console.error(' Kafka Producer connection failed:', err.message);
    console.log('  Service will run without Kafka');
  }
}

async function publishTransaction(transaction) {
  if (!isConnected) {
    console.log('  Kafka not connected, skipping event publish');
    return;
  }

  try {
    await producer.send({
      topic: 'transaction-created',
      messages: [
        {
          key: transaction.id,
          value: JSON.stringify({
            id: transaction.id,
            from_account_id: transaction.from_account_id,
            to_account_id: transaction.to_account_id,
            amount: transaction.amount,
            type: transaction.type,
            description: transaction.description,
            status: transaction.status,
            created_at: transaction.created_at,
          }),
        },
      ],
    });
    console.log(` Kafka event published: transaction-created [${transaction.id}]`);
  } catch (err) {
    console.error(' Kafka publish error:', err.message);
  }
}

module.exports = { connectProducer, publishTransaction };