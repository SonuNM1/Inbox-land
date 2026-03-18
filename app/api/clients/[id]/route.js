import pool from "@/lib/db.js";

export async function DELETE(req, { params }) {
  const { id } = await params;  // ← add await here
  try {
    const result = await pool.query("DELETE FROM clients WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return Response.json({ error: "Client not found." }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: "Failed to delete client." }, { status: 500 });
  }
}