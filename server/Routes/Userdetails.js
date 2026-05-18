const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Profile = require("../models/Profile");

router.post("/userdetails", async (req, res) => {
  const id = req.body.UserId;
  if (!id) {
    return res.status(400).json({ error: "UserId is required" });
  }
  try {
    const Data = await User.findOne({ _id: id }).select("-password");
    const userProfile = await Profile.find({ userId: id });
    res.send({ Data, userProfile });
  } catch (error) {
    console.error("Error in /userdetails:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
