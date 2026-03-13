import pool from "./db.js";
import bcrypt from "bcryptjs";
import usersToSeed from "./users-to-seed.js";

async function seed() {

  // Loop through every user defined in users-to-seed.js
  for (const user of usersToSeed) {

    // Hash password before storing — never store plain text
    const hashedPassword = await bcrypt.hash(user.password, 10)

    await pool.query(
      `INSERT INTO users (username, password)
       VALUES ($1, $2)
       ON CONFLICT (username) DO NOTHING`,
      [user.username, hashedPassword]
    )

    console.log(`✅ Seeded: ${user.username}`)
  }

  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})