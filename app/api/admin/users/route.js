import pool from "@/lib/db.js";

export async function GET() {
  const { rows } = await pool.query(`
  SELECT 
    u.id, u.username, u.role, u.is_active,
    u.deactivated_at,
    d.username AS deactivated_by_name
  FROM users u
  LEFT JOIN users d ON d.id = u.deactivated_by
  ORDER BY u.id DESC
`);
  return Response.json({ users: rows });
}
