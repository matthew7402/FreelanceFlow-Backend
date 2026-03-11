import { pool } from "../db.js";

async function requireWorkspaceMember(req, res, next) {
  const { workspaceId } = req.params;
  const userId = req.user.id;

  try {
    // Check if owner
    const workspaceCheck = await pool.query(
      "SELECT * FROM workspaces WHERE id = $1 AND owner_id = $2",
      [workspaceId, userId]
    );

    if (workspaceCheck.rows.length > 0) {
      req.workspace = workspaceCheck.rows[0];
      return next();
    }

    // Check if member
    const memberCheck = await pool.query(
      "SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [workspaceId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export { requireWorkspaceMember };