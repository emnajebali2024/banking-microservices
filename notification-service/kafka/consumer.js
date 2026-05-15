const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');
const { getCollection, saveDatabase } = require('../database');

const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'notification-group' });
let isConnected = false;

async function connectConsumer() {
  try {
    await consumer.connect();
    await consumer.subscribe({
      topic: 'transaction-created',
      fromBeginning: true,
    });

    isConnected = true;
    console.log(' Kafka Consumer connected — listening on [transaction-created]');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const transaction = JSON.parse(message.value.toString());
          console.log(` Kafka event received: ${transaction.id} | Type: ${transaction.type}`);

          const collection = getCollection();

          // Créer notification pour le compte source
          if (transaction.from_account_id) {
            await collection.insert({
              id: uuidv4(),
              account_id: transaction.from_account_id,
              message: buildMessage(transaction, 'sender'),
              type: transaction.type,
              is_read: false,
              created_at: new Date().toISOString(),
            });
          }

          // Créer notification pour le compte destinataire
          if (transaction.to_account_id && transaction.to_account_id !== transaction.from_account_id) {
            await collection.insert({
              id: uuidv4(),
              account_id: transaction.to_account_id,
              message: buildMessage(transaction, 'receiver'),
              type: transaction.type,
              is_read: false,
              created_at: new Date().toISOString(),
            });
          }

          await saveDatabase();
          console.log(` Notifications created for transaction: ${transaction.id}`);
        } catch (err) {
          console.error(' Error processing Kafka message:', err.message);
        }
      },
    });
  } catch (err) {
    console.error(' Kafka Consumer connection failed:', err.message);
    console.log('  Service will run without Kafka');
  }
}

function buildMessage(transaction, role) {
  if (transaction.type === 'DEPOSIT') {
    return `Deposit of ${transaction.amount} DT received on your account`;
  }
  if (transaction.type === 'WITHDRAWAL') {
    return `Withdrawal of ${transaction.amount} DT from your account`;
  }
  if (transaction.type === 'TRANSFER') {
    if (role === 'sender') {
      return `Transfer of ${transaction.amount} DT sent to account ${transaction.to_account_id}`;
    }
    return `Transfer of ${transaction.amount} DT received from account ${transaction.from_account_id}`;
  }
  return `Transaction of ${transaction.amount} DT — ${transaction.description}`;
}

module.exports = { connectConsumer };