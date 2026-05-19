// Backend end-to-end test suite for the CryptoPolio API.
//
// Run the server first, then: `node test_backend.js`
// Override the target with PORT or API_URL, e.g. `PORT=10000 node test_backend.js`.
//
// Test accounts use the "@cryptopolio.test" email domain so they can be
// removed afterwards with `node server/cleanup_test_data.js`.

const BASE_URL =
  process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;

let passed = 0;
let failed = 0;

function check(name, condition, detail) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function section(title) {
  console.log(`\n${title}`);
}

async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: res.status, text, json };
}

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: res.status, text, json };
}

async function run() {
  console.log(`CryptoPolio backend test suite\nTarget: ${BASE_URL}`);

  const email = `test_e2e_${Date.now()}@cryptopolio.test`;
  const password = "password123";
  let authToken;
  let userId;

  // -------------------------------------------------------------------------
  section("Service endpoints");
  {
    const root = await get("/");
    check("GET / responds 200", root.status === 200, `status ${root.status}`);

    const health = await get("/health");
    check(
      "GET /health is ok",
      health.status === 200 && health.json && health.json.status === "ok",
      health.text
    );

    const notFound = await get("/this-route-does-not-exist");
    check(
      "GET unknown route → 404",
      notFound.status === 404,
      `status ${notFound.status}`
    );
  }

  // -------------------------------------------------------------------------
  section("Registration");
  {
    const reg = await post("/register/creatuser", {
      first_name: "Test",
      last_name: "User",
      age: 25,
      mob: "1234567890",
      email,
      password,
    });
    check(
      "register new user → success + token",
      reg.json && reg.json.success === true && !!reg.json.authToken,
      reg.text
    );
    authToken = reg.json && reg.json.authToken;

    const dup = await post("/register/creatuser", {
      first_name: "Test",
      last_name: "User",
      email,
      password,
    });
    check(
      "register duplicate email → userexist",
      dup.json && dup.json.success === false && dup.json.userexist === true,
      dup.text
    );

    const badEmail = await post("/register/creatuser", {
      first_name: "Test",
      last_name: "User",
      email: "not-an-email",
      password,
    });
    check(
      "register invalid email → 400",
      badEmail.status === 400,
      `status ${badEmail.status}`
    );

    const shortPw = await post("/register/creatuser", {
      first_name: "Test",
      last_name: "User",
      email: `test_e2e_short_${Date.now()}@cryptopolio.test`,
      password: "abc",
    });
    check(
      "register short password → 400",
      shortPw.status === 400,
      `status ${shortPw.status}`
    );
  }

  if (!authToken) {
    console.log("\nAborting: no auth token from registration.");
    return finish();
  }

  // -------------------------------------------------------------------------
  section("Login");
  {
    const ok = await post("/register/Signup", { email, password });
    check(
      "login with correct credentials → token",
      ok.json && !!ok.json.authToken && !!ok.json.userdata,
      ok.text
    );
    check(
      "login response does NOT leak password hash",
      ok.json && ok.json.userdata && ok.json.userdata.password === undefined,
      "password field present in userdata"
    );

    const wrongPw = await post("/register/Signup", {
      email,
      password: "wrongpassword",
    });
    check(
      "login with wrong password → rejected",
      wrongPw.status === 400 && wrongPw.text === "incorrect password",
      `${wrongPw.status} ${wrongPw.text}`
    );

    const noUser = await post("/register/Signup", {
      email: "nobody_unknown@cryptopolio.test",
      password,
    });
    check(
      "login with unknown user → rejected",
      noUser.status === 400 && noUser.text === "No such user found",
      `${noUser.status} ${noUser.text}`
    );
  }

  // -------------------------------------------------------------------------
  section("Auth-protected dashboard");
  {
    const dash = await post("/dashboard/dashboard", { Token: authToken });
    check(
      "resolve user id from token",
      dash.status === 200 && dash.json && !!dash.json.id,
      dash.text
    );
    userId = dash.json && dash.json.id;

    const badToken = await post("/dashboard/dashboard", {
      Token: "garbage.token.value",
    });
    check(
      "invalid token → 401",
      badToken.status === 401,
      `status ${badToken.status}`
    );

    const noToken = await post("/dashboard/dashboard", {});
    check(
      "missing token → 401",
      noToken.status === 401,
      `status ${noToken.status}`
    );
  }

  // -------------------------------------------------------------------------
  section("User details & profile");
  {
    const details = await post("/dashboard/userdetails", { UserId: userId });
    check(
      "fetch user details",
      details.status === 200 &&
        details.json &&
        details.json.Data &&
        details.json.Data.email === email,
      details.text
    );
    check(
      "user details omit password hash",
      details.json &&
        details.json.Data &&
        details.json.Data.password === undefined,
      "password present"
    );

    const noId = await post("/dashboard/userdetails", {});
    check(
      "user details without UserId → 400",
      noId.status === 400,
      `status ${noId.status}`
    );

    const upd = await post("/dashboard/profileupdate", {
      UserId: userId,
      first_name: "Updated",
      last_name: "Name",
    });
    check(
      "profile update succeeds",
      upd.json && upd.json.success === true,
      upd.text
    );

    const after = await post("/dashboard/userdetails", { UserId: userId });
    check(
      "profile update persisted",
      after.json &&
        after.json.Data &&
        after.json.Data.first_name === "Updated",
      after.json && after.json.Data && after.json.Data.first_name
    );
  }

  // -------------------------------------------------------------------------
  section("Wallet & transactions");
  {
    const wallet0 = await post("/wallet/getwalletAmount", {
      login: authToken,
    });
    const w0 = Array.isArray(wallet0.json) ? wallet0.json[0] : null;
    check(
      "new wallet starts with 10000 balance",
      w0 && w0.Amount === 10000 && w0.Invested === 0,
      JSON.stringify(w0)
    );

    const buyOver = await post("/transactions/transactions", {
      Quantity: 1,
      Amount: 999999,
      login: authToken,
      Transaction: {
        img: "x",
        CoinId: "bitcoin",
        CoinName: "Bitcoin",
        Quantity: 1,
        Amount: 999999,
        Prise: 999999,
        Date: new Date(),
        type: "Buy",
      },
    });
    check(
      "buy exceeding balance → NO",
      buyOver.text === "NO",
      buyOver.text
    );

    const buyNoToken = await post("/transactions/transactions", {
      Amount: 100,
      Transaction: { CoinId: "bitcoin" },
    });
    check(
      "buy without token → 401",
      buyNoToken.status === 401,
      `status ${buyNoToken.status}`
    );

    const buyBadToken = await post("/transactions/transactions", {
      Amount: 100,
      login: "bad.token",
      Transaction: { CoinId: "bitcoin" },
    });
    check(
      "buy with invalid token → 401",
      buyBadToken.status === 401,
      `status ${buyBadToken.status}`
    );

    const buy = await post("/transactions/transactions", {
      Quantity: 0.1,
      Amount: 4000,
      login: authToken,
      Transaction: {
        img: "x",
        CoinId: "bitcoin",
        CoinName: "Bitcoin",
        Quantity: 0.1,
        Amount: 4000,
        Prise: 40000,
        Date: new Date(),
        type: "Buy",
      },
    });
    check("valid buy → YES", buy.text === "YES", buy.text);

    const wallet1 = await post("/wallet/getwalletAmount", {
      login: authToken,
    });
    const w1 = Array.isArray(wallet1.json) ? wallet1.json[0] : null;
    check(
      "wallet debited after buy (balance 6000, invested 4000)",
      w1 && w1.Amount === 6000 && w1.Invested === 4000,
      JSON.stringify(w1)
    );

    const sellOver = await post("/transactions/selltransactions", {
      Quantity: 5,
      Amount: 200000,
      login: authToken,
      Transaction: {
        img: "x",
        CoinId: "bitcoin",
        CoinName: "Bitcoin",
        Quantity: 5,
        Amount: 200000,
        Prise: 40000,
        Date: new Date(),
        type: "Sell",
      },
    });
    check(
      "sell exceeding holdings → NO",
      sellOver.text === "NO",
      sellOver.text
    );

    const sell = await post("/transactions/selltransactions", {
      Quantity: 0.03,
      Amount: 1500,
      login: authToken,
      Transaction: {
        img: "x",
        CoinId: "bitcoin",
        CoinName: "Bitcoin",
        Quantity: 0.03,
        Amount: 1500,
        Prise: 50000,
        Date: new Date(),
        type: "Sell",
      },
    });
    check("valid sell → YES", sell.text === "YES", sell.text);

    const wallet2 = await post("/wallet/getwalletAmount", {
      login: authToken,
    });
    const w2 = Array.isArray(wallet2.json) ? wallet2.json[0] : null;
    check(
      "wallet credited after sell (balance 7500)",
      w2 && w2.Amount === 7500,
      JSON.stringify(w2)
    );

    const history = await post("/wallet/getwalletTransaction", {
      login: authToken,
    });
    check(
      "transaction history has 2 entries",
      Array.isArray(history.json) && history.json.length === 2,
      `length ${history.json && history.json.length}`
    );
  }

  finish();
}

function finish() {
  console.log(`\n${"=".repeat(40)}`);
  console.log(`  Passed: ${passed}   Failed: ${failed}`);
  console.log("=".repeat(40));
  if (failed > 0) {
    console.log("SOME CHECKS FAILED ❌");
    process.exitCode = 1;
  } else {
    console.log("ALL CHECKS PASSED ✅");
  }
}

run().catch((err) => {
  console.error("\nTest run crashed:", err.message);
  console.error(
    "Is the server running? Start it with `npm start` in the server folder."
  );
  process.exitCode = 1;
});
