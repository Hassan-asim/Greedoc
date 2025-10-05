const { db } = require("../config/firebase");
const { Timestamp } = require("firebase-admin/firestore");

class HealthData {
  constructor(data) {
    this.id = data.id || null;
    this.patientId = data.patientId || "";
    this.type = data.type || ""; // steps, heart_rate, sleep, blood_pressure, weight, temperature
    this.value = data.value || 0;
    this.unit = data.unit || "";
    this.timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
    this.notes = data.notes || "";
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
  static async create(data) {
    try {
      console.log("Creating health data:", data);

      const healthData = {
        patientId: data.patientId,
        type: data.type,
        value: data.value,
        unit: data.unit,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        notes: data.notes || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        // Try to create document in Firestore
        const docRef = await db.collection("healthData").add(healthData);

        console.log("Health data created with ID:", docRef.id);

        const createdData = new HealthData({
          id: docRef.id,
          ...healthData,
        });

        console.log("Health data created successfully:", createdData);
        return createdData;
      } catch (firebaseError) {
        console.log(
          "Firebase not configured, using mock storage:",
          firebaseError.message
        );

        // Fallback to mock storage with persistent simulation
        const mockId = `health_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const createdData = new HealthData({
          id: mockId,
          ...healthData,
        });

        // Store in memory for this session (simulates database)
        if (!global.mockHealthData) {
          global.mockHealthData = new Map();
        }
        global.mockHealthData.set(mockId, createdData.toObject());

        console.log("Health data created (mock):", createdData);
        return createdData;
      }
    } catch (error) {
      console.error("Error creating health data:", error);
      throw new Error(`Error creating health data: ${error.message}`);
    }
  }

  static async findByPatientId(patientId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        type = null,
        startDate = null,
        endDate = null,
        orderBy = "timestamp",
        orderDirection = "desc",
      } = options;

      console.log("Finding health data for patient:", patientId, options);

      try {
        // Build Firestore query
        let query = db
          .collection("healthData")
          .where("patientId", "==", patientId);

        // Add type filter if specified
        if (type) {
          query = query.where("type", "==", type);
        }

        // Add date range filters if specified
        if (startDate) {
          query = query.where("timestamp", ">=", new Date(startDate));
        }
        if (endDate) {
          query = query.where("timestamp", "<=", new Date(endDate));
        }

        // Add ordering
        query = query.orderBy(orderBy, orderDirection);

        // Add pagination
        const offset = (page - 1) * limit;
        if (offset > 0) {
          // For pagination, we need to get documents to skip
          const skipQuery = query.limit(offset);
          const skipSnapshot = await skipQuery.get();
          if (!skipSnapshot.empty) {
            const lastDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1];
            query = query.startAfter(lastDoc);
          }
        }

        // Execute query with limit
        const snapshot = await query.limit(limit).get();

        // Get total count for pagination (without limit)
        const countSnapshot = await db
          .collection("healthData")
          .where("patientId", "==", patientId)
          .get();

        const healthData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          healthData.push(
            new HealthData({
              id: doc.id,
              ...data,
              timestamp: data.timestamp?.toDate
                ? data.timestamp.toDate()
                : data.timestamp,
              createdAt: data.createdAt?.toDate
                ? data.createdAt.toDate()
                : data.createdAt,
              updatedAt: data.updatedAt?.toDate
                ? data.updatedAt.toDate()
                : data.updatedAt,
            })
          );
        });

        console.log("Health data found:", {
          total: countSnapshot.size,
          page,
          limit,
          data: healthData.length,
          patientId,
          sampleData: healthData.slice(0, 2),
        });

        return {
          data: healthData,
          total: countSnapshot.size,
          page,
          limit,
          totalPages: Math.ceil(countSnapshot.size / limit),
        };
      } catch (firebaseError) {
        console.log(
          "Firebase not configured, using mock storage:",
          firebaseError.message
        );

        // Fallback to mock storage
        if (!global.mockHealthData) {
          global.mockHealthData = new Map();
        }

        // Get all mock data for this patient
        const allMockData = Array.from(global.mockHealthData.values()).filter(
          (item) => item.patientId === patientId
        );

        // Apply filters
        let filteredData = allMockData;
        if (type) {
          filteredData = filteredData.filter((item) => item.type === type);
        }
        if (startDate) {
          const start = new Date(startDate);
          filteredData = filteredData.filter(
            (item) => new Date(item.timestamp) >= start
          );
        }
        if (endDate) {
          const end = new Date(endDate);
          filteredData = filteredData.filter(
            (item) => new Date(item.timestamp) <= end
          );
        }

        // Sort data
        filteredData.sort((a, b) => {
          const aTime = new Date(a.timestamp).getTime();
          const bTime = new Date(b.timestamp).getTime();
          return orderDirection === "desc" ? bTime - aTime : aTime - bTime;
        });

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        console.log("Health data found (mock):", {
          total: filteredData.length,
          patientId,
          allMockDataCount: allMockData.length,
          sampleData: paginatedData.slice(0, 2),
          page,
          limit,
          data: paginatedData.length,
        });

        return {
          data: paginatedData.map((item) => new HealthData(item)),
          total: filteredData.length,
          page,
          limit,
          totalPages: Math.ceil(filteredData.length / limit),
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
        const doc = await db.collection("healthData").doc(id).get();

        if (!doc.exists) {
          return null;
        }

        const data = doc.data();
        const healthData = new HealthData({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate
            ? data.timestamp.toDate()
            : data.timestamp,
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
        if (!global.mockHealthData) {
          global.mockHealthData = new Map();
        }

        const mockData = global.mockHealthData.get(id);
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
        type: this.type,
        value: this.value,
        unit: this.unit,
        timestamp: this.timestamp,
        notes: this.notes,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };

      try {
        if (this.id) {
          // Update existing document
          await db.collection("healthData").doc(this.id).update(updateData);
          console.log("Health data updated successfully:", this.id);
        } else {
          // Create new document
          const docRef = await db.collection("healthData").add(updateData);
          this.id = docRef.id;
          console.log("Health data created successfully:", this.id);
        }

        return this;
      } catch (firebaseError) {
        console.log(
          "Firebase not configured, using mock storage:",
          firebaseError.message
        );

        // Fallback to mock storage
        if (!global.mockHealthData) {
          global.mockHealthData = new Map();
        }

        if (this.id) {
          // Update existing mock data
          global.mockHealthData.set(this.id, this.toObject());
          console.log("Health data updated (mock):", this.id);
        } else {
          // Create new mock data
          const mockId = `health_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          this.id = mockId;
          global.mockHealthData.set(mockId, this.toObject());
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
        await db.collection("healthData").doc(this.id).delete();
        console.log("Health data deleted successfully:", this.id);
        return true;
      } catch (firebaseError) {
        console.log(
          "Firebase not configured, using mock storage:",
          firebaseError.message
        );

        // Fallback to mock storage
        if (!global.mockHealthData) {
          global.mockHealthData = new Map();
        }

        global.mockHealthData.delete(this.id);
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
      type: this.type,
      value: this.value,
      unit: this.unit,
      timestamp: this.timestamp,
      notes: this.notes,
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
