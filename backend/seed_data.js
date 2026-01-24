const mongoose = require('mongoose');
const Profile = require('./models/Profile');
const User = require('./models/User');
require('dotenv').config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Clear existing data (optional, but safest for clean state)
        // await Profile.deleteMany({});
        // await User.deleteMany({});

        const mockUsers = [
            {
                username: 'johndoe',
                store_name: 'John\'s Coffee',
                bg: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80',
                bio: 'Coffee enthusiast and barista.',
                category: 'food'
            },
            {
                username: 'sarah_design',
                store_name: 'Sarah Design Studio',
                bg: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80',
                bio: 'Creative director & UI/UX Designer.',
                category: 'digital'
            },
            {
                username: 'mike_tech',
                store_name: 'Mike Tech Reviews',
                bg: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80',
                avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80',
                bio: 'Unboxing the latest gadgets.',
                category: 'tech'
            },
            {
                username: 'wanderlust_amy',
                store_name: 'Amy Travels',
                bg: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80',
                bio: 'Exploring the world one city at a time.',
                category: 'other'
            },
            {
                username: 'fitness_jack',
                store_name: 'Jack Fitness',
                bg: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80',
                avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80',
                bio: 'Personal trainer and nutrition coach.',
                category: 'health'
            }
        ];

        for (const data of mockUsers) {
            // Create Dummy User
            const user = await User.create({
                email: `${data.username}@example.com`,
                password_hash: 'hashedpassword123', // Dummy hash
            });

            // Create Profile
            await Profile.create({
                user_id: user._id,
                username: data.username,
                full_name: data.store_name,
                store_username: data.username, // Using same for simplicity
                store_name: data.store_name,
                store_bio: data.bio,
                store_avatar_url: data.avatar,
                store_category: data.category,
                store_published: true,
                design_config: {
                    backgroundImage: data.bg,
                    theme: 'custom'
                }
            });
            console.log(`Created user: ${data.username}`);
        }

        console.log('Seeding completed!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

seedData();
