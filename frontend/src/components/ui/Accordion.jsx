import React, { useState } from 'react'

export default function Accordion({ items, allowMultiple = false }) {
  const [openItems, setOpenItems] = useState([])

  const toggleItem = (id) => {
    if (allowMultiple) {
      setOpenItems(prev => 
        prev.includes(id) 
          ? prev.filter(item => item !== id)
          : [...prev, id]
      )
    } else {
      setOpenItems(prev => 
        prev.includes(id) ? [] : [id]
      )
    }
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openItems.includes(item.id)
        
        return (
          <div 
            key={item.id} 
            className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors focus:outline-none"
            >
              <span className="font-semibold text-gray-800 pr-4">{item.question}</span>
              <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            <div 
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 pb-4 pt-2 text-gray-600 leading-relaxed">
                {item.answer}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Category Accordion for grouping FAQs
export function CategoryAccordion({ categories }) {
  const [openCategory, setOpenCategory] = useState(null)

  const toggleCategory = (categoryName) => {
    setOpenCategory(prev => 
      prev === categoryName ? null : categoryName
    )
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const isOpen = openCategory === category.category
        
        return (
          <div 
            key={category.category} 
            className="bg-white rounded-2xl shadow-md overflow-hidden"
          >
            <button
              onClick={() => toggleCategory(category.category)}
              className="w-full px-6 py-5 flex items-center justify-between text-left bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors focus:outline-none"
            >
              <span className="font-bold text-lg text-gray-800">{category.category}</span>
              <span className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            <div 
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-6 pt-2">
                <Accordion items={category.questions} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
