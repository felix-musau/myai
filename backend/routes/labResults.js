const express = require('express')
const router = express.Router()

// POST /api/analyze-lab
// Mock endpoint - returns structured analysis
// Ready for AI integration later
router.post('/analyze-lab', (req, res) => {
  const { testType, values, fileName } = req.body

  // Log the request
  console.log('=== Lab Results Analysis Request ===')
  console.log('Test Type:', testType)
  console.log('Values:', values)
  console.log('File Name:', fileName)
  console.log('====================================')

  // Mock analysis based on test type
  let analysis = {}

  if (testType === 'blood-glucose') {
    const glucose = parseFloat(values?.glucose)
    if (glucose < 70) {
      analysis = {
        summary: 'Your blood glucose level is below the normal range (70-100 mg/dL).',
        riskLevel: 'Attention Needed',
        recommendation: 'Consider consuming a quick source of carbohydrates. If you have symptoms like dizziness or confusion, please consult a healthcare provider immediately.'
      }
    } else if (glucose >= 70 && glucose <= 100) {
      analysis = {
        summary: 'Your blood glucose level is within the normal range.',
        riskLevel: 'Normal',
        recommendation: 'Continue maintaining a healthy diet and regular exercise routine.'
      }
    } else if (glucose > 100 && glucose <= 125) {
      analysis = {
        summary: 'Your blood glucose level indicates pre-diabetes (100-125 mg/dL).',
        riskLevel: 'Attention Needed',
        recommendation: 'Consider lifestyle modifications including diet changes and increased physical activity. Consult with your healthcare provider for personalized advice.'
      }
    } else {
      analysis = {
        summary: 'Your blood glucose level is above the normal range, indicating diabetes (>125 mg/dL).',
        riskLevel: 'Attention Needed',
        recommendation: 'Please consult with a healthcare provider for proper diagnosis and management. This result requires medical attention.'
      }
    }
  } else if (testType === 'lipid-panel') {
    const totalCholesterol = parseFloat(values?.totalCholesterol)
    const ldl = parseFloat(values?.ldl)
    const hdl = parseFloat(values?.hdl)
    const triglycerides = parseFloat(values?.triglycerides)

    if (totalCholesterol < 200 && ldl < 100 && hdl > 40) {
      analysis = {
        summary: 'Your lipid panel results are within desirable ranges.',
        riskLevel: 'Normal',
        recommendation: 'Continue maintaining a heart-healthy lifestyle with balanced diet and regular exercise.'
      }
    } else if (totalCholesterol >= 200 || ldl >= 100 || hdl < 40) {
      analysis = {
        summary: 'Your lipid panel shows some values outside the optimal range.',
        riskLevel: 'Attention Needed',
        recommendation: 'Consider dietary modifications and increased physical activity. Schedule an appointment with your healthcare provider to discuss these results.'
      }
    } else {
      analysis = {
        summary: 'Further evaluation of your lipid panel is recommended.',
        riskLevel: 'Attention Needed',
        recommendation: 'Please consult with your healthcare provider for a comprehensive review of your lipid panel results.'
      }
    }
  } else if (testType === 'cbc') {
    const hemoglobin = parseFloat(values?.hemoglobin)
    const wbc = parseFloat(values?.wbc)
    const platelets = parseFloat(values?.platelets)

    if (hemoglobin >= 12 && wbc >= 4 && wbc <= 11 && platelets >= 150) {
      analysis = {
        summary: 'Your complete blood count (CBC) results appear normal.',
        riskLevel: 'Normal',
        recommendation: 'Continue with regular health check-ups. No specific action required at this time.'
      }
    } else {
      analysis = {
        summary: 'Some values in your CBC are outside the normal range.',
        riskLevel: 'Attention Needed',
        recommendation: 'Please consult with your healthcare provider to discuss these results. Additional testing may be recommended.'
      }
    }
  } else {
    // Default analysis for unknown test types
    analysis = {
      summary: 'Lab results have been received and are ready for review.',
      riskLevel: 'Normal',
      recommendation: 'Please share these results with your healthcare provider for proper interpretation and next steps.'
    }
  }

  // Return structured response
  res.status(200).json({
    success: true,
    requestId: `LAB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    testType: testType,
    receivedValues: values,
    analysis: analysis,
    disclaimer: 'This is an automated analysis for informational purposes only. Always consult with a qualified healthcare provider for proper interpretation of your lab results.',
    nextSteps: [
      'Review these results with your healthcare provider',
      'Schedule a follow-up appointment if needed',
      'Maintain regular health check-ups'
    ]
  })
})

module.exports = router
