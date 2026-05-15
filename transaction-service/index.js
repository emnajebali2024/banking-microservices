const grpc = require('@grpc/grpc-js');
const { initDatabase } = require('./database');
const { transactionServiceImpl, transactionProto } = require('./server');
const { connectProducer } = require('./kafka/producer');

const PORT = '0.0.0.0:50052';

async function main() {
  await initDatabase();
  await connectProducer();

  const server = new grpc.Server();
  server.addService(transactionProto.TransactionService.service, transactionServiceImpl);

  server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error(' Failed to start Transaction Service:', err);
      return;
    }
    console.log(` Transaction Service running on port ${port}`);
  });
}

main();