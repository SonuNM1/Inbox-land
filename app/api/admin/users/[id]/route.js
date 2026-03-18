import pool from "@/lib/db.js";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const { action, adminId } = await req.json();

  // Verify the requester is actually an admin
  const { rows: adminCheck } = await pool.query(
    "SELECT role FROM users WHERE id = $1",
    [adminId]
  );
  if (!adminCheck[0] || adminCheck[0].role !== "admin") {
    return Response.json({ error: "Unauthorized. Admins only." }, { status: 403 });
  }

  if (action === "deactivate") {
    await pool.query(
      `UPDATE users 
       SET is_active = FALSE, deactivated_by = $1, deactivated_at = NOW() 
       WHERE id = $2`,
      [adminId, id]
    );
    return Response.json({ success: true });
  }

  if (action === "reactivate") {
    await pool.query(
      `UPDATE users 
       SET is_active = TRUE, deactivated_by = NULL, deactivated_at = NULL 
       WHERE id = $1`,
      [id]
    );
    return Response.json({ success: true });
  }

  return Response.json({ error: "Invalid action." }, { status: 400 });
}