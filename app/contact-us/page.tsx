"use client";

import { useState } from "react";

export default function SubmitTicket() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      setSubmitStatus("success");
      
      
    } catch (error: any) {
      console.error("Submission error:", error);
      setSubmitStatus("error");
      setErrorMessage(error.message || "Failed to submit ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-center text-2xl font-semibold text-white mb-6">Submit a Support Ticket</h2>

        {submitStatus === "success" ? (
          <div className="text-center">
            <p className="text-green-400">Thank you! Your ticket has been submitted successfully.</p>
            
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message Display */}
            {submitStatus === "error" && (
              <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{errorMessage}</span>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-400">Name</label> 
              <input
                id="name" 
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                disabled={isSubmitting} 
                className="mt-1 p-2 w-full rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-indigo-500 disabled:opacity-50" 
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email</label> 
              <input
                id="email" 
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={isSubmitting} 
                className="mt-1 p-2 w-full rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-indigo-500 disabled:opacity-50" 
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-400">Subject</label> 
              <input
                id="subject" 
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                disabled={isSubmitting} 
                className="mt-1 p-2 w-full rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-indigo-500 disabled:opacity-50" 
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-400">Message</label> 
              <textarea
                id="message" 
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={4}
                disabled={isSubmitting} 
                className="mt-1 p-2 w-full rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-indigo-500 disabled:opacity-50" 
                minLength={20}
                maxLength={500}/>
                <p className="text-sm text-gray-500">
                    {form.message.length}/500 characters
                </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting} 
              className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center">
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Ticket'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}