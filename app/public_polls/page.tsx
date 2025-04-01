'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/client';
import PollCard from '../components/polls/poll_card';

const PublicPollsPage = () => {
    const [polls, setPolls] = useState<any[]>([]);
    const supabase = createClient();

    // Fetch all public polls (is_private = false)
    useEffect(() => {
        const fetchPublicPolls = async () => {
            try {
                const { data: pollData, error: pollError } = await supabase
                    .from("polls")
                    .select("title, description, end_date, options(text, vote_count)")
                    .eq('is_private', false); // Fetch only public polls

                if (pollError) {
                    console.error("Error fetching public polls:", pollError.message);
                    return;
                }
            } catch (error) {
                console.error("Error fetching public polls:", error);
            }
        };

        fetchPublicPolls();
    }, [supabase]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Public Polls</h2>
            {polls.length === 0 ? (
                <p className="text-gray-400">No public polls available.</p>
            ) : (
                <div className="space-y-4">
                    {polls.map((poll: any) => (
                        <PollCard
                            title={poll.title}
                            description={poll.description}
                            endDate={poll.end_date}
                            options={poll.options.map((option: any) => option.text)}
                            vote_count={poll.vote_count}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PublicPollsPage;
