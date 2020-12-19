const Koa = require('koa');
const koaBody = require('koa-body');
const error = require('koa-json-error');
const parameter = require('koa-parameter');
const mongoose = require('mongoose');
const koaStatic = require('koa-static');
const path = require('path');
const routing = require('./routers');
const { connectionStr } = require('./config');
const app = new Koa();

// 链接mongoDB
mongoose.connect(connectionStr, { useNewUrlParser: true }, () => console.log('MongoDB 连接成功了！'));
mongoose.connection.on('error', console.error);

// 静态目录
app.use(koaStatic(path.join(__dirname, '/public')));

// 返回JSON格式的错误
app.use(error({
    postFormat: (error, { stack, ...reset}) => process.env.NODE_ENV === 'production' ? reset : { stack, ...reset }
}));

console.log('NODE_ENV 环境变脸：', process.env.NODE_ENV);

// 使路由可解析body
app.use(koaBody({
    multipart: true,
    formidable: {
        // 上传文件的目录
        uploadDir: path.join(__dirname, '/public/uploads'), 
        // 保留拓展名
        keepExtensions: true,
    }
}));

// 验证body中请求体的结构
app.use(parameter(app));

// 注册路由
routing(app);

app.listen(3000, () => { console.log('服务启动在 3000 端口') });