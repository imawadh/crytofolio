// Registration route: creates the user, their demo wallet, and a default profile.

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Profile = require("../models/Profile");
const Wallet = require("../models/Wallet");
const { body, validationResult } = require("express-validator");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const DEFAULT_AVATAR =
  "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=2048x2048&w=is&k=20&c=6hQNACQQjktni8CxSS_QSPqJv2tycskYmpFGzxv3FNs=";

router.post(
  "/creatuser",
  body("email", "invalid email").isEmail(),
  body("password", "too small").isLength({ min: 5 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const existing = await User.findOne({ email: req.body.email });
      if (existing) {
        return res.json({ success: false, userexist: true });
      }

      const salt = await bcrypt.genSalt(10);
      const securepassword = await bcrypt.hash(req.body.password, salt);

      const user = await User.create({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        age: req.body.age,
        mob: req.body.mob,
        email: req.body.email,
        password: securepassword,
      });

      // Every new user starts with a demo wallet and a default profile.
      await Wallet.create({ UserId: user._id, Amount: 10000, Invested: 0 });
      await Profile.create({ userId: user._id, url: DEFAULT_AVATAR });

      const authToken = jwt.sign(
        { user: { id: user._id } },
        process.env.JWT_SECRET
      );
      res.json({ success: true, userexist: false, authToken });
    } catch (error) {
      console.error("Error in /creatuser:", error.message);
      res.status(500).json({ success: false, error: "Server error" });
    }
  }
);

module.exports = router;
