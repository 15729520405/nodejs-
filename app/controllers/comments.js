const Comment = require('../modules/comments');
class CommentsCtr {
    // 检查评论是否存在
    async checkCommentExist(ctx, next) {
        const comment = await Comment.findById(ctx.params.id).select('+commentator');
        const { questionId, answerId } = ctx.params;
        !comment && ctx.throw(412, '评论不存在');
        ctx.state.comment = comment;
        // 只有在删改查评论时，才检查此逻辑，赞和踩不涉及此逻辑
        if (questionId && comment.questionId !== questionId) {
            ctx.throw(412, '该问题下没有此评论');
        }
         // 只有在删改查评论时，才检查此逻辑，赞和踩不涉及此逻辑
        if (answerId && comment.answerId !== answerId) {
            ctx.throw(412, '该答案下没有此评论');
        }
        await next();
    }
    // 检查当前用户是否是评论者
    async checkCommenter(ctx, next) {
        let { user, comment } = ctx.state;
        if (user._id !== comment.commentator.toString()) {
            ctx.throw(403, '没有权限');
        }
        await next();
    }
    // 查询所有评论
    async find(ctx) {
        let { page = 1, per_page: perPage = 3, q } = ctx.query;
        page = isNaN(page) ? page : Math.max(Number(page), 1);
        perPage = isNaN(perPage) ? 1 : Math.max(Number(perPage), 1);
        const skip = (page - 1) * perPage;
        const { questionId, answerId } = ctx.params;
        const { fields = '' } = ctx.query;
        const populateStr = fields.split(';').filter(f => f).join(' ');
        const { rootCommentId } = ctx.query;
        let list = await Comment
            .find({ content: new RegExp(q), questionId, answerId, rootCommentId })
            .populate(populateStr)
            .limit(perPage).skip(skip);
        ctx.body = list;
    }
    // 获取特定评论
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const populateStr = fields.split(';').filter(f => f).join(' ');
        const comment = await Comment.findById(ctx.params.id).populate(populateStr);
        ctx.body = comment;
    }
    // 创建评论
    async create(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: true },
            rootCommentId: { type: 'string', required: false },
            replayTo: { type: 'string', required: false },
        });
        const { questionId, answerId } = ctx.params;
        const comment = await new Comment({
            ...ctx.request.body,
            commentator: ctx.state.user._id,
            answerId,
            questionId,
        }).save();
        ctx.body = comment;
        /**
         * 后续优化，用户不能回复自己的评论
         */
    } 
    // 修改评论
    async update(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: true },
        });
        const { content } = ctx.request.body; 
        await ctx.state.comment.update({ content });
        ctx.body = ctx.state.comment;
    }
    // 删除评论
    async delete(ctx) {
        await ctx.state.comment.delete();
        ctx.status = 204;
    }
}

module.exports = new CommentsCtr();