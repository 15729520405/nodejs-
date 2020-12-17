const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const userSchema = new Schema({
    __v: { type: Number, select: false },
    name: { type: String, required: true },
    age: { type: Number, default: 0 },
    password: { type: String, require: true, select: false },
    avatar_url: { type: String },
    // 性别
    gender: { type: String, enum: ['male', 'female'], default: 'male' }, 
     // 一句话简介
    headline: { type: String },
    // 地址
    locations: { type: [{ type: Schema.Types.ObjectId, ref: 'Topic' }], select: false }, 
    // 行业
    business: { type: Schema.Types.ObjectId, ref: 'Topic', select: false }, 
    // 职业经历
    employments: {     
        type: [{
            company: { type: Schema.Types.ObjectId, ref: 'Topic' },
            job: { type: Schema.Types.ObjectId, ref: 'Topic' }
        }],
        select: false
    },
    // 教育经历
    educations: {
        type: [{
            // 学校
            school: { type: Schema.Types.ObjectId, ref: 'Topic' },
            // 专业
            major: { type: Schema.Types.ObjectId, ref: 'Topic' },
            // 学历
            diploma: { type: Number, enum: [1, 2, 3, 4, 5] },
            // 入学年份
            entrance_year: { type: Number },
            // 毕业年份
            graduation_year: { type: Number }
        }],
        select: false
    },
    // 关注列表
    following: {
        type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        select: false,
    },
    // 关注话题列表
    followingTopics: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
        select: false,
    },
    // 赞的答案列表
    likingAnswers: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
        select: false,
    },
    // 踩的答案列表
    dislikingAnswers: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
        select: false,
    },
    // 收藏答案列表
    collectingAnswers: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
        select: false,
    },
});

module.exports = model('User', userSchema);