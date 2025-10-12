const HealthData = require("./models/HealthData");

async function checkHealthData() {
  console.log("Checking health data...");

  try {
    // Check if there's any mock data
    if (global.mockHealthData) {
      console.log(
        "Mock health data exists:",
        global.mockHealthData.size,
        "entries"
      );

      // List all entries
      for (const [key, value] of global.mockHealthData.entries()) {
        console.log("Entry:", key, "->", {
          patientId: value.patientId,
          type: value.type,
          value: value.value,
          timestamp: value.timestamp,
        });
      }
    } else {
      console.log("No mock health data found");
    }

    // Try to find health data for a test patient
    const result = await HealthData.findByPatientId("test-patient-123", {
      page: 1,
      limit: 10,
    });

    console.log("Health data query result:", {
      total: result.total,
      data: result.data.length,
      hasData: result.data.length > 0,
    });

    if (result.data.length > 0) {
      console.log("Sample data:", result.data[0]);
    }
  } catch (error) {
    console.error("Error checking health data:", error);
  }
}

checkHealthData();
