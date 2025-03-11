import { NextResponse } from "next/server";
import { Poll } from "@/app/types/poll";

// Helper function to create consistent dates
const createDate = (daysFromNow: number) => {
  const date = new Date('2024-03-15'); // Fixed base date
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
};

// Dummy data for testing with fixed dates
let dummyPolls: Poll[] = [
  {
    id: 1,
    name: "Community Garden Location",
    description: "Help us decide where to place the new community garden in our neighborhood.",
    endDate: createDate(7),
    options: ["Central Park", "Riverside", "Near School", "Market Square"],
    votes: 24,
    created_at: createDate(-2)
  },
  {
    id: 2,
    name: "Next Tech Meetup Topic",
    description: "What technology should we focus on for our next monthly meetup?",
    endDate: createDate(14),
    options: ["Web3 & Blockchain", "AI/ML", "Cloud Native", "Mobile Dev"],
    votes: 45,
    created_at: createDate(-5)
  },
  {
    id: 3,
    name: "Annual Festival Theme",
    description: "Choose the theme for this year's community festival celebration.",
    endDate: createDate(30),
    options: ["Space Adventure", "Medieval Times", "Future City", "Nature & Wildlife"],
    votes: 156,
    created_at: createDate(-1)
  },
  {
    id: 4,
    name: "Local Infrastructure Priority",
    description: "What should be our top infrastructure priority for Q3 2024?",
    endDate: createDate(21),
    options: ["Road Repairs", "Public Transport", "Bike Lanes", "Parks & Recreation"],
    votes: 89,
    created_at: createDate(-3)
  }
];

// Fetch all polls
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase();

    if (query) {
      const filteredPolls = dummyPolls.filter(poll => 
        poll.name.toLowerCase().includes(query) ||
        poll.description.toLowerCase().includes(query) ||
        poll.options.some(option => option.toLowerCase().includes(query))
      );
      return NextResponse.json(filteredPolls);
    }

    return NextResponse.json(dummyPolls);
  } catch (error) {
    console.error('Error fetching polls:', error);
    return NextResponse.json({ error: 'Failed to fetch polls' }, { status: 500 });
  }
}

// Create a new poll
export async function POST(req: Request) {
  try {
    const { name, description, endDate, options } = await req.json();

    // Validate required fields
    if (!name || !description || !endDate || !options || options.length < 2) {
      return NextResponse.json(
        { error: 'Missing required fields or insufficient options' },
        { status: 400 }
      );
    }

    const newPoll: Poll = {
      id: dummyPolls.length + 1,
      name,
      description,
      endDate,
      options,
      votes: 0,
      created_at: new Date('2024-03-15').toISOString() // Fixed date for new polls
    };

    dummyPolls.push(newPoll);
    return NextResponse.json(newPoll);
  } catch (error) {
    console.error('Error creating poll:', error);
    return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 });
  }
}
