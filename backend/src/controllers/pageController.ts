import { Request, Response } from 'express';
import pool from '../database/config.js';

export const getPages = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM pages ORDER BY created_at');
    res.json({ success: true, pages: result.rows });
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPage = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      'SELECT * FROM pages WHERE slug = $1 AND is_published = true',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({ success: true, page: result.rows[0] });
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPage = async (req: Request, res: Response) => {
  try {
    const { slug, title, description, content, meta_title, meta_description, is_published } = req.body;

    if (!slug || !title) {
      return res.status(400).json({ error: 'Slug and title are required' });
    }

    const result = await pool.query(
      `INSERT INTO pages (slug, title, description, content, meta_title, meta_description, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [slug, title, description, content, meta_title, meta_description, is_published ?? true]
    );

    res.json({ success: true, page: result.rows[0] });
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { slug, title, description, content, meta_title, meta_description, is_published } = req.body;

    const result = await pool.query(
      `UPDATE pages
       SET slug = COALESCE($1, slug),
           title = COALESCE($2, title),
           description = COALESCE($3, description),
           content = COALESCE($4, content),
           meta_title = COALESCE($5, meta_title),
           meta_description = COALESCE($6, meta_description),
           is_published = COALESCE($7, is_published),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [slug, title, description, content, meta_title, meta_description, is_published, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({ success: true, page: result.rows[0] });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM pages WHERE id = $1', [id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const togglePublish = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE pages SET is_published = NOT is_published WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({ success: true, page: result.rows[0] });
  } catch (error) {
    console.error('Toggle publish error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
