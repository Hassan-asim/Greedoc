const { db } = require("./config/firebase");
const HealthData = require("./models/HealthData");

/**
 * Migration script to convert old health data structure to new consolidated structure
 * This script will:
 * 1. Read all health data from the old 'healthData' collection
 * 2. Group them by patientId
 * 3. Create consolidated documents in the new 'patientHealthData' collection
 */

async function migrateHealthData() {
  try {
    console.log("Starting health data migration...");

    // Get all existing health data from the old collection
    const oldHealthDataSnapshot = await db.collection("healthData").get();

    if (oldHealthDataSnapshot.empty) {
      console.log("No existing health data found to migrate.");
      return;
    }

    console.log(
      `Found ${oldHealthDataSnapshot.size} health data records to migrate.`
    );

    // Group data by patientId
    const patientDataMap = new Map();

    oldHealthDataSnapshot.forEach((doc) => {
      const data = doc.data();
      const patientId = data.patientId;

      if (!patientDataMap.has(patientId)) {
        patientDataMap.set(patientId, {
          patientId: patientId,
          healthMetrics: {},
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          lastUpdated: data.timestamp,
        });
      }

      const patientData = patientDataMap.get(patientId);

      // Convert old type names to new structure
      const typeMapping = {
        heart_rate: "heartRate",
        blood_pressure: "bloodPressure",
      };

      const newType = typeMapping[data.type] || data.type;

      patientData.healthMetrics[newType] = {
        value: data.value,
        unit: data.unit,
        timestamp: data.timestamp,
        notes: data.notes || "",
      };

      // Update timestamps
      if (
        data.timestamp &&
        new Date(data.timestamp) > new Date(patientData.lastUpdated)
      ) {
        patientData.lastUpdated = data.timestamp;
      }
      if (
        data.updatedAt &&
        new Date(data.updatedAt) > new Date(patientData.updatedAt)
      ) {
        patientData.updatedAt = data.updatedAt;
      }
    });

    console.log(`Grouped data for ${patientDataMap.size} patients.`);

    // Create new consolidated documents
    let migratedCount = 0;
    for (const [patientId, patientData] of patientDataMap) {
      try {
        // Create the new consolidated health data document
        const newHealthData = new HealthData({
          id: patientId,
          patientId: patientId,
          healthMetrics: patientData.healthMetrics,
          lastUpdated: patientData.lastUpdated,
          createdAt: patientData.createdAt,
          updatedAt: patientData.updatedAt,
        });

        // Save to the new collection
        await db
          .collection("patientHealthData")
          .doc(patientId)
          .set(newHealthData.toObject());

        migratedCount++;
        console.log(`Migrated health data for patient ${patientId}`);
      } catch (error) {
        console.error(`Error migrating data for patient ${patientId}:`, error);
      }
    }

    console.log(
      `Successfully migrated health data for ${migratedCount} patients.`
    );
    console.log("Migration completed!");

    // Optional: Archive old data (uncomment if you want to move old data to archive)
    /*
    console.log("Archiving old health data...");
    const batch = db.batch();
    oldHealthDataSnapshot.forEach((doc) => {
      const archiveRef = db.collection("healthDataArchive").doc(doc.id);
      batch.set(archiveRef, doc.data());
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log("Old health data archived successfully.");
    */
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

/**
 * Rollback function to restore old structure (if needed)
 */
async function rollbackMigration() {
  try {
    console.log("Starting rollback...");

    // Get all consolidated health data
    const consolidatedDataSnapshot = await db
      .collection("patientHealthData")
      .get();

    if (consolidatedDataSnapshot.empty) {
      console.log("No consolidated health data found to rollback.");
      return;
    }

    console.log(
      `Found ${consolidatedDataSnapshot.size} consolidated records to rollback.`
    );

    let rollbackCount = 0;
    for (const doc of consolidatedDataSnapshot.docs) {
      const data = doc.data();
      const patientId = data.patientId;

      // Convert each health metric back to individual documents
      for (const [type, metric] of Object.entries(data.healthMetrics)) {
        if (metric && typeof metric === "object" && metric.value) {
          try {
            // Convert new type names back to old structure
            const typeMapping = {
              heartRate: "heart_rate",
              bloodPressure: "blood_pressure",
            };

            const oldType = typeMapping[type] || type;

            const oldHealthData = {
              patientId: patientId,
              type: oldType,
              value: metric.value,
              unit: metric.unit,
              timestamp: metric.timestamp,
              notes: metric.notes || "",
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            };

            await db.collection("healthData").add(oldHealthData);
            rollbackCount++;
          } catch (error) {
            console.error(
              `Error rolling back metric ${type} for patient ${patientId}:`,
              error
            );
          }
        }
      }
    }

    console.log(
      `Successfully rolled back ${rollbackCount} health data records.`
    );
    console.log("Rollback completed!");
  } catch (error) {
    console.error("Rollback failed:", error);
    throw error;
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  const command = process.argv[2];

  if (command === "rollback") {
    rollbackMigration()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error("Rollback failed:", error);
        process.exit(1);
      });
  } else {
    migrateHealthData()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error("Migration failed:", error);
        process.exit(1);
      });
  }
}

module.exports = {
  migrateHealthData,
  rollbackMigration,
};
