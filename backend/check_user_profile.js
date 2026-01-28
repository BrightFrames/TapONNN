const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const User = require('./models/User');
    const Profile = require('./models/Profile');

    // Get vivek user
    const user = await User.findOne({ email: /vivek/i });
    console.log('User._id:', user._id.toString());

    // Get vivek profile by username
    const profile = await Profile.findOne({ username: 'vivek' });
    console.log('Profile._id:', profile._id.toString());
    console.log('Profile.user_id:', profile.user_id ? profile.user_id.toString() : 'NULL/UNDEFINED');

    // Check if they match
    if (profile.user_id) {
        const match = user._id.toString() === profile.user_id.toString();
        console.log('Do they match?', match);
    } else {
        console.log('Profile.user_id is NULL - this is the problem!');
    }

    // Try to find profile by user_id
    const profileByUserId = await Profile.findOne({ user_id: user._id });
    console.log('Find by user_id result:', profileByUserId ? 'FOUND' : 'NOT FOUND');

    process.exit(0);
}).catch(err => console.error(err));
