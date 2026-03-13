import pool from "@/lib/db.js";

export async function POST(req) {
  const { senders } = await req.json();

  if (!senders?.length) {
    return Response.json({ error: "No senders provided." }, { status: 400 });
  }

  const results = { inserted: 0, skipped: 0, errors: [] };

  for (const s of senders) {
    if (!s.email || !s.appPassword) {
      results.skipped++;
      continue;
    }
    try {
      await pool.query(
        "INSERT INTO sender_accounts (email, app_password) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING",
        [s.email, s.appPassword]
      );
      results.inserted++;
    } catch (err) {
      results.errors.push({ email: s.email, error: err.message });
    }
  }

  return Response.json(results);
}