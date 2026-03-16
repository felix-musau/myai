import React from 'react'
import { Link } from 'react-router-dom'

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Terms &amp; Conditions</h1>
            <p className="text-gray-600 mt-2">Please read these terms and conditions carefully before using MyAI Healthcare.</p>
          </div>
          <Link
            to="/register"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            Back to Register
          </Link>
        </div>

        <div className="mt-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-800">1. Acceptance of Terms</h2>
            <p className="mt-2">
              By creating an account or using the MyAI Healthcare service, you agree to be bound by these terms and
              conditions. If you do not agree with any part of these terms, you must not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">2. Use of the Service</h2>
            <p className="mt-2">
              MyAI Healthcare is provided for informational and educational purposes. It is not a substitute for professional
              medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any
              questions you may have regarding a medical condition.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">3. Account Responsibility</h2>
            <p className="mt-2">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that
              occur under your account. Notify us immediately if you suspect any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">4. Privacy</h2>
            <p className="mt-2">
              Your use of the service is also governed by our Privacy Policy, which explains how we collect, use, and share
              your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">5. Changes to Terms</h2>
            <p className="mt-2">
              We may update these terms from time to time. Continued use of the service after changes are made constitutes
              acceptance of the updated terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
