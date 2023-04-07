
//some simple examples
var helper = require('../node-helper');

//show local IPs
var comment = 'Local IP adresses';
var delay = 3;
var data  = helper.getLocalIPs();

helper.showData(data, comment, delay);
