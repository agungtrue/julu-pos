'use server';

import { cookies } from 'next/headers';

export async function setAuthCookie(token: string) {
  (await cookies()).set('julu_session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true };
}

export async function removeAuthCookie() {
  (await cookies()).delete('julu_session_token');
  return { success: true };
}

export async function getAuthToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('julu_session_token')?.value;
  
  return token || null;
}