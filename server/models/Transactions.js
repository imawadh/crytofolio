//table
const mongoose = require("mongoose");

const subTransaction = new mongoose.Schema({
  img:{ type: String, required: true },
  CoinId: { type: String, required: true },
  CoinName: { type: String, required: true },
  Quantity: { type: Number, required: true },
  Amount: { type: Number, required: true },
  Prise: { type: Number, required: true },
  Date: { type: String },
  type: { type: String },
});

const transactionSchema = new mongoose.Schema({
  UserId: {
    type: String,
    required: true,
  },
  Transaction: [subTransaction]
});

//we have created the table now we will export this table

module.exports = mongoose.model("transaction", transactionSchema);
