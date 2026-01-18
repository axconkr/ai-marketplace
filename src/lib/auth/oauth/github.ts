/**
 * GitHub OAuth Provider
 * GitHub authentication implementation
 */

import { authConfig } from '../config';
import { OAuthProfile } from '../types';

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_API_URL = 'https://api.github.com/user';
const GITHUB_USER_EMAILS_URL = 'https://api.github.com/user/emails';

/**
 * Generate GitHub OAuth authorization URL
 * @param state - CSRF state token
 * @returns Authorization URL
 */
export function getGitHubAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: authConfig.oauth.github.clientId,
    redirect_uri: authConfig.oauth.github.callbackUrl,
    scope: authConfig.oauth.github.scope.join(' '),
    state,
  });

  return `${GITHUB_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * @param code - Authorization code
 * @returns Access token and token type
 */
export async function getGitHubAccessToken(code: string): Promise<{
  access_token: string;
  token_type: string;
  scope: string;
}> {
  const response = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: authConfig.oauth.github.clientId,
      client_secret: authConfig.oauth.github.clientSecret,
      code,
      redirect_uri: authConfig.oauth.github.callbackUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`GitHub token exchange failed: ${error.error_description || error.error}`);
  }

  return response.json();
}

/**
 * Get user profile from GitHub
 * @param accessToken - GitHub access token
 * @returns User profile
 */
export async function getGitHubUserProfile(accessToken: string): Promise<OAuthProfile> {
  // Fetch user profile
  const userResponse = await fetch(GITHUB_USER_API_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!userResponse.ok) {
    throw new Error('Failed to fetch GitHub user profile');
  }

  const userData = await userResponse.json();

  // If email is not public, fetch from emails endpoint
  let email = userData.email;
  if (!email) {
    const emailsResponse = await fetch(GITHUB_USER_EMAILS_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (emailsResponse.ok) {
      const emails = await emailsResponse.json();
      const primaryEmail = emails.find((e: { primary: boolean; verified: boolean }) => e.primary && e.verified);
      email = primaryEmail?.email || emails[0]?.email;
    }
  }

  if (!email) {
    throw new Error('Unable to retrieve email from GitHub account');
  }

  return {
    id: userData.id.toString(),
    email,
    name: userData.name || userData.login,
    avatar: userData.avatar_url,
    provider: 'github',
  };
}

/**
 * Complete GitHub OAuth flow
 * @param code - Authorization code from callback
 * @returns User profile
 */
export async function handleGitHubCallback(code: string): Promise<OAuthProfile> {
  const tokenData = await getGitHubAccessToken(code);
  return getGitHubUserProfile(tokenData.access_token);
}
