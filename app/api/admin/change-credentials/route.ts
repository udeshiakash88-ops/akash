import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Admin from '@/models/Admin';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Auth Token
    const auth = verifyToken(request);
    if (!auth.valid) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { currentUsername, currentPassword, newUsername, newPassword } = await request.json();

    if (!currentUsername || !currentPassword || !newUsername || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await dbConnect();

    // 2. Find Admin
    const admin = await Admin.findOne({});
    if (!admin) {
      return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
    }

    // 3. Verify Current Credentials
    if (currentUsername !== admin.username) {
      return NextResponse.json({ error: 'Current username is incorrect' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // 4. Update with New Credentials
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    admin.username = newUsername;
    admin.password = hashedNewPassword;
    await admin.save();

    return NextResponse.json({ message: 'Credentials updated successfully' });
  } catch (error) {
    console.error('Change credentials error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
