const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');
require('dotenv').config();

const createVivekUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Create User
        const email = 'vivek@example.com';
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                password_hash: '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Dummy hash, user might need to reset or we use a known one if we knew the salt/rounds logic of the app, but for now just creating the record. 
                // Actually, since I don't know the password hashing salt/secret, this user won't be able to login with this password. 
                // However, the USER IS ALREADY LOGGED IN on the frontend (presumably using some auth token or they are just assuming).
                // Wait, if they are logged in on frontend, they must exist somewhere? 
                // Maybe they are using a different email?
                // But the public profile is looked up by USERNAME.
                // So I just need to create the Profile with username "vivek".
            });
            console.log('Created User:', user._id);
        } else {
            console.log('User already exists:', user._id);
        }

        // 2. Create Profile
        const username = 'vivek';
        let profile = await Profile.findOne({ username });

        if (!profile) {
            profile = await Profile.create({
                user_id: user._id,
                username: username,
                full_name: 'Vivek',
                email: email,
                active_profile_mode: 'store', // Force store mode
                has_store: true,
                store_published: true, // Auto publish
                store_username: username, // Important for the store lookup
                store_name: "Vivek's Store",
                selected_theme: 'artemis',
                design_config: { theme: 'artemis' }
            });
            console.log('Created Profile:', profile.username);
        } else {
            console.log('Profile already exists. Updating...');
            profile.has_store = true;
            profile.store_published = true;
            profile.store_username = username; // Ensure this is set
            profile.active_profile_mode = 'store';
            await profile.save();
            console.log('Updated Profile');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

createVivekUser();
