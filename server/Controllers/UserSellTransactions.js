// Handles a virtual SELL: verifies the user holds enough of the coin,
// credits the wallet, and records the trade.

const TransactionModel = require("../models/Transactions");
const Wallet = require("../models/Wallet");
const jwt = require("jsonwebtoken");

const UserSellTransactions = async (req, res) => {
  try {
    const { login, Transaction, Quantity, Amount } = req.body;

    if (!login) return res.status(401).send("No token");

    let userData;
    try {
      userData = jwt.verify(login, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).send("Invalid Token");
    }
    const userId = userData.user.id;

    const sellQty = Number(Quantity);
    const sellAmount = Number(Amount);
    if (
      !Transaction ||
      !Transaction.CoinId ||
      !Number.isFinite(sellQty) ||
      sellQty <= 0 ||
      !Number.isFinite(sellAmount) ||
      sellAmount <= 0
    ) {
      return res.status(400).send("Invalid transaction");
    }

    // 1. Compute current holdings for this coin from the trade history.
    let currentHoldings = 0;
    const userTransDoc = await TransactionModel.findOne({ UserId: userId });

    if (userTransDoc && userTransDoc.Transaction) {
      userTransDoc.Transaction.forEach((t) => {
        if (t.CoinId && t.CoinId.toString() === Transaction.CoinId.toString()) {
          const type = t.type ? t.type.toLowerCase() : "";
          if (type === "buy") currentHoldings += Number(t.Quantity);
          else if (type === "sell") currentHoldings -= Number(t.Quantity);
        }
      });
    }

    if (currentHoldings < sellQty) {
      return res.send("NO");
    }

    // 2. Update wallet: free up invested capital, credit the sale proceeds.
    await Wallet.findOneAndUpdate(
      { UserId: userId },
      { $inc: { Invested: -sellAmount, Amount: sellAmount } }
    );

    // 3. Record the sell transaction.
    if (userTransDoc) {
      await TransactionModel.findOneAndUpdate(
        { UserId: userId },
        { $push: { Transaction: Transaction } }
      );
    } else {
      await TransactionModel.create({
        UserId: userId,
        Transaction: [Transaction],
      });
    }

    res.send("YES");
  } catch (error) {
    console.error("Error in UserSellTransactions:", error.message);
    res.status(500).send("ERROR");
  }
};

module.exports = { UserSellTransactions };
