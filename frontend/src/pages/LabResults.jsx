import React, { useState } from 'react'
import axios from 'axios'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

const testTypes = [
  { 
    id: 'blood-glucose', 
    name: 'Blood Glucose', 
    icon: '🩸',
    fields: [
      { name: 'glucose', label: 'Glucose (mg/dL)', min: 0, max: 500, normal: '70-100' }
    ]
  },
  { 
    id: 'lipid-panel', 
    name: 'Lipid Panel', 
    icon: '❤️',
    fields: [
      { name: 'totalCholesterol', label: 'Total Cholesterol (mg/dL)', min: 0, max: 400, normal: '<200' },
      { name: 'ldl', label: 'LDL Cholesterol (mg/dL)', min: 0, max: 300, normal: '<100' },
      { name: 'hdl', label: 'HDL Cholesterol (mg/dL)', min: 0, max: 150, normal: '>40' },
      { name: 'triglycerides', label: 'Triglycerides (mg/dL)', min: 0, max: 1000, normal: '<150' }
    ]
  },
  { 
    id: 'cbc', 
    name: 'Complete Blood Count (CBC)', 
    icon: '🧬',
    fields: [
      { name: 'hemoglobin', label: 'Hemoglobin (g/dL)', min: 0, max: 25, normal: '12-17' },
      { name: 'wbc', label: 'White Blood Cells (K/uL)', min: 0, max: 50, normal: '4-11' },
      { name: 'platelets', label: 'Platelets (K/uL)', min: 0, max: 1000, normal: '150-400' }
    ]
  }
]

export default function LabResults() {
  const [activeTab, setActiveTab] = useState('upload') // 'upload' or 'manual'
  const [selectedTest, setSelectedTest] = useState('')
  const [values, setValues] = useState({})
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [errors, setErrors] = useState({})

  const selectedTestType = testTypes.find(t => t.id === selectedTest)

  const handleValueChange = (fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }))
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFileName(file.name)
      // In a real app, you'd upload the file here
    }
  }

  const validateForm = () => {
    if (!selectedTest) {
      setErrors({ testType: 'Please select a test type' })
      return false
    }

    if (activeTab === 'manual' && selectedTestType) {
      const newErrors = {}
      selectedTestType.fields.forEach(field => {
        if (!values[field.name] || values[field.name] === '') {
          newErrors[field.name] = 'This field is required'
        }
      })
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return false
      }
    }

    if (activeTab === 'upload' && !fileName) {
      setErrors({ file: 'Please upload a file' })
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)

    try {
      const response = await axios.post('/api/analyze-lab', {
        testType: selectedTest,
        values: activeTab === 'manual' ? values : null,
        fileName: activeTab === 'upload' ? fileName : null
      }, { withCredentials: true })
      
      setResults(response.data)
      setShowModal(true)
    } catch (error) {
      console.error('Error analyzing lab results:', error)
      setErrors({ submit: 'Failed to analyze results. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedTest('')
    setValues({})
    setFileName('')
    setResults(null)
    setErrors({})
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat bg-[url('/ai.jpg')] flex flex-col relative">
      
      <div className="max-w-4xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-medical">🧪 Lab & Test Results</h1>
          <p className="text-gray-600 font-medical">Upload or enter your lab results for analysis</p>
        </div>

        <Card padding="lg" shadow="lg" className="glass-card">
          {/* Test Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-medical">Select Test Type *</label>
            <div className="grid md:grid-cols-3 gap-3">
              {testTypes.map((test) => (
                <button
                  key={test.id}
                  type="button"
                  onClick={() => {
                    setSelectedTest(test.id)
                    setValues({})
                    setErrors({})
                  }}
                  className={`p-4 rounded-xl border-2 transition-all font-medical ${
                    selectedTest === test.id
                      ? 'border-blue-500 bg-blue-50/80 backdrop-blur'
                      : 'border-gray-200/50 bg-white/40 backdrop-blur hover:border-gray-300'
                  }`}
                >
                  <span className="text-3xl block mb-2">{test.icon}</span>
                  <span className="font-semibold text-gray-800">{test.name}</span>
                </button>
              ))}
            </div>
            {errors.testType && <p className="text-red-500 text-sm mt-2">{errors.testType}</p>}
          </div>

          {/* Tab Selection */}
          {selectedTest && (
            <>
              <div className="flex border-b border-gray-200/50 mb-6">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-6 py-3 font-medium transition font-medical ${
                    activeTab === 'upload'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📁 Upload File
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`px-6 py-3 font-medium transition font-medical ${
                    activeTab === 'manual'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ✏️ Enter Values
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* File Upload Tab */}
                {activeTab === 'upload' && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300/50 bg-white/40 backdrop-blur rounded-xl p-8 text-center hover:border-blue-400 transition">
                      <input
                        type="file"
                        id="file-upload"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-5xl block mb-4">📤</span>
                        <p className="text-gray-700 font-medium font-medical">
                          {fileName ? fileName : 'Click to upload your lab results'}
                        </p>
                        <p className="text-gray-500 text-sm mt-2 font-medical">
                          Supported: PDF, JPG, PNG, DOC
                        </p>
                      </label>
                    </div>
                    {errors.file && <p className="text-red-500 text-sm">{errors.file}</p>}
                  </div>
                )}

                {/* Manual Entry Tab */}
                {activeTab === 'manual' && selectedTestType && (
                  <div className="space-y-4">
                    {selectedTestType.fields.map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-medical">
                          {field.label}
                          <span className="text-gray-500 ml-2 font-medical">(Normal: {field.normal})</span>
                        </label>
                        <input
                          type="number"
                          value={values[field.name] || ''}
                          onChange={(e) => handleValueChange(field.name, e.target.value)}
                          min={field.min}
                          max={field.max}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-medical ${
                            errors[field.name] ? 'border-red-500' : 'border-gray-300/50 bg-white/60 backdrop-blur'
                          }`}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                        {errors[field.name] && <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Submit Error */}
                {errors.submit && (
                  <div className="bg-red-50/80 backdrop-blur border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
                    {errors.submit}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 mt-6">
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={!selectedTest}
                    className="flex-1"
                    icon="🔬"
                  >
                    Analyze Results
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetForm}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </>
          )}
        </Card>

        {/* Disclaimer */}
        <div className="mt-6 bg-yellow-50/80 backdrop-blur border border-yellow-200/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-bold text-yellow-800 font-medical">Important Notice</h4>
              <p className="text-yellow-700 text-sm mt-1 font-medical">
                This analysis is for informational purposes only and should not replace professional medical advice. 
                Always consult with a healthcare provider for proper interpretation of your lab results.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="📊 Analysis Results"
        size="lg"
      >
        {results && (
          <div className="space-y-4">
            {/* Test Type */}
            <div className="bg-gray-50/80 backdrop-blur rounded-lg p-4">
              <p className="text-sm text-gray-500 font-medical">Test Type</p>
              <p className="font-semibold text-gray-800 font-medical">{testTypes.find(t => t.id === results.testType)?.name}</p>
            </div>

            {/* Summary */}
            <div className={`rounded-lg p-4 ${
              results.analysis.riskLevel === 'Normal' 
                ? 'bg-green-50/80 backdrop-blur border border-green-200' 
                : 'bg-orange-50/80 backdrop-blur border border-orange-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium font-medical ${
                  results.analysis.riskLevel === 'Normal'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {results.analysis.riskLevel}
                </span>
              </div>
              <p className="text-gray-800 font-medical">{results.analysis.summary}</p>
            </div>

            {/* Recommendation */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2 font-medical">Recommendation</h4>
              <p className="text-gray-600 font-medical">{results.analysis.recommendation}</p>
            </div>

            {/* Next Steps */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2 font-medical">Next Steps</h4>
              <ul className="space-y-2">
                {results.nextSteps?.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600 font-medical">
                    <span className="text-blue-500 mt-1">✓</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="bg-gray-50/80 backdrop-blur rounded-lg p-3 text-sm text-gray-500 italic font-medical">
              {results.disclaimer}
            </div>

            <Button
              onClick={() => setShowModal(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
