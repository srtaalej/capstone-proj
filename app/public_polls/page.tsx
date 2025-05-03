'use client'

import { useEffect, useState } from 'react'
import PollCard from '../components/polls/poll_card';
import { createClient } from '@/app/lib/client';
import VoteModal from '../components/polls/vote_modal';
import { useWallet } from '@solana/wallet-adapter-react';
import { Poll } from '@/app/utils/interfaces';

/* eslint-disable  @typescript-eslint/no-unused-vars */


// import { FaRegEdit } from 'react-icons/fa'
// import CandidateList from '@/app/components/CandidateList'
// import RegCandidate from '@/app/components/RegCandidate'
// import { RootState } from '@/app/utils/interfaces'
// import { useDispatch, useSelector } from 'react-redux'
// import { globalActions } from '@/app/store/globalSlices'
// import { useParams } from 'next/navigation'
// import {
//   fetchAllCandidates,
//   fetchPollDetails,
//   getReadOnlyProvider,
// } from '@/app/services/blockchain.service'


const PublicPollsPage = () => {
    const { publicKey, connected } = useWallet();
    const [polls, setPolls] = useState<Poll[]>([]);
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pollVotes, setPollVotes] = useState<Record<string, Record<string, number>>>({});

    useEffect(() => {
      const fetchPolls = async () => {
        setIsLoading(true);
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
          setPolls(data || []);
           const initialVotes: Record<string, Record<string, number>> = {};
           (data || []).forEach(poll => {
             initialVotes[poll.id] = {};
             poll.options.forEach(option => {
               initialVotes[poll.id][option.text] = option.vote_count;
             });
           });
           setPollVotes(initialVotes);
        }
        setIsLoading(false);
      };

      fetchPolls();
    }, [supabase]);

    const handlePollClick = (poll: Poll) => {
      if (!connected) {
        console.log("Connect wallet to vote");
        return;
      }
      setSelectedPoll(poll);
      setIsModalOpen(true);
    };

    const handleVoteSubmitted = (pollId: string, optionText: string) => {
         setPollVotes(prevVotes => {
            const newVotes = { ...prevVotes };
            if (newVotes[pollId]) {
            newVotes[pollId][optionText] = (newVotes[pollId][optionText] || 0) + 1;
            }
            return newVotes;
        });

        setPolls(prevPolls =>
        prevPolls.map(p => {
            if (p.id === pollId) {
            return {
                ...p,
                options: p.candidates.map(opt => ({
                ...opt,
                vote_count: pollVotes[pollId]?.[opt.text] ?? opt.vote_count,
                })),
            };
            }
            return p;
        }),
        );

        setIsModalOpen(false);
        setSelectedPoll(null);
    }

    const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedPoll(null);
    };

    return (
      <div className="min-h-screen space-y-6 p-4 sm:p-6 md:p-8 lg:p-10 bg-gray-900">
        <h2 className="text-2xl font-semibold text-white">Public Polls</h2>

        {isLoading && (
            <div className="text-center text-gray-400 py-10">Loading polls...</div>
        )}

        {!isLoading && polls.length === 0 && (
             <div className="text-center text-gray-400 py-10">No public polls found.</div>
        )}

        {!isLoading && polls.length > 0 && (
            <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {selectedPoll && (
                    <VoteModal
                        poll={selectedPoll}
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onVoteSuccess={handleVoteSubmitted}
                    />
                )}
                {polls.map((poll: Poll) => (
                    <li key={poll.id} onClick={() => handlePollClick(poll)} className="cursor-pointer">
                    <PollCard poll={poll} currentVotes={pollVotes[poll.id]} />
                    </li>
                ))}
            </ul>
        )}
      </div>
    );
};

export default PublicPollsPage;