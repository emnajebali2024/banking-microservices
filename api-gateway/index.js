const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
app.use(express.json());

// Routes REST
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: ' Banking API Gateway is running',
    services: {
      account_service: 'localhost:50051',
      transaction_service: 'localhost:50052',
      notification_service: 'localhost:50053',
    },
    endpoints: {
      REST: 'http://localhost:3000/api',
      GraphQL: 'http://localhost:3000/graphql',
    },
  });
});

async function startServer() {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log('');
    console.log(' ================================');
    console.log('  Banking API Gateway Started !');
    console.log(' ================================');
    console.log(` REST API    : http://localhost:${PORT}/api`);
    console.log(` GraphQL     : http://localhost:${PORT}/graphql`);
    console.log(` Health      : http://localhost:${PORT}/health`);
    console.log(' ================================');
    console.log('');
  });
}

startServer();