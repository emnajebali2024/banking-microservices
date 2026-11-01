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


## Conteneurisation avec Docker (TP2 DevOps)

Le projet démarre entièrement avec Docker Compose : quatre microservices Node.js,
Kafka et Zookeeper, avec des volumes persistants pour les bases de données.

### Architecture des conteneurs

| Service | Rôle | Port | Exposé sur la machine |
|---|---|---|---|
| `api-gateway` | REST, GraphQL, clients gRPC | 3000 | oui (3000) |
| `account-service` | Comptes (gRPC, SQLite) | 50051 | non |
| `transaction-service` | Transactions (gRPC, SQLite, producteur Kafka) | 50052 | non |
| `notification-service` | Notifications (gRPC, RxDB, consommateur Kafka) | 50053 | non |
| `kafka` | Broker d'événements (topic `transaction-created`) | 9092 / 29092 | oui (9092, débogage) |
| `zookeeper` | Coordination de Kafka | 2181 | non |

Les services communiquent sur le réseau `banking-network` (bridge) en utilisant
le nom du service comme hostname (par exemple `account-service:50051`).

### Fichiers de conteneurisation

```
banking-microservices/
├── docker-compose.yml
├── account-service/       Dockerfile, .dockerignore
├── transaction-service/   Dockerfile, .dockerignore
├── notification-service/  Dockerfile, .dockerignore
├── api-gateway/           Dockerfile, .dockerignore
└── proto/                 contrats gRPC partages
```

Le dossier `proto` est partagé par les quatre services : il est fourni à chaque
build via un contexte nomme (`additional_contexts`) puis copie dans `/app/proto`.

### Variables d'environnement

| Variable | Service | Valeur dans Docker |
|---|---|---|
| `ACCOUNT_SERVICE_ADDR` | api-gateway | `account-service:50051` |
| `TRANSACTION_SERVICE_ADDR` | api-gateway | `transaction-service:50052` |
| `NOTIFICATION_SERVICE_ADDR` | api-gateway | `notification-service:50053` |
| `KAFKA_BROKERS` | transaction, notification | `kafka:29092` |
| `DB_PATH` | account, transaction | `/data/accounts.db`, `/data/transactions.db` |
| `DATA_PATH` | notification | `/data/notifications-data.json` |

Sans ces variables, le code utilise ses valeurs locales par défaut (`127.0.0.1`,
`localhost:9092`), donc l'exécution sans Docker reste possible.

### Volumes persistants

`account-data`, `transaction-data` et `notification-data` conservent les bases
entre deux arrêts de la stack.

### Commandes

Prérequis : Docker Desktop démarré, ports 3000 et 9092 libres.

| Action | Commande |
|---|---|
| Construire et démarrer | `docker compose up --build -d` |
| État des services | `docker compose ps` |
| Logs d'un service | `docker compose logs --tail=50 <service>` |
| Redémarrer un service | `docker compose restart <service>` |
| Arrêter (données conservées) | `docker compose down` |
| Arrêter et supprimer les données | `docker compose down -v` |

Le premier démarrage prend quelques minutes (téléchargement de Kafka et
Zookeeper). Kafka devient `healthy` après environ 30 à 60 secondes, et les
services qui en dépendent démarrent ensuite.

### Test de bout en bout (PowerShell)

```powershell
$base = "http://localhost:3000/api"; $acc = "$base/accounts"; $trx = "$base/transactions"

# 1. Create two accounts
$r1 = Invoke-RestMethod -Method Post -Uri $acc -ContentType "application/json" -Body (@{ owner_name="Alice Test"; email="alice@test.com"; initial_balance=1000; account_type="checking" } | ConvertTo-Json)
$r2 = Invoke-RestMethod -Method Post -Uri $acc -ContentType "application/json" -Body (@{ owner_name="Bob Test"; email="bob@test.com"; initial_balance=500; account_type="savings" } | ConvertTo-Json)

# 2. Create a transaction (gateway -> gRPC -> Kafka -> notification-service)
$t = Invoke-RestMethod -Method Post -Uri $trx -ContentType "application/json" -Body (@{ from_account_id=$r1.data.id; to_account_id=$r2.data.id; amount=200; type="transfer"; description="Test" } | ConvertTo-Json)

# 3. Check the notifications created from the Kafka event
Invoke-RestMethod "$trx/notifications/all/list" | ConvertTo-Json -Depth 5
docker compose logs --tail=10 notification-service
```

Résultat observé : la transaction est créée (`COMPLETED`), `transaction-service`
publie l'événement `transaction-created`, `notification-service` le reçoit et crée
une notification pour chacun des deux comptes.

### Persistance

`docker compose down` (sans `-v`) puis `docker compose up -d` : les comptes, les
transactions et les notifications sont toujours présents.

### Diagnostic

1. `docker compose ps -a` : repérer les services `Exited`, `Restarting` ou `unhealthy`.
2. `docker compose logs --tail=50 <service>` : lire l'erreur.
3. `docker compose config` : afficher la configuration finale lue par Compose.
4. `docker compose exec <service> sh` : entrer dans le conteneur (par exemple `ls -la /data`).
5. Corriger puis `docker compose up --build -d`.

Cas fréquents : Kafka pas encore prêt (les services qui en dépendent attendent
son état `healthy`), adresse gRPC restée sur `localhost` au lieu du nom du service,
port 3000 déjà utilisé sur la machine.

### Difficultés rencontrées

- **Adresses en dur** : la gateway appelait `127.0.0.1` et Kafka `localhost:9092`.
  Dans Docker, `localhost` désigne le conteneur lui-même. Les adresses sont
  maintenant lues depuis des variables d'environnement.
- **Kafka inaccessible entre conteneurs** : l'adresse annoncée était
  `localhost:9092`. Ajout d'un second listener interne `kafka:29092`.
- **Démarrage trop rapide de Kafka** : Kafka a redémarré au premier lancement car
  Zookeeper n'était pas prêt. Ajout de healthchecks et de `depends_on` avec
  `condition: service_healthy`.
- **Dossier `proto` hors des services** : utilisation d'un contexte de build nommé
  pour le partager sans modifier le code.
- **Données des bases** : les fichiers SQLite et RxDB sont écrits dans des volumes
  nommés et non dans l'image.
- **Limite connue du projet d'origine** : une transaction ne modifie pas le solde
  des comptes (route séparée `PATCH /accounts/:id/balance`).