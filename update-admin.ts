import dbConnect from './lib/dbConnect';
import Admin from './models/Admin';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function updateAdmin() {
  try {
    await dbConnect();
    const newUsername = 'Akash_vision';
    const newPassword = 'vision_1818';
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Check if admin exists
    let admin = await Admin.findOne({});
    if (admin) {
      admin.username = newUsername;
      admin.password = hashedPassword;
      await admin.save();
      console.log('Admin credentials updated successfully.');
    } else {
      await Admin.create({ username: newUsername, password: hashedPassword });
      console.log('Admin account created with requested credentials.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error updating admin:', err);
    process.exit(1);
  }
}

updateAdmin();
