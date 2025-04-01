"use client";

import { useState } from "react";

export default function SubmitTicket() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting:", form);

    // Simulate an API request
    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-center text-2xl font-semibold text-white mb-6">Submit a Support Ticket</h2>

        {submitted ? (
          <div className="text-center">
            <p className="text-green-400">Thank you! Your ticket has been submitted.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1 p-2 w-full rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="mt-1 p-2 w-full rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">Subject</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                className="mt-1 p-2 w-full rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={4}
                className="mt-1 p-2 w-full rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-indigo-500"
                minLength={20}
                maxLength={500}/>
                <p className="text-sm text-gray-500">
                    {form.message.length}/500 characters
                </p>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition"
            >
              Submit Ticket
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
