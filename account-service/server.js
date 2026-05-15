const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDatabase } = require('./database');

const PROTO_PATH = path.join(__dirname, '../proto/account.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const accountProto = grpc.loadPackageDefinition(packageDef).account;

function rowToAccount(row) {
  return {
    id: row[0],
    owner_name: row[1],
    email: row[2],
    balance: row[3],
    account_type: row[4],
    status: row[5],
    created_at: row[6],
  };
}

const accountServiceImpl = {

  CreateAccount: (call, callback) => {
    try {
      const { owner_name, email, initial_balance, account_type } = call.request;
      const db = getDb();

      if (!owner_name || !email) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: 'owner_name and email are required',
        });
      }

      const id = uuidv4();
      const now = new Date().toISOString();

      db.run(
        `INSERT INTO accounts (id, owner_name, email, balance, account_type, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?)`,
        [id, owner_name, email, initial_balance || 0, account_type || 'CHECKING', now]
      );
      saveDatabase();

      const result = db.exec(`SELECT * FROM accounts WHERE id = '${id}'`);
      const row = result[0].values[0];
      console.log(`Account created: ${id}`);
      callback(null, rowToAccount(row));
    } catch (err) {
      console.error(' CreateAccount error:', err.message);
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },

  GetAccount: (call, callback) => {
    try {
      const db = getDb();
      const result = db.exec(`SELECT * FROM accounts WHERE id = '${call.request.id}'`);
      if (!result.length || !result[0].values.length) {
        return callback({ code: grpc.status.NOT_FOUND, message: 'Account not found' });
      }
      callback(null, rowToAccount(result[0].values[0]));
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },

  GetAllAccounts: (call, callback) => {
    try {
      const db = getDb();
      const result = db.exec('SELECT * FROM accounts');
      const accounts = result.length ? result[0].values.map(rowToAccount) : [];
      callback(null, { accounts });
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },

  UpdateAccount: (call, callback) => {
    try {
      const { id, owner_name, email, account_type } = call.request;
      const db = getDb();

      const existing = db.exec(`SELECT * FROM accounts WHERE id = '${id}'`);
      if (!existing.length || !existing[0].values.length) {
        return callback({ code: grpc.status.NOT_FOUND, message: 'Account not found' });
      }

      const old = rowToAccount(existing[0].values[0]);
      db.run(
        `UPDATE accounts SET owner_name = ?, email = ?, account_type = ? WHERE id = ?`,
        [owner_name || old.owner_name, email || old.email, account_type || old.account_type, id]
      );
      saveDatabase();

      const updated = db.exec(`SELECT * FROM accounts WHERE id = '${id}'`);
      callback(null, rowToAccount(updated[0].values[0]));
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },

  UpdateBalance: (call, callback) => {
    try {
      const { id, amount } = call.request;
      const db = getDb();

      const result = db.exec(`SELECT * FROM accounts WHERE id = '${id}'`);
      if (!result.length || !result[0].values.length) {
        return callback({ code: grpc.status.NOT_FOUND, message: 'Account not found' });
      }

      const account = rowToAccount(result[0].values[0]);
      const newBalance = account.balance + amount;

      db.run(`UPDATE accounts SET balance = ? WHERE id = ?`, [newBalance, id]);
      saveDatabase();

      const updated = db.exec(`SELECT * FROM accounts WHERE id = '${id}'`);
      callback(null, rowToAccount(updated[0].values[0]));
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },

  DeleteAccount: (call, callback) => {
    try {
      const db = getDb();
      const result = db.exec(`SELECT * FROM accounts WHERE id = '${call.request.id}'`);
      if (!result.length || !result[0].values.length) {
        return callback({ code: grpc.status.NOT_FOUND, message: 'Account not found' });
      }
      db.run(`DELETE FROM accounts WHERE id = ?`, [call.request.id]);
      saveDatabase();
      callback(null, { success: true, message: 'Account deleted successfully' });
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },
};

module.exports = { accountServiceImpl, accountProto };