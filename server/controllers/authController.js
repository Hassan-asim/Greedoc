const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const {
  generateToken,
  generateRefreshToken,
  authenticateToken,
} = require("../middleware/auth");

/**
 * Auth Controller
 * Handles all authentication related operations
 */
class AuthController {
  /**
   * Register a new doctor (Admin only)
   */
  static async registerDoctor(req, res) {
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

      const {
        firstName,
        lastName,
        email,
        password,
        dateOfBirth,
        gender,
        phoneNumber,
        specialization,
        licenseNumber,
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          status: "error",
          message: "Doctor with this email already exists",
        });
      }

      // Create new doctor
      const doctorData = {
        firstName,
        lastName,
        email,
        password,
        dateOfBirth,
        gender,
        phoneNumber,
        role: "doctor",
        specialization,
        licenseNumber,
      };

      console.log("Creating doctor with data:", {
        ...doctorData,
        password: "[HIDDEN]",
      });

      const doctor = new User(doctorData);

      await doctor.save();

      // Generate tokens
      const token = generateToken(doctor.id);
      const refreshToken = generateRefreshToken(doctor.id);

      // Remove password from response
      const doctorResponse = doctor.toObject();
      delete doctorResponse.password;

      res.status(201).json({
        status: "success",
        message: "Doctor registered successfully",
        data: {
          doctor: doctorResponse,
          token,
          refreshToken,
        },
      });
    } catch (error) {
      console.error("Doctor registration error:", error);
      res.status(500).json({
        status: "error",
        message: "Doctor registration failed",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * Register a new user (Legacy method - now only for admin)
   */
  static async register(req, res) {
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

      const {
        firstName,
        lastName,
        email,
        password,
        dateOfBirth,
        gender,
        phoneNumber,
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          status: "error",
          message: "User with this email already exists",
        });
      }

      // Create new user
      const user = new User({
        firstName,
        lastName,
        email,
        password,
        dateOfBirth,
        gender,
        phoneNumber,
      });

      await user.save();

      // Generate tokens
      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        status: "success",
        message: "User registered successfully",
        data: {
          user: userResponse,
          token,
          refreshToken,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        status: "error",
        message: "Registration failed",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * Login user
   */
  static async login(req, res) {
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

      const { email, password } = req.body;

      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      console.log("Login attempt:", {
        originalEmail: email,
        normalizedEmail: normalizedEmail,
        providedPassword: password,
        hasPassword: !!password,
        passwordLength: password ? password.length : 0,
      });

      // Find user and include password for comparison
      const user = await User.findByEmail(normalizedEmail, true);

      console.log("User found:", {
        userExists: !!user,
        userId: user ? user.id : null,
        userEmail: user ? user.email : null,
        userRole: user ? user.role : null,
        isActive: user ? user.isActive : null,
        hasPassword: user ? !!user.password : null,
        storedEmail: user ? user.email : null,
        storedPassword: user ? user.password : null,
        storedPasswordLength: user ? user.password.length : 0,
      });

      if (!user) {
        console.log("Login failed: User not found for email:", email);
        return res.status(401).json({
          status: "error",
          message: "Invalid email or password",
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({
          status: "error",
          message: "Account is deactivated",
        });
      }

      // Check password
      console.log("Checking password...");
      const isPasswordValid = await user.comparePassword(password);
      console.log("Password validation result:", {
        isValid: isPasswordValid,
        providedEmail: email,
        storedEmail: user.email,
        emailMatch: email.toLowerCase() === user.email.toLowerCase(),
        providedPassword: password,
        storedPasswordHash: user.password
          ? `${user.password.substring(0, 20)}...`
          : "No password",
        storedPasswordLength: user.password ? user.password.length : 0,
      });

      if (!isPasswordValid) {
        console.log("Login failed: Invalid password for user:", user.email);
        return res.status(401).json({
          status: "error",
          message: "Invalid email or password",
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        status: "success",
        message: "Login successful",
        data: {
          user: userResponse,
          token,
          refreshToken,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        status: "error",
        message: "Login failed",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

      if (decoded.type !== "refresh") {
        return res.status(401).json({
          status: "error",
          message: "Invalid refresh token",
        });
      }

      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        return res.status(401).json({
          status: "error",
          message: "User not found or inactive",
        });
      }

      // Generate new tokens
      const newToken = generateToken(user.id);
      const newRefreshToken = generateRefreshToken(user.id);

      res.json({
        status: "success",
        message: "Token refreshed successfully",
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(401).json({
        status: "error",
        message: "Invalid refresh token",
      });
    }
  }

  /**
   * Test password comparison (debugging endpoint)
   */
  static async testPassword(req, res) {
    try {
      const { email, testPassword } = req.body;

      console.log("Password test request:", {
        email: email,
        testPassword: testPassword,
      });

      const user = await User.findByEmail(email, true);

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Test the comparison
      const isMatch = await user.comparePassword(testPassword);

      console.log("Password test result:", {
        email: user.email,
        testPassword: testPassword,
        storedPassword: user.password,
        isMatch: isMatch,
      });

      res.status(200).json({
        status: "success",
        message: "Password test completed",
        data: {
          email: user.email,
          testPassword: testPassword,
          isMatch: isMatch,
          storedPasswordHash: user.password.substring(0, 20) + "...",
        },
      });
    } catch (error) {
      console.error("Password test error:", error);
      res.status(500).json({
        status: "error",
        message: "Password test failed",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * Reset password for debugging (temporary endpoint)
   */
  static async resetPassword(req, res) {
    try {
      const { email, newPassword } = req.body;

      console.log("Password reset request:", {
        email: email,
        hasNewPassword: !!newPassword,
      });

      const user = await User.findByEmail(email, true);

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Update password - force rehashing
      user.password = newPassword;
      console.log("Before save - password:", {
        newPassword: newPassword,
        userPassword: user.password,
        needsHashing: !user.password.startsWith("$2b$"),
      });
      await user.save();

      console.log("Password reset successful:", {
        email: user.email,
        newPasswordHash: user.password.substring(0, 20) + "...",
      });

      res.status(200).json({
        status: "success",
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({
        status: "error",
        message: "Password reset failed",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req, res) {
    try {
      res.json({
        status: "success",
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to get user profile",
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req, res) {
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

      const allowedUpdates = [
        "firstName",
        "lastName",
        "phoneNumber",
        "dateOfBirth",
        "address",
        "emergencyContact",
        "medicalInfo",
        "preferences",
      ];

      const updates = {};
      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true,
      });

      res.json({
        status: "success",
        message: "Profile updated successfully",
        data: {
          user,
        },
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update profile",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * Change user password
   */
  static async changePassword(req, res) {
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

      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await User.findById(req.user.id, true);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          status: "error",
          message: "Current password is incorrect",
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        status: "success",
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to change password",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  /**
   * Logout user
   */
  static async logout(req, res) {
    try {
      // In a more sophisticated implementation, you might want to blacklist the token
      // For now, we'll just return a success message
      res.json({
        status: "success",
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        status: "error",
        message: "Logout failed",
      });
    }
  }

  /**
   * Debug endpoint to check user existence
   */
  static async debugUser(req, res) {
    try {
      const { email } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      console.log("Debug user request:", {
        originalEmail: email,
        normalizedEmail: normalizedEmail,
      });

      // Try to find user
      const user = await User.findByEmail(normalizedEmail, true);

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
          debug: {
            searchedEmail: normalizedEmail,
            originalEmail: email,
          },
        });
      }

      res.status(200).json({
        status: "success",
        message: "User found",
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            hasPassword: !!user.password,
            passwordHash: user.password
              ? user.password.substring(0, 20) + "..."
              : "No password",
          },
        },
      });
    } catch (error) {
      console.error("Debug user error:", error);
      res.status(500).json({
        status: "error",
        message: "Debug failed",
        error: error.message,
      });
    }
  }

  /**
   * Fix password hash for existing users
   */
  static async fixPasswordHash(req, res) {
    try {
      const { email, newPassword } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      console.log("Fix password hash request:", {
        email: normalizedEmail,
        hasNewPassword: !!newPassword,
      });

      const user = await User.findByEmail(normalizedEmail, true);

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Force update the password with new hash
      user.password = newPassword;
      await user.save();

      console.log("Password hash fixed successfully:", {
        email: user.email,
        newPasswordHash: user.password.substring(0, 20) + "...",
        hashVersion: user.password.substring(0, 4),
      });

      res.status(200).json({
        status: "success",
        message: "Password hash updated successfully",
        data: {
          email: user.email,
          hashVersion: user.password.substring(0, 4),
        },
      });
    } catch (error) {
      console.error("Fix password hash error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fix password hash",
        error: error.message,
      });
    }
  }
}

module.exports = AuthController;
