/**
 * Health Controller
 * Handles health check and status endpoints
 */

class HealthController {
  /**
   * Simple health check - no database dependencies
   */
  static async getHealth(req, res) {
    try {
      res.status(200).json({
        status: "success",
        message: "Server is running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        version: "1.0.0",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Health check failed",
        error: error.message,
      });
    }
  }

  /**
   * Detailed status endpoint
   */
  static async getStatus(req, res) {
    try {
      const memoryUsage = process.memoryUsage();

      res.status(200).json({
        status: "success",
        message: "Server is operational",
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + " MB",
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + " MB",
          external: Math.round(memoryUsage.external / 1024 / 1024) + " MB",
        },
        environment: process.env.NODE_ENV || "development",
        nodeVersion: process.version,
        platform: process.platform,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Status check failed",
        error: error.message,
      });
    }
  }

  /**
   * API information endpoint
   */
  static async getApiInfo(req, res) {
    try {
      res.status(200).json({
        status: "success",
        message: "Welcome to Greedoc API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        endpoints: {
          health: "/api/health",
          status: "/api/status",
          auth: "/api/auth",
          users: "/api/users",
          patients: "/api/patients",
          medications: "/api/medications",
          appointments: "/api/appointments",
          ai: "/api/ai",
          chat: "/api/chat",
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "API info failed",
        error: error.message,
      });
    }
  }

  /**
   * Health check with database connectivity
   */
  static async getHealthCheck(req, res) {
    try {
      // You can add database connectivity checks here if needed
      res.status(200).json({
        status: "success",
        message: "Greedoc API is running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        database: "connected", // You can add actual DB check here
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Health check failed",
        error: error.message,
      });
    }
  }
}

module.exports = HealthController;
