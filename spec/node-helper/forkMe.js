"use strict";

var ForkMe;
module.exports = ForkMe = function ()  {
  this.intervalDelay = 1000;
	this.interval = 4;
	this.pid = process.pid;
}

ForkMe.prototype.doSemthing = function () {
  this.interval = this.interval -1
  if(this.interval <=1){
    return 'Time to kill Process ['+this.pid+']';
  }
  return 'Something Done';
}

ForkMe.prototype.start = function () {
	setInterval(this.sendMessageToMaster.bind(this),this.intervalDelay);
	this.sendMessageToMaster();
};

ForkMe.prototype.sendMessageToMaster = function () {
    var uptime = process.uptime();
    var message = 'Process ['+this.pid+'], uptime '+uptime+'s';
    process.send({ info: message });
    process.send({ info: this.doSemthing() });
};

process.on('disconnect',function() {
	process.kill();
});

var c = new ForkMe();
c.start();
