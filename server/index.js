require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const isProduction = process.env.NODE_ENV === "production";

// ---------------------------------------------------------------------------
// JWT secret
// ---------------------------------------------------------------------------
// Auth signing/verification needs a secret. In production it is mandatory; in
// development we fall back to an insecure value so the app still runs without
// a .env. This must run BEFORE the route files are required (they read it).
if (!process.env.JWT_SECRET) {
  if (isProduction) {
    console.error(
      "FATAL: JWT_SECRET is not set. Refusing to start in production."
    );
    process.exit(1);
  }
  process.env.JWT_SECRET = "dev-only-insecure-secret-change-me";
  console.warn(
    "⚠ No JWT_SECRET set — using an insecure dev fallback. Set JWT_SECRET in .env."
  );
}

const app = express();

// Running behind a proxy (Render, Heroku, etc.) — needed for correct client
// IPs and for express-rate-limit.
app.set("trust proxy", 1);

// ---------------------------------------------------------------------------
// Security & parsing middleware
// ---------------------------------------------------------------------------
app.use(helmet());

// API payloads are small JSON bodies; a tight limit guards against abuse.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Allowed browser origins. Configure for production via CLIENT_URL
// (comma-separated). Localhost origins are always allowed for local dev.
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((o) => o.trim()).filter(Boolean)
    : [
        "https://task-cryptopolio-main-two.vercel.app",
        "https://task-cryptopolio-main-ypy5.onrender.com",
      ]),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (curl, server-to-server, health checks).
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Global rate limit, with a stricter cap on the auth endpoints.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many attempts, please try again later.",
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.get("/", (req, res) => {
  res.send("Crypto Portfolio API is running 🚀");
});
app.get("/health", (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({ status: dbUp ? "ok" : "degraded" });
});

app.use("/dashboard", require("./Routes/Dashboard"));
app.use("/dashboard", require("./Routes/Userdetails"));
app.use("/dashboard", require("./Routes/ProfileUpdate"));

app.use("/register", authLimiter, require("./Routes/CreatUser"));
app.use("/register", authLimiter, require("./Routes/Signup"));

app.use("/transactions", require("./Routes/Transactions"));
app.use("/wallet", require("./Routes/Wallet"));

// 404 + centralized error handler.
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// ---------------------------------------------------------------------------
// Database connection
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;

mongoose.set("strictQuery", true);

const mongooseOptions = { serverSelectionTimeoutMS: 8000 };

// Throwaway in-memory MongoDB — development convenience only.
async function connectInMemory() {
  let MongoMemoryServer;
  try {
    ({ MongoMemoryServer } = require("mongodb-memory-server"));
  } catch (err) {
    throw new Error(
      "mongodb-memory-server is not installed — set a valid DATABASE_URI."
    );
  }
  const mem = await MongoMemoryServer.create();
  await mongoose.connect(mem.getUri(), mongooseOptions);
  console.log(
    "⚠ Using an in-memory MongoDB for local dev (data is NOT persisted)."
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
      console.error(
        `Could not reach the configured DATABASE_URI: ${error.message}`
      );
      // In production we never silently fall back to a non-persistent DB —
      // that would lose user data. Fail loudly instead.
      if (isProduction) {
        throw new Error("Database unreachable in production.");
      }
      console.error("Falling back to an in-memory MongoDB (development only).");
    }
  } else if (isProduction) {
    throw new Error("DATABASE_URI is required in production.");
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
    console.error("Database connection error:", error.message);
    process.exit(1);
  });
