const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Transaction = require("../models/Transactions"); // renamed to TitleCase for convention
const Wallet = require("../models/Wallet");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const UserTransactions = async (req, res) => {
  try {
    console.log(req.body);
    console.log("======================================================");
    const newTransactionItem = req.body.Transaction;
    const cost = Number(req.body.Amount);

    const authToken = req.body.login;
    if (!authToken) return res.status(401).send("No token");
    
    let data;
    try {
        data = jwt.verify(authToken, jwtSecret);
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    
    console.log("data come for buy/sell", data.user.id);
    const userId = data.user.id;

    // 1. Check Wallet Balance
    const wallet = await Wallet.findOne({ UserId: userId });
    
    if (!wallet) {
        return res.send("NO_WALLET");
    }

    const currentBalance = wallet.Amount;
    const currentInvested = wallet.Invested;

    console.log("Current Balance:", currentBalance);

    if (currentBalance >= cost) {
      // 2. Update Wallet (Deduct Balance, Add to Invested)
      await Wallet.findOneAndUpdate(
        { UserId: userId },
        {
          Invested: Number(currentInvested) + cost,
          Amount: Number(currentBalance) - cost,
        }
      );
      console.log("Balance updated. New Balance:", Number(currentBalance) - cost);

      // 3. Add Transaction
      // Check if transaction document exists for user, if not create one, else push
      const userTransactionParams = {
          img: newTransactionItem.img,
          CoinId: newTransactionItem.CoinId,
          CoinName: newTransactionItem.CoinName,
          Quantity: newTransactionItem.Quantity,
          Amount: newTransactionItem.Amount,
          Prise: newTransactionItem.Prise,
          Date: newTransactionItem.Date,
          type: newTransactionItem.type
      };

      const existingTransactionDoc = await Transaction.findOne({ UserId: userId });

      if (existingTransactionDoc) {
          await Transaction.findOneAndUpdate(
              { UserId: userId },
              { $push: { Transaction: userTransactionParams } }
          );
          console.log("Transaction pushed to existing history");
      } else {
          await Transaction.create({
              UserId: userId,
              Transaction: [userTransactionParams]
          });
          console.log("New Transaction document created");
      }

      res.send("YES");
    } else {
      res.send("NO");
    }
  } catch (error) {
    console.error("Error in UserTransactions:", error);
    res.status(500).send("ERROR");
  }
};

module.exports = { UserTransactions };
