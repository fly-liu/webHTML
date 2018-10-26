// 使用websocket方式

// 使用nodejs写后端接口

// 引入模块
// 使用websocket方式不需要URL模块，websocket自带解析功能
const http = require('http');
const fs = require('fs'); //fs 读取文件
const mysql = require('mysql');
const io = require('socket.io');

// 连接数据库
let db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'my_database',
})

// 创建 http 服务
const httpServer = http.createServer((req, res) => {
    //   读取文件
    fs.readFile(`view${req.url}`, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.write('Not Found');
        } else {
            res.write(data);
        }
        res.end();
    })

});
httpServer.listen(8082);

// ws 服务
const wsServer = io.listen(httpServer);
let aSock = [];
wsServer.on('connection', socket => {
    let cur_username = '';
    let cur_userId = 0;
    aSock.push(socket);

    // 注册
    socket.on('reg', (user, pass) => {
        // 1.校验数据
        if (!/^\w{3,32}$/.test(user)) {
            socket.emit('reg_ret', 0, '用户名不符合规范');
        } else if (!/^.{6,32}$/.test(pass)) {
            socket.emit('reg_ret', 0, '密码不符合规范');
        } else {
            // 2.用户名是否存在
            db.query(`SELECT ID FROM user_table WHERE name='${user}'`, (err, data) => {
                if (err) {
                    socket.emit('reg_ret', 0, '数据库错误');
                } else if (data.length > 0) {
                    socket.emit('reg_ret', 0, '用户名已存在');
                } else {
                    // 3.插入
                    db.query(`INSERT INTO user_table (name,password,online) VALUES('${user}','${pass}',0)`, err => {
                        if (err) {
                            socket.emit('reg_ret', 0, '数据库错误');
                        } else {
                            socket.emit('reg_ret', 1, '注册成功');
                        }
                    });
                }
            });
        }
        // 2.判断用户名是否存在
        // 3.插入
    });

    // 登录
    socket.on('login', (user, pass) => {
        // 1.校验数据
        if (!/^\w{3,32}$/.test(user)) {
            socket.emit('login_ret', 0, '用户名不符合规范');
        } else if (!/^.{6,32}$/.test(pass)) {
            socket.emit('login_ret', 0, '密码不符合规范');
        } else {
            // 2.判断用户是否存在
            db.query(`SELECT ID,password FROM user_table WHERE name='${user}'`, (err, data) => {
                if (err) {
                    socket.emit('login_ret', 0, '数据库错误');
                } else if (data.length == 0) {
                    socket.emit('login_ret', 0, '此用户不存在');
                } else if (data[0].password != pass) {
                    socket.emit('login_ret', 0, '用户名或密码有误');
                } else {
                    // 3.修改状态
                    db.query(`UPDATE user_table SET online=1 WHERE ID=${data[0].ID}`, err => {
                        if (err) {
                            socket.emit('login_ret', 0, '数据库错误');
                        } else {
                            socket.emit('login_ret', 1, '登录成功');
                            cur_username = user;
                            cur_userId = data[0].ID;
                        }
                    });
                }
            });
        }
    });

    // 发言
    socket.on('msg', txt => {
        if (!txt) {
            socket.emit('msg_ret', 0, '消息文本为空');
        } else {
            aSock.forEach(item => {
                if (item == socket) return;

                item.emit('msg', cur_username, txt); // 返回到客户端的数据
            });
            socket.emit('msg_ret', 1, '发送成功');
        }
    });

    // 3.判断离线
    socket.on('disconnect', function() {
        db.query(`UPDATE user_table SET online=0 WHERE ID=${cur_userId}`, err => {
            if (err) {
                console.log('数据库错误');
            }

            cur_username = '';
            cur_userId = 0;

            aSock.filter(item => item != socket);
        });
    });
});