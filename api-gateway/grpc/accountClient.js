const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/account.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const accountProto = grpc.loadPackageDefinition(packageDef).account;

const client = new accountProto.AccountService(
  process.env.ACCOUNT_SERVICE_ADDR || '127.0.0.1:50051',
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
  createAccount: (data) => grpcCall('CreateAccount', data),
  getAccount: (id) => grpcCall('GetAccount', { id }),
  getAllAccounts: () => grpcCall('GetAllAccounts', {}),
  updateAccount: (data) => grpcCall('UpdateAccount', data),
  updateBalance: (data) => grpcCall('UpdateBalance', data),
  deleteAccount: (id) => grpcCall('DeleteAccount', { id }),
};