const grpc = require('@grpc/grpc-js');
const { initDatabase } = require('./database');
const { accountServiceImpl, accountProto } = require('./server');

const PORT = '0.0.0.0:50051';

async function main() {
  await initDatabase();

  const server = new grpc.Server();
  server.addService(accountProto.AccountService.service, accountServiceImpl);

  server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error(' Failed to start Account Service:', err);
      return;
    }
    console.log(` Account Service running on port ${port}`);
  });
}

main();