const { db, messaging } = require('../config/firebase');
const User = require('../models/User');
const Chat = require('../models/Chat');
const axios = require('axios');

class HealthAgent {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.notificationInterval = parseInt(process.env.NOTIFICATION_INTERVAL) || 300000; // 5 minutes
  }

  async start() {
    if (this.isRunning) return;
    
    console.log('🤖 Health Agent starting...');
    this.isRunning = true;
    
    // Run immediately
    await this.processHealthData();
    
    // Set up interval
    this.interval = setInterval(async () => {
      await this.processHealthData();
    }, this.notificationInterval);
    
    console.log('✅ Health Agent started successfully');
  }

  async stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('🛑 Health Agent stopped');
  }

  async processHealthData() {
    try {
      console.log('🔍 Health Agent processing health data...');
      
      // Get all patients
      const patients = await User.findByRole('patient');
      
      for (const patient of patients) {
        await this.processPatientHealth(patient);
      }
      
      console.log('✅ Health Agent processing completed');
    } catch (error) {
      console.error('❌ Health Agent error:', error);
    }
  }

  async processPatientHealth(patient) {
    try {
      // Get patient's recent health data
      const healthData = await this.getPatientHealthData(patient.id);
      
      // Analyze health trends
      const analysis = await this.analyzeHealthTrends(healthData);
      
      // Generate notifications based on analysis
      await this.generateNotifications(patient, analysis);
      
      // Create calendar events based on doctor chats
      await this.createCalendarEvents(patient);
      
      // Set medication reminders
      await this.setMedicationReminders(patient);
      
    } catch (error) {
      console.error(`Error processing patient ${patient.id}:`, error);
    }
  }

  async getPatientHealthData(patientId) {
    // This would typically fetch from health records, vitals, etc.
    // For now, return mock data structure
    return {
      vitals: {
        bloodPressure: { systolic: 120, diastolic: 80, timestamp: new Date() },
        heartRate: { value: 72, timestamp: new Date() },
        temperature: { value: 98.6, timestamp: new Date() }
      },
      medications: [],
      appointments: [],
      recentChats: []
    };
  }

  async analyzeHealthTrends(healthData) {
    const analysis = {
      alerts: [],
      recommendations: [],
      reminders: []
    };

    // Analyze blood pressure
    if (healthData.vitals.bloodPressure) {
      const { systolic, diastolic } = healthData.vitals.bloodPressure;
      if (systolic > 140 || diastolic > 90) {
        analysis.alerts.push({
          type: 'high_blood_pressure',
          severity: 'high',
          message: 'Your blood pressure is elevated. Please consult your doctor.',
          action: 'schedule_appointment'
        });
      }
    }

    // Analyze heart rate
    if (healthData.vitals.heartRate) {
      const { value } = healthData.vitals.heartRate;
      if (value > 100) {
        analysis.alerts.push({
          type: 'high_heart_rate',
          severity: 'medium',
          message: 'Your heart rate is elevated. Consider relaxation techniques.',
          action: 'relaxation_exercise'
        });
      }
    }

    return analysis;
  }

  async generateNotifications(patient, analysis) {
    for (const alert of analysis.alerts) {
      await this.sendNotification(patient, {
        title: this.getAlertTitle(alert.type),
        body: alert.message,
        type: 'health_alert',
        data: {
          alertType: alert.type,
          severity: alert.severity,
          action: alert.action
        }
      });
    }

    for (const recommendation of analysis.recommendations) {
      await this.sendNotification(patient, {
        title: 'Health Recommendation',
        body: recommendation.message,
        type: 'recommendation',
        data: {
          recommendationType: recommendation.type
        }
      });
    }
  }

  async createCalendarEvents(patient) {
    try {
      // Get recent doctor chats
      const recentChats = await this.getRecentDoctorChats(patient.id);
      
      for (const chat of recentChats) {
        // Check if chat contains appointment scheduling
        if (this.containsAppointmentRequest(chat.message)) {
          await this.createAppointmentEvent(patient, chat);
        }
        
        // Check if chat contains medication changes
        if (this.containsMedicationChange(chat.message)) {
          await this.createMedicationEvent(patient, chat);
        }
      }
    } catch (error) {
      console.error('Error creating calendar events:', error);
    }
  }

  async setMedicationReminders(patient) {
    try {
      // Get patient's medications
      const medications = await this.getPatientMedications(patient.id);
      
      for (const medication of medications) {
        await this.scheduleMedicationReminder(patient, medication);
      }
    } catch (error) {
      console.error('Error setting medication reminders:', error);
    }
  }

  async sendNotification(patient, notification) {
    if (!patient.fcmToken) return;

    try {
      const payload = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          type: notification.type,
          ...notification.data
        },
        token: patient.fcmToken
      };

      await messaging.send(payload);
      console.log(`📱 Notification sent to patient ${patient.id}: ${notification.title}`);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  getAlertTitle(alertType) {
    const titles = {
      high_blood_pressure: '⚠️ High Blood Pressure Alert',
      high_heart_rate: '💓 Heart Rate Alert',
      medication_reminder: '💊 Medication Reminder',
      appointment_reminder: '📅 Appointment Reminder',
      health_recommendation: '💡 Health Recommendation'
    };
    return titles[alertType] || 'Health Alert';
  }

  async getRecentDoctorChats(patientId) {
    // This would typically fetch from chat history
    // For now, return empty array
    return [];
  }

  containsAppointmentRequest(message) {
    const keywords = ['appointment', 'schedule', 'meeting', 'visit', 'consultation'];
    return keywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  containsMedicationChange(message) {
    const keywords = ['medication', 'medicine', 'prescription', 'dosage', 'change'];
    return keywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  async createAppointmentEvent(patient, chat) {
    // Create calendar event based on chat
    console.log(`📅 Creating appointment event for patient ${patient.id}`);
  }

  async createMedicationEvent(patient, chat) {
    // Create medication reminder based on chat
    console.log(`💊 Creating medication event for patient ${patient.id}`);
  }

  async getPatientMedications(patientId) {
    // This would typically fetch from medications collection
    return [];
  }

  async scheduleMedicationReminder(patient, medication) {
    // Schedule medication reminder
    console.log(`⏰ Scheduling medication reminder for patient ${patient.id}`);
  }

  // AI-powered health analysis using GLM
  async analyzeWithAI(healthData, patientContext) {
    try {
      const glmApiKey = process.env.GLM_API_KEY;
      if (!glmApiKey) return null;

      const prompt = `Analyze this patient's health data and provide insights:
      
      Patient Context: ${JSON.stringify(patientContext)}
      Health Data: ${JSON.stringify(healthData)}
      
      Please provide:
      1. Health alerts (if any)
      2. Recommendations
      3. Reminders needed
      
      Respond in JSON format.`;

      const response = await axios.post(process.env.GLM_API_URL, {
        model: process.env.GLM_MODEL || 'glm-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${glmApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('AI analysis error:', error);
      return null;
    }
  }
}

module.exports = new HealthAgent();
