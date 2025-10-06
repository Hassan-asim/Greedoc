const HealthData = require("../models/HealthData");
const { body, validationResult } = require("express-validator");

class HealthDataController {
  /**
   * @route   GET /api/health-data
   * @desc    Get health data for a patient
   * @access  Private
   */
  static async getHealthData(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        startDate,
        endDate,
        orderBy = "timestamp",
        orderDirection = "desc",
      } = req.query;

      const userId = req.user._id || req.user.id;
      const userRole = req.user.role;

      console.log("Getting health data for user:", {
        userId,
        userRole,
        query: req.query,
        userObject: req.user,
      });

      // Only patients can access their own health data
      if (userRole !== "patient") {
        return res.status(403).json({
          status: "error",
          message: "Only patients can access health data",
        });
      }

      const result = await HealthData.findByPatientId(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        type,
        startDate,
        endDate,
        orderBy,
        orderDirection,
      });

      res.json({
        status: "success",
        data: {
          healthData: result.data.map((item) => item.toObject()),
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
        },
      });
    } catch (error) {
      console.error("Get health data error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch health data",
        error: error.message,
      });
    }
  }

  /**
   * @route   GET /api/health-data/:id
   * @desc    Get a specific health data entry
   * @access  Private
   */
  static async getHealthDataById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id || req.user.id;
      const userRole = req.user.role;

      console.log("Getting health data by ID:", { id, userId, userRole });

      // Only patients can access their own health data
      if (userRole !== "patient") {
        return res.status(403).json({
          status: "error",
          message: "Only patients can access health data",
        });
      }

      const healthData = await HealthData.findById(id);

      if (!healthData) {
        return res.status(404).json({
          status: "error",
          message: "Health data not found",
        });
      }

      // Verify the health data belongs to the patient
      if (healthData.patientId !== userId) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      res.json({
        status: "success",
        data: {
          healthData: healthData.toObject(),
        },
      });
    } catch (error) {
      console.error("Get health data by ID error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch health data",
        error: error.message,
      });
    }
  }

  /**
   * @route   POST /api/health-data
   * @desc    Create or update health data entry
   * @access  Private (Patient only)
   */
  static async createHealthData(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const userId = req.user._id || req.user.id;
      const userRole = req.user.role;

      console.log("Creating/updating health data for user:", {
        userId,
        userRole,
        body: req.body,
      });

      // Only patients can create health data
      if (userRole !== "patient") {
        return res.status(403).json({
          status: "error",
          message: "Only patients can create health data",
        });
      }

      const { type, value, unit, timestamp, notes } = req.body;

      const healthData = await HealthData.createOrUpdate({
        patientId: userId,
        type,
        value,
        unit,
        timestamp: timestamp || new Date().toISOString(),
        notes: notes || "",
      });

      res.status(201).json({
        status: "success",
        message: "Health data updated successfully",
        data: {
          healthData: healthData.toObject(),
        },
      });
    } catch (error) {
      console.error("Create health data error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to create health data",
        error: error.message,
      });
    }
  }

  /**
   * @route   PUT /api/health-data/:id
   * @desc    Update specific health metric
   * @access  Private (Patient only)
   */
  static async updateHealthData(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const userId = req.user._id || req.user.id;
      const userRole = req.user.role;

      console.log("Updating health data:", { id, userId, userRole });

      // Only patients can update their own health data
      if (userRole !== "patient") {
        return res.status(403).json({
          status: "error",
          message: "Only patients can update health data",
        });
      }

      // Verify the health data belongs to the patient
      if (id !== userId) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      const { type, value, unit, timestamp, notes } = req.body;

      const healthData = await HealthData.createOrUpdate({
        patientId: userId,
        type,
        value,
        unit,
        timestamp: timestamp || new Date().toISOString(),
        notes: notes || "",
      });

      res.json({
        status: "success",
        message: "Health data updated successfully",
        data: {
          healthData: healthData.toObject(),
        },
      });
    } catch (error) {
      console.error("Update health data error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update health data",
        error: error.message,
      });
    }
  }

  /**
   * @route   PUT /api/health-data/bulk
   * @desc    Update multiple health metrics at once
   * @access  Private (Patient only)
   */
  static async updateBulkHealthData(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const userId = req.user._id || req.user.id;
      const userRole = req.user.role;

      console.log("Updating bulk health data for user:", {
        userId,
        userRole,
        body: req.body,
      });

      // Only patients can update their own health data
      if (userRole !== "patient") {
        return res.status(403).json({
          status: "error",
          message: "Only patients can update health data",
        });
      }

      const { healthMetrics } = req.body;

      if (!healthMetrics || typeof healthMetrics !== "object") {
        return res.status(400).json({
          status: "error",
          message: "Health metrics object is required",
        });
      }

      // Get existing health data
      let existingHealthData = await HealthData.findById(userId);

      if (!existingHealthData) {
        // Create new health data document
        existingHealthData = new HealthData({
          id: userId,
          patientId: userId,
          healthMetrics: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          lastUpdated: new Date(),
        });
      }

      // Update each metric
      const now = new Date();
      for (const [type, metricData] of Object.entries(healthMetrics)) {
        if (metricData && typeof metricData === "object") {
          existingHealthData.healthMetrics[type] = {
            value: metricData.value,
            unit: metricData.unit || "",
            timestamp: metricData.timestamp
              ? new Date(metricData.timestamp)
              : now,
            notes: metricData.notes || "",
          };
        }
      }

      existingHealthData.lastUpdated = now;
      existingHealthData.updatedAt = now;

      // Save the updated health data
      await existingHealthData.save();

      res.json({
        status: "success",
        message: "Health data updated successfully",
        data: {
          healthData: existingHealthData.toObject(),
        },
      });
    } catch (error) {
      console.error("Update bulk health data error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update health data",
        error: error.message,
      });
    }
  }

  /**
   * @route   DELETE /api/health-data/:id
   * @desc    Delete health data entry
   * @access  Private (Patient only)
   */
  static async deleteHealthData(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id || req.user.id;
      const userRole = req.user.role;

      console.log("Deleting health data:", { id, userId, userRole });

      // Only patients can delete their own health data
      if (userRole !== "patient") {
        return res.status(403).json({
          status: "error",
          message: "Only patients can delete health data",
        });
      }

      const healthData = await HealthData.findById(id);

      if (!healthData) {
        return res.status(404).json({
          status: "error",
          message: "Health data not found",
        });
      }

      // Verify the health data belongs to the patient
      if (healthData.patientId !== userId) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      // Delete the health data from Firebase
      await healthData.delete();

      res.json({
        status: "success",
        message: "Health data deleted successfully",
      });
    } catch (error) {
      console.error("Delete health data error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to delete health data",
        error: error.message,
      });
    }
  }

  /**
   * @route   GET /api/health-data/metrics/types
   * @desc    Get available health metric types
   * @access  Private
   */
  static async getHealthMetricTypes(req, res) {
    try {
      const metrics = HealthData.getHealthMetrics();

      res.json({
        status: "success",
        data: {
          metrics,
        },
      });
    } catch (error) {
      console.error("Get health metric types error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch health metric types",
        error: error.message,
      });
    }
  }

  /**
   * @route   GET /api/health-data/patient/:patientId
   * @desc    Get health data for a specific patient (Doctor access)
   * @access  Private (Doctor only)
   */
  static async getPatientHealthData(req, res) {
    try {
      const { patientId } = req.params;
      const { page = 1, limit = 20, type, startDate, endDate } = req.query;

      const userId = req.user._id || req.user.id;
      const userRole = req.user.role;

      console.log("Getting patient health data for doctor:", {
        doctorId: userId,
        patientId,
        userRole,
      });

      // Only doctors can access patient health data
      if (userRole !== "doctor") {
        return res.status(403).json({
          status: "error",
          message: "Only doctors can access patient health data",
        });
      }

      const result = await HealthData.findByPatientId(patientId, {
        page: parseInt(page),
        limit: parseInt(limit),
        type,
        startDate,
        endDate,
      });

      res.json({
        status: "success",
        data: {
          healthData: result.data.map((item) => item.toObject()),
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
        },
      });
    } catch (error) {
      console.error("Get patient health data error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch patient health data",
        error: error.message,
      });
    }
  }
}

module.exports = HealthDataController;
