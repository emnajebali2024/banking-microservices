const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/notification.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const notificationProto = grpc.loadPackageDefinition(packageDef).notification;

const client = new notificationProto.NotificationService(
  process.env.NOTIFICATION_SERVICE_ADDR || '127.0.0.1:50053',
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
  getNotifications: (account_id) => grpcCall('GetNotifications', { account_id }),
  getAllNotifications: () => grpcCall('GetAllNotifications', {}),
  markAsRead: (id) => grpcCall('MarkAsRead', { id }),
};