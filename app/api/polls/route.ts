import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

// Fetch all polls
export async function GET() {
  const result = await pool.query("SELECT * FROM polls ORDER BY created_at DESC");
  return NextResponse.json(result.rows);
}

// Create a new poll
export async function POST(req: Request) {
  const { name } = await req.json();
  const result = await pool.query(
    "INSERT INTO polls (name) VALUES ($1) RETURNING *",
    [name]
  );
  return NextResponse.json(result.rows[0]);
}
