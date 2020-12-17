const jwt = require('koa-jwt');
const Router = require('koa-router');
const TopicsCtr = require('../controllers/topics');
const { secret } = require('../config');

const auth = jwt({ secret });

const router = new Router({ prefix: '/topics' });

const { 
    find, findById, create, update,
    listFollowers, checkTopicExist,
    listQuestions
} = TopicsCtr;

// 获取话题类别
router.get('/', find);
// 查询特定话题
router.get('/:id', checkTopicExist, findById);
// 创建话题
router.post('/', auth, create);
// 更新话题
router.patch('/:id', auth, checkTopicExist, update);
// 粉丝列表
router.get('/:id/followers', checkTopicExist, listFollowers);
// 话题下的问题列表
router.get('/:id/questions', checkTopicExist, listQuestions);
module.exports = router;