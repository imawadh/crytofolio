// const fetch = require('node-fetch'); // Using global fetch

const BASE_URL = 'http://localhost:3001';

async function testFlow() {
    try {
        console.log("1. Registering User...");
        const randomStr = Math.random().toString(36).substring(7);
        const email = `test_${randomStr}@example.com`;
        
        const registerRes = await fetch(`${BASE_URL}/register/creatuser`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: "Test",
                last_name: "User",
                age: 25,
                mob: "1234567890",
                email: email,
                password: "password123"
            })
        });
        
        const registerData = await registerRes.json();
        console.log("Register Response:", registerData);

        if (!registerData.success || !registerData.authToken) {
            console.error("Registration failed!");
            return;
        }

        const authToken = registerData.authToken;
        console.log("Auth Token received.");

        console.log("2. Performing Buy Transaction...");
        const transactionPayload = {
            Quantity: 1,
            Amount: 50000, // Should suffice given initial wallet is 100000
            login: authToken,
            CoinName: "Bitcoin",
            Transaction: {
                img: "http://example.com/btc.png",
                CoinId: "bitcoin",
                CoinName: "Bitcoin",
                Quantity: 1,
                Amount: 50000,
                Prise: 50000,
                Date: new Date(),
                type: "Buy"
            }
        };

        const buyRes = await fetch(`${BASE_URL}/transactions/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionPayload)
        });

        const buyText = await buyRes.text();
        console.log("Buy Response Body:", buyText);

        if (buyText === "YES") {
            console.log("SUCCESS: Transaction completed and balance updated.");
        } else {
            console.log("FAILURE: Transaction check failed.");
        }

    } catch (err) {
        console.error("Test Error:", err);
    }
}

testFlow();
