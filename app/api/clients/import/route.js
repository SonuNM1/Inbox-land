import pool from "@/lib/db.js";

export async function POST(req) {
  const { clients } = await req.json();

  if (!clients?.length) {
    return Response.json({ error: "No clients provided." }, { status: 400 });
  }

  const results = { inserted: 0, skipped: 0, errors: [] };

  for (const c of clients) {
    if (!c.email) { results.skipped++; continue; }
    try {
      await pool.query(
        "INSERT INTO clients (name, email) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING",
        [c.name || null, c.email]
      );
      results.inserted++;
    } catch (err) {
      results.errors.push({ email: c.email, error: err.message });
    }
  }

  return Response.json(results);
}