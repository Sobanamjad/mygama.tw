import { Request, Response } from 'express';
import pool from '../database/config.js';
import { v4 as uuidv4 } from 'uuid';

export const getMedia = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM media ORDER BY created_at DESC');
    res.json({ success: true, media: result.rows });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, mimetype, size, buffer } = req.file;

    // Convert buffer to base64
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimetype};base64,${base64}`;

    const type = mimetype.startsWith('image/') ? 'image' :
                 mimetype.startsWith('video/') ? 'video' : 'document';

    const result = await pool.query(
      'INSERT INTO media (id, name, url, type, size) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [uuidv4(), originalname, dataUrl, type, size]
    );

    res.json({ success: true, media: result.rows[0] });
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM media WHERE id = $1', [id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
