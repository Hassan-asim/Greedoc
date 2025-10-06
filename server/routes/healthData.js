const express = require("express");
const { body } = require("express-validator");
const HealthDataController = require("../controllers/healthDataController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

/**
 * @route   GET /api/health-data
 * @desc    Get health data for a patient
 * @access  Private
 */
router.get("/", authenticateToken, HealthDataController.getHealthData);

/**
 * @route   GET /api/health-data/:id
 * @desc    Get a specific health data entry
 * @access  Private
 */
router.get("/:id", authenticateToken, HealthDataController.getHealthDataById);

/**
 * @route   POST /api/health-data
 * @desc    Create new health data entry
 * @access  Private (Patient only)
 */
router.post(
  "/",
  authenticateToken,
  [
    body("type")
      .notEmpty()
      .withMessage("Type is required")
      .isIn([
        "steps",
        "heart_rate",
        "sleep",
        "blood_pressure",
        "weight",
        "temperature",
      ])
      .withMessage("Invalid health data type"),
    body("value")
      .notEmpty()
      .withMessage("Value is required")
      .isNumeric()
      .withMessage("Value must be a number"),
    body("unit")
      .notEmpty()
      .withMessage("Unit is required")
      .isString()
      .withMessage("Unit must be a string"),
    body("timestamp")
      .optional()
      .isISO8601()
      .withMessage("Invalid timestamp format"),
    body("notes")
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters"),
  ],
  HealthDataController.createHealthData
);

/**
 * @route   PUT /api/health-data/:id
 * @desc    Update specific health metric
 * @access  Private (Patient only)
 */
router.put(
  "/:id",
  authenticateToken,
  [
    body("type")
      .optional()
      .isIn([
        "steps",
        "heart_rate",
        "sleep",
        "blood_pressure",
        "weight",
        "temperature",
      ])
      .withMessage("Invalid health data type"),
    body("value").optional().isNumeric().withMessage("Value must be a number"),
    body("unit").optional().isString().withMessage("Unit must be a string"),
    body("timestamp")
      .optional()
      .isISO8601()
      .withMessage("Invalid timestamp format"),
    body("notes")
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters"),
  ],
  HealthDataController.updateHealthData
);

/**
 * @route   PUT /api/health-data/bulk
 * @desc    Update multiple health metrics at once
 * @access  Private (Patient only)
 */
router.put(
  "/bulk",
  authenticateToken,
  [
    body("healthMetrics")
      .isObject()
      .withMessage("Health metrics object is required"),
  ],
  HealthDataController.updateBulkHealthData
);

/**
 * @route   DELETE /api/health-data/:id
 * @desc    Delete health data entry
 * @access  Private (Patient only)
 */
router.delete("/:id", authenticateToken, HealthDataController.deleteHealthData);

/**
 * @route   GET /api/health-data/metrics/types
 * @desc    Get available health metric types
 * @access  Private
 */
router.get(
  "/metrics/types",
  authenticateToken,
  HealthDataController.getHealthMetricTypes
);

/**
 * @route   GET /api/health-data/patient/:patientId
 * @desc    Get health data for a specific patient (Doctor access)
 * @access  Private (Doctor only)
 */
router.get(
  "/patient/:patientId",
  authenticateToken,
  HealthDataController.getPatientHealthData
);

module.exports = router;
