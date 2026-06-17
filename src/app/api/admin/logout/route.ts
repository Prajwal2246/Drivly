import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  
  // Clear cookie by setting maxAge to 0
  response.cookies.set('admin_session', '', {
    path: '/',
    maxAge: 0,
  });

  return response;
}
