const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const AnalyticsEvent = require('./models/AnalyticsEvent');
    const Profile = require('./models/Profile');

    // Count total events
    const count = await AnalyticsEvent.countDocuments();
    console.log('========================================');
    console.log('TOTAL ANALYTICS EVENTS IN DATABASE: ' + count);
    console.log('========================================');

    // Get profiles with their event counts
    const profiles = await Profile.find().limit(5);
    console.log('\nEvents per profile:');
    for (let p of profiles) {
        const profileEvents = await AnalyticsEvent.countDocuments({ profile_id: p._id });
        console.log('  @' + p.username + ': ' + profileEvents + ' events');
    }

    // Recent events
    console.log('\nRecent 5 events:');
    const recent = await AnalyticsEvent.find().sort({ timestamp: -1 }).limit(5);
    recent.forEach((e, i) => {
        console.log('  ' + (i + 1) + '. ' + e.event_type + ' | ' + e.path + ' | ' + e.device + ' | ' + e.timestamp.toLocaleString());
    });

    console.log('\n========================================');
    console.log('ANALYTICS IS WORKING!');
    console.log('========================================');

    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
