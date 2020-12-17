const jsonwebtoken = require('jsonwebtoken');
const User = require('../modules/users');
const Question = require('../modules/questions');
const Answer = require('../modules/answers');
const { secret } = require('../config');
class UsersCtr {
    // 检出是否是自己
    async checkOwner(ctx, next) {
        ctx.params.id !== ctx.state.user._id && ctx.throw(403, '没有权限');
        await next();
    }
    // 检查用户是否存在
    async checkUserExist(ctx, next) {
        const user = await User.findById(ctx.params.id);
        !user && ctx.throw(412, '用户不存在');
        await next();
    }
    // 查找所用用户列表
    async find(ctx) {
        let { page = 1, per_page: perPage = 3 } = ctx.query;
        page = isNaN(page) ? page : Math.max(Number(page), 1);
        perPage = isNaN(perPage) ? 1 : Math.max(Number(perPage), 1);
        const skip = (page - 1) * perPage;
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ` +${f}`).join('');
        ctx.body = await User
            .find({name: new RegExp(ctx.query.q)})
            .select(selectFields)
            .limit(perPage)
            .skip(skip);
    }
    // 查找特定用户 
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const populateStr = fields.split(';').filter(f => f).map(f => {
            switch (f) {
                case 'employments':
                    return 'employments.company employments.job';
                case 'educations':
                    return 'educations.school educations.major';
                default: return f;
            }
        }).join(' ');
        const user = await User.findById(ctx.params.id).populate(populateStr);        
        !user && ctx.throw(412, '用户不存在');
        ctx.body = user;
    }
    // 创建用户
    async create(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            age: { type: 'number', required: false },
            password: { type: 'string', required: true }
        });
        const { name } = ctx.request.body;
        const repeatedUser = await User.findOne({ name });
        repeatedUser && ctx.throw(409, '用户已存在');
        const user = await new User(ctx.request.body).save();
        ctx.body = user;
    }
    // 更新用户
    async update(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: false },
            age: { type: 'number', required: false },
            password: { type: 'string', required: false },
            avatar_url: { type: 'string', require: false },
            gender: { type: 'string', required: false },
            headline: { type: 'string', required: false },
            location: { type: 'array', itenType: 'string', required: false },
            business: { type: 'string' },
            employments: { type: 'array', itemType: 'object', required: false },
            educations: { type: 'array', itemType: 'object', required: false }, 
        });
        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        !user && ctx.throw(412, '用户不存在');
        ctx.body = user;
    } 
    // 删除用户
    async delete(ctx) {
        const user = await User.findByIdAndDelete(ctx.params.id);
        !user && ctx.throw(412, '用户不存在');
        ctx.status = 204;
    }
    // 登录
    async login(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            password: { type: 'string', required: true }
        });
        const user = await User.findOne(ctx.request.body);
        !user && ctx.throw(401, '用户名或密码错误');
        const { _id, name } = user;
        const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: '1d' }); 
        ctx.body = { token };
    }
    // 获取关注列表
    async listFollowing(ctx) {
        const user = await User.findById(ctx.params.id).select(' +following').populate('following');
        !user && ctx.throw(412, '用户不存在');
        ctx.body = user.following;
    }
    // 获取粉丝列表
    async listFollowers(ctx) {
        const users = await User.find({ following: ctx.params.id});
        ctx.body = users;
    }
    // 关注
    async follow(ctx) {
        const meId = ctx.state.user._id;
        const followId = ctx.params.id;
        const me = await User.findById(meId).select('+following');
        const following = me.following;
        if (meId === followId) {
            ctx.throw(412, '用户不能关注自己！');
        }
        if (!following.map(id => id.toString()).includes(followId)) {
            me.following.push(followId);
            me.save();
        }
        ctx.status = 204;
    }

    // 取消关注
    async unfollow(ctx) {
        const meId = ctx.state.user._id;
        const followId = ctx.params.id;
        const me = await User.findById(meId).select('+following');
        const following = me.following;
        const followIndex = following.map(id => id.toString()).indexOf(followId);
        if (followIndex !== -1) {
            me.following.splice(followIndex, 1);
            me.save();
        }
        ctx.status = 204; 
    }
    // 获取关注话题列表
    async listFollowingTopics(ctx) {
        const user = await User.findById(ctx.params.id).select(' +followingTopics').populate('followingTopics');
        !user && ctx.throw(412, '用户不存在');
        ctx.body = user.followingTopics;
    }
    // 关注话题
    async followTopic(ctx) {
        const meId = ctx.state.user._id;
        const topicId = ctx.params.id;
        const me = await User.findById(meId).select('+followingTopics');
        const followingTopics = me.followingTopics;
        if (!followingTopics.map(id => id.toString()).includes(topicId)) {
            me.followingTopics.push(topicId);
            me.save();
        }
        ctx.status = 204;
    }
    // 取消关注话题
    async unfollowTopic(ctx) {
        const meId = ctx.state.user._id;
        const topicId = ctx.params.id;
        const me = await User.findById(meId).select('+followingTopics');
        const followingTopics = me.followingTopics;
        const topicIndex = followingTopics.map(id => id.toString()).indexOf(topicId);
        if (topicIndex !== -1) {
            me.followingTopics.splice(topicIndex, 1);
            me.save();
        }
        ctx.status = 204; 
    }
    // 查询特定用户的问题列表
    async listQuestions(ctx) {
        const questions = await Question.find({questioner: ctx.params.id });
        ctx.body = questions;
    }
    // 赞的答案列表
    async listLikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers');
        !user && ctx.throw(412, '用户不存在');
        ctx.
        body = user.likingAnswers;
    }
    // 赞答案
    async likeAnswer(ctx) {
        const meId = ctx.state.user._id;
        const answerId = ctx.params.id;
        const me = await User.findById(meId).select('+likingAnswers');
        const likingAnswers = me.likingAnswers;
        if (!likingAnswers.map(id => id.toString()).includes(answerId)) {
            me.likingAnswers.push(answerId);
            me.save();
            await Answer.findByIdAndUpdate(answerId, { $inc: { voteConunt: 1 } });
        }
        ctx.status = 204;
    }
    // 取消赞答案
    async unlikeAnswer(ctx) {
        const meId = ctx.state.user._id;
        const answerId = ctx.params.id;
        const me = await User.findById(meId).select('+likingAnswers');
        const likingAnswers = me.likingAnswers;
        const answerIndex = likingAnswers.findIndex(id => id.toString() === answerId);
        if (answerIndex > -1) {
            me.likingAnswers.splice(answerIndex, 1);
            me.save();
            await Answer.findByIdAndUpdate(answerId, { $inc: { voteConunt: -1 } });
        }
        ctx.status = 204;
    }
    // 踩的答案列表
    async listdisLikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers');
        !user && ctx.throw(412, '用户不存在');
        ctx.body = user.dislikingAnswers;
    }
    // 踩答案
    async dislikeAnswer(ctx) {
        const meId = ctx.state.user._id;
        const answerId = ctx.params.id;
        const me = await User.findById(meId).select('+dislikingAnswers');
        const dislikingAnswers = me.dislikingAnswers;
        if (!dislikingAnswers.map(id => id.toString()).includes(answerId)) {
            me.dislikingAnswers.push(answerId);
            me.save();
        }
        ctx.status = 204;
    }
    // 取消踩答案
    async undislikeAnswer(ctx) {
        const meId = ctx.state.user._id;
        const answerId = ctx.params.id;
        const me = await User.findById(meId).select('+dislikingAnswers');
        const dislikingAnswers = me.dislikingAnswers;
        const answerIndex = dislikingAnswers.findIndex(id => id.toString() === answerId);
        if (answerIndex > -1) {
            me.dislikingAnswers.splice(answerIndex, 1);
            me.save();
        }
        ctx.status = 204;
    }
    // 收藏的答案列表
    async listCollectingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+collectingAnswers').populate('collectingAnswers');
        !user && ctx.throw(412, '用户不存在');
        ctx.body = user.collectingAnswers;
    }
    // 收藏答案
    async collectAnswer(ctx) {
        const meId = ctx.state.user._id;
        const answerId = ctx.params.id;
        const me = await User.findById(meId).select('+collectingAnswers');
        const collectingAnswers = me.collectingAnswers;
        if (!collectingAnswers.map(id => id.toString()).includes(answerId)) {
            me.collectingAnswers.push(answerId);
            me.save();
        }
        ctx.status = 204;
    }
    // 取消收藏答案
    async uncollectAnswer(ctx) {
        const meId = ctx.state.user._id;
        const answerId = ctx.params.id;
        const me = await User.findById(meId).select('+collectingAnswers');
        const collectingAnswers = me.collectingAnswers;
        const answerIndex = collectingAnswers.findIndex(id => id.toString() === answerId);
        if (answerIndex > -1) {
            me.collectingAnswers.splice(answerIndex, 1);
            me.save();
        }
        ctx.status = 204;
    }
}

module.exports = new UsersCtr();