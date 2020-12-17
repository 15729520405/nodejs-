const jwt = require('koa-jwt');
const Router = require('koa-router');
const QuestionsCtr = require('../controllers/questions');

const { secret } = require('../config');

const auth = jwt({ secret });

const router = new Router({ prefix: '/questions' });

const { 
    find, findById, create, update, delete: del,
    checkQuestionExist, checkQuestioner
} = QuestionsCtr;
// 获取问题列表
router.get('/', find);
// 查询特定问题
router.get('/:id', findById);
// 创建问题
router.post('/', auth,  create);
// 更新问题
router.patch('/:id', auth, checkQuestionExist, checkQuestioner, update);
// 删除问题
router.delete('/:id', auth, checkQuestionExist, checkQuestioner, del);
module.exports = router;