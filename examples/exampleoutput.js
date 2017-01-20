
//some simple examples
var helper = require('../lib/node-helper');

//Hellow World
helper.log('hello');

//show local IPs
var comment = 'Local IP adresses';
var delay = 3;
var data  = helper.getLocalIPs();

helper.showData(data, comment, delay);
