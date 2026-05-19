// Login route: verifies credentials and issues a JWT.

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/Signup", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send("No such user found");
    }

    const passwordMatches = await bcrypt.compare(
      req.body.password || "",
      user.password
    );
    if (!passwordMatches) {
      return res.status(400).send("incorrect password");
    }

    const authToken = jwt.sign(
      { user: { id: user._id } },
      process.env.JWT_SECRET
    );

    // Never return the password hash to the client.
    const { password, ...safeUser } = user.toObject();
    res.send({ userdata: safeUser, authToken });
  } catch (error) {
    console.error("Error in /Signup:", error.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
