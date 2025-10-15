import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "Theo Core",
    status: "alive",
    timestamp: new Date().toISOString(),
  });
}