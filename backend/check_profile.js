const mongoose = require('mongoose');
const Profile = require('./models/Profile');
const User = require('./models/User');
const fs = require('fs');
require('dotenv').config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Check all users
        const allUsers = await User.find({}, 'email created_at');

        let output = 'All USERS in database:\n\n';
        allUsers.forEach(u => {
            output += `Email: ${u.email}\n`;
            output += `Created: ${u.created_at}\n`;
            output += `ID: ${u._id}\n`;
            output += `---\n`;
        });
        output += `\nTotal users: ${allUsers.length}\n\n`;

        // Check all profiles
        output += '='.repeat(40) + '\n\n';
        output += 'All PROFILES in database:\n\n';
        const allProfiles = await Profile.find({});
        allProfiles.forEach(p => {
            output += `Username: ${p.username}\n`;
            output += `User ID: ${p.user_id}\n`;
            output += `Full Name: ${p.full_name}\n`;
            output += `has_store: ${p.has_store}\n`;
            output += `store_username: ${p.store_username || 'NOT SET'}\n`;
            output += `store_published: ${p.store_published}\n`;
            output += `---\n`;
        });
        output += `\nTotal profiles: ${allProfiles.length}`;

        fs.writeFileSync('db_output.txt', output);
        console.log('Output written to db_output.txt');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
})();
