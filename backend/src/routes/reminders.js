import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import auth from '../middleware/auth.js';
import * as c from '../controllers/reminderController.js';

const router = Router();

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

router.use(auth);

router.get('/', c.getAll);
router.post('/', [
    body('message').notEmpty(),
    body('scheduledAt').isISO8601()
], validate, c.create);
router.delete('/:id', c.remove);

export default router;
