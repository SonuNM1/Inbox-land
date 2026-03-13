import pool from "@/lib/db.js";

export async function DELETE(req, { params }) {
  const { id } = params;
  await pool.query("DELETE FROM clients WHERE id = $1", [id]);
  return Response.json({ success: true });
}