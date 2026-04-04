const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`);
  res.status(500).json({ success: false, message: "Internal server error" });
};

const requestLogger = (req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
};

module.exports = { errorHandler, requestLogger };