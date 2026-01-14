
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DB_URI,
});

async function checkUsers() {
    const client = await pool.connect();
    try {
        console.log("Checking Auth Users and Profiles...");

        // Check auth.users (Supabase managed)
        try {
            const authRes = await client.query('SELECT id, email, created_at FROM auth.users');
            console.log(`Found ${authRes.rows.length} users in auth.users:`);
            console.table(authRes.rows);
        } catch (e) {
            console.log("Could not access auth.users (might be permission restricted):", e.message);
        }

        // Check public.profiles (App managed)
        const profileRes = await client.query('SELECT * FROM public.profiles');
        console.log(`Found ${profileRes.rows.length} profiles in public.profiles:`);
        console.table(profileRes.rows);

    } catch (err) {
        console.error("Query failed:", err);
    } finally {
        client.release();
        pool.end();
    }
}

checkUsers();
