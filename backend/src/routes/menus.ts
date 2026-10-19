import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { getMenus, updateMenu, addMenuItem, deleteMenuItem } from '../controllers/menuController.js';

const router = Router();

router.get('/', getMenus);
router.put('/:name', authenticate, updateMenu as any);
router.post('/item', authenticate, addMenuItem as any);
router.delete('/item/:id', authenticate, deleteMenuItem as any);

export default router;
