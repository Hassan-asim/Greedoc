const express = require("express");
const { body } = require("express-validator");
const UsersController = require("../controllers/usersController");
const { authenticateToken, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get(
  "/",
  authenticateToken,
  authorize("admin"),
  UsersController.getAllUsers
);

/**
 * @route   GET /api/users/search
 * @desc    Search users
 * @access  Private
 */
router.get("/search", authenticateToken, UsersController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get("/:id", authenticateToken, UsersController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private
 */
router.put(
  "/:id",
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
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("phoneNumber")
      .optional()
      .isMobilePhone()
      .withMessage("Please provide a valid phone number"),
  ],
  UsersController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (Admin only)
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  authenticateToken,
  authorize("admin"),
  UsersController.deleteUser
);

/**
 * @route   PUT /api/users/:id/deactivate
 * @desc    Deactivate user (Admin only)
 * @access  Private/Admin
 */
router.put(
  "/:id/deactivate",
  authenticateToken,
  authorize("admin"),
  UsersController.deactivateUser
);

/**
 * @route   PUT /api/users/:id/activate
 * @desc    Activate user (Admin only)
 * @access  Private/Admin
 */
router.put(
  "/:id/activate",
  authenticateToken,
  authorize("admin"),
  UsersController.activateUser
);

/**
 * @route   GET /api/doctors/:id/patients
 * @desc    Get patients for a doctor
 * @access  Private (Doctor/Admin only)
 */
router.get(
  "/:id/patients",
  authenticateToken,
  authorize("doctor", "admin"),
  UsersController.getDoctorPatients
);

module.exports = router;
