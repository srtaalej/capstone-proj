import { NextResponse } from "next/server";

// Dummy data for testing
let dummyPolls = [
  {
    id: 1,
    name: "Test Poll 1",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Test Poll 2",
    created_at: new Date().toISOString()
  }
];

// Fetch all polls
export async function GET() {
  return NextResponse.json(dummyPolls);
}

// Create a new poll
export async function POST(req: Request) {
  const { name } = await req.json();
  const newPoll = {
    id: dummyPolls.length + 1,
    name,
    created_at: new Date().toISOString()
  };
  dummyPolls.push(newPoll);
  return NextResponse.json(newPoll);
}
