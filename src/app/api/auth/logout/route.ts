import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  
  // Clear user_session cookie
  response.cookies.set('user_session', '', {
    path: '/',
    maxAge: 0,
  });

  return response;
}
