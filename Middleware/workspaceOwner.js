import { pool } from "../db.js";

export async function requireWorkspaceOwner(req, res, next) {
  const { workspaceId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "SELECT * FROM workspaces WHERE id = $1 AND owner_id = $2",
      [workspaceId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Owner access required" });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}