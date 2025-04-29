"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/client';
import { Poll, Option } from '@/app/types/poll';
import { useWallet } from '@solana/wallet-adapter-react';

const PollDetailsPage = () => {
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get('id');
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const wallet = useWallet();

  useEffect(() => {
    const fetchPoll = async () => {
      if (!id || typeof id !== 'string') return;

      const supabase = createClient();
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
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching poll:', error);
      } else if (data) {
        const formattedPoll: Poll = {
          ...data,
          isPrivate: data.is_private,
          options: data.options,
        };
        setPoll(formattedPoll);
      }

      setIsLoading(false);
    };

    fetchPoll();
  }, [id]);

  const handleVote = async (optionText: string) => {
    if (!wallet.connected || !poll) return;

    setIsVoting(true);
    const supabase = createClient();

    const { error } = await supabase.rpc('increment_vote_count', {
      poll_id_input: poll.id,
      option_text_input: optionText,
    });

    if (error) {
      console.error('Error voting:', error);
    } else {
      const updatedOptions = poll.options.map(option =>
        option.text === optionText
          ? { ...option, vote_count: option.vote_count + 1 }
          : option
      );

      setPoll({ ...poll, options: updatedOptions });
    }

    setIsVoting(false);
  };

  if (isLoading) {
    return <div className="p-10 text-white">Loading poll...</div>;
  }

  if (!poll) {
    return <div className="p-10 text-white">Poll not found.</div>;
  }

  return (
    <div className="p-10 bg-gray-900 min-h-screen">
      <div className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-4">{poll.title}</h1>
        <p className="text-gray-400 mb-6">{poll.description}</p>
        <div className="space-y-4">
          {poll.options.map((option: Option) => (
            <button
              key={option.text}
              onClick={() => handleVote(option.text)}
              disabled={isVoting || !wallet.connected}
              className="w-full p-3 rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
            >
              {option.text} ({option.vote_count} votes)
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-6">
          Ends: {new Date(poll.end_date).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default PollDetailsPage;
