const express = require("express");
const HealthController = require("../controllers/healthController");

const router = express.Router();

// Health endpoints
router.get("/", HealthController.getHealth);
router.get("/status", HealthController.getStatus);
router.get("/info", HealthController.getApiInfo);
router.get("/health-check", HealthController.getHealthCheck);

module.exports = router;
