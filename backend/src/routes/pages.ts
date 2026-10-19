import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { getPages, getPage, createPage, updatePage, deletePage, togglePublish } from '../controllers/pageController.js';

const router = Router();

router.get('/', getPages);
router.get('/:slug', getPage);
router.post('/', authenticate, createPage as any);
router.put('/:id', authenticate, updatePage as any);
router.delete('/:id', authenticate, deletePage as any);
router.patch('/:id/toggle', authenticate, togglePublish as any);

export default router;
