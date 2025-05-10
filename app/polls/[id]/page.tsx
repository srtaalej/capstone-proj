"use client"
import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/client';
import { Poll, Option } from '@/app/types/poll';
import { useWallet } from '@solana/wallet-adapter-react';
import { useParams } from 'next/navigation';
import { MdArrowBackIos } from "react-icons/md";
const PollDetailsPage = () => {
  const params = useParams();
  const id = params.id as string;
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [votingOptions, setVotingOptions] = useState<Record<string, boolean>>({});
  const connected = true;
  //useWallet();
  
  useEffect(() => {
    const fetchPoll = async () => {
      if (!id) return;
      
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
          is_private: data.is_private,
          options: data.options,
        };
        setPoll(formattedPoll);
      }
      
      setIsLoading(false);
    };
    
    fetchPoll();
  }, [id]);
  
  const handleVote = async (optionText: string) => {
    if (!connected || !poll) return;
    
    setVotingOptions(prev => ({ ...prev, [optionText]: true }));
    const supabase = createClient();
    
    const { error } = await supabase.rpc('increment_vote_count', {
        poll_id_input: poll.id,
        option_text_input: optionText
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
    
    setVotingOptions(prev => ({ ...prev, [optionText]: false }));
    };
  
  const getTotalVotes = () => {
    if (!poll) return 0;
    return poll.options.reduce((sum, option) => sum + option.vote_count, 0);
  };
  
  const getTimeLeft = () => {
    if (!poll) return '0 days';
    const endDate = new Date(poll.end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 0 ? 'Ended' : `${diffDays} days`;
  };
  
  if (isLoading) {
    return <div className="p-10 text-white">Loading poll...</div>;
  }
  
  if (!poll) {
    return <div className="p-10 text-white">Poll not found.</div>;
  }
  
  const stats = [
    { name: 'Total Votes', stat: getTotalVotes().toString() },
    { name: 'Options', stat: poll.options.length.toString() },
    { name: 'Time Left', stat: getTimeLeft() },
  ];
  
  return (
    <div className="p-10 bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
      
        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg mb-6">
        <div className="mb-4 w-20"> 
            <a href='/public_polls'
                className="flex items-center px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-indigo-400 hover:text-indigo-300 transition-colors">
                <MdArrowBackIos/>
                Back
            </a>
        </div>
          <h1 className="text-3xl font-bold text-white mb-4">{poll.title}</h1>
          <p className="text-gray-400 mb-8">{poll.description}</p>
          
          {/* Stats Section */}
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          {stats.map((item) => (
            <div key={item.name} className="overflow-hidden rounded-lg bg-gray-700 px-4 py-5 shadow sm:p-6">
                <dt className="truncate text-sm font-medium text-gray-300">{item.name}</dt>
                <dd className={`mt-1 text-3xl font-semibold tracking-tight ${
                item.name === 'Time Left' && item.stat === 'Ended' 
                    ? 'text-red-500' 
                    : 'text-indigo-400'
                }`}>
                {item.stat}
                </dd>
            </div>
            ))}
          </dl>
          
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-white">Voting Options</h3>
            {poll.options.map((option: Option) => (
              <div key={option.text} className="bg-gray-700 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">{option.text}</span>
                  <span className="text-indigo-400 font-bold">{option.vote_count} votes</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-500 h-2.5 rounded-full" 
                    style={{ 
                      width: `${getTotalVotes() > 0 ? (option.vote_count / getTotalVotes() * 100) : 0}%` 
                    }}
                  ></div>
                </div>
                <button
                    onClick={() => handleVote(option.text)}
                    disabled={votingOptions[option.text] || !connected}
                    className="mt-3 w-full p-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                    {votingOptions[option.text] ? 'Voting...' : 'Vote'}
                    </button>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-gray-500 mt-8">
            Poll ends: {new Date(poll.end_date).toLocaleString()}
          </p>
          
          {!connected && (
            <div className="mt-4 p-4 bg-amber-800/30 border border-amber-700 rounded-lg">
              <p className="text-amber-200">Connect your wallet to vote in this poll</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollDetailsPage;