const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with virtual doctor
 * @access  Private
 */
router.post('/chat', authenticateToken, [
  body('message').notEmpty().withMessage('Message is required'),
  body('type').isIn(['virtual_doctor', 'health_assistant']).withMessage('Valid type is required'),
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

    const { message, context = {}, type } = req.body;
    const userId = req.user._id;

    // Get AI response based on type
    let aiResponse;
    if (type === 'virtual_doctor') {
      aiResponse = await getVirtualDoctorResponse(message, context, userId);
    } else {
      aiResponse = await getHealthAssistantResponse(message, context, userId);
    }

    res.json({ 
      status: 'success', 
      data: {
        response: aiResponse,
        timestamp: new Date(),
        type: type
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
async function getVirtualDoctorResponse(message, context, userId) {
  try {
    // Use GLM API for virtual doctor responses
    const glmApiKey = process.env.GLM_API_KEY;
    const glmApiUrl = process.env.GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    const glmModel = process.env.GLM_MODEL || 'glm-4';
    
    if (!glmApiKey) {
      // Fallback to rule-based responses if no API key
      return getFallbackDoctorResponse(message);
    }

    const response = await axios.post(glmApiUrl, {
      model: glmModel,
      messages: [
        {
          role: 'system',
          content: `You are a helpful virtual doctor assistant. Provide medical advice, answer health questions, and offer guidance. 
                   Always remind users to consult with real healthcare professionals for serious concerns. 
                   Be empathetic, professional, and informative. Keep responses concise but helpful.
                   Respond in a conversational and caring manner.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${glmApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('GLM API error:', error);
    return getFallbackDoctorResponse(message);
  }
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