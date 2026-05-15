const { createRxDatabase, addRxPlugin } = require('rxdb');
const { getRxStorageMemory } = require('rxdb/plugins/storage-memory');
const { RxDBQueryBuilderPlugin } = require('rxdb/plugins/query-builder');
const { RxDBUpdatePlugin } = require('rxdb/plugins/update');
const fs = require('fs');
const path = require('path');

addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBUpdatePlugin);

const DATA_PATH = path.join(__dirname, 'notifications-data.json');

let db = null;
let notificationsCollection = null;

const notificationSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    account_id: { type: 'string' },
    message: { type: 'string' },
    type: { type: 'string' },
    is_read: { type: 'boolean', default: false },
    created_at: { type: 'string' },
  },
  required: ['id', 'account_id', 'message', 'type', 'created_at'],
};

async function initDatabase() {
  db = await createRxDatabase({
    name: 'notificationsdb',
    storage: getRxStorageMemory(),
    ignoreDuplicate: true,
  });

  await db.addCollections({
    notifications: { schema: notificationSchema },
  });

  notificationsCollection = db.notifications;

  // Charger les données persistées si elles existent
  if (fs.existsSync(DATA_PATH)) {
    try {
      const savedData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
      if (savedData.length > 0) {
        await notificationsCollection.bulkInsert(savedData);
        console.log(` Loaded ${savedData.length} notifications from disk`);
      }
    } catch (err) {
      console.log('  Could not load saved notifications:', err.message);
    }
  }

  console.log(' Notification Database initialized (RxDB)');
  return db;
}

async function saveDatabase() {
  if (notificationsCollection) {
    try {
      const all = await notificationsCollection.find().exec();
      const data = all.map(doc => doc.toJSON());
      fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(' Save error:', err.message);
    }
  }
}

function getCollection() {
  return notificationsCollection;
}

module.exports = { initDatabase, saveDatabase, getCollection };