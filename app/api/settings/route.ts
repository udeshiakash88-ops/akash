import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GlobalSettings from '@/models/GlobalSettings';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    let settings = await GlobalSettings.findOne({});
    if (!settings) {
      // Return default values if nothing in DB yet
      settings = new GlobalSettings({});
    }
    return NextResponse.json(settings);
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch settings: ' + err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = verifyToken(request);
  if (!auth.valid) return NextResponse.json({ error: auth.error }, { status: 401 });

  try {
    await dbConnect();
    const body = await request.json();
    
    // Clean body: strip fields that MongoDB forbids updating
    const { _id, __v, ...updateData } = body;
    
    let settings = await GlobalSettings.findOne({});
    if (settings) {
      const updated = await GlobalSettings.findByIdAndUpdate(settings._id, updateData, { new: true });
      return NextResponse.json({ success: true, settings: updated });
    } else {
      const created = await GlobalSettings.create(updateData);
      return NextResponse.json({ success: true, settings: created });
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update settings: ' + err.message }, { status: 500 });
  }
}
