const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");
const User = require("../models/User");

router.post("/profileupdate", async (req, res) => {
  try {
    const { UserId, first_name, last_name, ProfileUrl } = req.body;

    // Update User Name if provided
    if (first_name || last_name) {
      const userUpdate = {};
      if (first_name) userUpdate.first_name = first_name;
      if (last_name) userUpdate.last_name = last_name;
      
      await User.findByIdAndUpdate(UserId, { $set: userUpdate });
    }

    // Update Profile URL if provided
    if (ProfileUrl) {
      // Check if profile exists for this user
      const existingProfile = await Profile.findOne({ userId: UserId });
      
      if (existingProfile) {
        await Profile.updateOne({ userId: UserId }, { $set: { url: ProfileUrl } });
      } else {
        // Create new profile entry if it doesn't exist
        const newProfile = new Profile({
          userId: UserId,
          url: ProfileUrl
        });
        await newProfile.save();
      }
    }

    res.json({ success: true, message: "Profile updated successfully" });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
