import { NextRequest, NextResponse } from 'next/server';

export const CSRF_COOKIE_NAME = 'csrfToken';
export const CSRF_HEADER_NAME = 'x-csrf-token';

function base64UrlEncode(bytes: Uint8Array): string {
  let base64: string;

  if (typeof btoa === 'function') {
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    base64 = btoa(binary);
  } else if (typeof Buffer !== 'undefined') {
    base64 = Buffer.from(bytes).toString('base64');
  } else {
    throw new Error('Base64 encoding is not available');
  }

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function generateCSRFToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

export function setCSRFCookie(response: NextResponse, token?: string): string {
  const value = token ?? generateCSRFToken();

  response.cookies.set(CSRF_COOKIE_NAME, value, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return value;
}

export function validateCSRFToken(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return false;
  }

  return cookieToken === headerToken;
}
