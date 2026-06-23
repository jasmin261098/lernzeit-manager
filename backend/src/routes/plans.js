const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const c = require('../controllers/planController');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

router.use(auth);

router.get('/', c.getAll);
router.post('/', [
    body('title').notEmpty(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601()
], validate, c.create);
router.put('/:id', [
    body('title').optional().notEmpty(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601()
], validate, c.update);
router.delete('/:id', c.remove);
router.get('/monthly/:month', c.getMonthly);

module.exports = router;
