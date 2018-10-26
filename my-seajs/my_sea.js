const sea = {
    use(path, fn_end) {
        $.ajax({
            url: path,
            success(res) {
                parseStr(res, fn_end);

                function parseStr(res, fn_end) {
                    function define(fn) {
                        let module = {
                            exports: {}
                        }
                        fn(function() {}, module.exports, module);
                        fn_end(module.exports);
                    }

                    tmp = res.substring(res.indexOf('{') + 1, res.lastIndexOf('}'));
                    tmp.match(/require\([^\(\)]+\)/g).map(item => {
                        // alert(item.substring(/\"|\'/));
                        if (item.indexOf('"') != -1) {
                            return item.substring(item.indexOf('\"') + 1, item.lastIndexOf('\"'));
                        } else {
                            return item.substring(item.indexOf("\'") + 1, item.lastIndexOf("\'"));
                        }
                    });

                    let i = 0;
                    let json = {};

                    function next() {
                        $.ajax({
                            url: tmp[i],
                            success(str) {
                                parseStr(str, function(mod) {
                                    json[tmp[i]] = mod;
                                    i++;
                                    if (i == tmp.length) {
                                        eval(res);
                                    } else {
                                        next();
                                    }
                                });
                            }
                        });
                    }
                }
            },
            error() {
                alert("失败");
            }
        });
    }
}