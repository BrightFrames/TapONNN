const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const Profile = require('./models/Profile');

    const userId = '6978ef4e2ff3f5a35a37e222';
    console.log('userId (string):', userId);

    // Try as string
    const p1 = await Profile.findOne({ user_id: userId });
    console.log('Query with string:', p1 ? 'FOUND' : 'NOT FOUND');

    // Try as ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    console.log('userObjectId:', userObjectId);
    const p2 = await Profile.findOne({ user_id: userObjectId });
    console.log('Query with ObjectId:', p2 ? 'FOUND' : 'NOT FOUND');

    // Get all profiles and check user_id
    const allProfiles = await Profile.find({});
    console.log('\nAll profiles:');
    allProfiles.forEach(p => {
        console.log('  Username:', p.username, 'user_id:', p.user_id, 'type:', typeof p.user_id);
        console.log('  Match with string:', String(p.user_id) === userId);
    });

    process.exit(0);
}).catch(err => console.error(err));
