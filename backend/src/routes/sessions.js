import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import auth from '../middleware/auth.js';
import * as c from '../controllers/sessionController.js';

const router = Router();

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

router.use(auth);

router.get('/', c.getAll);
router.post('/start', [
    body('topic').notEmpty(),
    body('goalId').optional().isInt({ min: 1 })
], validate, c.start);
router.patch('/:id/stop', c.stop);

export default router;
