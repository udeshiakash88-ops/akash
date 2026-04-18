import mongoose from 'mongoose';
import GlobalSettings from '../models/GlobalSettings';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function seedLogo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const result = await GlobalSettings.findOneAndUpdate(
      {},
      { logoImage: 'https://drive.google.com/file/d/1_DVSa5P0hDjAgBDg-bZZKaYF7eVzzG1C/view' },
      { upsert: true, new: true }
    );

    console.log('Logo seeded successfully:', result.logoImage);
  } catch (error) {
    console.error('Error seeding logo:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedLogo();
