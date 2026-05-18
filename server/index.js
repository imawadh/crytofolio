require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const { header } = require("express-validator");
const dashboardRouter = require("./Routes/Dashboard");

const app = express();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// Update CORS to allow localhost:3002 and others
app.use(cors({
  origin: ["http://localhost:3000", "https://task-cryptopolio-main-two.vercel.app", "https://task-cryptopolio-main-ypy5.onrender.com"],
  methods: ['DELETE', 'GET', 'PUT', 'POST'],
  credentials: true
}));
app.get("/", (req, res) => {
  res.send("Crypto Portfolio API is running 🚀");
});

app.use(express.json());
app.use("/dashboard", dashboardRouter);
app.use("/dashboard", require("./Routes/Userdetails"));
app.use("/dashboard", require("./Routes/ProfileUpdate"));

app.use("/register", require("./Routes/CreatUser"));
app.use("/register", require("./Routes/Signup"));


app.use("/transactions", require("./Routes/Transactions"));
app.use("/wallet", require("./Routes/Wallet"));

//---------------mongoose connection----------------//

const PORT = process.env.PORT || 5000;

mongoose.set("strictQuery", true);

async function connectDatabase() {
  let uri = process.env.DATABASE_URI;

  // Local-dev fallback: if no DATABASE_URI is configured (e.g. no .env),
  // spin up an in-memory MongoDB so the app works without external infra.
  // Set DATABASE_URI (e.g. a MongoDB Atlas string) for a persistent DB.
  if (!uri) {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mem = await MongoMemoryServer.create();
    uri = mem.getUri();
    console.log(
      "⚠ No DATABASE_URI set — started an in-memory MongoDB for local dev (data is NOT persisted across restarts)."
    );
  }

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Database connected");
}

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error.message);
    process.exit(1);
  });






