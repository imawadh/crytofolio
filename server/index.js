require("dotenv").config();

// JWT signing/verification needs a secret. If none is configured (e.g. a
// teammate cloned the repo without a .env), fall back to a dev-only secret so
// auth still works locally instead of crashing every login/registration.
// Must run BEFORE the route files are required, since they read it on load.
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "dev-only-insecure-secret-change-me";
  console.warn(
    "⚠ No JWT_SECRET set — using an insecure dev fallback. Set JWT_SECRET in .env for production."
  );
}

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

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 8000,
};

// Spin up a throwaway in-memory MongoDB. Used when no DATABASE_URI is
// configured, or when the configured one is unreachable.
async function connectInMemory() {
  const { MongoMemoryServer } = require("mongodb-memory-server");
  const mem = await MongoMemoryServer.create();
  await mongoose.connect(mem.getUri(), mongooseOptions);
  console.log(
    "⚠ Using an in-memory MongoDB for local dev (data is NOT persisted across restarts)."
  );
}

async function connectDatabase() {
  const uri = process.env.DATABASE_URI;

  if (uri) {
    try {
      await mongoose.connect(uri, mongooseOptions);
      console.log("Database connected (configured DATABASE_URI)");
      return;
    } catch (error) {
      // The configured database is unreachable (dead Atlas cluster, no
      // network, bad credentials, etc.). Rather than crashing the whole app,
      // fall back to an in-memory DB so the project still runs locally.
      console.error(
        `⚠ Could not reach the configured DATABASE_URI: ${error.message}`
      );
      console.error("  Falling back to an in-memory MongoDB.");
    }
  } else {
    console.log("⚠ No DATABASE_URI set.");
  }

  await connectInMemory();
}

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    // Reaching here means even the in-memory fallback failed — unrecoverable.
    console.error("Database connection error:", error.message);
    process.exit(1);
  });






