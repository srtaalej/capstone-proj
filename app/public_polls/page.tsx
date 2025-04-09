'use client'

import { useEffect, useState } from 'react'
import PollCard from '../components/polls/poll_card';
import { useDebounce } from 'use-debounce';
import { createClient } from '@/app/lib/client';
import { Poll } from '@/app/types/poll';
import VoteModal from '../components/polls/vote_modal';
import { useWallet } from '@solana/wallet-adapter-react';

const PublicPollsPage = () => {
    const connected  = useWallet();
    const [polls, setPolls] = useState<any[]>([]);
    const supabase = createClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery] = useDebounce(searchQuery, 300);
    const [searchResults, setSearchResults] = useState<Poll[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    // Handle poll selection
    const handlePollClick = (poll: Poll) => {
    if (!connected) {
      setIsModalOpen(false);
    } else {
      setSelectedPoll(poll);
      setIsModalOpen(true);
    }
    };

    // Close modal
    const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedPoll(null);
      //update vote number on the card
      const updatedPolls = polls.map(p => {
        if (p.id === selectedPoll?.id) {
            return {
            ...p,
            options: p.options.map((option: any) => {
              if (option.text === selectedPoll?.options[0].text) {
              return { ...option, vote_count: option.vote_count + 1 };
              }
              return option;
            })
            };
        }
        return p;
      });
      setPolls(updatedPolls);
    };

    return (
      <div className="space-y-6 p-10 bg-gray-900">
        <h2 className="text-2xl font-semibold text-white">Public Polls</h2>
        <ul role="list" className="grid grid-cols-2 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {selectedPoll && (
              <VoteModal
                poll={selectedPoll}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
              />
            )}
          {polls.map((poll: Poll) => (
            <li key={poll.id} onClick={() => handlePollClick(poll)} className="cursor-pointer">
              <PollCard poll={poll} />
            </li>
          ))}
        </ul>
      </div>
    );
};

export default PublicPollsPage;