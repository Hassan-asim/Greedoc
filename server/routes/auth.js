const express = require("express");
const { body } = require("express-validator");
const AuthController = require("../controllers/authController");
const { authenticateToken, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new doctor (Self-registration)
 * @access  Public
 */
router.post(
  "/register",
  [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("dateOfBirth")
      .isISO8601()
      .withMessage("Please provide a valid date of birth"),
    body("gender")
      .isIn(["male", "female", "other", "prefer_not_to_say"])
      .withMessage("Invalid gender"),
    body("phoneNumber")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required")
      .isLength({ min: 10, max: 15 })
      .withMessage("Phone number must be between 10 and 15 characters"),
    body("specialization")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage(
        "Medical specialization must be between 2 and 100 characters"
      ),
    body("licenseNumber")
      .optional()
      .trim()
      .isLength({ min: 5, max: 50 })
      .withMessage(
        "Medical license number must be between 5 and 50 characters"
      ),
  ],
  AuthController.registerDoctor
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  AuthController.login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  "/refresh",
  [body("refreshToken").notEmpty().withMessage("Refresh token is required")],
  AuthController.refreshToken
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", authenticateToken, AuthController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  "/profile",
  authenticateToken,
  [
    body("firstName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("First name cannot be empty"),
    body("lastName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Last name cannot be empty"),
    body("phoneNumber")
      .optional()
      .isMobilePhone()
      .withMessage("Please provide a valid phone number"),
    body("dateOfBirth")
      .optional()
      .isISO8601()
      .withMessage("Please provide a valid date of birth"),
  ],
  AuthController.updateProfile
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
  "/change-password",
  authenticateToken,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  AuthController.changePassword
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post("/logout", authenticateToken, AuthController.logout);

/**
 * @route   POST /api/auth/test-password
 * @desc    Test password comparison (debugging)
 * @access  Public
 */
router.post("/test-password", AuthController.testPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password for debugging (temporary)
 * @access  Public
 */
router.post("/reset-password", AuthController.resetPassword);

/**
 * @route   POST /api/auth/debug-user
 * @desc    Debug user existence (temporary)
 * @access  Public
 */
router.post("/debug-user", AuthController.debugUser);

/**
 * @route   POST /api/auth/fix-password-hash
 * @desc    Fix password hash for existing users (temporary)
 * @access  Public
 */
router.post("/fix-password-hash", AuthController.fixPasswordHash);

module.exports = router;
