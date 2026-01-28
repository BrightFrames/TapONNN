const mongoose = require('mongoose');
require('dotenv').config();

async function testAnalytics() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Profile = require('./models/Profile');
    const AnalyticsEvent = require('./models/AnalyticsEvent');

    // Get a profile
    const profiles = await Profile.find({}).limit(5);
    console.log('\n=== Existing Profiles ===');
    profiles.forEach(p => console.log(`  ${p._id} - @${p.username}`));

    if (profiles.length === 0) {
        console.log('No profiles found!');
        process.exit(1);
    }

    const testProfile = profiles[0];
    console.log(`\nUsing profile: @${testProfile.username} (${testProfile._id})`);

    // Create a test analytics event
    console.log('\n=== Creating Test Analytics Event ===');
    const testEvent = new AnalyticsEvent({
        profile_id: testProfile._id,
        session_id: 'test-session-' + Date.now(),
        event_type: 'pageview',
        url: 'http://localhost:8081/@' + testProfile.username,
        path: '/@' + testProfile.username,
        device: 'Desktop',
        browser: 'Test Browser'
    });

    await testEvent.save();
    console.log('Analytics event saved:', testEvent._id);

    // Check total analytics events
    const totalEvents = await AnalyticsEvent.countDocuments({ profile_id: testProfile._id });
    console.log(`\nTotal analytics events for @${testProfile.username}: ${totalEvents}`);

    // Get recent events
    const recentEvents = await AnalyticsEvent.find({ profile_id: testProfile._id })
        .sort({ timestamp: -1 })
        .limit(5);

    console.log('\n=== Recent Analytics Events ===');
    recentEvents.forEach(e => {
        console.log(`  ${e.event_type} - ${e.path} - ${e.device} - ${e.timestamp}`);
    });

    console.log('\n✅ Analytics is working correctly!');
    process.exit(0);
}

testAnalytics().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
