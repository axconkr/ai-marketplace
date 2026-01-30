/**
 * CSRF Token API Endpoint
 * GET /api/csrf - Generate and return CSRF token
 */

import { NextResponse } from 'next/server';
import { generateCSRFToken, setCSRFCookie, CSRF_HEADER_NAME } from '@/lib/csrf';

export async function GET() {
  const token = generateCSRFToken();
  
  const response = NextResponse.json({
    csrfToken: token,
  });
  
  // Set CSRF token in cookie (not httpOnly so JS can read it)
  setCSRFCookie(response, token);
  
  // Also return in header for convenience
  response.headers.set(CSRF_HEADER_NAME, token);
  
  return response;
}
