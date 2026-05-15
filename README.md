# 🏦 Banking Microservices

Application bancaire simplifiée basée sur une architecture microservices.

## 👤 Auteur
- **Nom** : Emna Jbeli
- **Matière** : SOA et Microservices
- **Année universitaire** : 2025-2026
- **Collection Postman** : [Lien public](https://www.postman.com/galactic-shuttle-120666/workspace/banking-microservices-emna-jbeli/collection/45967017-7e475782-d55e-4385-9e5e-012d18dbd667)

##  Architecture

```
Client → REST/GraphQL → API Gateway → gRPC → Microservices
                                           ↕ Kafka
```

##  Technologies utilisées

| Technologie | Rôle |
|-------------|------|
| Node.js | Runtime |
| gRPC + Protobuf | Communication inter-services |
| REST (Express) | Interface client |
| GraphQL (Apollo) | Requêtes flexibles |
| Kafka (KafkaJS) | Communication asynchrone |
| SQLite3 (sql.js) | Base de données Account + Transaction |
| RxDB | Base de données Notification (NoSQL) |
| Docker | Kafka + Zookeeper |

##  Structure du projet

```
banking-microservices/
├── proto/                    # Fichiers .proto gRPC
│   ├── account.proto
│   ├── transaction.proto
│   └── notification.proto
├── api-gateway/              # REST + GraphQL + gRPC clients (Port 3000)
├── account-service/          # gRPC + SQLite3 (Port 50051)
├── transaction-service/      # gRPC + SQLite3 + Kafka Producer (Port 50052)
├── notification-service/     # gRPC + RxDB + Kafka Consumer (Port 50053)
├── docker-compose.yml        # Kafka + Zookeeper
└── README.md
```

##  Installation et démarrage

### Prérequis
- Node.js v18+
- Docker Desktop
- Postman

### 1. Cloner le projet
```bash
git clone https://github.com/TON_USERNAME/banking-microservices.git
cd banking-microservices
```

### 2. Installer les dépendances
```bash
cd account-service && npm install
cd ../transaction-service && npm install
cd ../notification-service && npm install
cd ../api-gateway && npm install
```

### 3. Démarrer Kafka
```bash
docker-compose up -d
```

### 4. Démarrer les services (4 terminaux séparés)
```bash
# Terminal 1 — Account Service
cd account-service && node index.js

# Terminal 2 — Transaction Service
cd transaction-service && node index.js

# Terminal 3 — Notification Service
cd notification-service && node index.js

# Terminal 4 — API Gateway
cd api-gateway && node index.js
```

### 5. Vérifier le démarrage
```
http://localhost:3000/health
```

##  Endpoints REST

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/accounts | Créer un compte |
| GET | /api/accounts | Tous les comptes |
| GET | /api/accounts/:id | Un compte par ID |
| PUT | /api/accounts/:id | Modifier un compte |
| PATCH | /api/accounts/:id/balance | Modifier le solde |
| DELETE | /api/accounts/:id | Supprimer un compte |
| GET | /api/accounts/:id/transactions | Transactions d'un compte |
| POST | /api/transactions | Créer une transaction |
| GET | /api/transactions | Toutes les transactions |
| GET | /api/transactions/:id | Une transaction par ID |
| GET | /api/transactions/notifications/:accountId | Notifications d'un compte |
| GET | /api/transactions/notifications/all/list | Toutes les notifications |
| PATCH | /api/transactions/notifications/:id/read | Marquer comme lu |

##  GraphQL

Endpoint : `http://localhost:3000/graphql`

### Queries
```graphql
{ accounts { id owner_name email balance account_type status } }
{ account(id: "ID") { id owner_name balance } }
{ transactions { id amount type status created_at } }
{ accountTransactions(account_id: "ID") { id amount type } }
{ allNotifications { id message type is_read created_at } }
{ notifications(account_id: "ID") { id message is_read } }
```

### Mutations
```graphql
mutation {
  createAccount(owner_name: "Test", email: "test@test.com", 
  initial_balance: 1000, account_type: "CHECKING") { id }
}

mutation {
  createTransaction(to_account_id: "ID", amount: 500, 
  type: "DEPOSIT", description: "Test") { id }
}

mutation { markAsRead(id: "NOTIF_ID") { id is_read } }
```

##  Topics Kafka

| Topic | Producteur | Consommateur | Déclencheur |
|-------|-----------|--------------|-------------|
| transaction-created | Transaction Service | Notification Service | Chaque nouvelle transaction |

##  Bases de données

| Service | Type | Technologie | Fichier |
|---------|------|-------------|---------|
| Account Service | SQL | SQLite3 (sql.js) | accounts.db |
| Transaction Service | SQL | SQLite3 (sql.js) | transactions.db |
| Notification Service | NoSQL | RxDB | notifications-data.json |

##  Tests Postman

 **Collection publique** : [Banking Microservices - Emna Jbeli](https://www.postman.com/galactic-shuttle-120666/workspace/banking-microservices-emna-jbeli/collection/45967017-7e475782-d55e-4385-9e5e-012d18dbd667)

La collection contient **20 requêtes** :
-  CRUD Accounts (REST)
-  Transactions DEPOSIT, TRANSFER, WITHDRAWAL (REST)
-  Notifications via Kafka (REST)
-  Queries GraphQL
-  Mutations GraphQL