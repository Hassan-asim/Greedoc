const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { authenticateToken, authorize } = require("../middleware/auth");

/**
 * Users Controller
 * Handles user management operations
 */
class UsersController {
  /**
   * Get all users (Admin only)
   */
  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, role, search } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        orderBy: "createdAt",
        orderDirection: "desc",
      };

      let users;
      if (role) {
        users = await User.findByRole(role);
      } else {
        users = await User.findAll(options);
      }

      // Filter by search term if provided
      if (search) {
        const searchTerm = search.toLowerCase();
        users = users.filter(
          (user) =>
            user.firstName.toLowerCase().includes(searchTerm) ||
            user.lastName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
      }

      res.json({
        status: "success",
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: users.length,
          },
        },
      });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to get users",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      res.json({
        status: "success",
        data: {
          user,
        },
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to get user",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * Update user (Admin or self)
   */
  static async updateUser(req, res) {
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

      // Check if user exists
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Check permissions (admin or self)
      if (req.user.role !== "admin" && req.user.id !== id) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      const user = await User.findByIdAndUpdate(id, updates, { new: true });

      res.json({
        status: "success",
        message: "User updated successfully",
        data: {
          user,
        },
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update user",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * Delete user (Admin only)
   */
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Check if user exists
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Prevent self-deletion
      if (req.user.id === id) {
        return res.status(400).json({
          status: "error",
          message: "Cannot delete your own account",
        });
      }

      await user.delete();

      res.json({
        status: "success",
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to delete user",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * Deactivate user (Admin only)
   */
  static async deactivateUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      user.isActive = false;
      await user.save();

      res.json({
        status: "success",
        message: "User deactivated successfully",
        data: {
          user,
        },
      });
    } catch (error) {
      console.error("Deactivate user error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to deactivate user",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * Activate user (Admin only)
   */
  static async activateUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      user.isActive = true;
      await user.save();

      res.json({
        status: "success",
        message: "User activated successfully",
        data: {
          user,
        },
      });
    } catch (error) {
      console.error("Activate user error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to activate user",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * Get patients for a doctor
   */
  static async getDoctorPatients(req, res) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      // Check if user has access to this doctor's patients
      if (currentUser.role === "doctor" && currentUser.id !== id) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      const doctor = await User.findById(id);
      if (!doctor) {
        return res.status(404).json({
          status: "error",
          message: "Doctor not found",
        });
      }

      // Get real patients assigned to this doctor
      const patients = await User.findPatientsByDoctor(id);

      res.json({
        status: "success",
        data: {
          patients: patients,
        },
      });
    } catch (error) {
      console.error("Get doctor patients error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to get doctor patients",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
}

module.exports = UsersController;
