const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Account {
    id: String
    owner_name: String
    email: String
    balance: Float
    account_type: String
    status: String
    created_at: String
  }

  type Transaction {
    id: String
    from_account_id: String
    to_account_id: String
    amount: Float
    type: String
    description: String
    status: String
    created_at: String
  }

  type Notification {
    id: String
    account_id: String
    message: String
    type: String
    is_read: Boolean
    created_at: String
  }

  type DeleteResult {
    success: Boolean
    message: String
  }

  type Query {
    # Accounts
    accounts: [Account]
    account(id: String!): Account

    # Transactions
    transactions: [Transaction]
    transaction(id: String!): Transaction
    accountTransactions(account_id: String!): [Transaction]

    # Notifications
    notifications(account_id: String!): [Notification]
    allNotifications: [Notification]
  }

  type Mutation {
    # Accounts
    createAccount(
      owner_name: String!
      email: String!
      initial_balance: Float
      account_type: String
    ): Account

    updateAccount(
      id: String!
      owner_name: String
      email: String
      account_type: String
    ): Account

    updateBalance(
      id: String!
      amount: Float!
    ): Account

    deleteAccount(id: String!): DeleteResult

    # Transactions
    createTransaction(
      from_account_id: String
      to_account_id: String
      amount: Float!
      type: String!
      description: String
    ): Transaction

    # Notifications
    markAsRead(id: String!): Notification
  }
`;

module.exports = typeDefs;