import React from 'react';
import Link from 'next/link';
import { CalendarIcon, ArrowPathIcon } from '@heroicons/react/20/solid'; 
import { Poll } from '@/app/types/poll';

interface SearchResultsProps {
  results: Poll[];
  isLoading: boolean; 
  onResultClick: () => void; 
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  try {
    
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return 'Invalid Date';
  }
};

export default function SearchResults({ results, isLoading, onResultClick }: SearchResultsProps) {
  

  return (
    
    <div className="overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
       <div className="max-h-96 overflow-y-auto p-2"> 

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center p-4 text-gray-500">
            <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
            <span>Loading...</span>
          </div>
        )}

        {/* No Results State */}
        {!isLoading && results.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500">
            No polls found.
          </div>
        )}

        {/* Results List */}
        {!isLoading && results.length > 0 && (
          <ul role="list" className="divide-y divide-gray-100">
            {results.map((poll) => (
              <li key={poll.id} className="block hover:bg-gray-50">
                <Link
                  href={`/polls/${poll.id}`}
                  onClick={onResultClick}
                  className="block p-3"
                >
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 truncate">{poll.title}</h3>
                    {poll.description && (
                         <p className="mt-1 text-sm text-gray-500 line-clamp-1">{poll.description}</p>
                    )}
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <CalendarIcon className="mr-1.5 h-3 w-3 flex-shrink-0" aria-hidden="true" />
                      <span>Ends {formatDate(poll.end_date)}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}