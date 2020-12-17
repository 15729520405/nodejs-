const Answer = require('../modules/answers');
class AnswersCtr {
    // 检查答案是否存在
    async checkAnswerExist(ctx, next) {
        const answer = await Answer.findById(ctx.params.id).select('+answerer');
        !answer && ctx.throw(412, '答案不存在');
        ctx.state.answer = answer;
        // 只有在删改查答案时，才检查此逻辑，赞和踩不涉及此逻辑
        if (ctx.params.questionId && answer.questionId !== ctx.params.questionId) {
            ctx.throw(412, '该问题下没有此答案');
        }
        await next();
    }
    // 检查当前用户是否是回答者
    async checkAnswerer(ctx, next) {
        let { user, answer } = ctx.state;
        if (user._id !== answer.answerer.toString()) {
            ctx.throw(403, '没有权限');
        }
        await next();
    }
    // 查询所有答案
    async find(ctx) {
        let { page = 1, per_page: perPage = 3, q } = ctx.query;
        page = isNaN(page) ? page : Math.max(Number(page), 1);
        perPage = isNaN(perPage) ? 1 : Math.max(Number(perPage), 1);
        const skip = (page - 1) * perPage;
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ` +${f}`).join('');
        ctx.body = await Answer
            .find({ content: new RegExp(q), questionId: ctx.params.questionId })
            .select(selectFields)
            .limit(perPage).skip(skip);
    }
    // 获取特定答案
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const populateStr = fields.split(';').filter(f => f).join(' ');
        const answer = await Answer.findById(ctx.params.id).populate(populateStr);
        ctx.body = answer;
    }
    // 创建答案
    async create(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: true },
        });
        const answer = await new Answer({
            ...ctx.request.body,
            answerer: ctx.state.user._id,
            questionId: ctx.params.questionId
        }).save();
        ctx.body = answer;
    } 
    // 修改答案
    async update(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: true },
        });
        await ctx.state.answer.update(ctx.request.body);
        ctx.body = ctx.state.answer;
    }
    // 删除答案
    async delete(ctx) {
        await ctx.state.answer.delete();
        ctx.status = 204;
    }
}

module.exports = new AnswersCtr();