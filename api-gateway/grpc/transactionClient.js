const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/transaction.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const transactionProto = grpc.loadPackageDefinition(packageDef).transaction;

const client = new transactionProto.TransactionService(
  process.env.TRANSACTION_SERVICE_ADDR || '127.0.0.1:50052',
  grpc.credentials.createInsecure()
);

function grpcCall(method, request) {
  return new Promise((resolve, reject) => {
    client[method](request, (err, response) => {
      if (err) reject(err);
      else resolve(response);
    });
  });
}

module.exports = {
  createTransaction: (data) => grpcCall('CreateTransaction', data),
  getTransaction: (id) => grpcCall('GetTransaction', { id }),
  getAccountTransactions: (account_id) => grpcCall('GetAccountTransactions', { account_id }),
  getAllTransactions: () => grpcCall('GetAllTransactions', {}),
};