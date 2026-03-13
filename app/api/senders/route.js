import pool from "@/lib/db.js";

export async function GET() {
  const { rows } = await pool.query(
    "SELECT id, email, app_password, mails_sent, created_at FROM sender_accounts ORDER BY created_at DESC"
  );
  return Response.json({ senders: rows });
}

export async function POST(req) {
  const { email, appPassword } = await req.json();

  if (!email || !appPassword) {
    return Response.json({ error: "Email and app password are required" }, { status: 400 });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO sender_accounts (email, app_password) VALUES ($1, $2) RETURNING id, email, mails_sent, created_at",
      [email, appPassword]
    );
    return Response.json({ sender: rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return Response.json({ error: "This email already exists." }, { status: 409 });
    }
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}