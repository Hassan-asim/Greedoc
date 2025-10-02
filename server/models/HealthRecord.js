const { db } = require('../config/firebase');

class HealthRecord {
  constructor(data) {
    this.id = data.id || null;
    this.userId = data.userId || '';
    this.recordType = data.recordType || '';
    this.title = data.title || '';
    this.description = data.description || '';
    this.date = data.date || new Date();
    this.provider = data.provider || {};
    this.vitalSigns = data.vitalSigns || {};
    this.labResults = data.labResults || {};
    this.medications = data.medications || [];
    this.symptoms = data.symptoms || [];
    this.attachments = data.attachments || [];
    this.tags = data.tags || [];
    this.isPrivate = data.isPrivate || false;
    this.isVerified = data.isVerified || false;
    this.verifiedBy = data.verifiedBy || null;
    this.verifiedAt = data.verifiedAt || null;
    this.notes = data.notes || '';
    this.followUpRequired = data.followUpRequired || false;
    this.followUpDate = data.followUpDate || null;
    this.followUpNotes = data.followUpNotes || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Virtual properties
  get formattedDate() {
    return this.date.toLocaleDateString();
  }

  // Static methods
  static async findByUserId(userId, options = {}) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        type = null, 
        startDate = null, 
        endDate = null,
        orderBy = 'date',
        orderDirection = 'desc'
      } = options;
      
      let query = db.collection('healthRecords')
        .where('userId', '==', userId)
        .orderBy(orderBy, orderDirection);
      
      // Apply filters
      if (type) {
        query = query.where('recordType', '==', type);
      }
      
      if (startDate) {
        query = query.where('date', '>=', new Date(startDate));
      }
      
      if (endDate) {
        query = query.where('date', '<=', new Date(endDate));
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      if (page > 1) {
        const offset = (page - 1) * limit;
        query = query.offset(offset);
      }
      
      const snapshot = await query.get();
      const records = [];
      
      snapshot.forEach(doc => {
        records.push(new HealthRecord({ id: doc.id, ...doc.data() }));
      });
      
      return records;
    } catch (error) {
      throw new Error(`Error finding health records: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const recordDoc = await db.collection('healthRecords').doc(id).get();
      
      if (!recordDoc.exists) {
        return null;
      }
      
      return new HealthRecord({ id: recordDoc.id, ...recordDoc.data() });
    } catch (error) {
      throw new Error(`Error finding health record by ID: ${error.message}`);
    }
  }

  static async getRecent(userId, days = 30, limit = 20) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const snapshot = await db.collection('healthRecords')
        .where('userId', '==', userId)
        .where('date', '>=', cutoffDate)
        .orderBy('date', 'desc')
        .limit(limit)
        .get();
      
      const records = [];
      snapshot.forEach(doc => {
        records.push(new HealthRecord({ id: doc.id, ...doc.data() }));
      });
      
      return records;
    } catch (error) {
      throw new Error(`Error getting recent health records: ${error.message}`);
    }
  }

  static async getByType(userId, recordType, limit = 10) {
    try {
      const snapshot = await db.collection('healthRecords')
        .where('userId', '==', userId)
        .where('recordType', '==', recordType)
        .orderBy('date', 'desc')
        .limit(limit)
        .get();
      
      const records = [];
      snapshot.forEach(doc => {
        records.push(new HealthRecord({ id: doc.id, ...doc.data() }));
      });
      
      return records;
    } catch (error) {
      throw new Error(`Error getting health records by type: ${error.message}`);
    }
  }

  // Instance methods
  async save() {
    try {
      const recordData = this.toObject();
      delete recordData.id; // Remove id from data to save
      
      if (this.id) {
        // Update existing record
        recordData.updatedAt = new Date();
        await db.collection('healthRecords').doc(this.id).update(recordData);
      } else {
        // Create new record
        recordData.createdAt = new Date();
        recordData.updatedAt = new Date();
        const docRef = await db.collection('healthRecords').add(recordData);
        this.id = docRef.id;
      }
      
      return this;
    } catch (error) {
      throw new Error(`Error saving health record: ${error.message}`);
    }
  }

  async delete() {
    try {
      if (!this.id) {
        throw new Error('Cannot delete health record without ID');
      }
      
      await db.collection('healthRecords').doc(this.id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting health record: ${error.message}`);
    }
  }

  isRecent(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return this.date >= cutoffDate;
  }

  toObject() {
    return {
      id: this.id,
      userId: this.userId,
      recordType: this.recordType,
      title: this.title,
      description: this.description,
      date: this.date,
      provider: this.provider,
      vitalSigns: this.vitalSigns,
      labResults: this.labResults,
      medications: this.medications,
      symptoms: this.symptoms,
      attachments: this.attachments,
      tags: this.tags,
      isPrivate: this.isPrivate,
      isVerified: this.isVerified,
      verifiedBy: this.verifiedBy,
      verifiedAt: this.verifiedAt,
      notes: this.notes,
      followUpRequired: this.followUpRequired,
      followUpDate: this.followUpDate,
      followUpNotes: this.followUpNotes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      formattedDate: this.formattedDate
    };
  }

  toJSON() {
    return this.toObject();
  }
}

module.exports = HealthRecord;