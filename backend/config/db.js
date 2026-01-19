const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DB_URI,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 30000, // 30 seconds timeout
    max: 10, // Max clients in pool
});

// Check DB Connection on startup
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to Database via PG');
    release();
});

// Prevent crash on idle client errors
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    // Don't exit process, just log it. Connection verification happens on query.
});

module.exports = pool;
