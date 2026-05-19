// Backend smoke test — exercises register → buy → sell → wallet endpoints.
// Run the server first, then: `node test_backend.js`
// Override the target with PORT or API_URL env vars, e.g. `PORT=10000 node test_backend.js`.

const BASE_URL =
  process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;

// New wallets start with 10000 (see server/Routes/CreatUser.js), so the test
// must spend less than that.
const BUY_AMOUNT = 4000;
const SELL_AMOUNT = 1500;

async function testFlow() {
  console.log(`Target: ${BASE_URL}\n`);
  try {
    console.log("1. Registering user...");
    const randomStr = Math.random().toString(36).substring(7);
    const email = `test_${randomStr}@example.com`;

    const registerRes = await fetch(`${BASE_URL}/register/creatuser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: "Test",
        last_name: "User",
        age: 25,
        mob: "1234567890",
        email: email,
        password: "password123",
      }),
    });

    const registerData = await registerRes.json();
    console.log("   Register response:", registerData);

    if (!registerData.success || !registerData.authToken) {
      console.error("   FAILURE: registration failed.");
      process.exitCode = 1;
      return;
    }

    const authToken = registerData.authToken;
    console.log("   OK: auth token received.\n");

    console.log("2. Performing BUY transaction...");
    const buyRes = await fetch(`${BASE_URL}/transactions/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Quantity: 0.1,
        Amount: BUY_AMOUNT,
        login: authToken,
        CoinName: "Bitcoin",
        Transaction: {
          img: "http://example.com/btc.png",
          CoinId: "bitcoin",
          CoinName: "Bitcoin",
          Quantity: 0.1,
          Amount: BUY_AMOUNT,
          Prise: BUY_AMOUNT / 0.1,
          Date: new Date(),
          type: "Buy",
        },
      }),
    });
    const buyText = await buyRes.text();
    console.log("   Buy response:", buyText);
    if (buyText !== "YES") {
      console.error("   FAILURE: buy transaction was rejected.");
      process.exitCode = 1;
      return;
    }
    console.log("   OK: buy succeeded.\n");

    console.log("3. Performing SELL transaction...");
    const sellRes = await fetch(`${BASE_URL}/transactions/selltransactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Quantity: 0.03,
        Amount: SELL_AMOUNT,
        login: authToken,
        CoinName: "Bitcoin",
        Transaction: {
          img: "http://example.com/btc.png",
          CoinId: "bitcoin",
          CoinName: "Bitcoin",
          Quantity: 0.03,
          Amount: SELL_AMOUNT,
          Prise: SELL_AMOUNT / 0.03,
          Date: new Date(),
          type: "Sell",
        },
      }),
    });
    const sellText = await sellRes.text();
    console.log("   Sell response:", sellText);
    if (sellText !== "YES") {
      console.error("   FAILURE: sell transaction was rejected.");
      process.exitCode = 1;
      return;
    }
    console.log("   OK: sell succeeded.\n");

    console.log("4. Reading wallet balance...");
    const walletRes = await fetch(`${BASE_URL}/wallet/getwalletAmount`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: authToken }),
    });
    const walletData = await walletRes.json();
    const wallet = Array.isArray(walletData) ? walletData[0] : walletData;
    console.log("   Wallet:", wallet);

    // After a 4000 buy and a 1500 sell: Amount = 10000 - 4000 + 1500 = 7500.
    const expectedBalance = 10000 - BUY_AMOUNT + SELL_AMOUNT;
    if (wallet && wallet.Amount === expectedBalance) {
      console.log(`   OK: balance is ${expectedBalance} as expected.\n`);
    } else {
      console.error(
        `   FAILURE: expected balance ${expectedBalance}, got ${wallet && wallet.Amount}.`
      );
      process.exitCode = 1;
      return;
    }

    console.log("ALL CHECKS PASSED ✅");
  } catch (err) {
    console.error("Test error:", err.message);
    console.error(
      "Is the server running? Start it with `npm start` in the server folder."
    );
    process.exitCode = 1;
  }
}

testFlow();
