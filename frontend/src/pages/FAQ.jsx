import React, { useState } from 'react'
import Card from '../components/ui/Card'
import { CategoryAccordion } from '../components/ui/Accordion'
import Button from '../components/ui/Button'
import faqsData from '../data/faqs.json'

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Get unique categories
  const categories = ['All', ...new Set(faqsData.map(cat => cat.category))]

  // Filter FAQs based on search and category
  const filteredData = faqsData
    .filter(cat => selectedCategory === 'All' || cat.category === selectedCategory)
    .map(cat => ({
      ...cat,
      questions: cat.questions.filter(q => 
        searchTerm === '' ||
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(cat => cat.questions.length > 0)

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat bg-[url('/ai.jpg')] flex flex-col relative">
      
      <div className="max-w-4xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-medical">❓ Frequently Asked Questions</h1>
          <p className="text-gray-600 font-medical">Find answers to common questions about our services</p>
        </div>

        {/* Search Bar */}
        <Card padding="md" shadow="md" className="glass-card mb-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300/50 bg-white/60 backdrop-blur rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-medical"
            />
          </div>
        </Card>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium transition font-medical ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/60 backdrop-blur text-gray-700 hover:bg-white/80 shadow-sm border border-gray-200/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <p className="text-gray-700 mb-4 font-medical">
          {searchTerm || selectedCategory !== 'All'
            ? `Found ${filteredData.reduce((sum, cat) => sum + cat.questions.length, 0)} matching questions`
            : `Showing all ${faqsData.reduce((sum, cat) => sum + cat.questions.length, 0)} questions`}
        </p>

        {/* FAQ Accordion */}
        {filteredData.length > 0 ? (
          <CategoryAccordion categories={filteredData} />
        ) : (
          <Card padding="lg" shadow="md" className="glass-card text-center">
            <span className="text-5xl block mb-4">🔍</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2 font-medical">No results found</h3>
            <p className="text-gray-600 font-medical">
              Try adjusting your search or browse all categories
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('All')
              }}
              className="mt-4 text-blue-600 hover:underline font-medium font-medical"
            >
              Clear filters
            </button>
          </Card>
        )}

        {/* Contact Support */}
        <Card padding="lg" shadow="md" className="mt-8 bg-gradient-to-r from-blue-600/80 to-indigo-600/80 backdrop-blur text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-1 font-medical">Still have questions?</h3>
              <p className="text-blue-100 font-medical">
                Our support team is here to help you with any concerns
              </p>
            </div>
            <Button variant="glass" onClick={() => window.location.href = '/contact'}>
              Contact Support
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
