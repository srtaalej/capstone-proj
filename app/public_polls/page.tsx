"use client"
import { useEffect, useState } from 'react';
import PollCard from '../components/polls/poll_card';
import { createClient } from '@/app/lib/client';
import { Poll } from '@/app/types/poll';
import { useRouter } from 'next/navigation'; // Changed from next/router

const PublicPollsPage = () => {
  const [polls, setPolls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  // Fetch all public polls (is_private = false)
  useEffect(() => {
    const fetchPolls = async () => {
      setIsLoading(true);
      setErrorLoading(null);
      const { data, error } = await supabase
        .from('polls')
        .select(`
          id,
          title, 
          description, 
          end_date, 
          is_private,
          options (
            text,
            vote_count
          )
        `)
        .eq('is_private', false)
        .neq('title', 'test')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching polls:', error);
        setErrorLoading('Could not load polls. Please try again later.');
        setPolls([]);
      } else {
        setPolls(data || []);
      }
      setIsLoading(false);
    };

    fetchPolls();
  }, [supabase]);

  // const handlePollClick = (id: string) => {
  //   router.push(`/polls/${id}`);
  // };
  //onClick={() => handlePollClick(poll.id)} 

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8 lg:p-10">
        <p className="text-xl text-white">Loading public polls...</p>
        {/* Optional: Add a spinner icon here */}
      </div>
    );
  }

  if (errorLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8 lg:p-10">
        <p className="text-xl text-red-400">{errorLoading}</p>
      </div>
    );
  }

  if (!isLoading && polls.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8 lg:p-10">
        <h2 className="text-2xl font-semibold text-white mb-4">Public Polls</h2>
        <p className="text-lg text-gray-400">No public polls available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-10 bg-gray-900">
      <h2 className="text-2xl font-semibold text-white">Public Polls</h2>
      <ul role="list" className="grid grid-cols-2 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {polls.map((poll: Poll) => (
          <li key={poll.id} className="cursor-pointer">
            <PollCard poll={poll} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PublicPollsPage;