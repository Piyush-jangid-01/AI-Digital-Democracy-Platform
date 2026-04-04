const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const validateFeedback = [
  body("description").notEmpty().withMessage("Description is required").isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),
  body("category").notEmpty().withMessage("Category is required"),
  body("location").notEmpty().withMessage("Location is required"),
  handleValidationErrors
];

const validateWorker = [
  body("name").notEmpty().withMessage("Name is required"),
  body("phone").notEmpty().withMessage("Phone is required").isMobilePhone().withMessage("Invalid phone number"),
  body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email"),
  body("constituency_id").notEmpty().withMessage("Constituency ID is required").isInt().withMessage("Invalid constituency ID"),
  handleValidationErrors
];

const validateTask = [
  body("title").notEmpty().withMessage("Title is required"),
  body("worker_id").notEmpty().withMessage("Worker ID is required").isInt().withMessage("Invalid worker ID"),
  body("due_date").notEmpty().withMessage("Due date is required").isDate().withMessage("Invalid date format"),
  handleValidationErrors
];

const validateUser = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  handleValidationErrors
];

const validateLogin = [
  body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors
];

const validateVoter = [
  body("name").notEmpty().withMessage("Name is required"),
  body("age").notEmpty().withMessage("Age is required").isInt({ min: 18 }).withMessage("Voter must be at least 18 years old"),
  body("constituency_id").notEmpty().withMessage("Constituency ID is required").isInt().withMessage("Invalid constituency ID"),
  handleValidationErrors
];

const validateSurvey = [
  body("worker_id").notEmpty().withMessage("Worker ID is required").isInt().withMessage("Invalid worker ID"),
  body("constituency_id").notEmpty().withMessage("Constituency ID is required").isInt().withMessage("Invalid constituency ID"),
  body("area").notEmpty().withMessage("Area is required"),
  body("survey_date").notEmpty().withMessage("Survey date is required").isDate().withMessage("Invalid date format"),
  handleValidationErrors
];

module.exports = {
  validateFeedback,
  validateWorker,
  validateTask,
  validateUser,
  validateLogin,
  validateVoter,
  validateSurvey
};