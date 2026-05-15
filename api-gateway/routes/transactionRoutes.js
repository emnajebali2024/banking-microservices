const express = require('express');
const router = express.Router();
const transactionClient = require('../grpc/transactionClient');
const notificationClient = require('../grpc/notificationClient');

// POST /api/transactions — Créer une transaction
router.post('/', async (req, res) => {
  try {
    const { from_account_id, to_account_id, amount, type, description } = req.body;
    const transaction = await transactionClient.createTransaction({
      from_account_id: from_account_id || '',
      to_account_id: to_account_id || '',
      amount: parseFloat(amount),
      type,
      description: description || '',
    });
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/transactions — Toutes les transactions
router.get('/', async (req, res) => {
  try {
    const response = await transactionClient.getAllTransactions();
    res.json({
      success: true,
      count: response.transactions.length,
      data: response.transactions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/transactions/:id — Une transaction
router.get('/:id', async (req, res) => {
  try {
    const transaction = await transactionClient.getTransaction(req.params.id);
    res.json({ success: true, data: transaction });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

// GET /api/notifications/:accountId — Notifications d'un compte
router.get('/notifications/:accountId', async (req, res) => {
  try {
    const response = await notificationClient.getNotifications(req.params.accountId);
    res.json({
      success: true,
      count: response.notifications.length,
      data: response.notifications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/notifications — Toutes les notifications
router.get('/notifications/all/list', async (req, res) => {
  try {
    const response = await notificationClient.getAllNotifications();
    res.json({
      success: true,
      count: response.notifications.length,
      data: response.notifications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/notifications/:id/read — Marquer comme lu
router.patch('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await notificationClient.markAsRead(req.params.id);
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

module.exports = router;