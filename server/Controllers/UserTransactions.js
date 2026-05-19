// Handles a virtual BUY: checks wallet balance, debits it, and records the trade.

const Transaction = require("../models/Transactions");
const Wallet = require("../models/Wallet");
const jwt = require("jsonwebtoken");

const UserTransactions = async (req, res) => {
  try {
    const newTransactionItem = req.body.Transaction;
    const cost = Number(req.body.Amount);

    const authToken = req.body.login;
    if (!authToken) return res.status(401).send("No token");

    let data;
    try {
      data = jwt.verify(authToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).send("Invalid Token");
    }
    const userId = data.user.id;

    if (!newTransactionItem || !Number.isFinite(cost) || cost <= 0) {
      return res.status(400).send("Invalid transaction");
    }

    // 1. Check wallet balance.
    const wallet = await Wallet.findOne({ UserId: userId });
    if (!wallet) {
      return res.send("NO_WALLET");
    }

    if (wallet.Amount < cost) {
      return res.send("NO");
    }

    // 2. Update wallet: deduct balance, add to invested.
    await Wallet.findOneAndUpdate(
      { UserId: userId },
      {
        Invested: Number(wallet.Invested) + cost,
        Amount: Number(wallet.Amount) - cost,
      }
    );

    // 3. Record the transaction (create the history doc if it's the first one).
    const userTransactionParams = {
      img: newTransactionItem.img,
      CoinId: newTransactionItem.CoinId,
      CoinName: newTransactionItem.CoinName,
      Quantity: newTransactionItem.Quantity,
      Amount: newTransactionItem.Amount,
      Prise: newTransactionItem.Prise,
      Date: newTransactionItem.Date,
      type: newTransactionItem.type,
    };

    const existingTransactionDoc = await Transaction.findOne({
      UserId: userId,
    });

    if (existingTransactionDoc) {
      await Transaction.findOneAndUpdate(
        { UserId: userId },
        { $push: { Transaction: userTransactionParams } }
      );
    } else {
      await Transaction.create({
        UserId: userId,
        Transaction: [userTransactionParams],
      });
    }

    res.send("YES");
  } catch (error) {
    console.error("Error in UserTransactions:", error.message);
    res.status(500).send("ERROR");
  }
};

module.exports = { UserTransactions };
