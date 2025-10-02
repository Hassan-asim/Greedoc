const express = require('express');
const { body, validationResult } = require('express-validator');
const OpenAI = require('openai');
const HealthRecord = require('../models/HealthRecord');
const Medication = require('../models/Medication');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * @route   POST /api/ai/health-insights
 * @desc    Get AI-powered health insights
 * @access  Private
 */
router.post('/health-insights', authenticateToken, [
  body('query').trim().notEmpty().withMessage('Query is required'),
  body('context').optional().isObject().withMessage('Context must be an object')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { query, context = {} } = req.body;
    const userId = req.user._id;

    // Get recent health data for context
    const recentRecords = await HealthRecord.find({ userId })
      .sort({ date: -1 })
      .limit(10);

    const activeMedications = await Medication.find({
      userId,
      isActive: true
    });

    // Prepare context for AI
    const healthContext = {
      user: {
        age: req.user.age,
        gender: req.user.gender,
        medicalInfo: req.user.medicalInfo
      },
      recentRecords: recentRecords.map(record => ({
        type: record.recordType,
        title: record.title,
        date: record.date,
        description: record.description
      })),
      medications: activeMedications.map(med => ({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency.timesPerDay
      }))
    };

    // Create AI prompt
    const systemPrompt = `You are Greedoc, an AI-powered health companion. You provide personalized health insights based on user data. 

IMPORTANT GUIDELINES:
- Always remind users to consult healthcare professionals for medical advice
- Do not provide specific medical diagnoses
- Focus on general health insights and recommendations
- Be encouraging and supportive
- Use the user's health data to provide personalized insights
- Keep responses concise but informative

User Health Context:
${JSON.stringify(healthContext, null, 2)}

Please provide helpful health insights based on the user's query and their health data.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      status: 'success',
      data: {
        query,
        response: aiResponse,
        timestamp: new Date().toISOString(),
        context: healthContext
      }
    });

  } catch (error) {
    console.error('AI health insights error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate health insights',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/ai/medication-analysis
 * @desc    Analyze medication interactions and provide insights
 * @access  Private
 */
router.post('/medication-analysis', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all active medications
    const medications = await Medication.find({
      userId,
      isActive: true
    });

    if (medications.length === 0) {
      return res.json({
        status: 'success',
        data: {
          analysis: "No active medications found for analysis.",
          recommendations: ["Continue maintaining a healthy lifestyle."]
        }
      });
    }

    // Prepare medication data for AI analysis
    const medicationData = medications.map(med => ({
      name: med.name,
      genericName: med.genericName,
      dosage: med.dosage,
      frequency: med.frequency,
      purpose: med.purpose,
      sideEffects: med.sideEffects,
      interactions: med.interactions
    }));

    const systemPrompt = `You are a medication analysis AI assistant. Analyze the user's medications and provide insights about:

1. Potential drug interactions
2. Side effect monitoring
3. Adherence recommendations
4. General medication management tips

IMPORTANT: Always remind users to consult their healthcare provider or pharmacist for specific medical advice.

User's Medications:
${JSON.stringify(medicationData, null, 2)}

Provide a comprehensive analysis focusing on safety and optimization.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Please analyze my medications and provide insights." }
      ],
      max_tokens: 800,
      temperature: 0.6
    });

    const analysis = completion.choices[0].message.content;

    res.json({
      status: 'success',
      data: {
        medications: medicationData,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Medication analysis error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to analyze medications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/ai/symptom-checker
 * @desc    AI-powered symptom analysis
 * @access  Private
 */
router.post('/symptom-checker', authenticateToken, [
  body('symptoms').isArray().withMessage('Symptoms must be an array'),
  body('symptoms.*.name').trim().notEmpty().withMessage('Symptom name is required'),
  body('symptoms.*.severity').isIn(['mild', 'moderate', 'severe', 'critical'])
    .withMessage('Invalid severity level'),
  body('duration').optional().trim().notEmpty().withMessage('Duration cannot be empty')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { symptoms, duration, additionalInfo } = req.body;
    const userId = req.user._id;

    // Get user's medical history for context
    const medicalHistory = await HealthRecord.find({
      userId,
      recordType: { $in: ['symptom', 'chronic_condition', 'allergy'] }
    }).sort({ date: -1 }).limit(20);

    const systemPrompt = `You are a symptom analysis AI assistant. Analyze the user's symptoms and provide insights.

IMPORTANT GUIDELINES:
- This is NOT a medical diagnosis
- Always recommend consulting healthcare professionals
- Focus on general guidance and when to seek medical attention
- Consider the user's medical history
- Be supportive and non-alarming

User Information:
- Age: ${req.user.age}
- Gender: ${req.user.gender}
- Medical History: ${JSON.stringify(medicalHistory.map(record => ({
      type: record.recordType,
      title: record.title,
      date: record.date
    })), null, 2)}

Current Symptoms:
${JSON.stringify(symptoms, null, 2)}
Duration: ${duration || 'Not specified'}
Additional Info: ${additionalInfo || 'None'}

Provide analysis focusing on:
1. Possible conditions to consider
2. When to seek immediate medical attention
3. General self-care recommendations
4. Follow-up actions`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Please analyze my symptoms." }
      ],
      max_tokens: 1000,
      temperature: 0.6
    });

    const analysis = completion.choices[0].message.content;

    // Save symptom record
    const symptomRecord = new HealthRecord({
      userId,
      recordType: 'symptom',
      title: 'Symptom Check',
      description: `AI symptom analysis for: ${symptoms.map(s => s.name).join(', ')}`,
      date: new Date(),
      symptoms: symptoms,
      notes: `Duration: ${duration || 'Not specified'}. Additional info: ${additionalInfo || 'None'}`
    });

    await symptomRecord.save();

    res.json({
      status: 'success',
      data: {
        symptoms,
        analysis,
        recordId: symptomRecord._id,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Symptom checker error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to analyze symptoms',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/ai/health-summary
 * @desc    Generate AI-powered health summary
 * @access  Private
 */
router.get('/health-summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get comprehensive health data
    const [recentRecords, medications, appointments] = await Promise.all([
      HealthRecord.find({ userId }).sort({ date: -1 }).limit(30),
      Medication.find({ userId, isActive: true }),
      HealthRecord.find({ 
        userId, 
        recordType: 'appointment',
        date: { $gte: new Date() }
      }).sort({ date: 1 }).limit(5)
    ]);

    const healthData = {
      user: {
        age: req.user.age,
        gender: req.user.gender,
        medicalInfo: req.user.medicalInfo
      },
      recentActivity: recentRecords.map(record => ({
        type: record.recordType,
        title: record.title,
        date: record.date
      })),
      medications: medications.map(med => ({
        name: med.name,
        adherence: med.adherence.adherenceRate
      })),
      upcomingAppointments: appointments.map(apt => ({
        title: apt.title,
        date: apt.date,
        provider: apt.provider
      }))
    };

    const systemPrompt = `You are Greedoc's AI health assistant. Generate a comprehensive health summary based on the user's data.

IMPORTANT:
- Provide encouraging and actionable insights
- Highlight positive trends and areas for improvement
- Suggest specific health goals
- Always remind users to consult healthcare professionals

User Health Data:
${JSON.stringify(healthData, null, 2)}

Generate a personalized health summary including:
1. Overall health status
2. Key trends and patterns
3. Medication adherence insights
4. Upcoming health priorities
5. Personalized recommendations`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate my health summary." }
      ],
      max_tokens: 1200,
      temperature: 0.7
    });

    const summary = completion.choices[0].message.content;

    res.json({
      status: 'success',
      data: {
        summary,
        healthData,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Health summary error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate health summary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
