const jwt = require('koa-jwt');
const Router = require('koa-router');
const AnswersCtr = require('../controllers/answers');

const { secret } = require('../config');

const auth = jwt({ secret });

const router = new Router({ prefix: '/questions/:questionId/answers' });

const { 
    find, findById, create, update, delete: del,
    checkAnswerExist, checkAnswerer
} = AnswersCtr;
// 获取问题列表
router.get('/', find);
// 查询特定问题
router.get('/:id', checkAnswerExist, findById);
// 创建问题
router.post('/', auth, create);
// 更新问题
router.patch('/:id', auth, checkAnswerExist, checkAnswerer, update);
// 删除问题
router.delete('/:id', auth, checkAnswerExist, checkAnswerer, del);
module.exports = router;