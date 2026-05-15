const express = require('express');
const router = express.Router();
const accountClient = require('../grpc/accountClient');
const transactionClient = require('../grpc/transactionClient');

// POST /api/accounts — Créer un compte
router.post('/', async (req, res) => {
  try {
    const { owner_name, email, initial_balance, account_type } = req.body;
    const account = await accountClient.createAccount({
      owner_name,
      email,
      initial_balance: initial_balance || 0,
      account_type: account_type || 'CHECKING',
    });
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: account,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/accounts — Tous les comptes
router.get('/', async (req, res) => {
  try {
    const response = await accountClient.getAllAccounts();
    res.json({
      success: true,
      count: response.accounts.length,
      data: response.accounts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/accounts/:id — Un compte
router.get('/:id', async (req, res) => {
  try {
    const account = await accountClient.getAccount(req.params.id);
    res.json({ success: true, data: account });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

// PUT /api/accounts/:id — Modifier un compte
router.put('/:id', async (req, res) => {
  try {
    const { owner_name, email, account_type } = req.body;
    const account = await accountClient.updateAccount({
      id: req.params.id,
      owner_name,
      email,
      account_type,
    });
    res.json({
      success: true,
      message: 'Account updated successfully',
      data: account,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/accounts/:id/balance — Modifier le solde
router.patch('/:id/balance', async (req, res) => {
  try {
    const { amount } = req.body;
    const account = await accountClient.updateBalance({
      id: req.params.id,
      amount: parseFloat(amount),
    });
    res.json({
      success: true,
      message: 'Balance updated successfully',
      data: account,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/accounts/:id — Supprimer un compte
router.delete('/:id', async (req, res) => {
  try {
    const result = await accountClient.deleteAccount(req.params.id);
    res.json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

// GET /api/accounts/:id/transactions — Transactions d'un compte
router.get('/:id/transactions', async (req, res) => {
  try {
    const response = await transactionClient.getAccountTransactions(req.params.id);
    res.json({
      success: true,
      count: response.transactions.length,
      data: response.transactions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;