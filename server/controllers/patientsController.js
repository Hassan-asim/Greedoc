const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { authenticateToken, authorize } = require("../middleware/auth");

// Generate secure password for patients
function generateSecurePassword() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";

  // Ensure at least one character from each category
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // Uppercase
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // Lowercase
  password += "0123456789"[Math.floor(Math.random() * 10)]; // Number
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // Special char

  // Fill the rest randomly
  for (let i = 4; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/**
 * Patients Controller
 * Handles patient-specific operations
 */
class PatientsController {
  /**
   * Get all patients for the authenticated doctor
   */
  static async getAllPatients(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const doctorId = req.user.id; // Get doctor ID from authenticated user

      if (!doctorId) {
        return res.status(400).json({
          status: "error",
          message: "Doctor ID is required",
        });
      }

      // Get patients for this specific doctor
      let patients = await User.findPatientsByDoctor(doctorId);

      // Filter by search term if provided
      if (search) {
        const searchTerm = search.toLowerCase();
        patients = patients.filter(
          (patient) =>
            patient.firstName.toLowerCase().includes(searchTerm) ||
            patient.lastName.toLowerCase().includes(searchTerm) ||
            patient.email.toLowerCase().includes(searchTerm)
        );
      }

      res.json({
        status: "success",
        data: {
          patients,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: patients.length,
          },
        },
      });
    } catch (error) {
      console.error("Get patients error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to get patients",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * Get patient by ID (only for the doctor who created the patient)
   */
  static async getPatientById(req, res) {
    try {
      const { id } = req.params;
      const doctorId = req.user.id; // Get doctor ID from authenticated user

      const patient = await User.findById(id);

      if (!patient) {
        return res.status(404).json({
          status: "error",
          message: "Patient not found",
        });
      }

      // Check if user is a patient
      if (patient.role !== "patient") {
        return res.status(400).json({
          status: "error",
          message: "User is not a patient",
        });
      }

      // Check if the patient belongs to the authenticated doctor
      if (patient.doctorId !== doctorId) {
        return res.status(403).json({
          status: "error",
          message: "Access denied. This patient does not belong to you.",
        });
      }

      res.json({
        status: "success",
        data: {
          patient,
        },
      });
    } catch (error) {
      console.error("Get patient error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to get patient",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * Create new patient (Doctor creates patient account with login credentials)
   */
  static async createPatient(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        firstName,
        lastName,
        email,
        password,
        dateOfBirth,
        gender,
        phoneNumber,
        medicalInfo,
      } = req.body;

      // Check if doctor ID exists
      if (!req.user.id) {
        return res.status(400).json({
          status: "error",
          message: "Doctor ID is required",
        });
      }

      // Check if patient already exists
      const existingPatient = await User.findByEmail(email);
      if (existingPatient) {
        return res.status(400).json({
          status: "error",
          message: "Patient with this email already exists",
        });
      }

      // Generate secure password if not provided
      const generatedPassword = password || generateSecurePassword();

      // Create new patient with doctor relationship
      const patient = new User({
        firstName,
        lastName,
        email,
        password: generatedPassword,
        dateOfBirth,
        gender,
        phoneNumber,
        medicalInfo,
        role: "patient",
        doctorId: req.user.id, // Associate with the authenticated doctor
      });

      await patient.save();

      res.status(201).json({
        status: "success",
        message: "Patient created successfully",
        data: {
          patient: {
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            phoneNumber: patient.phoneNumber,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            role: patient.role,
          },
          loginCredentials: {
            email: patient.email,
            password: generatedPassword,
            loginUrl: `${
              process.env.CLIENT_URL || "http://localhost:3000"
            }/patient/login`,
          },
        },
      });
    } catch (error) {
      console.error("Create patient error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to create patient",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * Update patient
   */
  static async updatePatient(req, res) {
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
      const updates = req.body;

      // Check if patient exists
      const patient = await User.findById(id);
      if (!patient) {
        return res.status(404).json({
          status: "error",
          message: "Patient not found",
        });
      }

      // Check if user is a patient
      if (patient.role !== "patient") {
        return res.status(400).json({
          status: "error",
          message: "User is not a patient",
        });
      }

      const updatedPatient = await User.findByIdAndUpdate(id, updates, {
        new: true,
      });

      res.json({
        status: "success",
        message: "Patient updated successfully",
        data: {
          patient: updatedPatient,
        },
      });
    } catch (error) {
      console.error("Update patient error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update patient",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * Get patient medical info
   */
  static async getPatientMedicalInfo(req, res) {
    try {
      const { id } = req.params;
      const patient = await User.findById(id);

      if (!patient) {
        return res.status(404).json({
          status: "error",
          message: "Patient not found",
        });
      }

      if (patient.role !== "patient") {
        return res.status(400).json({
          status: "error",
          message: "User is not a patient",
        });
      }

      res.json({
        status: "success",
        data: {
          medicalInfo: patient.medicalInfo,
          patient: {
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
          },
        },
      });
    } catch (error) {
      console.error("Get patient medical info error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to get patient medical info",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * Update patient medical info
   */
  static async updatePatientMedicalInfo(req, res) {
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
      const { medicalInfo } = req.body;

      const patient = await User.findById(id);
      if (!patient) {
        return res.status(404).json({
          status: "error",
          message: "Patient not found",
        });
      }

      if (patient.role !== "patient") {
        return res.status(400).json({
          status: "error",
          message: "User is not a patient",
        });
      }

      patient.medicalInfo = { ...patient.medicalInfo, ...medicalInfo };
      await patient.save();

      res.json({
        status: "success",
        message: "Patient medical info updated successfully",
        data: {
          medicalInfo: patient.medicalInfo,
        },
      });
    } catch (error) {
      console.error("Update patient medical info error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update patient medical info",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * Get assigned doctor for a patient
   */
  static async getAssignedDoctor(req, res) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      // Check if user has access to this patient
      if (currentUser.role === "patient" && currentUser.id !== id) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      const patient = await User.findById(id);
      if (!patient) {
        return res.status(404).json({
          status: "error",
          message: "Patient not found",
        });
      }

      // Get the assigned doctor for this patient
      let assignedDoctor = patient.doctorId
        ? await User.findDoctorById(patient.doctorId)
        : null;

      // Temporary: If no doctor assigned, assign the first available doctor
      if (!assignedDoctor) {
        console.log(
          "No doctor assigned to patient, looking for available doctor"
        );
        const doctors = await User.findByRole("doctor");
        if (doctors.length > 0) {
          const firstDoctor = doctors[0];
          console.log("Assigning doctor to patient:", firstDoctor.id);

          // Update patient with doctor assignment
          patient.doctorId = firstDoctor.id;
          await patient.save();

          assignedDoctor = firstDoctor;
          console.log("Doctor assigned successfully");
        }
      }

      res.json({
        status: "success",
        data: {
          doctor: assignedDoctor,
        },
      });
    } catch (error) {
      console.error("Get assigned doctor error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to get assigned doctor",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
}

module.exports = PatientsController;
