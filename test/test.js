//TODO realy do some testing with asserts
var helper = require('../lib/node-helper.js');

helper.log('test');

helper.log(helper.getLocalIPs());

var rs = new helper.runScript();
rs.start('../test/forkMe.js');

//true
var running = helper.isRunning(3448);
helper.log('Running ' + running);

//false
running = helper.isRunning(1);
helper.log('Running ' + running);
