import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export function verifyToken(request: NextRequest): { valid: boolean; error?: string } {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'No token provided' };
  }

  const token = authHeader.substring(7);
  try {
    jwt.verify(token, JWT_SECRET);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid token' };
  }
}

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
