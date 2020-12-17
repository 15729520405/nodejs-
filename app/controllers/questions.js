const Question = require('../modules/questions');
const User = require('../modules/users');
class QuestionsCtr {
    // 检查问题是否存在
    async checkQuestionExist(ctx, next) {
        const question = await Question.findById(ctx.params.id).select('+questioner');
        !question && ctx.throw(412, '问题不存在');
        ctx.state.question = question;
        await next();
    }
    // 检查当前用户是否是提问者
    async checkQuestioner(ctx, next) {
        let { user, question } = ctx.state;
        if (user._id !== question.questioner.toString()) {
            ctx.throw(403, '没有权限');
        }
        await next();
    }
    // 查询所有问题
    async find(ctx) {
        let { page = 1, per_page: perPage = 3, fields = '', q } = ctx.query;
        page = isNaN(page) ? page : Math.max(Number(page), 1);
        perPage = isNaN(perPage) ? 1 : Math.max(Number(perPage), 1);
        const skip = (page - 1) * perPage;
        const selectFields = fields.split(';').filter(f => f).map(f => ` +${f}`).join('');
        q = new RegExp(q);
        ctx.body = await Question
            .find({ $or: [{ title: q }, { description: q }] })
            .select(selectFields)
            .limit(perPage).skip(skip);
    }
    // 获取特定问题
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const populateStr = fields.split(';').filter(f => f).join(' ');
        const question = await Question.findById(ctx.params.id).populate(populateStr);
        ctx.body = question;
    }
    // 创建问题
    async create(ctx) {
        ctx.verifyParams({
            title: { type: 'string', required: true },
            description: { type: 'string', required: false }
        });
        const { title } = ctx.request.body;
        const repeatedQuesion= await Question.findOne({ title });
        repeatedQuesion && ctx.throw(409, '问题已存在');
        const question = await new Question({ ...ctx.request.body, questioner: ctx.state.user._id }).save();
        ctx.body = question;
    } 
    // 修改问题
    async update(ctx) {
        ctx.verifyParams({
            title: { type: 'string', required: true },
            description: { type: 'string', required: false }
        });
        await ctx.state.question.update(ctx.request.body);
        ctx.body = ctx.state.question;
    }
    // 删除问题
    async delete(ctx) {
        await ctx.state.question.delete();
        ctx.status = 204;
    }
}

module.exports = new QuestionsCtr();