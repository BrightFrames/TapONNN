const mongoose = require('mongoose');
const Profile = require('./models/Profile');
require('dotenv').config();

const User = require('./models/User');

const checkProfiles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const userCount = await User.countDocuments();
        console.log(`Total Users: ${userCount}`);

        const allProfiles = await Profile.find({});
        console.log(`Total Profiles: ${allProfiles.length}`);

        const withStoreName = allProfiles.filter(p => p.store_name);
        console.log(`Profiles with store_name: ${withStoreName.length}`);

        const withUsername = allProfiles.filter(p => p.username);
        console.log(`Profiles with username: ${withUsername.length}`);

        if (allProfiles.length > 0) {
            console.log('Sample Profile Keys:', Object.keys(allProfiles[0].toObject()));
            console.log('Sample Profile Data:', {
                username: allProfiles[0].username,
                store_name: allProfiles[0].store_name,
                full_name: allProfiles[0].full_name
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkProfiles();
