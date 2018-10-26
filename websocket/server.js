// 使用nodejs写后端接口

// 引入模块
const http = require('http');
const fs = require('fs');
const url = require('url');
const mysql = require('mysql');

// 连接数据库
let db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'my_database',
})

// 创建 http 服务
const httpServer = http.createServer((req, res) => {
    // 解析URL
    let { pathname, query } = url.parse(req.url, true);
    if (pathname == '/reg') { // 注册接口
        let { user, pass } = query;

        // 1.校验数据
        if (!/^\w{3,32}$/.test(user)) {
            res.write(JSON.stringify({ code: 0, msg: '用户名不符合规范' }));
            res.end();
        } else if (!/^.{6,32}$/.test(pass)) {
            res.write(JSON.stringify({ code: 0, msg: '密码不符合规范' }));
            res.end();
        } else {
            // 2.检验用户名是否重复
            db.query(`SELECT * FROM user_table WHERE name='${user}'`, (err, data) => {
                if (err) {
                    res.write(JSON.stringify({ code: 0, msg: '数据库出错' }));
                    res.end();
                } else if (data.length > 0) {
                    res.write(JSON.stringify({ code: 0, msg: '用户已存在' }));
                    res.end();
                } else {
                    // 3.插入
                    db.query(`INSERT INTO user_table (name,password,online) VALUES('${user}','${pass}',0)`, (err, data) => {
                        if (err) {
                            res.write(JSON.stringify({ code: 0, msg: '数据库出错' }));
                            res.end();
                        } else {
                            res.write(JSON.stringify({ code: 1, msg: '注册成功' }));
                            res.end();
                        }
                    });
                }
            });
        }
    } else if (pathname == '/login') { // 登录接口
        let { user, pass } = query;
        // 1.校验数据
        if (!/^\w{3,32}$/.test(user)) {
            res.write(JSON.stringify({ code: 0, msg: '用户名不符合规范' }));
            res.end();
        } else if (!/^.{6,32}$/.test(pass)) {
            res.write(JSON.stringify({ code: 0, msg: '密码不符合规范' }));
            res.end();
        } else {
            // 2. 获取数据
            db.query(`SELECT ID,password FROM user_table WHERE name='${user}'`, (err, data) => {
                if (err) {
                    res.write(JSON.stringify({ code: 0, msg: '数据库出错' }));
                    res.end();
                } else if (data.length == 0) {
                    res.write(JSON.stringify({ code: 0, msg: '此用户不存在' }));
                    res.end();
                } else if (data[0].password != pass) {
                    res.write(JSON.stringify({ code: 0, msg: '用户名或密码错误' }));
                    res.end();
                } else {
                    // 3.更新状态
                    db.query(`UPDATE user_table SET online=1 WHERE ID=${data[0].ID}`, err => {
                        if (err) {
                            res.write(JSON.stringify({ code: 0, msg: '数据库出错' }));
                            res.end();
                        } else {
                            res.write(JSON.stringify({ code: 1, msg: '登录成功' }));
                            res.end();
                        }
                    });

                }
            });
        }
    } else {
        //   读取文件
        fs.readFile(`view${pathname}`, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.write('Not Found');
            } else {
                res.write(data);
            }
            res.end();
        })
    }
});
httpServer.listen(8081);