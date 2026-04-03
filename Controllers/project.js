import { pool } from "../db.js";

/**
 * Create project
 */
export const createProject = async (req, res) => {
  const { workspaceId } = req.params;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Project name required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO projects (workspace_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [workspaceId, name, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create project error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get projects in workspace
 */
export const getWorkspaceProjects = async (req, res) => {
  const { workspaceId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM projects
       WHERE workspace_id = $1
       ORDER BY created_at DESC`,
      [workspaceId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get projects error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update project
 */
export const updateProject = async (req, res) => {
  const { workspaceId, projectId } = req.params;
  const { name, description, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE projects
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           status = COALESCE($3, status)
       WHERE id = $4 AND workspace_id = $5
       RETURNING *`,
      [name, description, status, projectId, workspaceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update project error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete project (owner only)
 */
export const deleteProject = async (req, res) => {
  const { workspaceId, projectId } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM projects
       WHERE id = $1 AND workspace_id = $2
       RETURNING *`,
      [projectId, workspaceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted" });
  } catch (err) {
    console.error("Delete project error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};