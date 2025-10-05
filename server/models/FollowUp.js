const { db } = require("../config/firebase");
const { Timestamp } = require("firebase-admin/firestore");

class FollowUp {
  constructor(data) {
    this.id = data.id || null;
    this.patientId = data.patientId || "";
    this.doctorId = data.doctorId || "";
    this.patientName = data.patientName || "";
    this.doctorName = data.doctorName || "";
    this.prescriptionId = data.prescriptionId || "";
    this.followUpDate = data.followUpDate
      ? new Date(data.followUpDate)
      : new Date();
    this.followUpTime = data.followUpTime || "";
    this.purpose = data.purpose || "";
    this.notes = data.notes || "";
    this.status = data.status || "scheduled"; // scheduled, completed, cancelled, rescheduled
    this.priority = data.priority || "medium"; // low, medium, high, urgent
    this.reminderSent = data.reminderSent || false;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  // Helper method to convert Firestore data
  static convertFirestoreData(data) {
    // Convert Firestore Timestamps to JavaScript Dates
    if (data.followUpDate && data.followUpDate.toDate) {
      data.followUpDate = data.followUpDate.toDate();
    }
    if (data.createdAt && data.createdAt.toDate) {
      data.createdAt = data.createdAt.toDate();
    }
    if (data.updatedAt && data.updatedAt.toDate) {
      data.updatedAt = data.updatedAt.toDate();
    }
    return data;
  }

  // Virtual properties
  get isOverdue() {
    return new Date() > new Date(this.followUpDate);
  }

  get isUpcoming() {
    const now = new Date();
    const followUpDate = new Date(this.followUpDate);
    const diffTime = followUpDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }

  get isToday() {
    const today = new Date();
    const followUpDate = new Date(this.followUpDate);
    return followUpDate.toDateString() === today.toDateString();
  }

  // Static methods
  static async findByPatientId(patientId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status = null,
        orderBy = "followUpDate",
        orderDirection = "asc",
      } = options;

      console.log("Finding follow-ups for patientId:", patientId);
      console.log("Options:", options);

      let followUps = [];
      let snapshot;

      // Try with ordering first (requires composite index)
      try {
        let query = db
          .collection("followUps")
          .where("patientId", "==", patientId);

        // Apply status filter if provided
        if (status) {
          query = query.where("status", "==", status);
        }

        // Apply ordering
        query = query.orderBy(orderBy, orderDirection);

        // Apply limit
        if (limit) {
          query = query.limit(limit);
        }

        if (page > 1 && limit) {
          const offset = (page - 1) * limit;
          query = query.offset(offset);
        }

        snapshot = await query.get();
        console.log("Query with ordering succeeded");
      } catch (orderError) {
        // If ordering fails (likely due to missing index), retry without ordering
        console.log(
          "Query with ordering failed, retrying without ordering:",
          orderError.message
        );

        let query = db
          .collection("followUps")
          .where("patientId", "==", patientId);

        // Apply status filter if provided
        if (status) {
          query = query.where("status", "==", status);
        }

        // Apply limit without ordering
        if (limit) {
          query = query.limit(limit * (page || 1)); // Get more to handle pagination
        }

        snapshot = await query.get();
      }

      snapshot.forEach((doc) => {
        const data = FollowUp.convertFirestoreData(doc.data());
        followUps.push(new FollowUp({ id: doc.id, ...data }));
      });

      console.log(
        `Found ${followUps.length} follow-ups for patient ${patientId}`
      );

      // Sort in memory if needed
      if (orderBy && followUps.length > 0) {
        followUps.sort((a, b) => {
          const aValue = a[orderBy];
          const bValue = b[orderBy];

          if (orderDirection === "desc") {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });
      }

      // Handle pagination in memory if we couldn't do it in the query
      if (page > 1 && limit) {
        const start = (page - 1) * limit;
        followUps = followUps.slice(start, start + limit);
      }

      return followUps;
    } catch (error) {
      console.error("Error in findByPatientId:", error);
      console.error("Error details:", error.message);
      console.error("Error code:", error.code);
      throw new Error(`Error finding follow-ups: ${error.message}`);
    }
  }

  static async findByDoctorId(doctorId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status = null,
        orderBy = "followUpDate",
        orderDirection = "asc",
      } = options;

      console.log("Finding follow-ups for doctorId:", doctorId);
      console.log("Options:", options);

      let followUps = [];
      let snapshot;

      // Try with ordering first (requires composite index)
      try {
        let query = db
          .collection("followUps")
          .where("doctorId", "==", doctorId);

        // Apply status filter if provided
        if (status) {
          query = query.where("status", "==", status);
        }

        // Apply ordering
        query = query.orderBy(orderBy, orderDirection);

        // Apply limit
        if (limit) {
          query = query.limit(limit);
        }

        if (page > 1 && limit) {
          const offset = (page - 1) * limit;
          query = query.offset(offset);
        }

        snapshot = await query.get();
        console.log("Query with ordering succeeded");
      } catch (orderError) {
        // If ordering fails (likely due to missing index), retry without ordering
        console.log(
          "Query with ordering failed, retrying without ordering:",
          orderError.message
        );

        let query = db
          .collection("followUps")
          .where("doctorId", "==", doctorId);

        // Apply status filter if provided
        if (status) {
          query = query.where("status", "==", status);
        }

        // Apply limit without ordering
        if (limit) {
          query = query.limit(limit * (page || 1)); // Get more to handle pagination
        }

        snapshot = await query.get();
      }

      snapshot.forEach((doc) => {
        const data = FollowUp.convertFirestoreData(doc.data());
        followUps.push(new FollowUp({ id: doc.id, ...data }));
      });

      console.log(
        `Found ${followUps.length} follow-ups for doctor ${doctorId}`
      );

      // Sort in memory if needed
      if (orderBy && followUps.length > 0) {
        followUps.sort((a, b) => {
          const aValue = a[orderBy];
          const bValue = b[orderBy];

          if (orderDirection === "desc") {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });
      }

      // Handle pagination in memory if we couldn't do it in the query
      if (page > 1 && limit) {
        const start = (page - 1) * limit;
        followUps = followUps.slice(start, start + limit);
      }

      return followUps;
    } catch (error) {
      console.error("Error in findByDoctorId:", error);
      console.error("Error details:", error.message);
      console.error("Error code:", error.code);
      throw new Error(`Error finding follow-ups: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const followUpDoc = await db.collection("followUps").doc(id).get();

      if (!followUpDoc.exists) {
        return null;
      }

      const data = FollowUp.convertFirestoreData(followUpDoc.data());
      return new FollowUp({
        id: followUpDoc.id,
        ...data,
      });
    } catch (error) {
      throw new Error(`Error finding follow-up by ID: ${error.message}`);
    }
  }

  static async getUpcomingFollowUps(doctorId, days = 7) {
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      const snapshot = await db
        .collection("followUps")
        .where("doctorId", "==", doctorId)
        .where("status", "==", "scheduled")
        .where("followUpDate", ">=", today)
        .where("followUpDate", "<=", futureDate)
        .orderBy("followUpDate", "asc")
        .get();

      const followUps = [];
      snapshot.forEach((doc) => {
        const data = FollowUp.convertFirestoreData(doc.data());
        followUps.push(new FollowUp({ id: doc.id, ...data }));
      });

      return followUps;
    } catch (error) {
      throw new Error(`Error getting upcoming follow-ups: ${error.message}`);
    }
  }

  // Instance methods
  async save() {
    try {
      console.log("=== FOLLOW-UP SAVE METHOD ===");
      const followUpData = this.toFirestoreObject();
      delete followUpData.id; // Remove id from data to save

      console.log(
        "Follow-up data to save to Firebase:",
        JSON.stringify(followUpData, null, 2)
      );

      if (this.id) {
        // Update existing follow-up
        console.log("Updating existing follow-up with ID:", this.id);
        followUpData.updatedAt = new Date();
        await db.collection("followUps").doc(this.id).update(followUpData);
        console.log("Follow-up updated successfully in Firebase");
      } else {
        // Create new follow-up
        console.log("Creating new follow-up in Firebase");
        followUpData.createdAt = new Date();
        followUpData.updatedAt = new Date();

        console.log("About to call Firebase add method...");
        const docRef = await db.collection("followUps").add(followUpData);
        console.log("Firebase add completed, docRef:", docRef);
        this.id = docRef.id;
        console.log("New follow-up created with ID:", this.id);
      }

      console.log("Follow-up save completed successfully");
      return this;
    } catch (error) {
      console.error("Error saving follow-up to Firebase:", error);
      console.error("Error details:", error.message);
      console.error("Error code:", error.code);
      throw new Error(`Error saving follow-up: ${error.message}`);
    }
  }

  async delete() {
    try {
      if (!this.id) {
        throw new Error("Cannot delete follow-up without ID");
      }

      await db.collection("followUps").doc(this.id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting follow-up: ${error.message}`);
    }
  }

  async updateStatus(newStatus) {
    try {
      this.status = newStatus;
      this.updatedAt = new Date();
      await this.save();
      return this;
    } catch (error) {
      throw new Error(`Error updating follow-up status: ${error.message}`);
    }
  }

  toObject() {
    return {
      id: this.id,
      patientId: this.patientId,
      doctorId: this.doctorId,
      patientName: this.patientName,
      doctorName: this.doctorName,
      prescriptionId: this.prescriptionId,
      followUpDate: this.followUpDate,
      followUpTime: this.followUpTime,
      purpose: this.purpose,
      notes: this.notes,
      status: this.status,
      priority: this.priority,
      reminderSent: this.reminderSent,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isOverdue: this.isOverdue,
      isUpcoming: this.isUpcoming,
      isToday: this.isToday,
    };
  }

  toFirestoreObject() {
    return {
      patientId: this.patientId,
      doctorId: this.doctorId,
      patientName: this.patientName,
      doctorName: this.doctorName,
      prescriptionId: this.prescriptionId,
      followUpDate: this.followUpDate
        ? Timestamp.fromDate(this.followUpDate)
        : null,
      followUpTime: this.followUpTime,
      purpose: this.purpose,
      notes: this.notes,
      status: this.status,
      priority: this.priority,
      reminderSent: this.reminderSent,
      createdAt: this.createdAt
        ? Timestamp.fromDate(this.createdAt)
        : Timestamp.now(),
      updatedAt: this.updatedAt
        ? Timestamp.fromDate(this.updatedAt)
        : Timestamp.now(),
    };
  }

  toJSON() {
    return this.toObject();
  }
}

module.exports = FollowUp;
