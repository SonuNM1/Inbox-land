import pool from "@/lib/db.js";

export async function GET() {
  const { rows } = await pool.query(
    "SELECT id, name, email, mailed, created_at FROM clients ORDER BY created_at DESC"
  );
  return Response.json({ clients: rows });
}

export async function POST(req) {
  const { name, email } = await req.json();

  if (!email) {
    return Response.json({ error: "Email is required." }, { status: 400 });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO clients (name, email) VALUES ($1, $2) RETURNING id, name, email, mailed, created_at",
      [name || null, email]
    );
    return Response.json({ client: rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return Response.json({ error: "This email already exists." }, { status: 409 });
    }
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}