const { db } = require('../config/firebase');

class User {
  constructor(data) {
    this.id = data.id || null;
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.email = data.email || '';
    this.password = data.password || '';
    this.dateOfBirth = data.dateOfBirth || null;
    this.gender = data.gender || '';
    this.phoneNumber = data.phoneNumber || '';
    this.address = data.address || {};
    this.emergencyContact = data.emergencyContact || {};
    this.medicalInfo = data.medicalInfo || {};
    this.preferences = data.preferences || {
      language: 'en',
      timezone: 'UTC',
      notifications: { email: true, sms: false, push: true },
      privacy: { shareData: false, anonymousUsage: true }
    };
    this.avatar = data.avatar || null;
    this.isEmailVerified = data.isEmailVerified || false;
    this.emailVerificationToken = data.emailVerificationToken || null;
    this.passwordResetToken = data.passwordResetToken || null;
    this.passwordResetExpires = data.passwordResetExpires || null;
    this.lastLogin = data.lastLogin || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.role = data.role || 'user';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
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
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Static methods
  static async findByEmail(email) {
    try {
      const usersRef = db.collection('users');
      const snapshot = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return new User({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const userDoc = await db.collection('users').doc(id).get();
      
      if (!userDoc.exists) {
        return null;
      }
      
      return new User({ id: userDoc.id, ...userDoc.data() });
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  static async findAll(options = {}) {
    try {
      const { page = 1, limit = 10, orderBy = 'createdAt', orderDirection = 'desc' } = options;
      const usersRef = db.collection('users');
      
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
      
      snapshot.forEach(doc => {
        users.push(new User({ id: doc.id, ...doc.data() }));
      });
      
      return users;
    } catch (error) {
      throw new Error(`Error finding users: ${error.message}`);
    }
  }

  // Instance methods
  async save() {
    try {
      const userData = this.toObject();
      delete userData.id; // Remove id from data to save
      
      if (this.id) {
        // Update existing user
        userData.updatedAt = new Date();
        await db.collection('users').doc(this.id).update(userData);
      } else {
        // Create new user
        userData.createdAt = new Date();
        userData.updatedAt = new Date();
        const docRef = await db.collection('users').add(userData);
        this.id = docRef.id;
      }
      
      return this;
    } catch (error) {
      throw new Error(`Error saving user: ${error.message}`);
    }
  }

  async delete() {
    try {
      if (!this.id) {
        throw new Error('Cannot delete user without ID');
      }
      
      await db.collection('users').doc(this.id).delete();
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
      address: this.address,
      emergencyContact: this.emergencyContact,
      medicalInfo: this.medicalInfo,
      preferences: this.preferences,
      avatar: this.avatar,
      isEmailVerified: this.isEmailVerified,
      emailVerificationToken: this.emailVerificationToken,
      passwordResetToken: this.passwordResetToken,
      passwordResetExpires: this.passwordResetExpires,
      lastLogin: this.lastLogin,
      isActive: this.isActive,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      fullName: this.fullName,
      age: this.age
    };
  }

  toJSON() {
    const obj = this.toObject();
    delete obj.password; // Remove password from JSON output
    return obj;
  }
}

module.exports = User;