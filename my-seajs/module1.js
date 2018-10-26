define(function(require, exports, module) {
    let mod2 = require('module2.js');
    let mod3 = require('module3.js');

    exports.result = mod2.num1 + mod3.num2;
    alert(exports.result);
});