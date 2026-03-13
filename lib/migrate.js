import pool from "./db.js";

async function migrate() {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,  -- unique username
            password VARCHAR(255) NOT NULL 
        );
    `);
  console.log("✅ Users table created");
  process.exit(0);
}

await pool.query(`
    CREATE TABLE IF NOT EXISTS sender_accounts (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        app_password VARCHAR(255) NOT NULL,
        mails_sent INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
    );
`);
console.log("✅ Sender accounts table created");

await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        mailed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
    );
`);
console.log("✅ Clients table created");

migrate().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
})