const grpc = require('@grpc/grpc-js');
const { initDatabase } = require('./database');
const { notificationServiceImpl, notificationProto } = require('./server');
const { connectConsumer } = require('./kafka/consumer');

const PORT = '0.0.0.0:50053';

async function main() {
  await initDatabase();
  await connectConsumer();

  const server = new grpc.Server();
  server.addService(
    notificationProto.NotificationService.service,
    notificationServiceImpl
  );

  server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error(' Failed to start Notification Service:', err);
      return;
    }
    console.log(` Notification Service running on port ${port}`);
  });
}

main();