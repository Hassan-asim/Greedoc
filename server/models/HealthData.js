const { db } = require("../config/firebase");
const { Timestamp } = require("firebase-admin/firestore");

class HealthData {
  constructor(data) {
    this.id = data.id || null;
    this.patientId = data.patientId || "";
    this.healthMetrics = data.healthMetrics || {
      heartRate: null,
      steps: null,
      sleep: null,
      bloodPressure: null,
      weight: null,
      temperature: null,
    };
    this.lastUpdated = data.lastUpdated
      ? new Date(data.lastUpdated)
      : new Date();
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  // Helper method to convert Firestore data
  static convertFirestoreData(data) {
    // Convert Firestore Timestamps to JavaScript Dates
    if (data.timestamp && data.timestamp.toDate) {
      data.timestamp = data.timestamp.toDate();
    }
    if (data.createdAt && data.createdAt.toDate) {
      data.createdAt = data.createdAt.toDate();
    }
    if (data.updatedAt && data.updatedAt.toDate) {
      data.updatedAt = data.updatedAt.toDate();
    }
    return data;
  }

  // Static methods for database operations
  static async createOrUpdate(data) {
    try {
      console.log("Creating/updating health data:", data);

      const { patientId, type, value, unit, timestamp, notes } = data;
      const now = new Date();

      try {
        // Check if patient health data already exists
        const patientDoc = await db
          .collection("patientHealthData")
          .doc(patientId)
          .get();

        let healthData;
        if (patientDoc.exists) {
          // Update existing document
          const existingData = patientDoc.data();
          healthData = new HealthData({
            id: patientId,
            ...existingData,
            healthMetrics: {
              ...existingData.healthMetrics,
              [type]: {
                value: value,
                unit: unit,
                timestamp: timestamp ? new Date(timestamp) : now,
                notes: notes || "",
              },
            },
            lastUpdated: now,
            updatedAt: now,
          });
        } else {
          // Create new document
          const healthMetrics = {};
          healthMetrics[type] = {
            value: value,
            unit: unit,
            timestamp: timestamp ? new Date(timestamp) : now,
            notes: notes || "",
          };

          healthData = new HealthData({
            id: patientId,
            patientId: patientId,
            healthMetrics: healthMetrics,
            lastUpdated: now,
            createdAt: now,
            updatedAt: now,
          });
        }

        // Save to Firestore
        await db
          .collection("patientHealthData")
          .doc(patientId)
          .set(healthData.toObject());

        console.log("Health data created/updated successfully:", healthData);
        return healthData;
      } catch (firebaseError) {
        console.log(
          "Firebase not configured, using mock storage:",
          firebaseError.message
        );

        // Fallback to mock storage
        if (!global.mockPatientHealthData) {
          global.mockPatientHealthData = new Map();
        }

        const existingData = global.mockPatientHealthData.get(patientId);
        let healthData;

        if (existingData) {
          // Update existing
          healthData = new HealthData({
            id: patientId,
            ...existingData,
            healthMetrics: {
              ...existingData.healthMetrics,
              [type]: {
                value: value,
                unit: unit,
                timestamp: timestamp ? new Date(timestamp) : now,
                notes: notes || "",
              },
            },
            lastUpdated: now,
            updatedAt: now,
          });
        } else {
          // Create new
          const healthMetrics = {};
          healthMetrics[type] = {
            value: value,
            unit: unit,
            timestamp: timestamp ? new Date(timestamp) : now,
            notes: notes || "",
          };

          healthData = new HealthData({
            id: patientId,
            patientId: patientId,
            healthMetrics: healthMetrics,
            lastUpdated: now,
            createdAt: now,
            updatedAt: now,
          });
        }

        global.mockPatientHealthData.set(patientId, healthData.toObject());
        console.log("Health data created/updated (mock):", healthData);
        return healthData;
      }
    } catch (error) {
      console.error("Error creating/updating health data:", error);
      throw new Error(`Error creating/updating health data: ${error.message}`);
    }
  }

  static async findByPatientId(patientId, options = {}) {
    try {
      console.log("Finding health data for patient:", patientId, options);

      try {
        // Get the patient's consolidated health data document
        const patientDoc = await db
          .collection("patientHealthData")
          .doc(patientId)
          .get();

        if (!patientDoc.exists) {
          return {
            data: [],
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
          };
        }

        const patientData = patientDoc.data();
        const healthData = new HealthData({
          id: patientId,
          ...patientData,
          lastUpdated: patientData.lastUpdated?.toDate
            ? patientData.lastUpdated.toDate()
            : patientData.lastUpdated,
          createdAt: patientData.createdAt?.toDate
            ? patientData.createdAt.toDate()
            : patientData.createdAt,
          updatedAt: patientData.updatedAt?.toDate
            ? patientData.updatedAt.toDate()
            : patientData.updatedAt,
        });

        console.log("Health data found:", {
          patientId,
          hasData: !!healthData.healthMetrics,
          metrics: Object.keys(healthData.healthMetrics || {}),
        });

        return {
          data: [healthData],
          total: 1,
          page: 1,
          limit: 1,
          totalPages: 1,
        };
      } catch (firebaseError) {
        console.log(
          "Firebase not configured, using mock storage:",
          firebaseError.message
        );

        // Fallback to mock storage
        if (!global.mockPatientHealthData) {
          global.mockPatientHealthData = new Map();
        }

        const mockData = global.mockPatientHealthData.get(patientId);
        if (!mockData) {
          return {
            data: [],
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
          };
        }

        const healthData = new HealthData(mockData);
        console.log("Health data found (mock):", {
          patientId,
          hasData: !!healthData.healthMetrics,
          metrics: Object.keys(healthData.healthMetrics || {}),
        });

        return {
          data: [healthData],
          total: 1,
          page: 1,
          limit: 1,
          totalPages: 1,
        };
      }
    } catch (error) {
      console.error("Error finding health data:", error);
      throw new Error(`Error finding health data: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      console.log("Finding health data by ID:", id);

      try {
        const doc = await db.collection("patientHealthData").doc(id).get();

        if (!doc.exists) {
          return null;
        }

        const data = doc.data();
        const healthData = new HealthData({
          id: doc.id,
          ...data,
          lastUpdated: data.lastUpdated?.toDate
            ? data.lastUpdated?.toDate()
            : data.lastUpdated,
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate()
            : data.createdAt,
          updatedAt: data.updatedAt?.toDate
            ? data.updatedAt.toDate()
            : data.updatedAt,
        });

        console.log("Health data found by ID:", healthData);
        return healthData;
      } catch (firebaseError) {
        console.log(
          "Firebase not configured, using mock storage:",
          firebaseError.message
        );

        // Fallback to mock storage
        if (!global.mockPatientHealthData) {
          global.mockPatientHealthData = new Map();
        }

        const mockData = global.mockPatientHealthData.get(id);
        if (!mockData) {
          return null;
        }

        const healthData = new HealthData(mockData);
        console.log("Health data found by ID (mock):", healthData);
        return healthData;
      }
    } catch (error) {
      console.error("Error finding health data by ID:", error);
      throw new Error(`Error finding health data by ID: ${error.message}`);
    }
  }

  async save() {
    try {
      console.log("Saving health data:", this);

      this.updatedAt = new Date();

      const updateData = {
        patientId: this.patientId,
        healthMetrics: this.healthMetrics,
        lastUpdated: this.lastUpdated,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };

      try {
        if (this.id) {
          // Update existing document
          await db.collection("patientHealthData").doc(this.id).set(updateData);
          console.log("Health data updated successfully:", this.id);
        } else {
          // Create new document
          const docRef = await db
            .collection("patientHealthData")
            .doc(this.patientId);
          this.id = this.patientId;
          await docRef.set(updateData);
          console.log("Health data created successfully:", this.id);
        }

        return this;
      } catch (firebaseError) {
        console.log(
          "Firebase not configured, using mock storage:",
          firebaseError.message
        );

        // Fallback to mock storage
        if (!global.mockPatientHealthData) {
          global.mockPatientHealthData = new Map();
        }

        if (this.id) {
          // Update existing mock data
          global.mockPatientHealthData.set(this.id, this.toObject());
          console.log("Health data updated (mock):", this.id);
        } else {
          // Create new mock data
          this.id = this.patientId;
          global.mockPatientHealthData.set(this.id, this.toObject());
          console.log("Health data created (mock):", this.id);
        }

        return this;
      }
    } catch (error) {
      console.error("Error saving health data:", error);
      throw new Error(`Error saving health data: ${error.message}`);
    }
  }

  async delete() {
    try {
      console.log("Deleting health data:", this.id);

      if (!this.id) {
        throw new Error("Cannot delete health data without an ID");
      }

      try {
        await db.collection("patientHealthData").doc(this.id).delete();
        console.log("Health data deleted successfully:", this.id);
        return true;
      } catch (firebaseError) {
        console.log(
          "Firebase not configured, using mock storage:",
          firebaseError.message
        );

        // Fallback to mock storage
        if (!global.mockPatientHealthData) {
          global.mockPatientHealthData = new Map();
        }

        global.mockPatientHealthData.delete(this.id);
        console.log("Health data deleted (mock):", this.id);
        return true;
      }
    } catch (error) {
      console.error("Error deleting health data:", error);
      throw new Error(`Error deleting health data: ${error.message}`);
    }
  }

  toObject() {
    return {
      id: this.id,
      patientId: this.patientId,
      healthMetrics: this.healthMetrics,
      lastUpdated: this.lastUpdated,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Helper methods for data analysis
  static getHealthMetrics() {
    return [
      {
        type: "steps",
        label: "Steps",
        unit: "steps",
        min: 0,
        max: 50000,
        step: 100,
        color: "text-blue-600",
      },
      {
        type: "heart_rate",
        label: "Heart Rate",
        unit: "bpm",
        min: 40,
        max: 200,
        step: 1,
        color: "text-red-600",
      },
      {
        type: "sleep",
        label: "Sleep Duration",
        unit: "hours",
        min: 0,
        max: 24,
        step: 0.5,
        color: "text-purple-600",
      },
      {
        type: "blood_pressure",
        label: "Blood Pressure",
        unit: "mmHg",
        min: 80,
        max: 200,
        step: 1,
        color: "text-green-600",
      },
      {
        type: "weight",
        label: "Weight",
        unit: "kg",
        min: 30,
        max: 200,
        step: 0.1,
        color: "text-orange-600",
      },
      {
        type: "temperature",
        label: "Body Temperature",
        unit: "°C",
        min: 35,
        max: 42,
        step: 0.1,
        color: "text-yellow-600",
      },
    ];
  }
}

module.exports = HealthData;
