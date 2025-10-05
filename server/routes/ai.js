const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const axios = require('axios');
const { db } = require('../config/firebase');

const router = express.Router();

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with virtual doctor
 * @access  Private
 */
router.post('/chat', authenticateToken, [
  body('message').notEmpty().withMessage('Message is required'),
  body('type').isIn(['virtual_doctor', 'health_assistant']).withMessage('Valid type is required'),
  body('patientId').optional().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { message, context = {}, type, patientId: patientIdFromBody } = req.body;
    const userId = req.user.id;

    // Resolve patientId: patients talk for themselves; doctors may pass patientId
    const patientId = req.user.role === 'patient' ? userId : (patientIdFromBody || userId);

    // Load conversation history for context (last 20 messages)
    const history = await getConversationHistory(patientId, 20);

    // Get AI response based on type
    let aiResponse;
    if (type === 'virtual_doctor') {
      aiResponse = await getVirtualDoctorResponse(message, context, userId, history);
    } else {
      aiResponse = await getHealthAssistantResponse(message, context, userId);
    }

    // Persist user and assistant messages to Firestore
    await Promise.all([
      saveChatMessage(patientId, 'user', message, type, context),
      saveChatMessage(patientId, 'assistant', aiResponse, type, {})
    ]);

    res.json({ 
      status: 'success', 
      data: {
        response: aiResponse,
        timestamp: new Date(),
        type: type,
        providerUsed: res.locals.aiProvider || 'unknown'
      }
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to get AI response', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/ai/provider
 * @desc    Diagnostics for configured AI providers (no secrets)
 * @access  Private
 */
router.get('/provider', authenticateToken, async (req, res) => {
  try {
    const configured = {
      openai: !!process.env.OPENAI_API_KEY,
      openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      glm: !!process.env.GLM_API_KEY,
      glmModel: process.env.GLM_MODEL || 'glm-4',
      timeoutMs: parseInt(process.env.AI_REQUEST_TIMEOUT_MS || '60000')
    };
    res.json({ status: 'success', data: configured });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to read provider config' });
  }
});

/**
 * @route   GET /api/ai/chat/history/:patientId?
 * @desc    Get chat history with virtual doctor for a patient
 * @access  Private
 */
router.get('/chat/history/:patientId?', authenticateToken, async (req, res) => {
  try {
    const requestedPatientId = req.params.patientId || req.user.id;

    // Authorization: patients can only access their own; doctors can access any
    if (req.user.role !== 'doctor' && requestedPatientId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const messages = await getConversationHistory(requestedPatientId, 100);
    res.json({ status: 'success', data: messages });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get chat history', error: error.message });
  }
});

// Alias without param segment to avoid 404 when no patientId is provided
router.get('/chat/history', authenticateToken, async (req, res) => {
  try {
    const requestedPatientId = req.user.id;
    const messages = await getConversationHistory(requestedPatientId, 100);
    res.json({ status: 'success', data: messages });
  } catch (error) {
    console.error('Get chat history (alias) error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get chat history', error: error.message });
  }
});

/**
 * @route   GET /api/ai/insights/:patientId
 * @desc    Get AI health insights for a patient
 * @access  Private
 */
router.get('/insights/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user._id;

    // Only doctors can access patient insights
    if (req.user.role !== 'doctor' && userId !== patientId) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Access denied' 
      });
    }

    const insights = await generateHealthInsights(patientId);

    res.json({ 
      status: 'success', 
      data: insights
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to get health insights', 
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/ai/analyze-symptoms
 * @desc    Analyze patient symptoms
 * @access  Private
 */
router.post('/analyze-symptoms', authenticateToken, [
  body('symptoms').isArray().withMessage('Symptoms must be an array'),
  body('patientId').notEmpty().withMessage('Patient ID is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { symptoms, patientId } = req.body;
    const userId = req.user._id;

    // Only doctors can analyze symptoms for patients
    if (req.user.role !== 'doctor' && userId !== patientId) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Access denied' 
      });
    }

    const analysis = await analyzeSymptoms(symptoms, patientId);

    res.json({ 
      status: 'success', 
      data: analysis
    });
  } catch (error) {
    console.error('Analyze symptoms error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to analyze symptoms', 
      error: error.message 
    });
  }
});

// Helper functions
async function getVirtualDoctorResponse(message, context, userId, history = []) {
  // Prefer OpenAI if configured, else GLM, else fallback
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const glmApiKey = process.env.GLM_API_KEY;

  // Build messages with lightweight conversation context
  const systemPrompt = `You are a careful, empathetic virtual doctor. Provide safe, general guidance; do not diagnose or prescribe. 
Always recommend consulting licensed clinicians for serious issues. 
Ask 2-4 targeted follow-up questions when needed. Be concise but caring.`;

  const historyMessages = history.map(h => ({
    role: h.sender === 'assistant' ? 'assistant' : 'user',
    content: h.message
  }));

  const messages = [
    { role: 'system', content: systemPrompt },
    ...historyMessages.slice(-16),
    { role: 'user', content: buildUserContent(message, context) }
  ];

  if (openaiApiKey) {
    try {
      const openaiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
      const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      const response = await axios.post(openaiUrl, {
        model: openaiModel,
        messages,
        temperature: 0.6,
        max_tokens: 600,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
          ...(process.env.OPENAI_ORG_ID ? { 'OpenAI-Organization': process.env.OPENAI_ORG_ID } : {}),
          ...(process.env.OPENAI_PROJECT_ID ? { 'OpenAI-Project': process.env.OPENAI_PROJECT_ID } : {})
        },
        timeout: parseInt(process.env.AI_REQUEST_TIMEOUT_MS || '60000')
      });
      console.log('[AI] Provider=OpenAI, Model=' + (process.env.OPENAI_MODEL || 'gpt-4o-mini'));
      try { res.locals.aiProvider = 'openai'; } catch (_) {}
      return response.data.choices[0].message.content;
    } catch (err) {
      console.error('[AI] OpenAI call failed:', err?.response?.data || err.message);
    }
  }

  if (glmApiKey) {
    try {
      const glmApiUrl = process.env.GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
      const glmModel = process.env.GLM_MODEL || 'glm-4';
      const response = await axios.post(glmApiUrl, {
        model: glmModel,
        messages,
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${glmApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: parseInt(process.env.AI_REQUEST_TIMEOUT_MS || '60000')
      });
      console.log('[AI] Provider=GLM, Model=' + (process.env.GLM_MODEL || 'glm-4'));
      try { res.locals.aiProvider = 'glm'; } catch (_) {}
      return response.data.choices[0].message.content;
    } catch (err) {
      console.error('[AI] GLM call failed:', err?.response?.data || err.message);
    }
  }

  console.warn('[AI] No provider available; using fallback response');
  return getFallbackDoctorResponse(message);
}

function getFallbackDoctorResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
    return "I understand you're experiencing pain. Can you describe the location, intensity (1-10 scale), and when it started? This will help me provide better guidance. For severe pain, please consult a healthcare professional immediately.";
  } else if (lowerMessage.includes('medication') || lowerMessage.includes('medicine')) {
    return "I can help with medication-related questions. Are you asking about dosage, side effects, interactions, or something else specific? Remember to always consult your doctor before making any medication changes.";
  } else if (lowerMessage.includes('exercise') || lowerMessage.includes('workout')) {
    return "Exercise is great for your health! What type of physical activity are you interested in? I can provide personalized recommendations based on your health status. Start slowly if you're new to exercise.";
  } else if (lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
    return "Nutrition plays a crucial role in your health. What specific dietary questions do you have? I can help with meal planning, food choices, or dietary restrictions. A balanced diet is key to good health.";
  } else if (lowerMessage.includes('sleep') || lowerMessage.includes('tired')) {
    return "Sleep is essential for your health. How many hours are you sleeping? Are you having trouble falling asleep or staying asleep? Good sleep hygiene can make a big difference.";
  } else if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety')) {
    return "Stress and anxiety can affect your physical health. What's causing you stress? I can suggest relaxation techniques, but consider speaking with a mental health professional for ongoing concerns.";
  } else {
    return "Thank you for sharing that information. Could you provide more details so I can give you the most helpful advice? I'm here to assist with your health concerns. Remember, I'm a virtual assistant - for serious medical issues, please consult a healthcare professional.";
  }
}

async function getHealthAssistantResponse(message, context, userId) {
  // Similar to virtual doctor but with different tone
  return getFallbackDoctorResponse(message);
}

async function generateHealthInsights(patientId) {
  // This would typically analyze patient data and generate insights
  // For now, return mock insights
  return [
    {
      id: '1',
      title: 'Exercise Recommendation',
      description: 'Based on your recent activity patterns, consider adding 15 minutes of cardio to your morning routine.',
      type: 'recommendation',
      priority: 'medium',
      timestamp: new Date()
    },
    {
      id: '2',
      title: 'Health Prediction',
      description: 'Your current trends suggest improved cardiovascular health over the next 30 days.',
      type: 'prediction',
      priority: 'high',
      timestamp: new Date()
    }
  ];
}

async function analyzeSymptoms(symptoms, patientId) {
  // This would typically use AI to analyze symptoms
  // For now, return a basic analysis
  return {
    possibleConditions: ['Common cold', 'Allergies', 'Stress-related symptoms'],
    recommendations: [
      'Get plenty of rest',
      'Stay hydrated',
      'Monitor symptoms for 24-48 hours',
      'Consult a healthcare professional if symptoms worsen'
    ],
    urgency: 'low',
    timestamp: new Date()
  };
}

module.exports = router;

// ===== Helper: persistence and formatting =====
async function saveChatMessage(patientId, sender, message, type, context) {
  try {
    const doc = {
      chatRoomId: `virtual_doctor_${patientId}`,
      patientId,
      sender, // 'user' | 'assistant'
      message,
      messageType: 'text',
      aiType: type,
      context: context || {},
      isRead: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.collection('virtual_doctor_chats').add(doc);
  } catch (e) {
    console.error('Failed to save chat message:', e);
  }
}

async function getConversationHistory(patientId, limit = 20) {
  const snap = await db
    .collection('virtual_doctor_chats')
    .where('patientId', '==', patientId)
    .orderBy('createdAt', 'asc')
    .limit(limit)
    .get();
  const items = [];
  snap.forEach(doc => {
    const d = doc.data();
    items.push({
      id: doc.id,
      sender: d.sender,
      message: d.message,
      createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : d.createdAt
    });
  });
  return items;
}

function buildUserContent(message, context) {
  if (context && context.action) {
    return `User message: ${message}\nContext action: ${context.action}`;
  }
  return message;
}