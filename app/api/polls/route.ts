// import { NextResponse } from "next/server";
// import { Poll } from "@/app/types/poll";
// import pool from "@/app/lib/db";


// async function generateUniqueId(): Promise<number> {
//   const min = 4;
//   const max = 10000;
  
//   while (true) {
//     const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    
//     try {
//       const result = await pool.query(
//         'SELECT id FROM polls WHERE id = $1',
//         [randomId]
//       );
      
//       // If no poll with this ID exists (empty result), return it
//       if (result.rows.length === 0) {
//         return randomId;
//       }
//       // Otherwise try again with a new random number
//     } catch (error) {
//       console.error('Error checking ID existence:', error);
//       // In case of error, generate a new ID to try
//     }
//   }
// }
// // Helper function to create consistent dates
// const createDate = (daysFromNow: number) => {
//   const date = new Date('2024-03-15'); // Fixed base date
//   date.setDate(date.getDate() + daysFromNow);
//   return date.toISOString();
// };

// // Fetch all polls
// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const query = searchParams.get('q')?.toLowerCase();

//     if (query) {
//       const filteredPolls = dummyPolls.filter(poll => 
//         poll.name.toLowerCase().includes(query) ||
//         poll.description.toLowerCase().includes(query) ||
//         poll.options.some(option => option.toLowerCase().includes(query))
//       );
//       return NextResponse.json(filteredPolls);
//     }

//     return NextResponse.json(dummyPolls);
//   } catch (error) {
//     console.error('Error fetching polls:', error);
//     return NextResponse.json({ error: 'Failed to fetch polls' }, { status: 500 });
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const { name, description, endDate, options } = await req.json();
//     if (!name || !description || !endDate || !options || options.length < 2) {
//       return NextResponse.json(
//         { error: 'Missing required fields or insufficient options' },
//         { status: 400 }
//       );
//     }
//     const uniqueId = await generateUniqueId();

//     const newPoll: Poll = {
//       id: uniqueId,
//       name,
//       description,
//       endDate,
//       options,
//       votes: 0,
//       created_at: new Date('2024-03-15').toISOString()
//     };
//     await pool.query(
//       'INSERT INTO polls (id, name, description, end_date, options, votes, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
//       [
//         newPoll.id, 
//         newPoll.name, 
//         newPoll.description, 
//         newPoll.endDate, 
//         JSON.stringify(newPoll.options),
//         newPoll.votes, 
//         newPoll.created_at
//       ]
//     );

//     dummyPolls.push(newPoll);

//     return NextResponse.json(newPoll);
//   } catch (error) {
//     console.error('Error creating poll:', error);
//     return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 });
//   }
// }