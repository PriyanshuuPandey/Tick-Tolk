// routes/payments.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');

// Merchant/Business UPI Details
const MERCHANT_UPI_ID = 'yourbusiness@upi'; // Your registered UPI ID
const MERCHANT_NAME = 'Your App Name';
const TXN_NOTE = 'Coin purchase in Shorts App';

// Generate UPI Payment Link
router.post('/generate-upi-link', async (req, res) => {
  const { amount, userId } = req.body;
  
  // Validate amount
  if (!amount || amount < 10) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  // Create unique transaction ID
  const txnId = `SHORTS${Date.now()}${crypto.randomBytes(2).toString('hex')}`;
  
  // UPI Deep Link
  const upiLink = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&tn=${encodeURIComponent(TXN_NOTE)}&tid=${txnId}`;
  
  // QR Code Data
  const qrData = `${upiLink}&cu=INR`;
  
  // Store transaction in database (you'll need a Transaction model)
  const transaction = new Transaction({
    txnId,
    amount,
    userId,
    status: 'pending',
    createdAt: new Date()
  });
  
  await transaction.save();

  res.json({
    upiLink,
    qrData,
    txnId,
    merchantUpiId: MERCHANT_UPI_ID,
    merchantName: MERCHANT_NAME,
    amount,
    note: TXN_NOTE
  });
});

// Webhook for UPI Payment Confirmation (to be called by your bank)
router.post('/payment-webhook', async (req, res) => {
  const { txnId, status, upiTxnId } = req.body;
  
  // Verify the request comes from your bank (implement proper verification)
  if (!verifyBankWebhook(req)) {
    return res.status(401).send('Unauthorized');
  }

  // Update transaction status
  const transaction = await Transaction.findOneAndUpdate(
    { txnId },
    { status: status === 'success' ? 'completed' : 'failed', upiTxnId },
    { new: true }
  );

  // Credit coins if payment successful
  if (status === 'success' && transaction) {
    await User.findByIdAndUpdate(transaction.userId, {
      $inc: { coins: calculateCoins(transaction.amount) }
    });
  }

  res.status(200).send('OK');
});

// Helper function to verify bank webhook
function verifyBankWebhook(req) {
  // Implement verification logic based on your bank's API
  // This might include checking signatures, IP whitelisting, etc.
  return true; // Replace with actual verification
}

// Helper function to calculate coins based on amount
function calculateCoins(amount) {
  const rates = {
    10: 50,
    20: 100,
    50: 250,
    100: 500,
    1000: 5000
  };
  return rates[amount] || Math.floor(amount * 5); // Default rate
}

module.exports = router;
// Add to routes/payments.js
router.get('/check-status', async (req, res) => {
    const { txnId } = req.query;
    
    const transaction = await Transaction.findOne({ txnId });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({
      status: transaction.status,
      amount: transaction.amount,
      coinsCredited: transaction.coinsCredited
    });
  });