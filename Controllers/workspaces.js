import { pool } from "../db.js";

export const createWorkspace = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  try {
    await pool.query("BEGIN");

    // 1. Create workspace
    const workspaceResult = await pool.query(
      "INSERT INTO workspaces (name, owner_id) VALUES ($1, $2) RETURNING *",
      [name, userId]
    );

    const workspace = workspaceResult.rows[0];

    // 2. Add owner as member
    await pool.query(
      "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, $3)",
      [workspace.id, userId, "owner"]
    );

    await pool.query("COMMIT");

    res.status(201).json(workspace);
  } catch (err) {
    await pool.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  }
};
export const getWorkspaces = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT 
        w.id,
        w.name,
        w.owner_id,
        w.created_at,
        wm.role
      FROM workspaces w
      JOIN workspace_members wm
        ON w.id = wm.workspace_id
      WHERE wm.user_id = $1
      ORDER BY w.created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const inviteMember = async (req, res) => {
  const { workspaceId } = req.params;
  const { email } = req.body;
  const inviterId = req.user.id;

  try {
    // 1️⃣ Check workspace ownership
    const workspaceResult = await pool.query(
      `
      SELECT id FROM workspaces
      WHERE id = $1 AND owner_id = $2
      `,
      [workspaceId, inviterId]
    );

    if (workspaceResult.rows.length === 0) {
      return res.status(403).json({
        error: "Only workspace owner can invite members"
      });
    }

    // 2️⃣ Find user by email
    const userResult = await pool.query(
      "SELECT id, email FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: "User with this email does not exist"
      });
    }

    const invitedUserId = userResult.rows[0].id;

    // 3️⃣ Prevent self-invite
    if (invitedUserId === inviterId) {
      return res.status(400).json({
        error: "You cannot invite yourself"
      });
    }

    // 4️⃣ Check if already a member
    const membershipCheck = await pool.query(
      `
      SELECT id FROM workspace_members
      WHERE workspace_id = $1 AND user_id = $2
      `,
      [workspaceId, invitedUserId]
    );

    if (membershipCheck.rows.length > 0) {
      return res.status(400).json({
        error: "User is already a member of this workspace"
      });
    }

    // 5️⃣ Insert membership
    await pool.query(
      `
      INSERT INTO workspace_members (workspace_id, user_id, role)
      VALUES ($1, $2, 'member')
      `,
      [workspaceId, invitedUserId]
    );

    res.status(201).json({
      message: "User invited successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};