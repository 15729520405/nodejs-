const Router = require('koa-router');
const HomeCtr = require('../controllers/home');

const router = new Router();

const { index, upload } = HomeCtr;

router.get('/', index);

router.post('/upload', upload);

module.exports = router;