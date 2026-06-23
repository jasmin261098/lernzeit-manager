const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/dashboardController');

router.use(auth);

router.get('/', c.getDashboard);

module.exports = router;
