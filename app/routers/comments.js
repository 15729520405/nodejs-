const jwt = require('koa-jwt');
const Router = require('koa-router');
const CommentsCtr = require('../controllers/comments');

const { secret } = require('../config');

const auth = jwt({ secret });

const router = new Router({ prefix: '/questions/:questionId/answers/:answerId/comments' });

const { 
    find, findById, create, update, delete: del,
    checkCommentExist, checkCommenter
} = CommentsCtr;
// 获取评论列表
router.get('/', find);
// 查询特定评论
router.get('/:id', checkCommentExist, findById);
// 创建评论
router.post('/', auth, create);
// 更新评论
router.patch('/:id', auth, checkCommentExist, checkCommenter, update);
// 删除评论
router.delete('/:id', auth, checkCommentExist, checkCommenter, del);
module.exports = router;