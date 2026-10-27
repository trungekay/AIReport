import { NextResponse } from 'next/server';
import { getSampleDocuments } from '@/lib/sampleData.js';

export async function GET() {
  const sampleDocs = getSampleDocuments();
  return NextResponse.json({
    success: true,
    documents: sampleDocs,
  });
}
