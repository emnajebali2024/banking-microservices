const accountClient = require('../grpc/accountClient');
const transactionClient = require('../grpc/transactionClient');
const notificationClient = require('../grpc/notificationClient');

const resolvers = {
  Query: {
    // Accounts
    accounts: async () => {
      const res = await accountClient.getAllAccounts();
      return res.accounts;
    },
    account: async (_, { id }) => {
      return await accountClient.getAccount(id);
    },

    // Transactions
    transactions: async () => {
      const res = await transactionClient.getAllTransactions();
      return res.transactions;
    },
    transaction: async (_, { id }) => {
      return await transactionClient.getTransaction(id);
    },
    accountTransactions: async (_, { account_id }) => {
      const res = await transactionClient.getAccountTransactions(account_id);
      return res.transactions;
    },

    // Notifications
    notifications: async (_, { account_id }) => {
      const res = await notificationClient.getNotifications(account_id);
      return res.notifications;
    },
    allNotifications: async () => {
      const res = await notificationClient.getAllNotifications();
      return res.notifications;
    },
  },

  Mutation: {
    // Accounts
    createAccount: async (_, args) => {
      return await accountClient.createAccount(args);
    },
    updateAccount: async (_, args) => {
      return await accountClient.updateAccount(args);
    },
    updateBalance: async (_, args) => {
      return await accountClient.updateBalance(args);
    },
    deleteAccount: async (_, { id }) => {
      return await accountClient.deleteAccount(id);
    },

    // Transactions
    createTransaction: async (_, args) => {
      return await transactionClient.createTransaction(args);
    },

    // Notifications
    markAsRead: async (_, { id }) => {
      return await notificationClient.markAsRead(id);
    },
  },
};

module.exports = resolvers;