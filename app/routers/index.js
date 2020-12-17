const fs = require('fs');
module.exports = (app) => {
    fs.readdirSync(__dirname).forEach(file => {
        if (file !== 'index.js') {
            const router = require(`./${file}`);
            // 注册路由，并使路由响应options请求
            app.use(router.routes()).use(router.allowedMethods());
        }
    });
}