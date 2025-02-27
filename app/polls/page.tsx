"use client";
import { useState, useEffect } from "react";

interface Poll {
  id: number;
  name: string;
  created_at: string;
}

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);  
  const [pollName, setPollName] = useState("");

  // Fetch polls from API
  const fetchPolls = async () => {
    const response = await fetch("/api/polls");
    const data: Poll[] = await response.json();  
    setPolls(data);
  };

  // Create a new poll
  const createPoll = async () => {
    if (!pollName) return alert("Enter a poll name!");

    const response = await fetch("/api/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: pollName }),
    });

    if (response.ok) {
      setPollName("");
      fetchPolls();
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Polls</h1>

      <input
        type="text"
        value={pollName}
        onChange={(e) => setPollName(e.target.value)}
        placeholder="Enter poll name"
        className="border p-2 w-full mb-2"
      />

      <button onClick={createPoll} className="px-4 py-2 bg-blue-500 text-white rounded">
        Create Poll
      </button>

      <ul className="mt-4">
        {polls.map((poll) => (
          <li key={poll.id} className="border p-2 mt-2">
            {poll.name} (Created: {new Date(poll.created_at).toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
}
