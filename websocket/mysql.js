// Node操作数据库 

// mysql模块
const mysql = require('mysql');

// 连接数据库
// createConnection 创建一个连接
// createPool 创建一个连接池
let db = mysql.createPool({ host: 'localhost', port: 3306, user: 'root', password: '123456', database: 'my_database' });

// 查询
db.query('SELECT * FROM user_table', (err, data) => {
    if (err) {
        console.log(err);
    } else {
        console.log(JSON.stringify(data));
    }
});