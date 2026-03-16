import pool from "./db.js";
import bcrypt from "bcryptjs";
import usersToSeed from "./users-to-seed.js";

async function seed() {

  for (const user of usersToSeed) {

    const hashedPassword = await bcrypt.hash(user.password, 10);

    await pool.query(
      `INSERT INTO users (username, password, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO NOTHING`,
      [user.username, hashedPassword, user.role]
    );

    console.log(`✅ Seeded: ${user.username}`);
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});