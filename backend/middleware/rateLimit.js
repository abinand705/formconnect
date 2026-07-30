const rateLimit = require("express-rate-limit");

const submitLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: "Too many requests from this IP, please try again after a minute" },
});

module.exports = { submitLimiter };
