const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const User = require('./models/User');
    const Profile = require('./models/Profile');

    // Find vivek user
    const user = await User.findOne({ email: /vivek/i });
    if (!user) {
        console.log('User not found!');
        process.exit(1);
    }

    console.log('User found:', user._id, user.email);

    // Generate a token for testing
    const token = jwt.sign(
        { id: user._id.toString(), email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    console.log('\n=== TEST TOKEN FOR VIVEK ===');
    console.log(token);
    console.log('\n=== CURL COMMAND TO TEST ===');
    console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:5000/api/analytics/stats?period=30d`);

    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
