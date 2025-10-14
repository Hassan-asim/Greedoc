const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/patients", require("./routes/patients"));
app.use("/api/health", require("./routes/health"));
app.use("/api/medications", require("./routes/medications"));
app.use("/api/prescriptions", require("./routes/prescriptions"));
app.use("/api/followups", require("./routes/followups"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/health-data", require("./routes/healthData"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/events", require("./routes/events"));
app.use("/api/notifications", require("./routes/notifications"));

// Health check endpoint
app.get("/api/health-check", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Greedoc API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Simple test endpoint
app.get("/api/test", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Test endpoint working",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong!"
        : err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
