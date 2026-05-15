const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDatabase } = require('./database');
const { publishTransaction } = require('./kafka/producer');

const PROTO_PATH = path.join(__dirname, '../proto/transaction.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const transactionProto = grpc.loadPackageDefinition(packageDef).transaction;

function rowToTransaction(row) {
  return {
    id: row[0],
    from_account_id: row[1],
    to_account_id: row[2],
    amount: row[3],
    type: row[4],
    description: row[5],
    status: row[6],
    created_at: row[7],
  };
}

const transactionServiceImpl = {

  CreateTransaction: async (call, callback) => {
    try {
      const { from_account_id, to_account_id, amount, type, description } = call.request;
      const db = getDb();

      if (!amount || amount <= 0) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: 'Amount must be greater than 0',
        });
      }

      if (!type) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: 'Transaction type is required (TRANSFER, DEPOSIT, WITHDRAWAL)',
        });
      }

      const id = uuidv4();
      const now = new Date().toISOString();

      db.run(
        `INSERT INTO transactions 
         (id, from_account_id, to_account_id, amount, type, description, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'COMPLETED', ?)`,
        [id, from_account_id || '', to_account_id || '', amount, type, description || '', now]
      );
      saveDatabase();

      const result = db.exec(`SELECT * FROM transactions WHERE id = '${id}'`);
      const transaction = rowToTransaction(result[0].values[0]);

      // Publier sur Kafka
      await publishTransaction(transaction);

      console.log(` Transaction created: ${id} | Type: ${type} | Amount: ${amount}`);
      callback(null, transaction);
    } catch (err) {
      console.error(' CreateTransaction error:', err.message);
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },

  GetTransaction: (call, callback) => {
    try {
      const db = getDb();
      const result = db.exec(`SELECT * FROM transactions WHERE id = '${call.request.id}'`);
      if (!result.length || !result[0].values.length) {
        return callback({ code: grpc.status.NOT_FOUND, message: 'Transaction not found' });
      }
      callback(null, rowToTransaction(result[0].values[0]));
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },

  GetAccountTransactions: (call, callback) => {
    try {
      const db = getDb();
      const { account_id } = call.request;
      const result = db.exec(
        `SELECT * FROM transactions 
         WHERE from_account_id = '${account_id}' 
         OR to_account_id = '${account_id}'
         ORDER BY created_at DESC`
      );
      const transactions = result.length ? result[0].values.map(rowToTransaction) : [];
      callback(null, { transactions });
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },

  GetAllTransactions: (call, callback) => {
    try {
      const db = getDb();
      const result = db.exec('SELECT * FROM transactions ORDER BY created_at DESC');
      const transactions = result.length ? result[0].values.map(rowToTransaction) : [];
      callback(null, { transactions });
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },
};

module.exports = { transactionServiceImpl, transactionProto };