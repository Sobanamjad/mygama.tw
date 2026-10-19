import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { getFeeds, addFeed, updateFeed, deleteFeed, toggleFeed } from '../controllers/rssController.js';

const router = Router();

router.get('/', getFeeds);
router.post('/', authenticate, addFeed as any);
router.put('/:id', authenticate, updateFeed as any);
router.delete('/:id', authenticate, deleteFeed as any);
router.patch('/:id/toggle', authenticate, toggleFeed as any);

export default router;
