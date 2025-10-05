const express = require("express");
const { body } = require("express-validator");
const PrescriptionController = require("../controllers/prescriptionController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

/**
 * @route   GET /api/prescriptions
 * @desc    Get prescriptions for a user (doctor or patient)
 * @access  Private
 */
router.get("/", authenticateToken, PrescriptionController.getPrescriptions);

/**
 * @route   GET /api/prescriptions/:id
 * @desc    Get a specific prescription
 * @access  Private
 */
router.get("/:id", authenticateToken, PrescriptionController.getPrescription);

/**
 * @route   POST /api/prescriptions
 * @desc    Create a new prescription
 * @access  Private (Doctor only)
 */
router.post(
  "/",
  authenticateToken,
  [
    body("patientId").notEmpty().withMessage("Patient ID is required"),
    body("patientName").notEmpty().withMessage("Patient name is required"),
    body("medications")
      .isArray({ min: 1 })
      .withMessage("At least one medication is required"),
    body("medications.*.name")
      .notEmpty()
      .withMessage("Medication name is required"),
    body("medications.*.dosage")
      .notEmpty()
      .withMessage("Medication dosage is required"),
    body("medications.*.frequency")
      .notEmpty()
      .withMessage("Medication frequency is required"),
    body("prescriptionDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid prescription date"),
    body("validUntil")
      .optional()
      .isISO8601()
      .withMessage("Invalid valid until date"),
    body("followUpDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid follow-up date"),
    body("diagnosis")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Diagnosis cannot exceed 500 characters"),
    body("notes")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Notes cannot exceed 1000 characters"),
  ],
  PrescriptionController.createPrescription
);

/**
 * @route   PUT /api/prescriptions/:id
 * @desc    Update a prescription
 * @access  Private (Doctor only)
 */
router.put(
  "/:id",
  authenticateToken,
  [
    body("patientName")
      .optional()
      .notEmpty()
      .withMessage("Patient name cannot be empty"),
    body("medications")
      .optional()
      .isArray()
      .withMessage("Medications must be an array"),
    body("medications.*.name")
      .optional()
      .notEmpty()
      .withMessage("Medication name cannot be empty"),
    body("medications.*.dosage")
      .optional()
      .notEmpty()
      .withMessage("Medication dosage cannot be empty"),
    body("medications.*.frequency")
      .optional()
      .notEmpty()
      .withMessage("Medication frequency cannot be empty"),
    body("prescriptionDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid prescription date"),
    body("validUntil")
      .optional()
      .isISO8601()
      .withMessage("Invalid valid until date"),
    body("followUpDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid follow-up date"),
    body("diagnosis")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Diagnosis cannot exceed 500 characters"),
    body("notes")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Notes cannot exceed 1000 characters"),
  ],
  PrescriptionController.updatePrescription
);

/**
 * @route   PUT /api/prescriptions/:id/status
 * @desc    Update prescription status
 * @access  Private (Doctor only)
 */
router.put(
  "/:id/status",
  authenticateToken,
  [
    body("status")
      .isIn(["draft", "active", "completed", "cancelled"])
      .withMessage("Invalid status"),
  ],
  PrescriptionController.updatePrescriptionStatus
);

/**
 * @route   DELETE /api/prescriptions/:id
 * @desc    Delete a prescription
 * @access  Private (Doctor only)
 */
router.delete(
  "/:id",
  authenticateToken,
  PrescriptionController.deletePrescription
);

/**
 * @route   GET /api/prescriptions/patient/:patientId
 * @desc    Get prescriptions for a specific patient
 * @access  Private (Doctor only)
 */
router.get(
  "/patient/:patientId",
  authenticateToken,
  PrescriptionController.getPatientPrescriptions
);

/**
 * @route   GET /api/prescriptions/active/:patientId
 * @desc    Get active prescriptions for a patient
 * @access  Private
 */
router.get(
  "/active/:patientId",
  authenticateToken,
  PrescriptionController.getActivePrescriptions
);

module.exports = router;
