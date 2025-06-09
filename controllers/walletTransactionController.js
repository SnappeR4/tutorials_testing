// controllers/walletTransactionController.js
const WalletTransaction = require('../models/WalletTransaction');
const WalletUser = require('../models/WalletUser');

function generateTicketId() {
  const now = new Date();
  const id = 'TXN' +
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
  return id;
}

exports.addTransaction = async (req, res) => {
  try {
    const { userId, type, points, reason } = req.body;
    const user = await WalletUser.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newBalance =
      type === 'add' ? user.wallet.points + points :
      type === 'redeem' ? user.wallet.points - points :
      user.wallet.points;

    if (newBalance < 0) {
      return res.status(400).json({ error: 'Not enough points to redeem' });
    }

    const ticketId = generateTicketId();
    const transaction = new WalletTransaction({ userId, type, points, reason, ticketId });
    await transaction.save();

    user.wallet.points = newBalance;
    await user.save();

    res.status(201).json({ transaction, newBalance });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserTransactions = async (req, res) => {
  const userId = req.params.userId;
  const transactions = await WalletTransaction.find({ userId }).sort({ timestamp: -1 });
  res.json(transactions);
};
