const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { getCollection, saveDatabase } = require('./database');

const PROTO_PATH = path.join(__dirname, '../proto/notification.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const notificationProto = grpc.loadPackageDefinition(packageDef).notification;

function docToNotification(doc) {
  const data = doc.toJSON ? doc.toJSON() : doc;
  return {
    id: data.id,
    account_id: data.account_id,
    message: data.message,
    type: data.type,
    is_read: data.is_read || false,
    created_at: data.created_at,
  };
}

const notificationServiceImpl = {

  GetNotifications: async (call, callback) => {
    try {
      const collection = getCollection();
      const docs = await collection
        .find({ selector: { account_id: call.request.account_id } })
        .exec();
      const notifications = docs.map(docToNotification);
      callback(null, { notifications });
    } catch (err) {
      console.error(' GetNotifications error:', err.message);
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },

  GetAllNotifications: async (call, callback) => {
    try {
      const collection = getCollection();
      const docs = await collection.find().exec();
      const notifications = docs.map(docToNotification);
      callback(null, { notifications });
    } catch (err) {
      console.error(' GetAllNotifications error:', err.message);
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },

  MarkAsRead: async (call, callback) => {
    try {
      const collection = getCollection();
      const doc = await collection
        .findOne({ selector: { id: call.request.id } })
        .exec();

      if (!doc) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: 'Notification not found',
        });
      }

      await doc.update({ $set: { is_read: true } });
      await saveDatabase();

      const updated = await collection
        .findOne({ selector: { id: call.request.id } })
        .exec();

      callback(null, docToNotification(updated));
    } catch (err) {
      console.error(' MarkAsRead error:', err.message);
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },
};

module.exports = { notificationServiceImpl, notificationProto };