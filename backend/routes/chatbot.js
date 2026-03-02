const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const authMiddleware = require('../middleware/auth')
const { Low, JSONFile } = require('lowdb')

// ML Service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000'

// ============================================
// COMPREHENSIVE SYMPTOM MAPPING
// ============================================
const symptomMappings = {
  // Head/Brain symptoms
  'headache': 'headache', 'head ache': 'headache', 'head pain': 'headache',
  'my head hurts': 'headache', 'hurt head': 'headache', 'migraine': 'headache',
  
  'dizziness': 'dizziness', 'dizzy': 'dizziness', 'lightheaded': 'dizziness',
  'vertigo': 'dizziness', 'feeling faint': 'dizziness',
  
  'anxiety': 'anxiety', 'anxious': 'anxiety', 'nervous': 'anxiety', 'worried': 'anxiety',
  'depression': 'depression', 'depressed': 'depression', 'sad': 'depression',
  'confusion': 'altered_sensorium', 'confused': 'altered_sensorium',
  
  // Eye symptoms
  'eye pain': 'pain_behind_the_eyes', 'pain behind eye': 'pain_behind_the_eyes',
  'blurred vision': 'blurred_and_distorted_vision', 'blurry vision': 'blurred_and',
  'double_distorted_vision vision': 'blurred_and_distorted_vision',
  'yellow eyes': 'yellowing_of_eyes', 'red eyes': 'redness_of_eyes',
  
  // Ear/Nose/Throat
  'ear pain': 'ear_pain', 'earache': 'ear_pain',
  'sore throat': 'throat_irritation', 'throat pain': 'throat_irritation',
  'runny nose': 'runny_nose', 'stuffy nose': 'congestion', 'congestion': 'congestion',
  'sneezing': 'continuous_sneezing', 'cough': 'cough', 'coughing': 'cough',
  
  // Respiratory
  'breathing difficulty': 'breathlessness', 'shortness of breath': 'breathlessness',
  'cant breathe': 'breathlessness', 'chest pain': 'chest_pain',
  'fast heart rate': 'fast_heart_rate', 'heart racing': 'fast_heart_rate',
  
  // Gastrointestinal
  'stomach pain': 'stomach_pain', 'stomach ache': 'stomach_pain', 'belly pain': 'stomach_pain',
  'nausea': 'nausea', 'nauseous': 'nausea', 'feel sick': 'nausea',
  'vomiting': 'vomiting', 'vomit': 'vomiting', 'throwing up': 'vomiting',
  'diarrhea': 'diarrhoea', 'loose stools': 'diarrhoea',
  'constipation': 'constipation', 'bloody stool': 'bloody_stool',
  'indigestion': 'indigestion', 'acid reflux': 'acidity', 'heartburn': 'acidity',
  'loss of appetite': 'loss_of_appetite', 'no appetite': 'loss_of_appetite',
  'increased appetite': 'increased_appetite',
  
  // Urinary
  'burning urination': 'burning_micturition', 'painful urination': 'burning_micturition',
  'frequent urination': 'polyuria',
  
  // Skin symptoms
  'skin rash': 'skin_rash', 'rash': 'skin_rash',
  'itching': 'itching', 'itchy': 'itching',
  'yellow skin': 'yellowish_skin', 'jaundice': 'yellowish_skin',
  'pale skin': 'pallor', 'pale': 'pallor',
  
  // General symptoms
  'fever': 'high_fever', 'high temperature': 'high_fever', 'febrile': 'high_fever',
  'mild fever': 'mild_fever',
  'fatigue': 'fatigue', 'tired': 'fatigue', 'tiredness': 'fatigue', 'exhausted': 'fatigue',
  'weakness': 'fatigue', 'no energy': 'fatigue',
  'chills': 'chills', 'shivering': 'shivering',
  'sweating': 'sweating', 'sweat': 'sweating', 'night sweats': 'sweating',
  'dehydration': 'dehydration', 'dry mouth': 'dehydration', 'thirsty': 'dehydration',
  'weight loss': 'weight_loss', 'weight gain': 'weight_gain',
  'joint pain': 'joint_pain', 'muscle pain': 'muscle_pain', 'muscle ache': 'muscle_pain',
  'neck pain': 'neck_pain', 'back pain': 'back_pain',
  'cramps': 'cramps', 'swelling': 'swelling_joints', 'swollen': 'swelling_joints',
  'malaise': 'malaise', 'unwell': 'malaise',
  'phlegm': 'phlegm', 'mucus': 'phlegm',
  'obesity': 'obesity', 'overweight': 'obesity',
  'swollen legs': 'swollen_legs', 'swollen feet': 'swollen_extremeties',
  'thyroid': 'enlarged_thyroid', 'brittle nails': 'brittle_nails',
  'slurred speech': 'slurred_speech', 'knee pain': 'knee_pain', 'hip pain': 'hip_joint_pain',
  'balance problems': 'loss_of_balance', 'unsteady': 'unsteadiness',
  'body side weakness': 'weakness_of_one_body_side',
  'smell loss': 'loss_of_smell', 'cant smell': 'loss_of_smell',
  'urination problems': 'bladder_discomfort', 'gas': 'passage_of_gases',
  'restlessness': 'restlessness', 'restless': 'restlessness',
  'insomnia': 'lack_of_concentration', 'cant sleep': 'lack_of_concentration',
  'mood swings': 'mood_swings',
  'spots': 'red_spots_over_body', 'red spots': 'red_spots_over_body',
  'pimples': 'pus_filled_pimples', 'acne': 'pus_filled_pimples',
  'bloated': 'swelling_of_stomach', 'belly swelling': 'swelling_of_stomach',
  'lymph nodes': 'swelled_lymph_nodes', 'swollen glands': 'swelled_lymph_nodes',
  'sunken eyes': 'sunken_eyes',
  'ulcers': 'ulcers_on_tongue', 'mouth ulcer': 'ulcers_on_tongue',
  'cold hands': 'cold_hands_and_feets', 'cold feet': 'cold_hands_and_feets',
  'blood sugar': 'irregular_sugar_level', 'sugar level': 'irregular_sugar_level',
}

// Model feature names
const modelFeatures = [
  'itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing', 'shivering',
  'chills', 'joint_pain', 'stomach_pain', 'acidity', 'ulcers_on_tongue', 'muscle_wasting',
  'vomiting', 'burning_micturition', 'spotting_ urination', 'fatigue', 'weight_gain',
  'anxiety', 'cold_hands_and_feets', 'mood_swings', 'weight_loss', 'restlessness',
  'lethargy', 'patches_in_throat', 'irregular_sugar_level', 'cough', 'high_fever',
  'sunken_eyes', 'breathlessness', 'sweating', 'dehydration', 'indigestion', 'headache',
  'yellowish_skin', 'dark_urine', 'nausea', 'loss_of_appetite', 'pain_behind_the_eyes',
  'back_pain', 'constipation', 'abdominal_pain', 'diarrhoea', 'mild_fever', 'yellow_urine',
  'yellowing_of_eyes', 'acute_liver_failure', 'fluid_overload', 'swelling_of_stomach',
  'swelled_lymph_nodes', 'malaise', 'blurred_and_distorted_vision', 'phlegm',
  'throat_irritation', 'redness_of_eyes', 'sinus_pressure', 'runny_nose', 'congestion',
  'chest_pain', 'weakness_in_limbs', 'fast_heart_rate', 'pain_during_bowel_movements',
  'pain_in_anal_region', 'bloody_stool', 'irritation_in_anus', 'neck_pain', 'dizziness',
  'cramps', 'bruising', 'obesity', 'swollen_legs', 'swollen_blood_vessels',
  'puffy_face_and_eyes', 'enlarged_thyroid', 'brittle_nails', 'swollen_extremeties',
  'excessive_hunger', 'extra_marital_contacts', 'drying_and_tingling_lips', 'slurred_speech',
  'knee_pain', 'hip_joint_pain', 'muscle_weakness', 'stiff_neck', 'swelling_joints',
  'movement_stiffness', 'spinning_movements', 'loss_of_balance', 'unsteadiness',
  'weakness_of_one_body_side', 'loss_of_smell', 'bladder_discomfort', 'foul_smell_of urine',
  'continuous_feel_of_urine', 'passage_of_gases', 'internal_itching', 'toxic_look_(typhos)',
  'depression', 'irritability', 'muscle_pain', 'altered_sensorium', 'red_spots_over_body',
  'belly_pain', 'abnormal_menstruation', 'dischromic _patches', 'watering_from_eyes',
  'increased_appetite', 'polyuria', 'family_history', 'mucoid_sputum', 'rusty_sputum',
  'lack_of_concentration', 'visual_disturbances', 'receiving_blood_transfusion',
  'receiving_unsterile_injections', 'coma', 'stomach_bleeding', 'distention_of_abdomen',
  'history_of_alcohol_consumption', 'blood_in_sputum', 'prominent_veins_on_calf',
  'palpitations', 'painful_walking', 'pus_filled_pimples', 'blackheads', 'scurring',
  'skin_peeling', 'silver_like_dusting', 'small_dents_in_nails', 'inflammatory_nails',
  'blister', 'red_sore_around_nose', 'yellow_crust_ooze'
]

// ============================================
// PRECAUTION DATA FROM CSV
// ============================================
const precautionMap = {}
try {
  const precautionData = fs.readFileSync(path.join(__dirname, '../../symptom_precaution.csv'), 'utf8')
  const lines = precautionData.split('\n').slice(1)
  lines.forEach(line => {
    const parts = line.split(',')
    if (parts.length >= 2) {
      const disease = parts[0].replace(/"/g, '').trim()
      const precautions = parts.slice(1).map(p => p.replace(/"/g, '').trim()).filter(p => p)
      precautionMap[disease] = precautions
    }
  })
} catch (e) {
  console.log('Could not load precaution data')
}

// ============================================
// CONVERSATION STORAGE
// ============================================
const conversations = {}

// ============================================
// HEALTH TIPS AND FACTS
// ============================================
const healthTips = [
  "Drink at least 8 glasses of water daily to stay hydrated.",
  "Get 7-9 hours of sleep each night for proper body recovery.",
  "Wash your hands frequently for at least 20 seconds to prevent germs.",
  "Apply ice to sprains for 15-20 minutes every hour to reduce swelling.",
  "Take breaks every 30 minutes when working at a computer to prevent eye strain.",
  "Chew your food slowly to aid digestion and prevent overeating.",
  "Keep a first aid kit at home with bandages, antiseptic, and pain relievers.",
  "Check your posture while sitting - keep your back straight.",
  "Replace your toothbrush every 3 months or after illness.",
  "Apply sunscreen with SPF 30+ daily to protect your skin.",
  "Learn the Heimlich maneuver - it could save someone from choking.",
  "Keep emergency numbers saved in your phone.",
  "Elevate your legs for 15 minutes daily to improve circulation.",
  "Practice deep breathing exercises to reduce stress.",
  "Never ignore chest pain - seek medical attention immediately.",
  "Use the RICE method for injuries: Rest, Ice, Compression, Elevation.",
  "Stay up to date with vaccinations to protect yourself.",
  "Eat a balanced diet rich in fruits, vegetables, and lean proteins.",
  "Schedule regular health check-ups even when you feel healthy.",
  "Learn CPR - it can double or triple survival chances during cardiac arrest."
]

const bodyFacts = [
  "Your heart beats about 100,000 times per day.",
  "You have about 37.2 trillion cells in your body.",
  "Your bones are stronger than steel.",
  "Your nose can remember 50,000 different scents.",
  "Your brain uses 20% of your body's energy.",
  "Your liver has over 500 functions.",
  "Your lungs have a surface area of about 70 square meters.",
  "Your skin is the largest organ.",
  "Your stomach gets a new lining every 3-4 days.",
  "You lose about 4kg of skin cells each year.",
  "Your brain is 73% water.",
  "Human DNA could stretch from Earth to the sun and back."
]

// ============================================
// HELPER FUNCTIONS
// ============================================

function extractSymptoms(message) {
  const lowerMsg = message.toLowerCase()
  const foundSymptoms = new Set()
  
  for (const [phrase, symptom] of Object.entries(symptomMappings)) {
    if (lowerMsg.includes(phrase)) {
      if (modelFeatures.includes(symptom)) {
        foundSymptoms.add(symptom)
      }
    }
  }
  
  for (const feature of modelFeatures) {
    const featureUnderscore = feature.replace(/_/g, ' ')
    if (lowerMsg.includes(feature) || lowerMsg.includes(featureUnderscore)) {
      foundSymptoms.add(feature)
    }
  }
  
  return Array.from(foundSymptoms)
}

async function getPrediction(symptoms) {
  try {
    const symptomDict = {}
    for (const s of symptoms) {
      symptomDict[s] = 1
    }
    
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, {
      symptoms: symptomDict
    }, {
      timeout: 10000
    })
    
    return {
      disease: response.data.disease,
      confidence: response.data.confidence || 0
    }
  } catch (error) {
    console.error('ML service error:', error.message)
    return null
  }
}

function getClarifyingQuestions(disease, currentSymptoms) {
  const questionBank = {
    'Common Cold': [
      'Do you have a runny nose or congestion?',
      'Are you experiencing sore throat?',
      'Do you have any sneezing?'
    ],
    'Flu': [
      'Do you have body aches or muscle pain?',
      'Are you feeling very tired?',
      'Do you have a sore throat?'
    ],
    'Malaria': [
      'Have you been to any malaria-prone area recently?',
      'Do you experience chills and shivering?',
      'Do you have excessive sweating?'
    ],
    'Dengue': [
      'Do you have severe headache, especially behind the eyes?',
      'Are you experiencing joint and muscle pain?',
      'Do you notice any skin rash or red spots?'
    ],
    'Typhoid': [
      'Do you have abdominal pain?',
      'Are you experiencing constipation or diarrhea?',
      'Do you feel weak and fatigued?'
    ],
    'Pneumonia': [
      'Do you have chest pain while breathing?',
      'Are you coughing up phlegm or mucus?',
      'Do you experience shortness of breath?'
    ],
    'Tuberculosis': [
      'Are you coughing for more than 2 weeks?',
      'Do you cough up blood?',
      'Do you have night sweats?'
    ],
    'Heart attack': [
      'Do you have pain radiating to your arm or jaw?',
      'Are you experiencing shortness of breath?',
      'Do you have sweating and nausea?'
    ],
    'Diabetes': [
      'Are you urinating more frequently than usual?',
      'Do you feel very thirsty all the time?',
      'Are you experiencing blurred vision?'
    ],
    'Hypertension': [
      'Do you have frequent headaches?',
      'Are you experiencing dizziness?',
      'Do you have any vision problems?'
    ],
    'Migraine': [
      'Is the headache throbbing or pulsating?',
      'Does light make the headache worse?',
      'Do you feel nauseous with the headache?'
    ],
    'Asthma': [
      'Do you wheeze when breathing?',
      'Is your breathing worse at night?',
      'Do you have chest tightness?'
    ],
    'Gastroenteritis': [
      'Are you vomiting?',
      'Do you have diarrhea?',
      'Is there blood in your stool?'
    ],
    'Food Poisoning': [
      'Did you eat something unusual recently?',
      'Are you experiencing both vomiting and diarrhea?',
      'Do you have abdominal cramps?'
    ],
    'Urinary tract infection': [
      'Do you have burning sensation while urinating?',
      'Do you urinate frequently but in small amounts?',
      'Is your urine cloudy?'
    ],
    'Kidney infection': [
      'Do you have pain in your back or side?',
      'Do you have fever and chills?',
      'Are you experiencing nausea?'
    ],
    'Liver disease': [
      'Is your urine dark colored?',
      'Are your eyes or skin yellow?',
      'Do you have abdominal swelling?'
    ],
    'Anemia': [
      'Are you feeling dizzy or lightheaded?',
      'Is your skin pale?',
      'Do you feel very tired all the time?'
    ],
    'Thyroid': [
      'Have you noticed weight changes?',
      'Are you feeling unusually tired?',
      'Do you have temperature sensitivity?'
    ],
    'Arthritis': [
      'Are your joints swollen or red?',
      'Is the joint stiffness worse in the morning?',
      'Do you have limited movement in affected joints?'
    ],
    'Depression': [
      'Have you lost interest in activities you enjoy?',
      'Are you having trouble sleeping?',
      'Do you feel hopeless most of the day?'
    ],
    'Anxiety': [
      'Do you feel nervous or worried most of the time?',
      'Do you have trouble sleeping due to worry?',
      'Do you experience physical symptoms like racing heart?'
    ],
    'Allergy': [
      'Do you have itchy or watery eyes?',
      'Are your symptoms seasonal?',
      'Do you have skin rash or hives?'
    ]
  }
  
  return questionBank[disease] || [
    'Can you describe the pain location?',
    'How long have you been experiencing these symptoms?',
    'Do you have any fever?'
  ]
}

function getAnswer(answer) {
  const lower = answer.toLowerCase()
  const positivePatterns = /\b(yes|yeah|yep|yep|true|correct|right|exactly|definitely|absolutely|sure|ok|sure|indeed|obviously|clearly|definitely|of course)\b/i
  const negativePatterns = /\b(no|nope|nah|not|false|wrong|incorrect|never|don'?t|doesn'?t|isn'?t|aren'?t|wasn'?t|weren'?t)\b/i
  
  if (positivePatterns.test(lower)) return 'yes'
  if (negativePatterns.test(lower)) return 'no'
  return 'uncertain'
}

function isGreeting(msg) {
  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'howdy', 'hi there', 'hello there']
  const lower = msg.toLowerCase()
  return greetings.some(g => lower.includes(g))
}

function isThanks(msg) {
  const thanks = ['thank', 'thanks', 'thankyou', 'thx', 'appreciate', 'grateful']
  const lower = msg.toLowerCase()
  return thanks.some(t => lower.includes(t))
}

function isGoodbye(msg) {
  const goodbyes = ['bye', 'goodbye', 'see you', 'later', 'farewell', 'take care', 'good night', 'goodnight', 'cya']
  const lower = msg.toLowerCase()
  return goodbyes.some(g => lower.includes(g))
}

function isHealthTipRequest(msg) {
  const tips = ['health tip', 'health advice', 'tip', 'tips', 'advice', 'how to stay healthy', 'stay healthy']
  const lower = msg.toLowerCase()
  return tips.some(t => lower.includes(t))
}

function isFactRequest(msg) {
  const facts = ['fact', 'did you know', 'interesting', 'fun fact']
  const lower = msg.toLowerCase()
  return facts.some(f => lower.includes(f))
}

function isRestartRequest(msg) {
  const restarts = ['restart', 'start over', 'reset', 'new chat', 'begin']
  const lower = msg.toLowerCase()
  return restarts.some(r => lower.includes(r))
}

function isDoneRequest(msg) {
  const dones = ['done', 'finished', 'complete', 'thats all', 'thats it', 'nothing else']
  const lower = msg.toLowerCase()
  return dones.some(d => lower.includes(d))
}

// Save consultation to history
async function saveConsultation(req, state) {
  try {
    const consultFile = path.join(__dirname, '..', 'db', 'consultations.json')
    const adapter = new JSONFile(consultFile)
    const db = new Low(adapter)
    await db.read()
    db.data = db.data || { consultations: [] }
    
    db.data.consultations.push({
      id: Date.now(),
      user_id: req.user?.id || 'unknown',
      username: req.user?.username || 'unknown',
      name: state.data.name,
      gender: state.data.gender,
      age: state.data.age,
      conditions: state.data.conditions,
      symptoms: state.data.symptoms,
      disease: state.data.prediction,
      created_at: new Date().toISOString()
    })
    await db.write()
    console.log('Consultation saved to history')
  } catch (err) {
    console.error('Error saving consultation:', err)
  }
}

// ============================================
// MAIN CHAT ENDPOINT
// ============================================
router.post('/message', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body
    const msg = message ? message.trim() : ''
    
    const userKey = req.user && req.user.username ? req.user.username : (req.ip || req.headers['x-forwarded-for'] || 'anon')
    let state = conversations[userKey]
    
    // Handle reset/restart
    if (isRestartRequest(msg)) {
      delete conversations[userKey]
      return res.json({ 
        reply: "👋 Hello! I'm MyAI, your healthcare assistant. I'll guide you through a quick health check-up.\n\nFirst, what should I call you?" 
      })
    }
    
    // Handle goodbye
    if (isGoodbye(msg)) {
      const name = state?.data?.name || 'friend'
      delete conversations[userKey]
      return res.json({ 
        reply: `Goodbye, ${name}! Take care of your health. If you need me again, just refresh or start a new chat. 😊` 
      })
    }
    
    // Handle thanks
    if (isThanks(msg)) {
      const name = state?.data?.name || 'friend'
      return res.json({ 
        reply: `You're welcome, ${name}! 😊 Is there anything else I can help you with? You can tell me about any symptoms, ask for health tips, or just chat.` 
      })
    }
    
    // Handle health tips request
    if (isHealthTipRequest(msg)) {
      const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)]
      return res.json({ 
        reply: `💡 Here's a health tip for you:\n\n${randomTip}\n\nWould you like another tip, or shall we continue with your health check-up?` 
      })
    }
    
    // Handle facts request
    if (isFactRequest(msg)) {
      const randomFact = bodyFacts[Math.floor(Math.random() * bodyFacts.length)]
      return res.json({ 
        reply: `🤓 Did you know?\n\n${randomFact}\n\nInteresting, right? Would you like to know more, or shall we continue with your health check-up?` 
      })
    }
    
    // Handle casual chat (not in conversation)
    if (!msg) {
      return res.json({ 
        reply: "👋 Hello! I'm MyAI, your healthcare assistant. I'll guide you through a quick health check-up.\n\nFirst, what should I call you?" 
      })
    }
    
    // Initialize new conversation
    if (!state) {
      conversations[userKey] = {
        stage: 'name',
        data: {
          name: '',
          gender: '',
          age: '',
          conditions: [],
          symptoms: [],
          prediction: '',
          confidence: 0,
          followupsAsked: 0,
          followupAnswers: [],
          questions: []
        }
      }
      return res.json({ 
        reply: "👋 Hello! I'm MyAI, your healthcare assistant. I'll guide you through a quick health check-up.\n\nFirst, what should I call you?" 
      })
    }
    
    // ============================================
    // STAGE 1: NAME
    // ============================================
    if (state.stage === 'name') {
      const name = msg.trim()
      state.data.name = name
      state.stage = 'gender'
      return res.json({ 
        reply: `Nice to meet you, ${name}! 😊\n\nNow, may I ask your gender? (male/female/prefer not to say)` 
      })
    }
    
    // ============================================
    // STAGE 2: GENDER
    // ============================================
    if (state.stage === 'gender') {
      const gender = msg.toLowerCase()
      if (gender.includes('male') || gender.includes('man') || gender.includes('boy')) {
        state.data.gender = 'male'
      } else if (gender.includes('female') || gender.includes('woman') || gender.includes('girl')) {
        state.data.gender = 'female'
      } else if (gender.includes('prefer') || gender.includes('other') || gender.includes('non-binary')) {
        state.data.gender = 'other'
      } else {
        state.data.gender = 'undisclosed'
      }
      state.stage = 'age'
      return res.json({ 
        reply: `Got it!\n\nHow old are you, ${state.data.name}?` 
      })
    }
    
    // ============================================
    // STAGE 3: AGE
    // ============================================
    if (state.stage === 'age') {
      // Extract age from message
      const ageMatch = msg.match(/\d+/)
      const age = ageMatch ? parseInt(ageMatch[0]) : 0
      
      if (age > 0 && age < 150) {
        state.data.age = age
      } else {
        state.data.age = 'undisclosed'
      }
      state.stage = 'conditions'
      return res.json({ 
        reply: `Thank you, ${state.data.name}!\n\nDo you have any pre-existing medical conditions? (e.g., diabetes, hypertension, asthma, heart disease, etc.) If none, just say 'none' or 'no'.` 
      })
    }
    
    // ============================================
    // STAGE 4: PRE-EXISTING CONDITIONS
    // ============================================
    if (state.stage === 'conditions') {
      const lowerMsg = msg.toLowerCase()
      const conditions = []
      
      // Common condition keywords
      const conditionKeywords = {
        'diabetes': 'diabetes', 'sugar': 'diabetes', 'blood sugar': 'diabetes',
        'hypertension': 'hypertension', 'high blood pressure': 'hypertension', 'blood pressure': 'hypertension',
        'asthma': 'asthma', 'breathing problem': 'asthma',
        'heart': 'heart disease', 'cardiac': 'heart disease', 'cardiovascular': 'heart disease',
        'cancer': 'cancer',
        'thyroid': 'thyroid',
        'kidney': 'kidney disease', 'renal': 'kidney disease',
        'liver': 'liver disease', 'hepatic': 'liver disease',
        'arthritis': 'arthritis',
        'depression': 'depression', 'mental': 'depression',
        'anxiety': 'anxiety',
        'allergy': 'allergies', 'allergies': 'allergies',
        'copd': 'copd', 'lung': 'copd',
        ' epilepsy': 'epilepsy', 'seizure': 'epilepsy'
      }
      
      for (const [keyword, condition] of Object.entries(conditionKeywords)) {
        if (lowerMsg.includes(keyword)) {
          conditions.push(condition)
        }
      }
      
      state.data.conditions = conditions
      state.stage = 'symptoms'
      
      const conditionsText = conditions.length > 0 ? conditions.join(', ') : 'none noted'
      return res.json({ 
        reply: `Got it! I'll keep in mind that you have ${conditionsText}.\n\nNow, ${state.data.name}, please describe your symptoms. What are you experiencing? (e.g., "I have headache and fever" or "my stomach hurts")` 
      })
    }
    
    // ============================================
    // STAGE 5: SYMPTOMS
    // ============================================
    if (state.stage === 'symptoms') {
      // Check for done request
      if (isDoneRequest(msg)) {
        return res.json({ 
          reply: `Alright, ${state.data.name}! If you need help in the future, just refresh or start a new chat. Take care! 😊` 
        })
      }
      
      const symptoms = extractSymptoms(msg)
      
      if (symptoms.length === 0) {
        return res.json({ 
          reply: `I couldn't detect any clear symptoms, ${state.data.name}. Please try describing how you're feeling with more detail (e.g., "I have headache and fever" or "my stomach hurts").` 
        })
      }
      
      state.data.symptoms = symptoms
      
      // Get prediction with confidence (internal only - don't show user yet)
      const result = await getPrediction(symptoms)
      
      if (!result) {
        return res.json({ 
          reply: `I found symptoms: ${symptoms.map(s => s.replace(/_/g, ' ')).join(', ')}. However, I'm having trouble connecting to the diagnosis system. Could you try again in a moment?` 
        })
      }
      
      // Store prediction but don't show user yet
      state.data.prediction = result.disease
      state.data.confidence = result.confidence
      state.data.questions = getClarifyingQuestions(result.disease, symptoms)
      state.data.followupsAsked = 0
      state.data.followupAnswers = []
      
      // Ask clarifying questions first - don't show disease or confidence
      state.stage = 'clarifying'
      return res.json({ 
        reply: `I understand you're experiencing: ${symptoms.map(s => s.replace(/_/g, ' ')).join(', ')}.\n\nLet me ask a few questions to get a better understanding.\n\n${state.data.questions[0]}` 
      })
    }
    
    // ============================================
    // STAGE 6: CLARIFYING QUESTIONS
    // ============================================
    if (state.stage === 'clarifying') {
      const answer = getAnswer(msg)
      state.data.followupAnswers.push(answer)
      state.data.followupsAsked++
      
      // Ask next question or give diagnosis
      if (state.data.followupsAsked < 3 && state.data.questions[state.data.followupsAsked]) {
        return res.json({ 
          reply: state.data.questions[state.data.followupsAsked] 
        })
      }
      
      // Done with clarifying questions
      state.stage = 'diagnosis'
      
      // Re-predict with updated symptoms
      const result = await getPrediction(state.data.symptoms)
      if (result) {
        state.data.prediction = result.disease
        state.data.confidence = result.confidence
      }
      
      const disease = state.data.prediction
      const precs = precautionMap[disease] || []
      
      let reply = `Based on your answers, you may be suffering from **${disease}**.\n\n`
      
      if (precs.length) {
        reply += '📋 Here are some precautions you should take:\n'
        precs.forEach((p, i) => {
          reply += `${i+1}. ${p}\n`
        })
      }
      
      reply += '\n💡 Please note: This is an AI-generated assessment and not a professional medical diagnosis. Please consult a doctor for proper evaluation.'
      
      state.stage = 'done'
      
      // Save consultation to history
      await saveConsultation(req, state)
      
      return res.json({ reply })
    }
    
    // ============================================
    // STAGE 7: DIAGNOSIS (for high confidence)
    // ============================================
    if (state.stage === 'diagnosis') {
      const disease = state.data.prediction
      const precs = precautionMap[disease] || []
      
      let reply = `Based on your symptoms, you may be suffering from **${disease}**.\n\n`
      
      if (precs.length) {
        reply += '📋 Here are some precautions you should take:\n'
        precs.forEach((p, i) => {
          reply += `${i+1}. ${p}\n`
        })
      }
      
      reply += '\n💡 Please note: This is an AI-generated assessment and not a professional medical diagnosis. Please consult a doctor for proper evaluation.'
      
      reply += `\n\n✨ To start a new consultation, just type "restart" or refresh the page. Take care, ${state.data.name}! 😊`
      
      state.stage = 'done'
      
      // Save consultation to history
      await saveConsultation(req, state)
      
      return res.json({ reply })
    }
    
    // ============================================
    // STAGE 8: DONE
    // ============================================
    if (state.stage === 'done') {
      // Handle any additional requests after diagnosis
      if (isHealthTipRequest(msg)) {
        const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)]
        return res.json({ 
          reply: `💡 ${randomTip}\n\nTo start a new consultation, type "restart". Take care! 😊` 
        })
      }
      
      if (isFactRequest(msg)) {
        const randomFact = bodyFacts[Math.floor(Math.random() * bodyFacts.length)]
        return res.json({ 
          reply: `🤓 ${randomFact}\n\nTo start a new consultation, type "restart". Take care! 😊` 
        })
      }
      
      return res.json({ 
        reply: `This consultation is complete, ${state.data.name}! 😊\n\nTo start a new health check-up, just type "restart" or refresh the page. Take care!` 
      })
    }
    
    // Fallback
    return res.json({ 
      reply: `I'm not sure how to respond, ${state.data.name}. Type "restart" to start a new consultation.` 
    })
    
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ error: 'Chat service error' })
  }
})

// ============================================
// RESET CHAT
// ============================================
router.post('/reset', authMiddleware, (req, res) => {
  try {
    const userKey = req.user && req.user.username ? req.user.username : (req.ip || req.headers['x-forwarded-for'] || 'anon')
    delete conversations[userKey]
    res.json({ 
      reply: "👋 Chat reset! I'm MyAI, your healthcare assistant. What should I call you?" 
    })
  } catch (err) {
    console.error('Reset error:', err)
    res.status(500).json({ error: 'Reset failed' })
  }
})

module.exports = router
