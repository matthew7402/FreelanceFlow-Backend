// Controllers/messagesController.js
import { pool } from "../db.js";

/**
 * GET /api/messages/:projectId
 * Fetch all messages for a project with sender info
 */
export const getMessages = async (req, res) => {
  const { projectId } = req.params;

  try {
    const result = await pool.query(
      `SELECT m.id, m.project_id, m.sender_id, m.content, m.created_at,
              u.name as sender_name
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.project_id = $1
       ORDER BY m.created_at ASC`,
      [projectId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};


export const handleSendMessage = (io, socket) => {
  socket.on("sendMessage", async (data) => {
    try {
      const { projectId, senderId, content } = data;
      

      // ✅ Check if sender belongs to the project
      const { rowCount } = await pool.query(
        `SELECT 1
         FROM workspace_members wm
         JOIN projects p ON p.workspace_id = wm.workspace_id
         WHERE wm.user_id = $1 AND p.id = $2`,
        [senderId, projectId]
      );

      if (rowCount === 0) {
        return socket.emit("errorMessage", "User not in project");
      }

      // ✅ Save message to database
      const result = await pool.query(
        `INSERT INTO messages (project_id, sender_id, content)
         VALUES ($1, $2, $3)
         RETURNING 
  id, project_id, sender_id, content, created_at,
  (SELECT name FROM users WHERE id = sender_id) as sender_name`,
        [projectId, senderId, content]
      );


      const message = result.rows[0];

      // ✅ Broadcast to everyone in the project room
      io.to(`project_${projectId}`).emit("newMessage", message);

    } catch (err) {
      console.error(err);
      socket.emit("errorMessage", "Failed to send message");
    }
  });
};