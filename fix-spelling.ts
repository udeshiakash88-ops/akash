import dbConnect from './lib/dbConnect';
import GlobalSettings from './models/GlobalSettings';

async function fixSpelling() {
  try {
    await dbConnect();
    const settings = await GlobalSettings.findOne({});
    if (settings && settings.stats) {
      settings.stats = settings.stats.map((s: any) => ({
        ...s,
        label: s.label.replace('Experiance', 'Experience')
      }));
      await settings.save();
      console.log('Fixed spelling in GlobalSettings stats.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error fixing spelling:', err);
    process.exit(1);
  }
}

fixSpelling();
