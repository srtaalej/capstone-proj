'use client'

import { Fragment, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild, Description } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { Poll } from '@/app/types/poll'
import { createClient } from '@/app/lib/client';

interface VoteModalProps {
  poll: Poll;
  isOpen: boolean;
  onClose: () => void;
}

export default function VoteModal({ poll, isOpen, onClose }: VoteModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const handleVote = async () => {
    if (!selectedOption) return;
    
    setIsSubmitting(true);
    
    // Find the selected option
    const option = poll.options.find(opt => opt.text === selectedOption);
    
    if (option) {
      // Update vote count in the database
      const { error } = await supabase
        .from('options')
        .update({ vote_count: option.vote_count + 1 })
        .eq('poll_id', poll.id)
        .eq('text', selectedOption);
        
      if (error) {
        console.error('Error submitting vote:', error);
      } else {
        // Close modal after successful vote
        onClose();
      }
    }
    
    setIsSubmitting(false);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center">
                  <DialogTitle as="h3" className="text-xl font-medium leading-6 text-white">
                    {poll.title}
                  </DialogTitle>
                  <button
                    type="button"
                    className="rounded-md text-white hover:text-white focus:outline-none"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <Description as="p" className="mt-2 text-sm text-gray-300">
                  {poll.description}
                </Description>

                <div className="mt-4 space-y-2">
                  {poll.options.map((option) => (
                    <div 
                      key={`${option.poll_id}-${option.text}`}
                      className={`p-3 rounded-lg cursor-pointer text-white ${
                        selectedOption === option.text 
                          ? 'bg-indigo-600' 
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedOption(option.text)}
                    >
                      {option.text}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium ${
                      !selectedOption || isSubmitting
                        ? 'bg-gray-700 text-white cursor-not-allowed'
                        : 'bg-indigo-600  text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
                    }`}
                    onClick={handleVote}
                    disabled={!selectedOption || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Vote'}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}