const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const fetchuser = (req, res, next) => {
  const authToken = req.body.Token;
  if (!authToken) {
    return res.status(401).json({ error: "No authentication token provided" });
  }
  try {
    const data = jwt.verify(authToken, jwtSecret);
    req.user = data.user;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid authentication token" });
  }
};
module.exports = { fetchuser };
