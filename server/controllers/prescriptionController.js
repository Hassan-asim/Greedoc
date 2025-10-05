const Prescription = require("../models/Prescription");
const { body, validationResult } = require("express-validator");

class PrescriptionController {
  /**
   * @route   GET /api/prescriptions
   * @desc    Get prescriptions for a user (doctor or patient)
   * @access  Private
   */
  static async getPrescriptions(req, res) {
    try {
      const { page = 1, limit = 20, status, patientId, doctorId } = req.query;
      const userId = req.user._id;
      const userRole = req.user.role;

      let prescriptions;

      if (userRole === "doctor") {
        // Doctor can see their own prescriptions or filter by patient
        if (patientId) {
          prescriptions = await Prescription.findByPatientId(patientId, {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
          });
        } else {
          prescriptions = await Prescription.findByDoctorId(userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
          });
        }
      } else if (userRole === "patient") {
        // Patient can only see their own prescriptions
        prescriptions = await Prescription.findByPatientId(userId, {
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
          prescriptions,
          pagination: {
            current: parseInt(page),
            limit: parseInt(limit),
            total: prescriptions.length,
          },
        },
      });
    } catch (error) {
      console.error("Get prescriptions error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch prescriptions",
      });
    }
  }

  /**
   * @route   GET /api/prescriptions/:id
   * @desc    Get a specific prescription
   * @access  Private
   */
  static async getPrescription(req, res) {
    try {
      const prescription = await Prescription.findById(req.params.id);

      if (!prescription) {
        return res.status(404).json({
          status: "error",
          message: "Prescription not found",
        });
      }

      // Check if user has access to this prescription
      const userId = req.user._id;
      const userRole = req.user.role;

      if (userRole === "patient" && prescription.patientId !== userId) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      if (userRole === "doctor" && prescription.doctorId !== userId) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      res.json({
        status: "success",
        data: {
          prescription,
        },
      });
    } catch (error) {
      console.error("Get prescription error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch prescription",
      });
    }
  }

  /**
   * @route   POST /api/prescriptions
   * @desc    Create a new prescription
   * @access  Private (Doctor only)
   */
  static async createPrescription(req, res) {
    try {
      console.log("=== PRESCRIPTION CREATE REQUEST ===");
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      console.log("User info:", req.user);

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      // Only doctors can create prescriptions
      if (req.user.role !== "doctor") {
        console.log("Access denied - user role:", req.user.role);
        return res.status(403).json({
          status: "error",
          message: "Only doctors can create prescriptions",
        });
      }

      const prescriptionData = {
        ...req.body,
        doctorId: req.user._id,
        doctorName: `${req.user.firstName} ${req.user.lastName}`,
        status: "draft",
      };

      console.log(
        "Prescription data to save:",
        JSON.stringify(prescriptionData, null, 2)
      );

      const prescription = new Prescription(prescriptionData);
      console.log("Prescription instance created:", prescription.toObject());

      const savedPrescription = await prescription.save();
      console.log(
        "Prescription saved successfully:",
        savedPrescription.toObject()
      );

      res.status(201).json({
        status: "success",
        message: "Prescription created successfully",
        data: {
          prescription: savedPrescription,
        },
      });
    } catch (error) {
      console.error("Create prescription error:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({
        status: "error",
        message: "Failed to create prescription",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * @route   PUT /api/prescriptions/:id
   * @desc    Update a prescription
   * @access  Private (Doctor only)
   */
  static async updatePrescription(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      // Only doctors can update prescriptions
      if (req.user.role !== "doctor") {
        return res.status(403).json({
          status: "error",
          message: "Only doctors can update prescriptions",
        });
      }

      const prescription = await Prescription.findById(req.params.id);

      if (!prescription) {
        return res.status(404).json({
          status: "error",
          message: "Prescription not found",
        });
      }

      // Check if doctor owns this prescription
      if (prescription.doctorId !== req.user._id) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      // Update prescription data
      Object.assign(prescription, req.body);
      prescription.updatedAt = new Date();

      await prescription.save();

      res.json({
        status: "success",
        message: "Prescription updated successfully",
        data: {
          prescription,
        },
      });
    } catch (error) {
      console.error("Update prescription error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update prescription",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * @route   PUT /api/prescriptions/:id/status
   * @desc    Update prescription status
   * @access  Private (Doctor only)
   */
  static async updatePrescriptionStatus(req, res) {
    try {
      const { status } = req.body;

      if (!["draft", "active", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({
          status: "error",
          message:
            "Invalid status. Must be one of: draft, active, completed, cancelled",
        });
      }

      // Only doctors can update prescription status
      if (req.user.role !== "doctor") {
        return res.status(403).json({
          status: "error",
          message: "Only doctors can update prescription status",
        });
      }

      const prescription = await Prescription.findById(req.params.id);

      if (!prescription) {
        return res.status(404).json({
          status: "error",
          message: "Prescription not found",
        });
      }

      // Check if doctor owns this prescription
      if (prescription.doctorId !== req.user._id) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      await prescription.updateStatus(status);

      res.json({
        status: "success",
        message: `Prescription ${status} successfully`,
        data: {
          prescription,
        },
      });
    } catch (error) {
      console.error("Update prescription status error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update prescription status",
      });
    }
  }

  /**
   * @route   DELETE /api/prescriptions/:id
   * @desc    Delete a prescription
   * @access  Private (Doctor only)
   */
  static async deletePrescription(req, res) {
    try {
      // Only doctors can delete prescriptions
      if (req.user.role !== "doctor") {
        return res.status(403).json({
          status: "error",
          message: "Only doctors can delete prescriptions",
        });
      }

      const prescription = await Prescription.findById(req.params.id);

      if (!prescription) {
        return res.status(404).json({
          status: "error",
          message: "Prescription not found",
        });
      }

      // Check if doctor owns this prescription
      if (prescription.doctorId !== req.user._id) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      await prescription.delete();

      res.json({
        status: "success",
        message: "Prescription deleted successfully",
      });
    } catch (error) {
      console.error("Delete prescription error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to delete prescription",
      });
    }
  }

  /**
   * @route   GET /api/prescriptions/patient/:patientId
   * @desc    Get prescriptions for a specific patient
   * @access  Private (Doctor only)
   */
  static async getPatientPrescriptions(req, res) {
    try {
      // Only doctors can view patient prescriptions
      if (req.user.role !== "doctor") {
        return res.status(403).json({
          status: "error",
          message: "Only doctors can view patient prescriptions",
        });
      }

      const { page = 1, limit = 20, status } = req.query;
      const prescriptions = await Prescription.findByPatientId(
        req.params.patientId,
        {
          page: parseInt(page),
          limit: parseInt(limit),
          status,
        }
      );

      res.json({
        status: "success",
        data: {
          prescriptions,
          pagination: {
            current: parseInt(page),
            limit: parseInt(limit),
            total: prescriptions.length,
          },
        },
      });
    } catch (error) {
      console.error("Get patient prescriptions error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch patient prescriptions",
      });
    }
  }

  /**
   * @route   GET /api/prescriptions/active/:patientId
   * @desc    Get active prescriptions for a patient
   * @access  Private
   */
  static async getActivePrescriptions(req, res) {
    try {
      const userId = req.user._id;
      const userRole = req.user.role;
      const patientId = req.params.patientId;

      // Check access permissions
      if (userRole === "patient" && patientId !== userId) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      if (userRole === "doctor") {
        // Doctor can view any patient's prescriptions
      } else if (userRole === "patient" && patientId !== userId) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      const prescriptions = await Prescription.getActivePrescriptions(
        patientId
      );

      res.json({
        status: "success",
        data: {
          prescriptions,
          count: prescriptions.length,
        },
      });
    } catch (error) {
      console.error("Get active prescriptions error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch active prescriptions",
      });
    }
  }
}

module.exports = PrescriptionController;
