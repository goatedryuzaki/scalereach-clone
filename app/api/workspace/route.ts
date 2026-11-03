import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const workspace = db.getWorkspace();
  return NextResponse.json({ workspace });
}
