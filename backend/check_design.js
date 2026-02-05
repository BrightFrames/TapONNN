const mongoose = require('mongoose');
const Profile = require('./models/Profile');
require('dotenv').config();

const checkDesign = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const profile = await Profile.findOne({ username: 'sourabhu' });
        
        if (profile) {
            console.log('\n=== DESIGN CONFIG ===');
            console.log(JSON.stringify(profile.design_config, null, 2));
            
            console.log('\n=== STORE DESIGN CONFIG ===');
            console.log(JSON.stringify(profile.store_design_config, null, 2));
        } else {
            console.log('Profile not found');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDesign();
