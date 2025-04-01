'use client'

import { useEffect, useState } from 'react'
import PollCard from '../components/polls/poll_card';
import { useDebounce } from 'use-debounce';
import { createClient } from '@/app/lib/client';
import { Poll } from '@/app/types/poll';

const PublicPollsPage = () => {
    const [polls, setPolls] = useState<any[]>([]);
    const supabase = createClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery] = useDebounce(searchQuery, 300);
    const [searchResults, setSearchResults] = useState<Poll[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Fetch all public polls (is_private = false)
    useEffect(() => {
      const fetchPolls = async () => {
        setIsSearching(true);
        const { data, error } = await supabase
          .from('polls')
          .select(`
            id,
            title, 
            description, 
            end_date, 
            is_private, 
            created_at,
            options (
              text,
              vote_count,
              poll_id
            )
          `)
          .eq('is_private', false)
          .neq('title', 'test')
          .order('created_at', { ascending: false });
  
        if (error) {
          console.error('Error fetching polls:', error);
        } else {
          console.log('Fetched Polls:', data);
          setPolls(data || []);
        }
        setIsSearching(false);
      };
  
      fetchPolls();
    }, []);

    return (
      <div className="space-y-6 p-10 bg-gray-900">
      <h2 className="text-2xl font-semibold text-white">Public Polls</h2>
      <ul role="list" className="grid grid-cols-2 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            
              {polls.map((poll: Poll) => (
                  <PollCard
                      key={poll.id}
                      poll={poll}
                  />
              ))}
           
          </ul>
  </div>
    );
};

export default PublicPollsPage;
