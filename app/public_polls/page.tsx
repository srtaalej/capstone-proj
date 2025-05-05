"use client"
import { useEffect, useState } from 'react';
import PollCard from '../components/polls/poll_card';
import { createClient } from '@/app/lib/client';
import { Poll } from '@/app/types/poll';
import { useRouter } from 'next/navigation'; // Changed from next/router

const PublicPollsPage = () => {
  const [polls, setPolls] = useState<any[]>([]);
  const supabase = createClient();
  const router = useRouter();

  // Fetch all public polls (is_private = false)
  useEffect(() => {
    const fetchPolls = async () => {
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
      } else {
        setPolls(data || []);
      }
    };

    fetchPolls();
  }, []);

  const handlePollClick = (id: string) => {
    router.push(`/polls/${id}`);
  };

  return (
    <div className="space-y-6 p-10 bg-gray-900">
      <h2 className="text-2xl font-semibold text-white">Public Polls</h2>
      <ul role="list" className="grid grid-cols-2 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {polls.map((poll: Poll) => (
          <li key={poll.id} onClick={() => handlePollClick(poll.id)} className="cursor-pointer">
            <PollCard poll={poll} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PublicPollsPage;