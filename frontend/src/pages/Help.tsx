import React from 'react';
import { HelpCircle, Phone, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Help() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Help & Support</h1>

      <div className="space-y-6">
        {/* Quick Help */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <HelpCircle className="h-6 w-6 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                question: "How do I track my order?",
                answer: "You can track your order by going to the Orders section in your dashboard and clicking on the specific order you want to track."
              },
              {
                question: "How do I cancel my subscription?",
                answer: "To cancel a subscription, visit the Subscriptions page, select the subscription you want to cancel, and click the Cancel button."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit/debit cards, UPI, and net banking. You can manage your payment methods in the Settings section."
              }
            ].map((faq, index) => (
              <details key={index} className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <p className="mt-4 px-4 text-gray-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-primary-50 rounded-lg">
              <Phone className="h-6 w-6 text-primary-600 mb-3" />
              <h3 className="font-medium text-gray-900">Phone Support</h3>
              <p className="text-sm text-gray-500 mt-1">Available 24/7</p>
              <p className="text-primary-600 font-medium mt-2">+91 1800-123-4567</p>
            </div>
            <div className="p-4 bg-primary-50 rounded-lg">
              <Mail className="h-6 w-6 text-primary-600 mb-3" />
              <h3 className="font-medium text-gray-900">Email Support</h3>
              <p className="text-sm text-gray-500 mt-1">Get response within 24 hours</p>
              <p className="text-primary-600 font-medium mt-2">support@kiranaconnect.com</p>
            </div>
            <div className="p-4 bg-primary-50 rounded-lg">
              <MessageSquare className="h-6 w-6 text-primary-600 mb-3" />
              <h3 className="font-medium text-gray-900">Live Chat</h3>
              <p className="text-sm text-gray-500 mt-1">Chat with our support team</p>
              <Button variant="outline" className="mt-2">Start Chat</Button>
            </div>
          </div>
        </div>

        {/* Submit Ticket */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit a Support Ticket</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Enter the subject of your issue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={4}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Describe your issue in detail"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Attachments</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      <span>Upload a file</span>
                      <input type="file" className="sr-only" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
            <div>
              <Button type="submit">Submit Ticket</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}