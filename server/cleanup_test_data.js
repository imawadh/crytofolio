// Removes test accounts created by the backend test suite.
// Test users use the "@cryptopolio.test" email domain.
//
// Run from the server folder:  node cleanup_test_data.js

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Wallet = require("./models/Wallet");
const Profile = require("./models/Profile");
const Transaction = require("./models/Transactions");

async function main() {
  const uri = process.env.DATABASE_URI;
  if (!uri) {
    console.error("No DATABASE_URI set — nothing to clean up.");
    process.exit(1);
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log("Connected. Looking for test accounts…");

  const testUsers = await User.find({ email: /@cryptopolio\.test$/ });
  console.log(`Found ${testUsers.length} test account(s).`);

  for (const user of testUsers) {
    const id = user._id.toString();
    await Wallet.deleteMany({ UserId: id });
    await Profile.deleteMany({ userId: id });
    await Transaction.deleteMany({ UserId: id });
    await User.deleteOne({ _id: user._id });
    console.log(`  removed ${user.email}`);
  }

  await mongoose.disconnect();
  console.log("Cleanup complete.");
}

main().catch((err) => {
  console.error("Cleanup failed:", err.message);
  process.exit(1);
});
