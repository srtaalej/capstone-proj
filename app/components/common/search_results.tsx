import React from 'react';
import Link from 'next/link';
import { CalendarIcon, UserGroupIcon } from '@heroicons/react/20/solid';
import { Poll } from '@/app/types/poll';

interface SearchResultsProps {
  results: Poll[];
  isVisible: boolean;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
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
            href={`/public_polls`}
            >
          <div>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">{poll.title}</h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{poll.description}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-gray-500 sxace-x-4">
              <div className="flex items-center">
                <CalendarIcon className="mr-1.5 h-4 w-4" />
                <span>Ends {formatDate(poll.end_date)}</span>
              </div>
          </div>
          </div>
          </Link>
        
        ))}
        
      </div>
    </div>
  );
} 




