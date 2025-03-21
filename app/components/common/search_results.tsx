import React from 'react';
import Link from 'next/link';
import { CalendarIcon, UserGroupIcon } from '@heroicons/react/20/solid';
import { Poll } from '@/app/types/poll';

interface SearchResultsProps {
  results: Poll[];
  isVisible: boolean;
  onClose: () => void;
}

// Helper function to format dates consistently
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function SearchResults({ results, isVisible, onClose }: SearchResultsProps) {
  if (!isVisible || results.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
      <div className="p-2">
        {results.map((poll) => (
          <Link
            key={poll.id}
            href={`/polls/${poll.id}`}
            className="block p-4 hover:bg-gray-50 rounded-lg transition-colors duration-150 ease-in-out"
            onClick={onClose}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">{poll.name}</h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{poll.description}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
              <div className="flex items-center">
                <CalendarIcon className="mr-1.5 h-4 w-4" />
                <span>Ends {formatDate(poll.endDate)}</span>
              </div>
              <div className="flex items-center">
                <UserGroupIcon className="mr-1.5 h-4 w-4" />
                <span>{poll.votes} votes</span>
              </div>
              <div className="flex items-center">
                <span>{poll.options.length} options</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 