const { db, messaging } = require('../config/firebase');
const axios = require('axios');

class NotificationAgent {
  constructor() {
    this._timer = null;
    this._isRunning = false;
    this._intervalMs = parseInt(process.env.NOTIFICATION_INTERVAL_MS || '60000');
    this._advanceMinutes = parseInt(process.env.NOTIFICATION_ADVANCE_MINUTES || '15');
  }

  start() {
    if (this._isRunning) return;
    this._isRunning = true;
    this._timer = setInterval(() => this._tick().catch(console.error), this._intervalMs);
    console.log(`🔔 NotificationAgent started. Interval=${this._intervalMs}ms, advance=${this._advanceMinutes}m`);
  }

  stop() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
    this._isRunning = false;
  }

  async _tick() {
    const now = new Date();
    await Promise.all([
      this._checkMedicationReminders(now),
      this._checkCalendarEvents(now)
    ]);
  }

  async _checkMedicationReminders(now) {
    // Find medications due in the next advance window
    const snapshot = await db.collection('medications')
      .where('isActive', '==', true)
      .where('reminders.enabled', '==', true)
      .get();

    const tasks = [];
    snapshot.forEach(doc => {
      const med = { id: doc.id, ...doc.data() };
      const schedule = (med.frequency && med.frequency.schedule) || [];
      if (!Array.isArray(schedule) || schedule.length === 0) return;
      for (const s of schedule) {
        if (!s.time) continue;
        const doseTime = this._makeDateFromTime(now, s.time);
        const diffMs = doseTime.getTime() - now.getTime();
        const windowMs = (med.reminders && med.reminders.advanceTime ? med.reminders.advanceTime : this._advanceMinutes) * 60 * 1000;
        if (diffMs >= 0 && diffMs <= windowMs) {
          tasks.push(this._notifyUser(med.userId, 'medication', med, { dueAt: doseTime.toISOString() }));
        }
      }
    });
    await Promise.all(tasks);
  }

  async _checkCalendarEvents(now) {
    // Today events with time within advance window
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const snap = await db.collection('calendarEvents')
      .where('date', '>=', startOfDay)
      .where('date', '<=', endOfDay)
      .get();

    const tasks = [];
    snap.forEach(doc => {
      const ev = { id: doc.id, ...doc.data() };
      if (!ev.time) return;
      const eventTime = this._makeDateFromTime(now, ev.time);
      const diffMs = eventTime.getTime() - now.getTime();
      const windowMs = this._advanceMinutes * 60 * 1000;
      if (diffMs >= 0 && diffMs <= windowMs) {
        tasks.push(this._notifyUser(ev.userId, 'event', ev, { dueAt: eventTime.toISOString() }));
      }
    });
    await Promise.all(tasks);
  }

  _makeDateFromTime(baseDate, hhmm) {
    const [h, m] = hhmm.split(':').map(x => parseInt(x, 10));
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), h || 0, m || 0, 0);
  }

  async _notifyUser(userId, kind, payload, meta = {}) {
    // Compose message (OpenAI preferred)
    const title = kind === 'medication' ? 'Medication reminder' : 'Upcoming event';
    const body = await this._composeNotification(kind, payload, meta);

    // Store in Firestore notifications
    const notificationDoc = {
      userId,
      title,
      body,
      kind,
      data: { id: payload.id || null, name: payload.name || payload.title || '', ...meta },
      isRead: false,
      createdAt: new Date()
    };
    await db.collection('notifications').add(notificationDoc);

    // Try push via FCM topic user_{userId}
    try {
      await messaging.send({
        topic: `user_${userId}`,
        notification: { title, body },
        data: {
          kind,
          userId: String(userId || '')
        }
      });
    } catch (e) {
      // Non-fatal if push fails
    }
  }

  async _composeNotification(kind, payload, meta) {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const glmApiKey = process.env.GLM_API_KEY;
    const base = kind === 'medication'
      ? `Reminder to take ${payload.name || 'your medication'}${payload.dosage?.value ? ` (${payload.dosage.value}${payload.dosage.unit || ''})` : ''}. Due at ${new Date(meta.dueAt).toLocaleTimeString()}.`
      : `Upcoming ${payload.type || 'event'}: ${payload.title || 'Scheduled item'} at ${new Date(meta.dueAt).toLocaleTimeString()}.`;

    const prompt = `Write a short, friendly, safety-conscious notification message for a patient.
Context: ${base}
Keep it under 220 characters.`;

    try {
      if (openaiApiKey) {
        const openaiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
        const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        const resp = await axios.post(openaiUrl, {
          model: openaiModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 60
        }, {
          headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
          timeout: parseInt(process.env.AI_REQUEST_TIMEOUT_MS || '60000')
        });
        return resp.data.choices[0].message.content;
      }
      if (glmApiKey) {
        const glmUrl = process.env.GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
        const glmModel = process.env.GLM_MODEL || 'glm-4';
        const resp = await axios.post(glmUrl, {
          model: glmModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 60
        }, {
          headers: { 'Authorization': `Bearer ${glmApiKey}`, 'Content-Type': 'application/json' },
          timeout: parseInt(process.env.AI_REQUEST_TIMEOUT_MS || '60000')
        });
        return resp.data.choices[0].message.content;
      }
    } catch (e) {
      // fallthrough
    }
    return base;
  }
}

module.exports = new NotificationAgent();


