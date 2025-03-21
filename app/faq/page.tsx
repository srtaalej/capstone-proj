"use client";

import FaqCard from "@/app/components/faq/faq"

export default function FAQPage() {
  return (
    <div className="container mx-auto py-16">
      <h1 className="text-4xl font-bold text-gray-800 text-center">Frequently Asked Questions</h1>
      <p className="mt-4 text-gray-600 text-center">Answers to common questions about our voting system.</p>
      <div className="mt-8">
        <FaqCard />
      </div>
    </div>
  );
}
