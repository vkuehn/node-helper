//TODO realy do some tesing with asserts
var helper = require('../lib/node-helper.js');

//helper.log('test');

//helper.log(helper.getLocalIPs());

var rs = new helper.RunScript();
rs.start('../test/forkMe.js');
