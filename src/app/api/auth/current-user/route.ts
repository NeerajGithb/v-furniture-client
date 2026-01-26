export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/security/auth';
import { connectDB } from '@/lib/dbConnect';
import User from '@/models/User';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vf_access')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Access token missing', user: null }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Invalid access token', user: null }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(payload.userId).select('name email _id photoURL');
    if (!user) {
      return NextResponse.json({ error: 'User not found', user: null }, { status: 401 });
    }

    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
    };

    return NextResponse.json({ user: userResponse }, { status: 200 });
  } catch (err) {
    console.error('❌ /current-user error:', err);
    return NextResponse.json({ error: 'Internal server error', user: null }, { status: 500 });
  }
}