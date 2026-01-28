const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testStatsAPI() {
    await mongoose.connect(process.env.MONGODB_URI);

    const User = require('./models/User');
    const Profile = require('./models/Profile');
    const AnalyticsEvent = require('./models/AnalyticsEvent');

    // Find vivek user
    const user = await User.findOne({ email: /vivek/i });
    if (!user) {
        console.log('User not found!');
        process.exit(1);
    }
    console.log('User ID:', user._id.toString());

    // Find profile
    const profile = await Profile.findOne({ user_id: user._id });
    if (!profile) {
        console.log('Profile not found!');
        process.exit(1);
    }
    console.log('Profile ID:', profile._id.toString());

    // Generate token
    const token = jwt.sign(
        { id: user._id.toString(), email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    // Make HTTP request to stats endpoint
    const response = await fetch('http://localhost:5000/api/analytics/stats?period=30d', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    console.log('\nAPI Response Status:', response.status);
    const data = await response.json();
    console.log('API Response Data:', JSON.stringify(data, null, 2));

    // Also check events directly
    const events = await AnalyticsEvent.countDocuments({ profile_id: profile._id });
    console.log('\nDirect DB Query - Events for this profile:', events);

    process.exit(0);
}

testStatsAPI().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
