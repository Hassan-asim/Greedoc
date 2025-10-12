const { db } = require("../config/firebase");
const { Timestamp } = require("firebase-admin/firestore");

class Prescription {
  constructor(data) {
    this.id = data.id || null;
    this.patientId = data.patientId || "";
    this.doctorId = data.doctorId || "";
    this.patientName = data.patientName || "";
    this.doctorName = data.doctorName || "";
    this.medications = data.medications || [];
    this.notes = data.notes || "";
    this.status = data.status || "draft"; // draft, active, completed, cancelled
    this.prescriptionDate = data.prescriptionDate
      ? new Date(data.prescriptionDate)
      : new Date();
    this.validUntil = data.validUntil ? new Date(data.validUntil) : null;
    this.followUpDate = data.followUpDate ? new Date(data.followUpDate) : null;
    this.diagnosis = data.diagnosis || "";
    this.allergies = data.allergies || [];
    this.contraindications = data.contraindications || [];
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  // Helper method to convert Firestore data
  static convertFirestoreData(data) {
    // Convert Firestore Timestamps to JavaScript Dates
    if (data.prescriptionDate && data.prescriptionDate.toDate) {
      data.prescriptionDate = data.prescriptionDate.toDate();
    }
    if (data.validUntil && data.validUntil.toDate) {
      data.validUntil = data.validUntil.toDate();
    }
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
  get isActive() {
    return this.status === "active";
  }

  get isExpired() {
    if (!this.validUntil) return false;
    return new Date() > new Date(this.validUntil);
  }

  get needsFollowUp() {
    if (!this.followUpDate) return false;
    return new Date() >= new Date(this.followUpDate);
  }

  // Static methods
  static async findByPatientId(patientId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status = null,
        orderBy = "prescriptionDate",
        orderDirection = "desc",
      } = options;

      console.log("Finding prescriptions for patientId:", patientId);
      console.log("Options:", options);

      let prescriptions = [];
      let snapshot;

      // Try with ordering first (requires composite index)
      try {
        let query = db
          .collection("prescriptions")
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
          .collection("prescriptions")
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
        const data = Prescription.convertFirestoreData(doc.data());
        prescriptions.push(new Prescription({ id: doc.id, ...data }));
      });

      console.log(
        `Found ${prescriptions.length} prescriptions for patient ${patientId}`
      );

      // Sort in memory if needed
      if (orderBy && prescriptions.length > 0) {
        prescriptions.sort((a, b) => {
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
        prescriptions = prescriptions.slice(start, start + limit);
      }

      return prescriptions;
    } catch (error) {
      console.error("Error in findByPatientId:", error);
      console.error("Error details:", error.message);
      console.error("Error code:", error.code);
      throw new Error(`Error finding prescriptions: ${error.message}`);
    }
  }

  static async findByDoctorId(doctorId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status = null,
        orderBy = "prescriptionDate",
        orderDirection = "desc",
      } = options;

      console.log("Finding prescriptions for doctorId:", doctorId);
      console.log("Options:", options);

      let prescriptions = [];
      let snapshot;

      // Try with ordering first (requires composite index)
      try {
        let query = db
          .collection("prescriptions")
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
          .collection("prescriptions")
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
        const data = Prescription.convertFirestoreData(doc.data());
        prescriptions.push(new Prescription({ id: doc.id, ...data }));
      });

      console.log(
        `Found ${prescriptions.length} prescriptions for doctor ${doctorId}`
      );

      // Sort in memory if needed
      if (orderBy && prescriptions.length > 0) {
        prescriptions.sort((a, b) => {
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
        prescriptions = prescriptions.slice(start, start + limit);
      }

      return prescriptions;
    } catch (error) {
      console.error("Error in findByDoctorId:", error);
      console.error("Error details:", error.message);
      console.error("Error code:", error.code);
      throw new Error(`Error finding prescriptions: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const prescriptionDoc = await db
        .collection("prescriptions")
        .doc(id)
        .get();

      if (!prescriptionDoc.exists) {
        return null;
      }

      const data = Prescription.convertFirestoreData(prescriptionDoc.data());
      return new Prescription({
        id: prescriptionDoc.id,
        ...data,
      });
    } catch (error) {
      throw new Error(`Error finding prescription by ID: ${error.message}`);
    }
  }

  static async getActivePrescriptions(patientId) {
    try {
      console.log("Getting active prescriptions for patientId:", patientId);

      let prescriptions = [];
      let snapshot;

      // Try with ordering first (requires composite index)
      try {
        snapshot = await db
          .collection("prescriptions")
          .where("patientId", "==", patientId)
          .where("status", "==", "active")
          .orderBy("prescriptionDate", "desc")
          .get();
        console.log("Query with ordering succeeded");
      } catch (orderError) {
        // If ordering fails (likely due to missing index), retry without ordering
        console.log(
          "Query with ordering failed, retrying without ordering:",
          orderError.message
        );

        snapshot = await db
          .collection("prescriptions")
          .where("patientId", "==", patientId)
          .where("status", "==", "active")
          .get();
      }

      snapshot.forEach((doc) => {
        const data = Prescription.convertFirestoreData(doc.data());
        prescriptions.push(new Prescription({ id: doc.id, ...data }));
      });

      // Sort in memory if needed
      prescriptions.sort((a, b) => {
        return b.prescriptionDate > a.prescriptionDate ? 1 : -1;
      });

      console.log(
        `Found ${prescriptions.length} active prescriptions for patient ${patientId}`
      );
      return prescriptions;
    } catch (error) {
      console.error("Error in getActivePrescriptions:", error);
      console.error("Error details:", error.message);
      console.error("Error code:", error.code);
      throw new Error(`Error getting active prescriptions: ${error.message}`);
    }
  }

  // Instance methods
  async save() {
    try {
      console.log("=== PRESCRIPTION SAVE METHOD ===");
      const prescriptionData = this.toFirestoreObject();
      delete prescriptionData.id; // Remove id from data to save

      console.log(
        "Prescription data to save to Firebase:",
        JSON.stringify(prescriptionData, null, 2)
      );
      console.log("Firebase db object:", typeof db);
      console.log("Firebase db collection method:", typeof db.collection);

      if (this.id) {
        // Update existing prescription
        console.log("Updating existing prescription with ID:", this.id);
        prescriptionData.updatedAt = new Date();
        await db
          .collection("prescriptions")
          .doc(this.id)
          .update(prescriptionData);
        console.log("Prescription updated successfully in Firebase");
      } else {
        // Create new prescription
        console.log("Creating new prescription in Firebase");
        prescriptionData.createdAt = new Date();
        prescriptionData.updatedAt = new Date();

        console.log("About to call Firebase add method...");
        const docRef = await db
          .collection("prescriptions")
          .add(prescriptionData);
        console.log("Firebase add completed, docRef:", docRef);
        this.id = docRef.id;
        console.log("New prescription created with ID:", this.id);
      }

      console.log("Prescription save completed successfully");
      return this;
    } catch (error) {
      console.error("Error saving prescription to Firebase:", error);
      console.error("Error details:", error.message);
      console.error("Error code:", error.code);
      throw new Error(`Error saving prescription: ${error.message}`);
    }
  }

  async delete() {
    try {
      if (!this.id) {
        throw new Error("Cannot delete prescription without ID");
      }

      await db.collection("prescriptions").doc(this.id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting prescription: ${error.message}`);
    }
  }

  async updateStatus(newStatus) {
    try {
      this.status = newStatus;
      this.updatedAt = new Date();
      await this.save();
      return this;
    } catch (error) {
      throw new Error(`Error updating prescription status: ${error.message}`);
    }
  }

  addMedication(medication) {
    this.medications.push({
      id: Date.now().toString(),
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      duration: medication.duration,
      instructions: medication.instructions,
      startDate: medication.startDate,
      endDate: medication.endDate,
      ...medication,
    });
  }

  removeMedication(medicationId) {
    this.medications = this.medications.filter(
      (med) => med.id !== medicationId
    );
  }

  toObject() {
    return {
      id: this.id,
      patientId: this.patientId,
      doctorId: this.doctorId,
      patientName: this.patientName,
      doctorName: this.doctorName,
      medications: this.medications,
      notes: this.notes,
      status: this.status,
      prescriptionDate: this.prescriptionDate,
      validUntil: this.validUntil,
      followUpDate: this.followUpDate,
      diagnosis: this.diagnosis,
      allergies: this.allergies,
      contraindications: this.contraindications,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
      isExpired: this.isExpired,
      needsFollowUp: this.needsFollowUp,
    };
  }

  toFirestoreObject() {
    return {
      patientId: this.patientId,
      doctorId: this.doctorId,
      patientName: this.patientName,
      doctorName: this.doctorName,
      medications: this.medications,
      notes: this.notes,
      status: this.status,
      prescriptionDate: this.prescriptionDate
        ? Timestamp.fromDate(this.prescriptionDate)
        : null,
      validUntil: this.validUntil ? Timestamp.fromDate(this.validUntil) : null,
      followUpDate: this.followUpDate
        ? Timestamp.fromDate(this.followUpDate)
        : null,
      diagnosis: this.diagnosis,
      allergies: this.allergies,
      contraindications: this.contraindications,
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

module.exports = Prescription;
