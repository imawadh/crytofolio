const express = require("express");
const router = express.Router();
const User = require("../models/User"); //we select the table

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const { fetchuser } = require("../middleware/fetchuser");

router.post("/dashboard", fetchuser, async (req, res) => {
  try {
    const id = req.user.id;
    res.send({ id: id });
  } catch (error) {
    console.error("Error in /dashboard:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
