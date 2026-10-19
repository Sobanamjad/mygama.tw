import { Request, Response } from 'express';
import pool from '../database/config.js';

export const getMenus = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT m.id, m.name, m.created_at, m.updated_at,
             mi.id as item_id, mi.label, mi.href, mi.order_index
      FROM menus m
      LEFT JOIN menu_items mi ON m.id = mi.menu_id
      ORDER BY m.name, mi.order_index
    `);

    const menusMap = new Map();

    for (const row of result.rows) {
      if (!menusMap.has(row.id)) {
        menusMap.set(row.id, {
          id: row.id,
          name: row.name,
          items: [],
          created_at: row.created_at,
          updated_at: row.updated_at
        });
      }

      if (row.item_id) {
        menusMap.get(row.id).items.push({
          id: row.item_id,
          label: row.label,
          href: row.href,
          order: row.order_index
        });
      }
    }

    res.json({ success: true, menus: Array.from(menusMap.values()) });
  } catch (error) {
    console.error('Get menus error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMenu = async (req: Request, res: Response) => {
  try {
    const { name, items } = req.body;

    if (!name || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const menuResult = await pool.query('SELECT id FROM menus WHERE name = $1', [name]);

    if (menuResult.rows.length === 0) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    const menuId = menuResult.rows[0].id;

    // Delete existing items
    await pool.query('DELETE FROM menu_items WHERE menu_id = $1', [menuId]);

    // Insert new items
    for (const item of items) {
      await pool.query(
        'INSERT INTO menu_items (menu_id, label, href, order_index) VALUES ($1, $2, $3, $4)',
        [menuId, item.label, item.href, item.order || 0]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addMenuItem = async (req: Request, res: Response) => {
  try {
    const { name, label, href, order } = req.body;

    if (!name || !label || !href) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const menuResult = await pool.query('SELECT id FROM menus WHERE name = $1', [name]);

    if (menuResult.rows.length === 0) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    const menuId = menuResult.rows[0].id;

    const result = await pool.query(
      'INSERT INTO menu_items (menu_id, label, href, order_index) VALUES ($1, $2, $3, $4) RETURNING *',
      [menuId, label, href, order || 0]
    );

    res.json({ success: true, item: result.rows[0] });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM menu_items WHERE id = $1', [id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
