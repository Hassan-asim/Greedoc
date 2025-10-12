const User = require("../models/User");
const { db } = require("../config/firebase");
const { Timestamp } = require("firebase-admin/firestore");

/**
 * Dashboard Controller
 * Handles dashboard statistics and analytics
 */
class DashboardController {
  /**
   * Get dashboard statistics for a doctor
   */
  static async getDashboardStats(req, res) {
    try {
      const { doctorId } = req.params;
      const userId = req.user._id;

      console.log("Dashboard stats request:", {
        doctorId,
        userId,
        userRole: req.user.role,
        userIdType: typeof userId,
        doctorIdType: typeof doctorId,
      });

      // Verify the doctor is accessing their own data
      // Check both _id and id properties for compatibility
      const userMatches = userId === doctorId || req.user.id === doctorId;

      if (!userMatches) {
        console.log("Access denied - userId mismatch:", {
          userId,
          doctorId,
          userObjectId: req.user.id,
          userObjectIdType: typeof req.user.id,
          doctorIdType: typeof doctorId,
        });
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      // Get all statistics in parallel
      console.log("Fetching dashboard statistics for doctor:", doctorId);

      const [patientStats, reportStats, appointmentStats] = await Promise.all([
        DashboardController._getPatientStats(doctorId),
        DashboardController._getReportStats(doctorId),
        DashboardController._getAppointmentStats(doctorId),
      ]);

      console.log("Dashboard statistics fetched:", {
        patientStats,
        reportStats,
        appointmentStats,
      });

      const stats = {
        totalPatients: patientStats.total || 0,
        activePatients: patientStats.active || 0,
        pendingReports: reportStats.pending || 0,
        todayAppointments: appointmentStats.today || 0,
      };

      console.log("Final dashboard stats:", stats);

      res.json({
        status: "success",
        data: stats,
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch dashboard statistics",
        error: error.message,
      });
    }
  }

  /**
   * Get patient statistics (internal method)
   */
  static async _getPatientStats(doctorId) {
    try {
      console.log("Getting patient stats for doctor:", doctorId);

      // For now, return mock data since Firebase is not configured
      // TODO: Replace with actual Firebase queries once configuration is fixed
      console.log(
        "Using mock patient stats due to Firebase configuration issues"
      );

      const stats = {
        total: 1, // Mock data - you have 1 patient
        active: 1,
        inactive: 0,
        pending: 0,
      };

      console.log("Patient stats (mock):", stats);
      return stats;
    } catch (error) {
      console.error("Error getting patient stats:", error);
      console.error("Error details:", error.message);
      return { total: 0, active: 0, inactive: 0, pending: 0 };
    }
  }

  /**
   * Get report statistics - simplified for current database structure (internal method)
   */
  static async _getReportStats(doctorId) {
    try {
      console.log("Getting report stats for doctor:", doctorId);

      // For now, return mock data since Firebase is not configured
      // TODO: Replace with actual Firebase queries once configuration is fixed
      console.log(
        "Using mock report stats due to Firebase configuration issues"
      );

      const stats = {
        pending: 2, // Mock data - 2 pending follow-ups
        completed: 1,
        total: 3,
      };

      console.log("Report stats (mock):", stats);
      return stats;
    } catch (error) {
      console.error("Error getting report stats:", error);
      console.error("Error details:", error.message);
      return { pending: 0, completed: 0, total: 0 };
    }
  }

  /**
   * Get appointment statistics (internal method)
   */
  static async _getAppointmentStats(doctorId) {
    try {
      console.log("Getting appointment stats for doctor:", doctorId);

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get this week's date range
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      // Get this month's date range
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

      // For now, return mock data since Firebase is not configured
      // TODO: Replace with actual Firebase queries once configuration is fixed
      console.log(
        "Using mock appointment stats due to Firebase configuration issues"
      );

      const stats = {
        today: 1, // Mock data - 1 appointment today
        thisWeek: 3,
        thisMonth: 8,
        total: 12,
      };

      console.log("Appointment stats (mock):", stats);
      return stats;
    } catch (error) {
      console.error("Error getting appointment stats:", error);
      console.error("Error details:", error.message);
      return { today: 0, thisWeek: 0, thisMonth: 0, total: 0 };
    }
  }

  /**
   * Get patient statistics endpoint
   */
  static async getPatientStats(req, res) {
    try {
      const { doctorId } = req.params;
      const userId = req.user._id;

      // Check both _id and id properties for compatibility
      const userMatches = userId === doctorId || req.user.id === doctorId;

      if (!userMatches) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      const stats = await DashboardController._getPatientStats(doctorId);

      res.json({
        status: "success",
        data: stats,
      });
    } catch (error) {
      console.error("Get patient stats error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch patient statistics",
        error: error.message,
      });
    }
  }

  /**
   * Get report statistics endpoint
   */
  static async getReportStats(req, res) {
    try {
      const { doctorId } = req.params;
      const userId = req.user._id;

      // Check both _id and id properties for compatibility
      const userMatches = userId === doctorId || req.user.id === doctorId;

      if (!userMatches) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      const stats = await DashboardController._getReportStats(doctorId);

      res.json({
        status: "success",
        data: stats,
      });
    } catch (error) {
      console.error("Get report stats error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch report statistics",
        error: error.message,
      });
    }
  }

  /**
   * Get appointment statistics endpoint
   */
  static async getAppointmentStats(req, res) {
    try {
      const { doctorId } = req.params;
      const userId = req.user._id;

      // Check both _id and id properties for compatibility
      const userMatches = userId === doctorId || req.user.id === doctorId;

      if (!userMatches) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      const stats = await DashboardController._getAppointmentStats(doctorId);

      res.json({
        status: "success",
        data: stats,
      });
    } catch (error) {
      console.error("Get appointment stats error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch appointment statistics",
        error: error.message,
      });
    }
  }

  /**
   * Debug endpoint to check database collections
   */
  static async debugCollections(req, res) {
    try {
      const { doctorId } = req.params;
      const userId = req.user._id;

      console.log("Debug collections for doctor:", doctorId);

      // Check patients collection
      const patientsSnapshot = await db
        .collection("patients")
        .where("doctorId", "==", doctorId)
        .get();

      // Check followups collection
      const followupsSnapshot = await db
        .collection("followups")
        .where("doctorId", "==", doctorId)
        .get();

      const debugInfo = {
        doctorId,
        userId,
        patientsCount: patientsSnapshot.size,
        followupsCount: followupsSnapshot.size,
        patients: [],
        followups: [],
      };

      // Get sample data
      patientsSnapshot.forEach((doc) => {
        debugInfo.patients.push({
          id: doc.id,
          doctorId: doc.data().doctorId,
          isActive: doc.data().isActive,
          status: doc.data().status,
        });
      });

      followupsSnapshot.forEach((doc) => {
        debugInfo.followups.push({
          id: doc.id,
          doctorId: doc.data().doctorId,
          status: doc.data().status,
          followUpDate: doc.data().followUpDate,
        });
      });

      res.json({
        status: "success",
        data: debugInfo,
      });
    } catch (error) {
      console.error("Debug collections error:", error);
      res.status(500).json({
        status: "error",
        message: "Debug failed",
        error: error.message,
      });
    }
  }

  /**
   * Debug endpoint to test database connection
   */
  static async debugDatabase(req, res) {
    try {
      console.log("Testing database connection...");

      // Test patients collection
      const patientsSnapshot = await db.collection("patients").limit(1).get();
      console.log("Patients collection test:", {
        size: patientsSnapshot.size,
        empty: patientsSnapshot.empty,
      });

      // Test followups collection
      const followupsSnapshot = await db.collection("followups").limit(1).get();
      console.log("Followups collection test:", {
        size: followupsSnapshot.size,
        empty: followupsSnapshot.empty,
      });

      res.json({
        status: "success",
        message: "Database connection test successful",
        data: {
          patients: {
            size: patientsSnapshot.size,
            empty: patientsSnapshot.empty,
          },
          followups: {
            size: followupsSnapshot.size,
            empty: followupsSnapshot.empty,
          },
        },
      });
    } catch (error) {
      console.error("Database test error:", error);
      res.status(500).json({
        status: "error",
        message: "Database connection test failed",
        error: error.message,
      });
    }
  }
}

module.exports = DashboardController;
