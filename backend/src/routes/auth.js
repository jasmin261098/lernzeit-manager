const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { register, login } = require('../controllers/authController');

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

module.exports = router;
