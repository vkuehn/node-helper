//just here to test this and that
//unit tests are done throuch jasmine and are configured in node-helper_Spec.js

let helper = require('../lib/node-helper.js');
const debug = require('debug')('test');

const ips = helper.getLocalIPs();
debug('runscript %s', ips);


