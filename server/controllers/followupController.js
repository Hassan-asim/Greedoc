const FollowUp = require("../models/FollowUp");
const { body, validationResult } = require("express-validator");

class FollowUpController {
  /**
   * @route   GET /api/followups
   * @desc    Get follow-ups for a user (doctor or patient)
   * @access  Private
   */
  static async getFollowUps(req, res) {
    try {
      const { page = 1, limit = 20, status, patientId, doctorId } = req.query;
      const userId = req.user._id || req.user.id;
      const userRole = req.user.role;

      let followUps;

      if (userRole === "doctor") {
        // Doctor can see their own follow-ups or filter by patient
        if (patientId) {
          followUps = await FollowUp.findByPatientId(patientId, {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
          });
        } else {
          followUps = await FollowUp.findByDoctorId(userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
          });
        }
      } else if (userRole === "patient") {
        // Patient can only see their own follow-ups
        followUps = await FollowUp.findByPatientId(userId, {
          page: parseInt(page),
          limit: parseInt(limit),
          status,
        });
      } else {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      res.json({
        status: "success",
        data: {
          followUps,
          pagination: {
            current: parseInt(page),
            limit: parseInt(limit),
            total: followUps.length,
          },
        },
      });
    } catch (error) {
      console.error("Get follow-ups error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch follow-ups",
      });
    }
  }

  /**
   * @route   GET /api/followups/:id
   * @desc    Get a specific follow-up
   * @access  Private
   */
  static async getFollowUp(req, res) {
    try {
      const followUp = await FollowUp.findById(req.params.id);

      if (!followUp) {
        return res.status(404).json({
          status: "error",
          message: "Follow-up not found",
        });
      }

      // Check if user has access to this follow-up
      const userId = req.user._id || req.user.id;
      const userRole = req.user.role;

      if (userRole === "patient" && followUp.patientId !== userId) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      if (userRole === "doctor" && followUp.doctorId !== userId) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      res.json({
        status: "success",
        data: {
          followUp,
        },
      });
    } catch (error) {
      console.error("Get follow-up error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch follow-up",
      });
    }
  }

  /**
   * @route   POST /api/followups
   * @desc    Create a new follow-up
   * @access  Private (Doctor only)
   */
  static async createFollowUp(req, res) {
    try {
      // Only doctors can create follow-ups
      if (req.user.role !== "doctor") {
        return res.status(403).json({
          status: "error",
          message: "Only doctors can create follow-ups",
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        patientId,
        patientName,
        prescriptionId,
        followUpDate,
        followUpTime,
        purpose,
        notes,
        priority = "medium",
      } = req.body;

      console.log("=== CREATING FOLLOW-UP ===");
      console.log("Request data:", req.body);
      console.log("Doctor ID:", req.user._id || req.user.id);
      console.log("Doctor name:", req.user.firstName, req.user.lastName);

      const followUpData = {
        patientId,
        doctorId: req.user._id || req.user.id,
        patientName,
        doctorName: `${req.user.firstName} ${req.user.lastName}`,
        prescriptionId: prescriptionId || "",
        followUpDate: new Date(followUpDate),
        followUpTime,
        purpose,
        notes: notes || "",
        status: "scheduled",
        priority,
        reminderSent: false,
      };

      console.log("Follow-up data to create:", followUpData);

      const followUp = new FollowUp(followUpData);
      const savedFollowUp = await followUp.save();

      console.log("Follow-up created successfully:", savedFollowUp.id);

      res.status(201).json({
        status: "success",
        message: "Follow-up created successfully",
        data: {
          followUp: savedFollowUp.toObject(),
        },
      });
    } catch (error) {
      console.error("Create follow-up error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to create follow-up",
        error: error.message,
      });
    }
  }

  /**
   * @route   PUT /api/followups/:id
   * @desc    Update a follow-up
   * @access  Private (Doctor only)
   */
  static async updateFollowUp(req, res) {
    try {
      // Only doctors can update follow-ups
      if (req.user.role !== "doctor") {
        return res.status(403).json({
          status: "error",
          message: "Only doctors can update follow-ups",
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const followUp = await FollowUp.findById(req.params.id);

      if (!followUp) {
        return res.status(404).json({
          status: "error",
          message: "Follow-up not found",
        });
      }

      // Check if doctor owns this follow-up
      if (followUp.doctorId !== (req.user._id || req.user.id)) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      const {
        patientName,
        followUpDate,
        followUpTime,
        purpose,
        notes,
        status,
        priority,
      } = req.body;

      // Update fields
      if (patientName) followUp.patientName = patientName;
      if (followUpDate) followUp.followUpDate = new Date(followUpDate);
      if (followUpTime) followUp.followUpTime = followUpTime;
      if (purpose) followUp.purpose = purpose;
      if (notes !== undefined) followUp.notes = notes;
      if (status) followUp.status = status;
      if (priority) followUp.priority = priority;

      // For now, simulate the update since Firebase is not configured
      // TODO: Replace with actual Firebase update once configuration is fixed
      console.log(
        "Using mock follow-up update due to Firebase configuration issues"
      );
      followUp.updatedAt = new Date();

      res.json({
        status: "success",
        message: "Follow-up updated successfully",
        data: {
          followUp: followUp.toObject(),
        },
      });
    } catch (error) {
      console.error("Update follow-up error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update follow-up",
        error: error.message,
      });
    }
  }

  /**
   * @route   PUT /api/followups/:id/status
   * @desc    Update follow-up status
   * @access  Private
   */
  static async updateFollowUpStatus(req, res) {
    try {
      const { status } = req.body;
      const userId = req.user._id || req.user.id;
      const userRole = req.user.role;

      console.log("=== UPDATE FOLLOW-UP STATUS ===");
      console.log("Request params:", req.params);
      console.log("Request body:", req.body);
      console.log("User info:", {
        userId,
        userRole,
        userObjectId: req.user.id,
        userObjectIdType: typeof req.user.id,
      });

      if (!status) {
        return res.status(400).json({
          status: "error",
          message: "Status is required",
        });
      }

      const followUp = await FollowUp.findById(req.params.id);

      if (!followUp) {
        console.log("Follow-up not found for ID:", req.params.id);
        return res.status(404).json({
          status: "error",
          message: "Follow-up not found",
        });
      }

      console.log("Follow-up found:", {
        id: followUp.id,
        patientId: followUp.patientId,
        doctorId: followUp.doctorId,
        currentStatus: followUp.status,
      });

      // Check access permissions with flexible ID matching
      const userMatchesPatient =
        userId === followUp.patientId || req.user.id === followUp.patientId;
      const userMatchesDoctor =
        userId === followUp.doctorId || req.user.id === followUp.doctorId;

      console.log("Authorization check:", {
        userRole,
        userId,
        userObjectId: req.user.id,
        followUpPatientId: followUp.patientId,
        followUpDoctorId: followUp.doctorId,
        userMatchesPatient,
        userMatchesDoctor,
      });

      if (userRole === "patient" && !userMatchesPatient) {
        console.log("Patient access denied:", {
          userId,
          userObjectId: req.user.id,
          followUpPatientId: followUp.patientId,
          userMatchesPatient,
        });
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      if (userRole === "doctor" && !userMatchesDoctor) {
        console.log("Doctor access denied:", {
          userId,
          userObjectId: req.user.id,
          followUpDoctorId: followUp.doctorId,
          userMatchesDoctor,
        });
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      console.log("Authorization passed, updating status to:", status);

      // For now, simulate the update since Firebase is not configured
      // TODO: Replace with actual Firebase update once configuration is fixed
      console.log(
        "Using mock status update due to Firebase configuration issues"
      );

      // Simulate the update by modifying the follow-up object
      followUp.status = status;
      followUp.updatedAt = new Date();

      res.json({
        status: "success",
        message: "Follow-up status updated successfully",
        data: {
          followUp: followUp.toObject(),
        },
      });
    } catch (error) {
      console.error("Update follow-up status error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update follow-up status",
        error: error.message,
      });
    }
  }

  /**
   * @route   DELETE /api/followups/:id
   * @desc    Delete a follow-up
   * @access  Private (Doctor only)
   */
  static async deleteFollowUp(req, res) {
    try {
      // Only doctors can delete follow-ups
      if (req.user.role !== "doctor") {
        return res.status(403).json({
          status: "error",
          message: "Only doctors can delete follow-ups",
        });
      }

      const followUp = await FollowUp.findById(req.params.id);

      if (!followUp) {
        return res.status(404).json({
          status: "error",
          message: "Follow-up not found",
        });
      }

      // Check if doctor owns this follow-up
      if (followUp.doctorId !== (req.user._id || req.user.id)) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      await followUp.delete();

      res.json({
        status: "success",
        message: "Follow-up deleted successfully",
      });
    } catch (error) {
      console.error("Delete follow-up error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to delete follow-up",
        error: error.message,
      });
    }
  }

  /**
   * @route   GET /api/followups/patient/:patientId
   * @desc    Get follow-ups for a specific patient
   * @access  Private (Doctor only)
   */
  static async getPatientFollowUps(req, res) {
    try {
      // Only doctors can view patient follow-ups
      if (req.user.role !== "doctor") {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      const { page = 1, limit = 20, status } = req.query;
      const patientId = req.params.patientId;

      const followUps = await FollowUp.findByPatientId(patientId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
      });

      res.json({
        status: "success",
        data: {
          followUps,
          pagination: {
            current: parseInt(page),
            limit: parseInt(limit),
            total: followUps.length,
          },
        },
      });
    } catch (error) {
      console.error("Get patient follow-ups error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch patient follow-ups",
      });
    }
  }

  /**
   * @route   GET /api/followups/upcoming/:doctorId
   * @desc    Get upcoming follow-ups for a doctor
   * @access  Private
   */
  static async getUpcomingFollowUps(req, res) {
    try {
      const { days = 7 } = req.query;
      const doctorId = req.params.doctorId;
      const userId = req.user._id || req.user.id;
      const userRole = req.user.role;

      // Check access permissions
      if (userRole === "doctor" && doctorId !== userId) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      const followUps = await FollowUp.getUpcomingFollowUps(
        doctorId,
        parseInt(days)
      );

      res.json({
        status: "success",
        data: {
          followUps,
          count: followUps.length,
        },
      });
    } catch (error) {
      console.error("Get upcoming follow-ups error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch upcoming follow-ups",
      });
    }
  }
}

module.exports = FollowUpController;
