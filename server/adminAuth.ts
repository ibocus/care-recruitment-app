import { createClerkClient, verifyToken } from '@clerk/backend';
import type { VercelRequest } from '@vercel/node';

export class AuthError extends Error {}

// Any Clerk account that can sign in to /admin is treated as staff — there
// is no public sign-up flow in this app, so access is controlled entirely
// by who has a Clerk account (invite staff from the Clerk dashboard, with
// public sign-up turned off there).
export async function requireStaffAuth(req: VercelRequest): Promise<string> {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) {
    throw new AuthError('Sign in required');
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Staff sign-in is not configured: set CLERK_SECRET_KEY');
  }

  try {
    const claims = await verifyToken(token, { secretKey });
    return claims.sub;
  } catch {
    throw new AuthError('Your session has expired — please sign in again');
  }
}

export function getClerkClient() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Staff sign-in is not configured: set CLERK_SECRET_KEY');
  }
  return createClerkClient({ secretKey });
}
