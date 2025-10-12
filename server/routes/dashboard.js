const express = require("express");
const DashboardController = require("../controllers/dashboardController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

/**
 * @route   GET /api/dashboard/stats/:doctorId
 * @desc    Get dashboard statistics for a doctor
 * @access  Private
 */
router.get(
  "/stats/:doctorId",
  authenticateToken,
  DashboardController.getDashboardStats
);

/**
 * @route   GET /api/dashboard/patients/:doctorId
 * @desc    Get patient statistics for a doctor
 * @access  Private
 */
router.get(
  "/patients/:doctorId",
  authenticateToken,
  DashboardController.getPatientStats
);

/**
 * @route   GET /api/dashboard/reports/:doctorId
 * @desc    Get report statistics for a doctor
 * @access  Private
 */
router.get(
  "/reports/:doctorId",
  authenticateToken,
  DashboardController.getReportStats
);

/**
 * @route   GET /api/dashboard/appointments/:doctorId
 * @desc    Get appointment statistics for a doctor
 * @access  Private
 */
router.get(
  "/appointments/:doctorId",
  authenticateToken,
  DashboardController.getAppointmentStats
);

/**
 * @route   GET /api/dashboard/debug/:doctorId
 * @desc    Debug endpoint to check database collections
 * @access  Private
 */
router.get(
  "/debug/:doctorId",
  authenticateToken,
  DashboardController.debugCollections
);

/**
 * @route   GET /api/dashboard/debug-db
 * @desc    Debug database connection
 * @access  Private
 */
router.get("/debug-db", authenticateToken, DashboardController.debugDatabase);

module.exports = router;
