const bcrypt = require("bcryptjs");
const { db } = require("../config/firebase");

class User {
  constructor(data) {
    this.id = data.id || null;
    this.firstName = data.firstName || "";
    this.lastName = data.lastName || "";
    this.email = data.email ? data.email.toLowerCase() : "";
    this.password = data.password || "";
    this.dateOfBirth = data.dateOfBirth || null;
    this.gender = data.gender || "";
    this.phoneNumber = data.phoneNumber || "";
    this.role = data.role || "user";
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();

    console.log(
      "User constructor - Role set to:",
      this.role,
      "from data:",
      data.role
    );

    // Doctor-specific fields
    this.specialization = data.specialization || null;
    this.licenseNumber = data.licenseNumber || null;

    // Patient-specific fields
    this.doctorId = data.doctorId || null;
    this.medicalInfo = data.medicalInfo || {};

    // Optional fields
    this.address = data.address || {};
    this.emergencyContact = data.emergencyContact || {};
    this.preferences = data.preferences || {
      language: "en",
      timezone: "UTC",
      notifications: { email: true, sms: false, push: true },
      privacy: { shareData: false, anonymousUsage: true },
    };
    this.avatar = data.avatar || null;
    this.isEmailVerified = data.isEmailVerified || false;
    this.emailVerificationToken = data.emailVerificationToken || null;
    this.passwordResetToken = data.passwordResetToken || null;
    this.passwordResetExpires = data.passwordResetExpires || null;
    this.lastLogin = data.lastLogin || null;
    this.fcmToken = data.fcmToken || null;
    this.isOnline = data.isOnline || false;
  }

  // Virtual properties
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  get age() {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  // Static methods
  static async findByEmail(email, includePassword = false) {
    try {
      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim();

      console.log("findByEmail called with:", {
        originalEmail: email,
        normalizedEmail: normalizedEmail,
        includePassword: includePassword,
      });

      const usersRef = db.collection("users");
      const snapshot = await usersRef
        .where("email", "==", normalizedEmail)
        .limit(1)
        .get();

      console.log("findByEmail query result:", {
        isEmpty: snapshot.empty,
        docsCount: snapshot.docs.length,
        queryEmail: normalizedEmail,
      });

      if (snapshot.empty) {
        console.log("No user found with email:", normalizedEmail);
        return null;
      }

      const doc = snapshot.docs[0];
      const userData = { id: doc.id, ...doc.data() };

      console.log("User found in database:", {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        isActive: userData.isActive,
        hasPassword: !!userData.password,
        passwordPreview: userData.password
          ? `${userData.password.substring(0, 20)}...`
          : "No password",
      });

      // Remove password from response unless specifically requested
      if (!includePassword && userData.password) {
        delete userData.password;
      }

      return new User(userData);
    } catch (error) {
      console.error("Error in findByEmail:", error);
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  static async findById(id, includePassword = false) {
    try {
      if (!id) {
        throw new Error("User ID is required");
      }

      const userDoc = await db.collection("users").doc(id).get();

      if (!userDoc.exists) {
        return null;
      }

      const userData = { id: userDoc.id, ...userDoc.data() };

      // Remove password from response unless specifically requested
      if (!includePassword && userData.password) {
        delete userData.password;
      }

      return new User(userData);
    } catch (error) {
      console.error("Error in findById:", error);
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        orderBy = "createdAt",
        orderDirection = "desc",
      } = options;
      const usersRef = db.collection("users");

      let query = usersRef.orderBy(orderBy, orderDirection);

      if (limit) {
        query = query.limit(limit);
      }

      if (page > 1) {
        const offset = (page - 1) * limit;
        query = query.offset(offset);
      }

      const snapshot = await query.get();
      const users = [];

      snapshot.forEach((doc) => {
        users.push(new User({ id: doc.id, ...doc.data() }));
      });

      return users;
    } catch (error) {
      throw new Error(`Error finding users: ${error.message}`);
    }
  }

  static async findByIdAndUpdate(id, updates, options = {}) {
    try {
      const userDoc = await db.collection("users").doc(id).get();

      if (!userDoc.exists) {
        return null;
      }

      const userData = { id: userDoc.id, ...userDoc.data() };
      const user = new User(userData);

      // Apply updates
      Object.keys(updates).forEach((key) => {
        if (updates[key] !== undefined) {
          user[key] = updates[key];
        }
      });

      // Hash password if it was updated
      if (updates.password) {
        await user.hashPassword();
      }

      user.updatedAt = new Date();
      await user.save();

      return user;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  static async findByRole(role) {
    try {
      const usersSnapshot = await db
        .collection("users")
        .where("role", "==", role)
        .get();
      const users = [];

      usersSnapshot.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        users.push(new User(userData));
      });

      return users;
    } catch (error) {
      throw new Error(`Error finding users by role: ${error.message}`);
    }
  }

  // Find patients by doctor ID
  static async findPatientsByDoctor(doctorId) {
    try {
      if (!doctorId) {
        throw new Error("Doctor ID is required");
      }

      // First get all patients for this doctor (without orderBy to avoid index requirement)
      const patientsSnapshot = await db
        .collection("users")
        .where("role", "==", "patient")
        .where("doctorId", "==", doctorId)
        .get();

      const patients = [];
      patientsSnapshot.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        patients.push(new User(userData));
      });

      // Sort by createdAt in descending order (newest first)
      patients.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA; // Descending order
      });

      return patients;
    } catch (error) {
      console.error("Error in findPatientsByDoctor:", error);
      throw new Error(`Error finding patients by doctor: ${error.message}`);
    }
  }

  // Find doctor by ID
  static async findDoctorById(doctorId) {
    try {
      const doctorDoc = await db.collection("users").doc(doctorId).get();

      if (!doctorDoc.exists) {
        return null;
      }

      const userData = { id: doctorDoc.id, ...doctorDoc.data() };

      // Verify it's a doctor
      if (userData.role !== "doctor") {
        return null;
      }

      return new User(userData);
    } catch (error) {
      throw new Error(`Error finding doctor by ID: ${error.message}`);
    }
  }

  // Check if email exists (for registration validation)
  static async emailExists(email) {
    try {
      const usersSnapshot = await db
        .collection("users")
        .where("email", "==", email.toLowerCase())
        .limit(1)
        .get();

      return !usersSnapshot.empty;
    } catch (error) {
      throw new Error(`Error checking email existence: ${error.message}`);
    }
  }

  // Password methods
  async hashPassword() {
    // No hashing - keep password in plain text
    if (this.password) {
      console.log("hashPassword called (no hashing - plain text):", {
        originalPassword: this.password,
        originalLength: this.password.length,
        userId: this.id,
        email: this.email,
      });

      // Keep password as is (plain text)
      console.log("Password kept in plain text:", {
        password: this.password,
        length: this.password.length,
      });

      // No hashing - password remains as plain text
    }
  }

  async comparePassword(candidatePassword) {
    console.log("comparePassword called (plain text):", {
      candidatePassword: candidatePassword,
      storedPassword: this.password,
      match: candidatePassword === this.password,
    });

    if (!this.password || !candidatePassword) {
      console.log("Missing password or candidate password");
      return false;
    }

    // Simple plain text comparison
    const result = candidatePassword === this.password;

    console.log("Plain text comparison result:", {
      candidatePassword: candidatePassword,
      storedPassword: this.password,
      result: result,
    });

    return result;
  }

  // Instance methods
  async save() {
    try {
      // Hash password before saving
      if (this.password && !this.password.startsWith("$2a$")) {
        console.log("Hashing password before saving");
        this.password = await bcrypt.hash(this.password, 12);
      }

      console.log("Saving user with hashed password:", {
        isNewUser: !this.id,
        hasPassword: !!this.password,
        passwordPreview: this.password
          ? this.password.substring(0, 10) + "..."
          : "No password",
      });

      const userData = this.toObject();
      delete userData.id; // Remove id from data to save

      console.log("Saving user data:", {
        ...userData,
        password: "[HIDDEN]",
        role: userData.role,
        email: userData.email,
      });

      if (this.id) {
        // Update existing user
        userData.updatedAt = new Date();
        await db.collection("users").doc(this.id).update(userData);
      } else {
        // Create new user
        userData.createdAt = new Date();
        userData.updatedAt = new Date();
        const docRef = await db.collection("users").add(userData);
        this.id = docRef.id;
        console.log("User created with ID:", this.id);
        console.log("User email saved as:", userData.email);
      }

      return this;
    } catch (error) {
      console.error("Error saving user:", error);
      throw new Error(`Error saving user: ${error.message}`);
    }
  }

  async delete() {
    try {
      if (!this.id) {
        throw new Error("Cannot delete user without ID");
      }

      await db.collection("users").doc(this.id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  toObject() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      phoneNumber: this.phoneNumber,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,

      // Doctor-specific fields
      specialization: this.specialization,
      licenseNumber: this.licenseNumber,

      // Patient-specific fields
      doctorId: this.doctorId,
      medicalInfo: this.medicalInfo,

      // Optional fields
      address: this.address,
      emergencyContact: this.emergencyContact,
      preferences: this.preferences,
      avatar: this.avatar,
      isEmailVerified: this.isEmailVerified,
      emailVerificationToken: this.emailVerificationToken,
      passwordResetToken: this.passwordResetToken,
      passwordResetExpires: this.passwordResetExpires,
      lastLogin: this.lastLogin,
      fcmToken: this.fcmToken,
      isOnline: this.isOnline,
      fullName: this.fullName,
      age: this.age,
    };
  }

  toJSON() {
    const obj = this.toObject();
    delete obj.password; // Remove password from JSON output
    return obj;
  }
}

module.exports = User;
