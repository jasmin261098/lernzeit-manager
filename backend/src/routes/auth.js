import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { register, login } from '../controllers/authController.js';

const router = Router();

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

router.post('/register', [
    body('email').isEmail(),
    body('password').isLength({ min: 8 })
], validate, register);

router.post('/login', [
    body('email').isEmail(),
    body('password').notEmpty()
], validate, login);

export default router;
