import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GlobalSettings from '@/models/GlobalSettings';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const result = await GlobalSettings.findOneAndUpdate(
      {},
      { logoImage: 'https://drive.google.com/file/d/1_DVSa5P0hDjAgBDg-bZZKaYF7eVzzG1C/view' },
      { upsert: true, new: true }
    );
    return NextResponse.json({ success: true, logoImage: result.logoImage });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
