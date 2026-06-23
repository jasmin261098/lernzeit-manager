const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const c = require('../controllers/sessionController');

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

module.exports = router;
