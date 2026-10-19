import { Request, Response } from 'express';
import pool from '../database/config.js';

export const getFeeds = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM rss_feeds ORDER BY created_at');
    res.json({ success: true, feeds: result.rows });
  } catch (error) {
    console.error('Get feeds error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addFeed = async (req: Request, res: Response) => {
  try {
    const { name, url, categories } = req.body;

    if (!name || !url || !categories) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const result = await pool.query(
      'INSERT INTO rss_feeds (name, url, categories) VALUES ($1, $2, $3) RETURNING *',
      [name, url, categories]
    );

    res.json({ success: true, feed: result.rows[0] });
  } catch (error) {
    console.error('Add feed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateFeed = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, url, categories, is_active } = req.body;

    const result = await pool.query(
      `UPDATE rss_feeds
       SET name = COALESCE($1, name),
           url = COALESCE($2, url),
           categories = COALESCE($3, categories),
           is_active = COALESCE($4, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [name, url, categories, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feed not found' });
    }

    res.json({ success: true, feed: result.rows[0] });
  } catch (error) {
    console.error('Update feed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteFeed = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM rss_feeds WHERE id = $1', [id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete feed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleFeed = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE rss_feeds SET is_active = NOT is_active WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feed not found' });
    }

    res.json({ success: true, feed: result.rows[0] });
  } catch (error) {
    console.error('Toggle feed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
