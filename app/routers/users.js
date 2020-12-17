const jwt = require('koa-jwt');
const Router = require('koa-router');
const UsersCtr = require('../controllers/users');
const TopicsCtr = require('../controllers/topics');
const AnswersCtr = require('../controllers/answers')
const { secret } = require('../config');

const auth = jwt({ secret });

const router = new Router({ prefix: '/users' });

const { 
    find, findById, create, update, delete: del,
    login, checkOwner, listFollowing, follow,
    unfollow, listFollowers, checkUserExist,
    followTopic, unfollowTopic,
    listFollowingTopics, listQuestions,
    listLikingAnswers, listdisLikingAnswers,
    likeAnswer, unlikeAnswer,
    dislikeAnswer, undislikeAnswer,
    listCollectingAnswers, collectAnswer, uncollectAnswer
} = UsersCtr;
const { checkTopicExist } = TopicsCtr;
const { checkAnswerExist } = AnswersCtr;
// 获取用户列表
router.get('/', find);
// 查询特定用户
router.get('/:id', findById);
// 创建用户
router.post('/', create);
// 更新用户
router.patch('/:id', auth, checkOwner, update);
// 删除用户
router.delete('/:id', auth, checkOwner, del);
// 登录
router.post('/login', login);
// 关注列表
router.get('/:id/following', listFollowing);
// 粉丝列表
router.get('/:id/followers', listFollowers);
// 关注某人
router.put('/following/:id', auth, checkUserExist, follow);
// 取消关注
router.delete('/following/:id', auth, checkUserExist, unfollow);
// 关注话题列表
router.get('/:id/followingTopics', listFollowingTopics);
// 关注话题
router.put('/followingTopics/:id', auth, checkTopicExist, followTopic);
// 取消关注话题
router.delete('/followingTopics/:id', auth, checkTopicExist, unfollowTopic);
// 查询特定用户的问题列表
router.get('/:id/questions', listQuestions);
// 获取赞的答案列表
router.get('/:id/likingAnswers', listLikingAnswers);
// 赞答案
router.put('/likingAnswers/:id', auth, checkAnswerExist, likeAnswer);
// 取消赞答案
router.delete('/likingAnswers/:id', auth, checkAnswerExist, unlikeAnswer);
// 获取踩的答案列表
router.get('/:id/dislikingAnswers', listdisLikingAnswers);
// 踩答案
router.put('/dislikingAnswers/:id', auth, checkAnswerExist, dislikeAnswer);
// 取消踩答案
router.delete('/dislikingAnswers/:id', auth, checkAnswerExist, undislikeAnswer);
// 获取收藏的答案列表
router.get('/:id/collectingAnswers', listCollectingAnswers);
// 收藏答案
router.put('/collectingAnswers/:id', auth, checkAnswerExist, collectAnswer);
// 取消收藏答案
router.delete('/collectingAnswers/:id', auth, checkAnswerExist, uncollectAnswer);
module.exports = router;    