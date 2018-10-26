// nodejs 判断浏览器语言，国际化处理，重定向到指定语言的页面
const http = require('http');

let server = http.createServer((req, res) => {
    let lang = req.headers['accept-content-language'].split(';')[0].split(',')[0];
    switch (lang.toLowerCase()) {
        case 'zh-cn':
            res.setHeader({ location: 'http://localhost/cn/' });
            res.writeHead(302);
            break;
        case 'en-us':
            res.setHeader({ location: 'http://localhost/en/' });
            res.writeHead(302);
            break;
        default:
            res.setHeader({ location: 'http://localhost/' });
            res.writeHead(302);
            break;
    }
});

server.listen(8080);