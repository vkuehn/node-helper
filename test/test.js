//TODO realy do some testing with asserts
//let helper = require('../lib/node-helper.js');
const debug = require('debug')('worker');

setInterval(function(){
  debug('doing some work');
}, 1000);

/*
 helper.getLocalIPs();
debug('runscript');
const rs = new helper.runScript();
rs.start('../test/forkMe.js');
*/
