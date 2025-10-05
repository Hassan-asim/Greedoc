const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware to authenticate JWT tokens
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    console.log("Auth middleware - Request:", {
      url: req.url,
      method: req.method,
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : "No token",
    });

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Access token required",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      return res.status(500).json({
        status: "error",
        message: "Server configuration error",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid token - user not found",
      });
    }

    // Ensure user object has required properties
    if (!user.id || !user.role) {
      return res.status(401).json({
        status: "error",
        message: "Invalid user data",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: "error",
        message: "Account is deactivated",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token expired",
      });
    }

    console.error("Auth middleware error:", error);
    res.status(500).json({
      status: "error",
      message: "Authentication error",
    });
  }
};

/**
 * Middleware to check if user has required role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    console.log("Authorization check:", {
      userRole: req.user.role,
      requiredRoles: roles,
      userAllowed: roles.includes(req.user.role),
      userId: req.user.id,
      userEmail: req.user.email,
    });

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: `Insufficient permissions. Required roles: ${roles.join(
          ", "
        )}, User role: ${req.user.role}`,
      });
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource
 */
const checkOwnership = (resourceUserIdField = "userId") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    // Admin users can access any resource
    if (req.user.role === "admin") {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId =
      req.params[resourceUserIdField] || req.body[resourceUserIdField];

    if (
      resourceUserId &&
      resourceUserId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: "error",
        message: "Access denied - you can only access your own resources",
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Doesn't fail if no token is provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId, type: "refresh" }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = {
  authenticateToken,
  authorize,
  checkOwnership,
  optionalAuth,
  generateToken,
  generateRefreshToken,
};
