const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DB_URI,
});

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log("Running migration: 003_add_design_config.sql");
        const sqlPath = path.join(__dirname, 'migrations', '003_add_design_config.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');

        console.log("Migration completed successfully.");
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Migration failed:", err);
    } finally {
        client.release();
        pool.end();
    }
}

runMigration();
