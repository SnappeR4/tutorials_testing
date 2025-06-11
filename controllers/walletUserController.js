// controllers/walletUserController.js
const WalletUser = require('../models/WalletUser');

exports.createUser = async (req, res) => {
  try {
    const user = new WalletUser(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  const users = await WalletUser.find();
  res.json(users);
};

exports.getUserById = async (req, res) => {
  try {
      const user = await WalletUser.findOne({ mobile: req.params.id });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
};

exports.updateUser = async (req, res) => {
  const user = await WalletUser.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};

exports.deleteUser = async (req, res) => {
  const user = await WalletUser.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'User deleted' });
};
