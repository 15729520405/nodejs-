const Topic = require('../modules/topics');
const User = require('../modules/users');
const Question = require('../modules/questions');
class TopicsCtr {
    // 检查话题是否存在
    async checkTopicExist(ctx, next) {
        const topic = await Topic.findById(ctx.params.id);
        !topic && ctx.throw(412, '话题不存在');
        await next();
    }
    // 查询所有话题
    async find(ctx) {
        let { page = 1, per_page: perPage = 3 } = ctx.query;
        page = isNaN(page) ? page : Math.max(Number(page), 1);
        perPage = isNaN(perPage) ? 1 : Math.max(Number(perPage), 1);
        const skip = (page - 1) * perPage;
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ` +${f}`).join('');
        ctx.body = await Topic
            .find({name: new RegExp(ctx.query.q)})
            .select(selectFields)
            .limit(perPage).skip(skip);
    }
    // 获取特定话题
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ` +${f}`).join('');
        const topic = await Topic.findById(ctx.params.id).select(selectFields);
        ctx.body = topic
    }
    // 创建话题
    async create(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            avatar_url: { type: 'string', required: false },
            introduction: { type: 'string', required: false }
        });
        const { name } = ctx.request.body;
        const repeatedTopic= await Topic.findOne({ name });
        repeatedTopic && ctx.throw(409, '话题已存在');
        const topic = await new Topic(ctx.request.body).save();
        ctx.body = topic;
    } 
    // 修改话题
    async update(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            avatar_url: { type: 'string', required: false },
            introduction: { type: 'string', required: false }
        });
        const topic = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        ctx.body = topic;
    }
    // 获取粉丝列表
    async listFollowers(ctx) {
        const users = await User.find({ followingTopics: ctx.params.id});
        ctx.body = users;
    }
    // 话题下的所有问题
    async listQuestions(ctx) {
        const questions = await Question.find({ topics: ctx.params.id });
        ctx.body = questions;
    }
}

module.exports = new TopicsCtr();