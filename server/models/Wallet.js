const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  UserId: {
    type: String,
    required: true,
  },
  Amount: {
    type: Number,
    default: 0,
  },
  Invested: {
    type: Number,
    default: 0,
  },
});

//we have created the table now we will export this table

module.exports = mongoose.model("wallet", walletSchema);
