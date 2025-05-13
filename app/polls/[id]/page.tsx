"use client"
import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/client';
import { Poll, Option } from '@/app/types/poll';
import { useWallet } from '@solana/wallet-adapter-react';
import { useParams, useRouter } from 'next/navigation';
import { MdArrowBackIos } from "react-icons/md";
import { BsThreeDotsVertical, BsClipboard2, BsClipboard2Check } from "react-icons/bs";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowPathIcon } from '@heroicons/react/20/solid';

const PollDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [votingOptionsState, setVotingOptionsState] = useState<Record<string, boolean>>({});
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);

  const { connected: isWalletConnected, publicKey } = useWallet();
  const supabase = createClient();

  useEffect(() => {
    const fetchPoll = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
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
            vote_count
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching poll:', error);
        setPoll(null);
      } else if (data) {
        setPoll(data as Poll);
      }
      setIsLoading(false);
    };

    fetchPoll();
  }, [id, supabase]);

  const isPollEnded = () => {
    if (!poll || !poll.end_date) return false;
    return new Date(poll.end_date) < new Date();
  };

  const handleVote = async (optionText: string) => {
    if (!isWalletConnected || !poll || votingOptionsState[optionText] || isPollEnded()) return;

    setVotingOptionsState(prev => ({ ...prev, [optionText]: true }));
    const votePromise = supabase.rpc('increment_vote_count', {
      poll_id_input: poll.id,
      option_text_input: optionText
    });

    toast.promise(
      votePromise,
      {
        loading: 'Casting your vote...',
        success: () => {
          setPoll(prevPoll => {
            if (!prevPoll) return null;
            const updatedOptions = prevPoll.options.map(option =>
              option.text === optionText
                ? { ...option, vote_count: option.vote_count + 1 }
                : option
            );
            return { ...prevPoll, options: updatedOptions };
          });
          return 'Vote cast successfully!';
        },
        error: (err) => {
          console.error('Error voting:', err);
          return `Failed to cast vote: ${err.message || 'Please try again.'}`;
        }
      }
    );
    
    
    votePromise.finally(() => {
        setVotingOptionsState(prev => ({ ...prev, [optionText]: false }));
    });
  };

  const getTotalVotes = () => {
    if (!poll) return 0;
    return poll.options.reduce((sum, option) => sum + option.vote_count, 0);
  };

  const getTimeLeft = () => {
    if (!poll || !poll.end_date) return 'N/A';
    if (isPollEnded()) return 'Ended';

    const endDate = new Date(poll.end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-900 p-10 text-white">Loading poll...</div>;
  }

  if (!poll) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-900 p-10 text-white">Poll not found.</div>;
  }

  const totalVotes = getTotalVotes();
  const timeLeft = getTimeLeft();

  const stats = [
    { name: 'Total Votes', stat: totalVotes.toString() },
    { name: 'Options', stat: poll.options.length.toString() },
    { name: 'Time Left', stat: timeLeft },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 bg-gray-900 min-h-screen text-white">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg">
          <div className="mb-6 flex justify-between items-center">
            <a href='/public_polls'
                className="flex items-center px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-indigo-400 hover:text-indigo-300 transition-colors">
                <MdArrowBackIos/>
                Back
            </a>
            <div className="relative inline-block text-left">
              <Menu as="div" className="relative">
                <MenuButton className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                  <BsThreeDotsVertical className="h-5 w-5 text-gray-300" aria-hidden="true"/>
                </MenuButton>
                <Transition
                  as="div" 
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <MenuItems className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const baseUrl = window.location.origin;
                              const pollUrl = `${baseUrl}/polls/${poll.id}`;
                              navigator.clipboard.writeText(pollUrl)
                                .then(() => {
                                  setShowCopiedNotification(true);
                                  setTimeout(() => setShowCopiedNotification(false), 2500);
                                  if (document.activeElement instanceof HTMLElement) {
                                    document.activeElement.blur(); 
                                  }
                                })
                                .catch(err => {
                                  console.error('Failed to copy: ', err);
                                  toast.error('Failed to copy link.');
                                });
                            }}
                            className={`${
                              active ? 'bg-indigo-500 text-white' : 'text-gray-200'
                            } group flex w-full items-center rounded-md px-3 py-2 text-sm gap-x-2`}
                          >
                            <BsClipboard2 className="h-4 w-4" />
                            Share Poll
                          </button>
                        )}
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Transition>
              </Menu>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{poll.title}</h1>
          {poll.description && <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">{poll.description}</p>}

          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            {stats.map((item) => (
              <div key={item.name} className="overflow-hidden rounded-lg bg-gray-700 px-4 py-5 shadow sm:p-6">
                <dt className="truncate text-xs sm:text-sm font-medium text-gray-300">{item.name}</dt>
                <dd className={`mt-1 text-2xl sm:text-3xl font-semibold tracking-tight ${
                  item.name === 'Time Left' && item.stat === 'Ended'
                    ? 'text-red-500'
                    : 'text-indigo-400'
                }`}>
                  {item.stat}
                </dd>
              </div>
            ))}
          </dl>

          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-medium text-white">Voting Options</h3>
            {poll.options.map((option: Option) => (
              <div key={option.text} className="bg-gray-700 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium text-sm sm:text-base break-words pr-2">{option.text}</span>
                  <span className="text-indigo-400 font-bold text-xs sm:text-sm whitespace-nowrap">{option.vote_count} votes</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2 sm:h-2.5">
                  <div
                    className="bg-indigo-500 h-2 sm:h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${totalVotes > 0 ? (option.vote_count / totalVotes * 100) : 0}%`
                    }}
                  ></div>
                </div>
                {!isPollEnded() && (
                    <button
                        onClick={() => handleVote(option.text)}
                        disabled={votingOptionsState[option.text] || !isWalletConnected || isPollEnded()}
                        className="mt-3 w-full p-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                    >
                        {votingOptionsState[option.text] ? (
                            <>
                                <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                                Voting...
                            </>
                        ) : 'Vote'}
                    </button>
                )}
              </div>
            ))}
          </div>

          {isPollEnded() && (
            <div className="mt-6 p-3 bg-red-800/30 border border-red-700 rounded-lg text-center">
                <p className="text-red-200 font-medium">This poll has ended.</p>
            </div>
          )}

          <p className="text-xs sm:text-sm text-gray-500 mt-8 text-center">
            Poll ends: {new Date(poll.end_date).toLocaleString()}
          </p>

          {!isWalletConnected && !isPollEnded() && (
            <div className="mt-4 p-3 bg-amber-800/30 border border-amber-700 rounded-lg text-center">
              <p className="text-amber-200 text-sm">Connect your wallet to vote in this poll.</p>
            </div>
          )}
        </div>
      </div>
      {showCopiedNotification && (
        <div className="fixed bottom-5 right-5 bg-gray-700 text-white px-4 py-3 rounded-lg shadow-xl flex items-center z-50">
            <BsClipboard2Check className="h-5 w-5 mr-2 text-green-400"/>
            <p className='text-sm'>Link copied to clipboard!</p>
        </div>
      )}
    </div>
  );
};

export default PollDetailsPage;