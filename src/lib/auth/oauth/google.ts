/**
 * Google OAuth Provider
 * Google authentication implementation
 */

import { authConfig } from '../config';
import { OAuthProfile } from '../types';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

/**
 * Generate Google OAuth authorization URL
 * @param state - CSRF state token
 * @returns Authorization URL
 */
export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: authConfig.oauth.google.clientId,
    redirect_uri: authConfig.oauth.google.callbackUrl,
    response_type: 'code',
    scope: authConfig.oauth.google.scope.join(' '),
    state,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * @param code - Authorization code
 * @returns Access token and token type
 */
export async function getGoogleAccessToken(code: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: authConfig.oauth.google.clientId,
      client_secret: authConfig.oauth.google.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: authConfig.oauth.google.callbackUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Google token exchange failed: ${error.error_description || error.error}`);
  }

  return response.json();
}

/**
 * Get user profile from Google
 * @param accessToken - Google access token
 * @returns User profile
 */
export async function getGoogleUserProfile(accessToken: string): Promise<OAuthProfile> {
  const response = await fetch(GOOGLE_USER_INFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Google user profile');
  }

  const data = await response.json();

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    avatar: data.picture,
    provider: 'google',
  };
}

/**
 * Complete Google OAuth flow
 * @param code - Authorization code from callback
 * @returns User profile
 */
export async function handleGoogleCallback(code: string): Promise<OAuthProfile> {
  const tokenData = await getGoogleAccessToken(code);
  return getGoogleUserProfile(tokenData.access_token);
}
