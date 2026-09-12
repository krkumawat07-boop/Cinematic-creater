import { Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken } from './firebaseAdmin.js';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  userId?: string;
  idToken?: string;
}

/**
 * Middleware: requireAuth
 * Strictly enforces valid Firebase ID Token via Authorization: Bearer <token> header.
 * Attaches verified user and uid to the request.
 * Rejects with HTTP 401 if missing, invalid, or expired.
 */
export async function requireAuth(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Missing or invalid Authorization header. Please sign in.',
      code: 'AUTH_REQUIRED'
    });
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized: Empty token. Please sign in.',
      code: 'AUTH_TOKEN_EMPTY'
    });
  }

  try {
    const verifiedUser = await verifyFirebaseToken(token);
    req.user = verifiedUser;
    req.userId = verifiedUser.uid;
    req.idToken = token;
    next();
  } catch (err: any) {
    console.error('Firebase token verification error:', err.message);
    return res.status(401).json({
      error: 'Unauthorized: Invalid or expired authentication token. Please sign in again.',
      code: 'AUTH_TOKEN_INVALID',
      details: err.message
    });
  }
}

/**
 * Optional Auth middleware:
 * If Authorization header is present, verifies it and attaches user.
 * Does not reject unauthenticated requests.
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return next();
  }

  try {
    const verifiedUser = await verifyFirebaseToken(token);
    req.user = verifiedUser;
    req.userId = verifiedUser.uid;
    req.idToken = token;
  } catch (err) {
    // optional, proceed without user
  }
  next();
}
