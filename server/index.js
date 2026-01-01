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
  origin: ["http://localhost:3000", "https://task-cryptopolio-main-two.vercel.app/"],
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

const Connection_url = process.env.DATABASE_URI;
const PORT = process.env.PORT; 


//here are routes for backend calls
//---------------mongoose connection----------------//
mongoose.connect(Connection_url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Database connected"))
  .catch((error) => console.log("Database connection error:", error.message));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


mongoose.set("strictQuery", true);






