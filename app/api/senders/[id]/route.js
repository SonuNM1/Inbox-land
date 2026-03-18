import pool from "@/lib/db.js";

// Delete a sender by ID

export async function DELETE(req, { params }) {
  const { id } = await params;
  try {
    const result = await pool.query("DELETE FROM sender_accounts WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return Response.json({ error: "Sender not found." }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to delete sender." }, { status: 500 });
  }
}

// Update a sender's email and app password

export async function PATCH(req, { params }) {
  const { id } = await params;
  const { email, appPassword } = await req.json();
  if (!email || !appPassword) {
    return Response.json({ error: "Both fields are required." }, { status: 400 });
  }
  try {
    const { rows } = await pool.query(
      "UPDATE sender_accounts SET email = $1, app_password = $2 WHERE id = $3 RETURNING id, email, mails_sent, last_used_at",
      [email, appPassword, id]
    );
    if (rows.length === 0) {
      return Response.json({ error: "Sender not found." }, { status: 404 });
    }
    return Response.json({ sender: rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return Response.json({ error: "This email already exists." }, { status: 409 });
    }
    return Response.json({ error: "Failed to update sender." }, { status: 500 });
  }
}