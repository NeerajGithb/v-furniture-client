// app/api/oauth/google/route.ts
import { getGoogleAuthUrl } from '@/lib/google-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.redirect(getGoogleAuthUrl());
}