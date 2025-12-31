const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const TransactionModel = require("../models/Transactions"); 
const Wallet = require("../models/Wallet");
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET;

const UserSellTransactions = async (req, res) => {
  try {
    const { login, Transaction, Quantity, Amount } = req.body;
    
    // Verify User
    const userData = jwt.verify(login, jwtSecret);
    const userId = userData.user.id;

    console.log(`Processing SELL for User: ${userId}, Coin: ${Transaction.CoinName}, Qty: ${Quantity}`);

    // 1. Calculate Current Holdings for THIS Coin
    let currentHoldings = 0;
    
    const userTransDoc = await TransactionModel.findOne({ UserId: userId });
    
    if (userTransDoc && userTransDoc.Transaction) {
        userTransDoc.Transaction.forEach(t => {
             // Ensure we match the coin (using CoinId is safer than Name)
             // Transaction.CoinId comes from the request
             if (t.CoinId && Transaction.CoinId && t.CoinId.toString() === Transaction.CoinId.toString()) {
                 const type = t.type ? t.type.toLowerCase() : "";
                 if (type === "buy") {
                     currentHoldings += Number(t.Quantity);
                 } else if (type === "sell") {
                     currentHoldings -= Number(t.Quantity);
                 }
             }
        });
    }

    console.log(`Current Holdings for ${Transaction.CoinName}: ${currentHoldings}`);

    if (currentHoldings >= Number(Quantity)) {
        // 2. Perform Sell
        
        // Update Wallet: Decrease Invested (Logic: You took money out), Increase Amount (Available Balance)
        // Wait, "Invested" usually means 'Current Value of Holdings' or 'Total Amount Spent'?
        // Existing logic: Invested = Invested - SaleAmount. 
        // If Invested tracks "Total amount of INR currently locked in crypto", then yes, reducing it by sale amount is roughly correct (though profit/loss complicates it).
        // For simplicity, we stick to: Invested -= Amount, Balance += Amount.
        
        await Wallet.findOneAndUpdate(
            { UserId: userId },
            { 
                $inc: { 
                    Invested: -Number(Amount),
                    Amount: Number(Amount) 
                } 
            }
        );

        // Add Transaction
        if (userTransDoc) {
            await TransactionModel.findOneAndUpdate(
                { UserId: userId },
                { $push: { Transaction: Transaction } }
            );
        } else {
            // Should not happen if they have holdings, but for safety
            await TransactionModel.create({
                UserId: userId,
                Transaction: [Transaction]
            });
        }

        console.log("Sell Successful");
        res.send("YES");

    } else {
        console.log("Insufficient Holdings");
        res.send("NO");
    }

  } catch (error) {
      console.error("Sell Transaction Error:", error);
      res.status(500).send("ERROR");
  }
};

module.exports = { UserSellTransactions };
