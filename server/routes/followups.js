const express = require("express");
const { body } = require("express-validator");
const FollowUpController = require("../controllers/followupController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

/**
 * @route   GET /api/followups
 * @desc    Get follow-ups for a user (doctor or patient)
 * @access  Private
 */
router.get("/", authenticateToken, FollowUpController.getFollowUps);

/**
 * @route   GET /api/followups/:id
 * @desc    Get a specific follow-up
 * @access  Private
 */
router.get("/:id", authenticateToken, FollowUpController.getFollowUp);

/**
 * @route   POST /api/followups
 * @desc    Create a new follow-up
 * @access  Private (Doctor only)
 */
router.post(
  "/",
  authenticateToken,
  [
    body("patientId").notEmpty().withMessage("Patient ID is required"),
    body("patientName").notEmpty().withMessage("Patient name is required"),
    body("followUpDate")
      .notEmpty()
      .withMessage("Follow-up date is required")
      .isISO8601()
      .withMessage("Invalid follow-up date format"),
    body("followUpTime").notEmpty().withMessage("Follow-up time is required"),
    body("purpose")
      .notEmpty()
      .withMessage("Purpose is required")
      .isLength({ min: 3, max: 100 })
      .withMessage("Purpose must be between 3 and 100 characters"),
    body("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high", "urgent"])
      .withMessage("Priority must be one of: low, medium, high, urgent"),
    body("prescriptionId")
      .optional()
      .isString()
      .withMessage("Prescription ID must be a string"),
  ],
  FollowUpController.createFollowUp
);

/**
 * @route   PUT /api/followups/:id
 * @desc    Update a follow-up
 * @access  Private (Doctor only)
 */
router.put(
  "/:id",
  authenticateToken,
  [
    body("patientName")
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage("Patient name must be between 2 and 100 characters"),
    body("followUpDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid follow-up date format"),
    body("followUpTime")
      .optional()
      .isString()
      .withMessage("Follow-up time must be a string"),
    body("purpose")
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage("Purpose must be between 3 and 100 characters"),
    body("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters"),
    body("status")
      .optional()
      .isIn(["scheduled", "completed", "cancelled", "rescheduled"])
      .withMessage(
        "Status must be one of: scheduled, completed, cancelled, rescheduled"
      ),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high", "urgent"])
      .withMessage("Priority must be one of: low, medium, high, urgent"),
  ],
  FollowUpController.updateFollowUp
);

/**
 * @route   PUT /api/followups/:id/status
 * @desc    Update follow-up status
 * @access  Private
 */
router.put(
  "/:id/status",
  authenticateToken,
  [
    body("status")
      .notEmpty()
      .withMessage("Status is required")
      .isIn(["scheduled", "completed", "cancelled", "rescheduled"])
      .withMessage(
        "Status must be one of: scheduled, completed, cancelled, rescheduled"
      ),
  ],
  FollowUpController.updateFollowUpStatus
);

/**
 * @route   DELETE /api/followups/:id
 * @desc    Delete a follow-up
 * @access  Private (Doctor only)
 */
router.delete("/:id", authenticateToken, FollowUpController.deleteFollowUp);

/**
 * @route   GET /api/followups/patient/:patientId
 * @desc    Get follow-ups for a specific patient
 * @access  Private (Doctor only)
 */
router.get(
  "/patient/:patientId",
  authenticateToken,
  FollowUpController.getPatientFollowUps
);

/**
 * @route   GET /api/followups/upcoming/:doctorId
 * @desc    Get upcoming follow-ups for a doctor
 * @access  Private
 */
router.get(
  "/upcoming/:doctorId",
  authenticateToken,
  FollowUpController.getUpcomingFollowUps
);

module.exports = router;
