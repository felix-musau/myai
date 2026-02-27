const express = require('express')
const router = express.Router()

// Sample facts and tips (for lack of actual ML chatbot)
const bodyFacts = [
  "Your heart beats about 100,000 times per day",
  "You have about 37.2 trillion cells in your body",
  "Your bones are stronger than steel",
  "Your nose can remember 50,000 different scents",
  "Your brain uses 20% of your body's energy",
  "Your liver has over 500 functions",
  "Your lungs have a surface area of about 70 square meters",
  "Your skin is the largest organ",
  "Your stomach gets a new lining every 3-4 days",
  "You lose about 4kg of skin cells each year",
  "Your brain is 73% water",
  "Human DNA could stretch from Earth to the sun and back"
]

const proTips = [
  "Drink at least 8 glasses of water daily to keep your body hydrated and functioning properly.",
  "Get 7-9 hours of sleep each night to allow your body to repair and recharge.",
  "Wash your hands frequently for at least 20 seconds to prevent the spread of germs.",
  "Apply ice to a sprain for 15-20 minutes every hour to reduce swelling.",
  "Take breaks every 30 minutes when working at a computer to prevent eye strain.",
  "Chew your food slowly to aid digestion and prevent overeating.",
  "Keep a first aid kit at home with bandages, antiseptic, and pain relievers.",
  "Check your posture while sitting - keep your back straight and shoulders relaxed.",
  "Replace your toothbrush every 3 months or after illness to maintain oral hygiene.",
  "Apply sunscreen with SPF 30+ daily to protect your skin from UV damage.",
  "Learn the Heimlich maneuver - it could save someone from choking.",
  "Keep emergency numbers saved in your phone for quick access.",
  "Elevate your legs for 15 minutes daily to improve circulation.",
  "Practice deep breathing exercises to reduce stress and anxiety.",
  "Keep medications in their original containers and check expiration dates regularly.",
  "Never ignore chest pain - seek medical attention immediately.",
  "Use the RICE method for injuries: Rest, Ice, Compression, Elevation.",
  "Stay up to date with vaccinations to protect yourself and others.",
  "Eat a balanced diet rich in fruits, vegetables, and lean proteins.",
  "Schedule regular health check-ups even when you feel healthy.",
  "Learn CPR - it can double or triple chances of survival during cardiac arrest."
]

// Store conversation context per user
const conversations = {}

// Get a random fact or tip (alternating)
router.get('/fact', (req, res) => {
  const facts = [...bodyFacts, ...proTips]
  const randomFact = facts[Math.floor(Math.random() * facts.length)]
  res.json({ fact: randomFact })
})

// Simple chatbot endpoint
router.post('/chat', (req, res) => {
  try {
    const { message } = req.body
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message required' })
    }

    const msg = message.toLowerCase().trim()
    let reply = ""

    // Simple rule-based responses
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('start')) {
      reply = "👋 Hi there! I'm your AI healthcare assistant. I can help you with:\n\n" +
              "• **Health facts** - Learn interesting facts about your body\n" +
              "• **Symptoms** - Describe your symptoms and I'll provide guidance\n" +
              "• **First aid tips** - Get emergency care advice\n" +
              "• **Prevention** - Learn how to stay healthy\n\n" +
              "What would you like to know about?"
    } else if (msg.includes('symptom') || msg.includes('pain') || msg.includes('sick')) {
      reply = "I can help with symptoms! Could you describe what you're experiencing?\n\n" +
              "Please tell me:\n" +
              "• What symptoms are you experiencing?\n" +
              "• How long have you had them?\n" +
              "• Any other relevant information?\n\n" +
              "⚠️ For emergencies, always call 911 or visit your nearest hospital."
    } else if (msg.includes('emergency') || msg.includes('urgent') || msg.includes('hospital')) {
      reply = "🚨 **EMERGENCY**: If this is a life-threatening situation:\n\n" +
              "• **CALL 911** immediately\n" +
              "• Go to the nearest emergency room\n" +
              "• Follow instructions from emergency responders\n\n" +
              "Do not rely on online diagnosis for emergencies. Get immediate professional help!"
    } else if (msg.includes('fact') || msg.includes('health') || msg.includes('body')) {
      const fact = bodyFacts[Math.floor(Math.random() * bodyFacts.length)]
      reply = `💡 **Health Fact**: ${fact}`
    } else if (msg.includes('tip') || msg.includes('advice') || msg.includes('prevent')) {
      const tip = proTips[Math.floor(Math.random() * proTips.length)]
      reply = `💪 **Health Tip**: ${tip}`
    } else {
      reply = "I'm here to help with health information and first aid advice. Try asking me about:\n\n" +
              "• Health facts\n" +
              "• Your symptoms\n" +
              "• Emergency care\n" +
              "• Prevention tips\n\n" +
              "What would you like to know?"
    }

    res.json({ reply })
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ error: 'Chat service error' })
  }
})

// Reset chat (clear conversation context)
router.post('/reset', (req, res) => {
  try {
    const defaultReply = "👋 Hello! I'm MyAI, your healthcare assistant.\n\n✨ Welcome to the HealthCare ChatBot!\n\n➡️ Say 'hello' or 'hi' to start your consultation."
    res.json({ reply: defaultReply })
  } catch (err) {
    console.error('Reset error:', err)
    res.status(500).json({ error: 'Reset failed' })
  }
})

module.exports = router
