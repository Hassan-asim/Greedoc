const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

// Load environment variables from root directory
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Initialize Firebase
const { admin, db } = require("./config/firebase");

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
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

// Firebase is initialized and ready to use
console.log("✅ Firebase initialized successfully");

// Firebase real-time messaging will be handled through Firestore listeners

// Start Health Agent if enabled
if (process.env.HEALTH_AGENT_ENABLED === "true") {
  const healthAgent = require("./services/healthAgent");
  healthAgent.start().catch(console.error);
}

// Start Notification Agent
const notificationAgent = require("./services/notificationAgent");
notificationAgent.start();

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
app.use("/api/ai", require("./routes/ai"));
app.use("/api/events", require("./routes/events"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/chat", require("./routes/chat"));

// Root API endpoint
app.get("/api", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to Greedoc API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      patients: "/api/patients",
      health: "/api/health",
      medications: "/api/medications",
      prescriptions: "/api/prescriptions",
      appointments: "/api/appointments",
      ai: "/api/ai",
      chat: "/api/chat",
    },
  });
});

// Favicon endpoint
app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Greedoc server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`🔥 Firebase real-time messaging enabled`);
});

module.exports = app;
