const express = require("express");
const { body } = require("express-validator");
const PatientsController = require("../controllers/patientsController");
const { authenticateToken, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * @route   GET /api/patients
 * @desc    Get all patients
 * @access  Private (Doctor/Admin only)
 */
router.get(
  "/",
  authenticateToken,
  authorize("doctor", "admin"),
  PatientsController.getAllPatients
);

/**
 * @route   POST /api/patients
 * @desc    Create a new patient (Doctor creates patient account with login credentials)
 * @access  Private (Doctor/Admin only)
 */
router.post(
  "/",
  authenticateToken,
  authorize("doctor", "admin"),
  [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phoneNumber").notEmpty().withMessage("Phone number is required"),
    body("dateOfBirth").notEmpty().withMessage("Date of birth is required"),
    body("gender")
      .isIn(["male", "female", "other"])
      .withMessage("Valid gender is required"),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  PatientsController.createPatient
);

/**
 * @route   GET /api/patients/:id
 * @desc    Get a specific patient by ID
 * @access  Private (Doctor/Admin only)
 */
router.get(
  "/:id",
  authenticateToken,
  authorize("doctor", "admin"),
  PatientsController.getPatientById
);

/**
 * @route   PUT /api/patients/:id
 * @desc    Update patient
 * @access  Private (Doctor/Admin only)
 */
router.put(
  "/:id",
  authenticateToken,
  authorize("doctor", "admin"),
  [
    body("firstName")
      .optional()
      .notEmpty()
      .withMessage("First name cannot be empty"),
    body("lastName")
      .optional()
      .notEmpty()
      .withMessage("Last name cannot be empty"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("phoneNumber")
      .optional()
      .notEmpty()
      .withMessage("Phone number cannot be empty"),
  ],
  PatientsController.updatePatient
);

/**
 * @route   GET /api/patients/:id/medical-info
 * @desc    Get patient medical info
 * @access  Private (Doctor/Admin only)
 */
router.get(
  "/:id/medical-info",
  authenticateToken,
  authorize("doctor", "admin"),
  PatientsController.getPatientMedicalInfo
);

/**
 * @route   PUT /api/patients/:id/medical-info
 * @desc    Update patient medical info
 * @access  Private (Doctor/Admin only)
 */
router.put(
  "/:id/medical-info",
  authenticateToken,
  authorize("doctor", "admin"),
  [
    body("allergies")
      .optional()
      .isArray()
      .withMessage("Allergies must be an array"),
    body("medications")
      .optional()
      .isArray()
      .withMessage("Medications must be an array"),
    body("conditions")
      .optional()
      .isArray()
      .withMessage("Conditions must be an array"),
  ],
  PatientsController.updatePatientMedicalInfo
);

/**
 * @route   GET /api/patients/:id/doctor
 * @desc    Get assigned doctor for a patient
 * @access  Private (Patient/Doctor/Admin only)
 */
router.get(
  "/:id/doctor",
  authenticateToken,
  authorize("patient", "doctor", "admin"),
  PatientsController.getAssignedDoctor
);

module.exports = router;
