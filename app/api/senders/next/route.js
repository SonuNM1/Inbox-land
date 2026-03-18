import pool from "@/lib/db.js";

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT id, email, app_password
      FROM sender_accounts
      WHERE last_used_at IS NULL 
        OR last_used_at < NOW() - INTERVAL '36 hours'
      ORDER BY last_used_at ASC NULLS FIRST
      LIMIT 1
    `);

    if (rows.length === 0) {
      return Response.json(
        { error: "No eligible senders available. All accounts are in cooldown." },
        { status: 404 }
      );
    }

    return Response.json({ sender: rows[0] });
  } catch (err) {
    return Response.json({ error: "Failed to fetch next sender." }, { status: 500 });
  }
}