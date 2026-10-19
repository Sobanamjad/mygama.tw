import { Request, Response } from 'express';
import pool from '../database/config.js';

export const getContent = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM content_sections ORDER BY section_id');
    res.json({ success: true, content: result.rows });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateContent = async (req: Request, res: Response) => {
  try {
    const { section_id, content } = req.body;

    if (!section_id || !content) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const result = await pool.query(
      `UPDATE content_sections
       SET content = $1, updated_at = CURRENT_TIMESTAMP
       WHERE section_id = $2
       RETURNING *`,
      [JSON.stringify(content), section_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content section not found' });
    }

    res.json({ success: true, content: result.rows[0] });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
