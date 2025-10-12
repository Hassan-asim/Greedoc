// Simple script to check user authentication and health data
const express = require("express");
const app = express();

// Mock user data for testing
const mockUser = {
  _id: "test-patient-123",
  id: "test-patient-123",
  role: "patient",
  firstName: "Test",
  lastName: "Patient",
  email: "test@example.com",
};

console.log("Mock user data:", mockUser);
console.log("User ID (from _id):", mockUser._id);
console.log("User ID (from id):", mockUser.id);

// Test the ID extraction logic from the controller
const userId = mockUser._id || mockUser.id;
console.log("Extracted user ID:", userId);

console.log("This should match the patientId in health data: test-patient-123");
