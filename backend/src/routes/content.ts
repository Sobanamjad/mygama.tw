import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { getContent, updateContent } from '../controllers/contentController.js';

const router = Router();

router.get('/', getContent);
router.put('/:section_id', authenticate, updateContent as any);

export default router;
