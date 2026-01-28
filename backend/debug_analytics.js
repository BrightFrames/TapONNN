const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const Profile = require('./models/Profile');
    const AnalyticsEvent = require('./models/AnalyticsEvent');
    const User = require('./models/User');

    // Find vivek's user and profile
    const user = await User.findOne({ email: /vivek/i });
    if (!user) {
        console.log('User not found by email, checking profiles...');
    } else {
        console.log('User ID:', user._id);
    }

    const profile = await Profile.findOne({ username: 'vivek' });
    if (!profile) {
        console.log('Profile not found!');
        process.exit(1);
    }
    console.log('Profile ID:', profile._id);
    console.log('Profile user_id:', profile.user_id);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    console.log('Start Date:', startDate);

    // Check all events for this profile
    const allEvents = await AnalyticsEvent.find({ profile_id: profile._id });
    console.log('\nAll events for this profile:', allEvents.length);
    allEvents.forEach(e => {
        console.log('  - Event:', e.event_type, e.path, e.timestamp);
    });

    // Run the same aggregation as the controller
    const stats = await AnalyticsEvent.aggregate([
        {
            $match: {
                profile_id: profile._id,
                timestamp: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: { $cond: [{ $eq: ['$event_type', 'pageview'] }, 1, 0] } },
                sessions: { $addToSet: '$session_id' }
            }
        }
    ]);

    console.log('\nAggregation result:', JSON.stringify(stats, null, 2));

    if (stats.length > 0) {
        console.log('\nParsed stats:');
        console.log('  Total Views:', stats[0].totalViews);
        console.log('  Unique Sessions:', stats[0].sessions.length);
    } else {
        console.log('\nNo stats returned from aggregation!');
    }

    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
