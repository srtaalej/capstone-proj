import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is Block Vote?",
    answer:
      "Block Vote is a decentralized voting system using blockchain technology that ensures fairness and transparency.",
  },
  {
    question: "How does blockchain ensure security?",
    answer:
      "Blockchain uses decentralized ledgers and consensus mechanisms like Proof of Stake to secure transactions and prevent tampering.",
  },
  {
    question: "What wallet do I need to participate?",
    answer:
      "You'll need a compatible wallet—such as Phantom—to authenticate and participate in the voting process.",
  },
  {
    question: "Is my vote anonymous?",
    answer:
      "Yes, blockchain ensures that votes remain both secure and anonymous while still being verifiable.",
  },
];

export default function FaqCard() {
  return (
    <div className="bg-gray-900">
        
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Frequently Asked Questions</h2>
          <dl className="mt-16 divide-y divide-white/10">
            {faqs.map((faq) => (
              <Disclosure key={faq.question} as="div" className="py-6 first:pt-0 last:pb-0">
                <dt>
                  <DisclosureButton className="group flex w-full items-start justify-between text-left text-white">
                    <span className="text-base/7 font-semibold">{faq.question}</span>
                    <span className="ml-6 flex h-7 items-center">
                      <PlusIcon aria-hidden="true" className="size-6 group-data-[open]:hidden" />
                      <MinusIcon aria-hidden="true" className="size-6 group-[&:not([data-open])]:hidden" />
                    </span>
                  </DisclosureButton>
                </dt>
                <DisclosurePanel as="dd" className="mt-2 pr-12">
                  <p className="text-base/7 text-gray-300">{faq.answer}</p>
                </DisclosurePanel>
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
