import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT id, username, role FROM users ORDER BY id DESC"
    );
    return Response.json({ users: result.rows });
  } catch (err) {
    console.error("Failed to fetch users:", err);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}