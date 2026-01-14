
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DB_URI,
});

async function runMigrations() {
    const client = await pool.connect();
    try {
        console.log("Connected to DB. Running migrations...");

        const schema = fs.readFileSync(path.join(__dirname, 'migrations', '000_init_schema.sql'), 'utf8');
        await client.query(schema);
        console.log("✅ Schema created successfully.");

        // We can run the existing 001 migration too just in case, though I included most fields in 000
        const migration1 = fs.readFileSync(path.join(__dirname, 'migrations', '001_add_position_and_features.sql'), 'utf8');
        await client.query(migration1);
        console.log("✅ Additional features migration applied.");

    } catch (err) {
        console.error("❌ Migration failed:", err);
    } finally {
        client.release();
        pool.end();
    }
}

runMigrations();
