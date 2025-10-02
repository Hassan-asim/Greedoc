const { db } = require('../config/firebase');

class Medication {
  constructor(data) {
    this.id = data.id || null;
    this.userId = data.userId || '';
    this.name = data.name || '';
    this.genericName = data.genericName || '';
    this.brandName = data.brandName || '';
    this.dosage = data.dosage || { value: 0, unit: 'mg', form: 'tablet' };
    this.frequency = data.frequency || { timesPerDay: 1, schedule: [], daysOfWeek: [], interval: 'daily' };
    this.startDate = data.startDate || new Date();
    this.endDate = data.endDate || null;
    this.prescribedBy = data.prescribedBy || {};
    this.pharmacy = data.pharmacy || {};
    this.purpose = data.purpose || '';
    this.sideEffects = data.sideEffects || [];
    this.interactions = data.interactions || [];
    this.contraindications = data.contraindications || [];
    this.instructions = data.instructions || '';
    this.reminders = data.reminders || { enabled: true, advanceTime: 15, notificationTypes: { push: true, email: false, sms: false } };
    this.adherence = data.adherence || { trackingEnabled: true, missedDoses: [], adherenceRate: 100 };
    this.refills = data.refills || { remaining: 0, total: 0, lastRefillDate: null, nextRefillDate: null };
    this.cost = data.cost || { amount: 0, currency: 'USD', insuranceCovered: false, copay: 0 };
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.discontinuedReason = data.discontinuedReason || '';
    this.discontinuedDate = data.discontinuedDate || null;
    this.notes = data.notes || '';
    this.tags = data.tags || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Virtual properties
  get status() {
    if (!this.isActive) return 'discontinued';
    if (this.endDate && new Date() > this.endDate) return 'completed';
    if (this.refills.remaining === 0) return 'needs_refill';
    return 'active';
  }

  get nextDoseTime() {
    if (!this.isActive || !this.frequency.schedule.length) return null;
    
    const now = new Date();
    const today = now.toDateString();
    const currentTime = now.toTimeString().slice(0, 5);
    
    // Find next scheduled time today
    for (const schedule of this.frequency.schedule) {
      if (schedule.time > currentTime) {
        return new Date(`${today} ${schedule.time}`);
      }
    }
    
    // If no more doses today, return first dose tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const firstSchedule = this.frequency.schedule[0];
    
    return new Date(`${tomorrow.toDateString()} ${firstSchedule.time}`);
  }

  // Static methods
  static async findByUserId(userId, options = {}) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        active = null,
        orderBy = 'startDate',
        orderDirection = 'desc'
      } = options;
      
      let query = db.collection('medications')
        .where('userId', '==', userId)
        .orderBy(orderBy, orderDirection);
      
      // Apply filters
      if (active !== null) {
        query = query.where('isActive', '==', active);
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      if (page > 1) {
        const offset = (page - 1) * limit;
        query = query.offset(offset);
      }
      
      const snapshot = await query.get();
      const medications = [];
      
      snapshot.forEach(doc => {
        medications.push(new Medication({ id: doc.id, ...doc.data() }));
      });
      
      return medications;
    } catch (error) {
      throw new Error(`Error finding medications: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const medicationDoc = await db.collection('medications').doc(id).get();
      
      if (!medicationDoc.exists) {
        return null;
      }
      
      return new Medication({ id: medicationDoc.id, ...medicationDoc.data() });
    } catch (error) {
      throw new Error(`Error finding medication by ID: ${error.message}`);
    }
  }

  static async getActive(userId) {
    try {
      const snapshot = await db.collection('medications')
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .orderBy('startDate', 'desc')
        .get();
      
      const medications = [];
      snapshot.forEach(doc => {
        medications.push(new Medication({ id: doc.id, ...doc.data() }));
      });
      
      return medications;
    } catch (error) {
      throw new Error(`Error getting active medications: ${error.message}`);
    }
  }

  static async getDueForReminder(userId) {
    try {
      const snapshot = await db.collection('medications')
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .where('reminders.enabled', '==', true)
        .get();
      
      const medications = [];
      snapshot.forEach(doc => {
        const medication = new Medication({ id: doc.id, ...doc.data() });
        if (medication.isDue()) {
          medications.push(medication);
        }
      });
      
      return medications;
    } catch (error) {
      throw new Error(`Error getting due medications: ${error.message}`);
    }
  }

  // Instance methods
  async save() {
    try {
      const medicationData = this.toObject();
      delete medicationData.id; // Remove id from data to save
      
      if (this.id) {
        // Update existing medication
        medicationData.updatedAt = new Date();
        await db.collection('medications').doc(this.id).update(medicationData);
      } else {
        // Create new medication
        medicationData.createdAt = new Date();
        medicationData.updatedAt = new Date();
        const docRef = await db.collection('medications').add(medicationData);
        this.id = docRef.id;
      }
      
      return this;
    } catch (error) {
      throw new Error(`Error saving medication: ${error.message}`);
    }
  }

  async delete() {
    try {
      if (!this.id) {
        throw new Error('Cannot delete medication without ID');
      }
      
      await db.collection('medications').doc(this.id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting medication: ${error.message}`);
    }
  }

  isDue() {
    if (!this.isActive || !this.frequency.schedule.length) return false;
    
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    return this.frequency.schedule.some(schedule => {
      const scheduleTime = new Date(`${now.toDateString()} ${schedule.time}`);
      const timeDiff = scheduleTime.getTime() - now.getTime();
      
      // Check if it's within the reminder window
      return timeDiff >= 0 && timeDiff <= (this.reminders.advanceTime * 60 * 1000);
    });
  }

  async markDoseTaken(date = new Date()) {
    try {
      // Add to missed doses tracking or update adherence
      this.adherence.missedDoses = this.adherence.missedDoses || [];
      
      // Calculate adherence rate
      const totalDoses = this.frequency.timesPerDay * 30; // Assuming 30 days
      const missedCount = this.adherence.missedDoses.length;
      this.adherence.adherenceRate = Math.round(((totalDoses - missedCount) / totalDoses) * 100);
      
      await this.save();
      return this;
    } catch (error) {
      throw new Error(`Error marking dose as taken: ${error.message}`);
    }
  }

  toObject() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      genericName: this.genericName,
      brandName: this.brandName,
      dosage: this.dosage,
      frequency: this.frequency,
      startDate: this.startDate,
      endDate: this.endDate,
      prescribedBy: this.prescribedBy,
      pharmacy: this.pharmacy,
      purpose: this.purpose,
      sideEffects: this.sideEffects,
      interactions: this.interactions,
      contraindications: this.contraindications,
      instructions: this.instructions,
      reminders: this.reminders,
      adherence: this.adherence,
      refills: this.refills,
      cost: this.cost,
      isActive: this.isActive,
      discontinuedReason: this.discontinuedReason,
      discontinuedDate: this.discontinuedDate,
      notes: this.notes,
      tags: this.tags,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      status: this.status,
      nextDoseTime: this.nextDoseTime
    };
  }

  toJSON() {
    return this.toObject();
  }
}

module.exports = Medication;