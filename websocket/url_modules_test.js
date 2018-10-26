// url模块，nodejs提供解析URL

const url = require('url');

const str = 'https://mbd.baidu.com:8080/newspage/data/landingsuper?context=%7B%22nid%22%3A%22news_9369277938384699354%22%7D&n_type=0&p_from=1';

// parse加true，将参数解析为对象
let obj = url.parse(str, true);

console.log(obj);