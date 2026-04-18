import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Admin from '@/models/Admin';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { username, password } = await request.json();

    // 1. Check if admin exists in DB
    let admin = await Admin.findOne({});

    // 2. Bootstrap if no admin exists (Transition from .env)
    if (!admin) {
      const defaultUser = process.env.ADMIN_USERNAME;
      const defaultPass = process.env.ADMIN_PASSWORD;

      if (!defaultUser || !defaultPass) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }

      // Seed the DB with current credentials (hashed)
      const hashedPassword = await bcrypt.hash(defaultPass, 10);
      admin = await Admin.create({ username: defaultUser, password: hashedPassword });
      console.log('Admin account bootstrapped to database');
    }

    // 3. Verify Username
    if (username !== admin.username) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 4. Verify Password (Hashed)
    const isValid = await bcrypt.compare(password, admin.password);
    
    // Fallback: If it's the exact same as .env and not yet hashed in a way that matches, 
    // but the DB was already seeded with it... 
    // Wait, the bootstrap already hashes it. 
    // If the DB already has a plain text password (unlikely if I'm the one seedin it), we handle it.
    
    if (!isValid) {
      // One-time fallback for transition if bcrypt.compare fails but plain text matches (only for newly seeded)
      // Actually, since I hash it in step 2, bcrypt.compare will work.
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ username: admin.username, role: 'admin' });
    return NextResponse.json({ token, username: admin.username });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
