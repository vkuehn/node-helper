/*eslint-env node */
/*
this is called node-helper as node already has an utility
a single javascript file to make the repeating node js stuff a one liner.
No outside node dependencies wanted here !
look a the end of this file to see what's available

Tested on windows and Linux...sorry no darwin yet..
*/
"use strict";
var child_process = require('child_process');
var events	= require('events');
var fs = require("fs");
var os = require('os');
var path	= require('path');
var util	= require('util');

var RunScript;

/*--File System---------------------------------------------------------*/
function copyFileOnce(sourceFile, destinationFile, callback){
	var success = false;
	if(isDirSync(sourceFile)) {
		if (callback) callback('copyFileOnce: ' + sourceFile + 'is a directory');
	}
	if(isDirSync(destinationFile)) {
		if (callback) callback('copyFileOnce: '+ destinationFile +' is a Directory');
	}
	try{
	  fs.statSync(destinationFile);
			if (callback) {
				callback('copyFileOnce: ' + destinationFile + ' already exists');
			}
			return success;
	}catch (err) {
		try{
			fs.statSync(sourceFile);
			fs.writeFileSync(destinationFile, fs.readFileSync(sourceFile));
			if (callback) {
				callback('copyFileOnce: copied ' + sourceFile + ' to ' + destinationFile);
			}
			success = true;
		}catch (err) {
			if (callback) {
				callback('copyFileOnce: ' + sourceFile + ' does not exists');
			}
		}
	}
	return success;
}

function isDirSync(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    } else {
      throw e;
    }
  }
}

function loadFile(filePath){
	fs.stat(filePath, function(err) {
		if(err === null) {
			//asynch here
		} else {
			console.error(err);
			return '';
		}
	});
	var	data = loadFileSynch(filePath);
	return data;
}

function mkDirOnce (dirPath, callback) {
  try {
    fs.statSync(dirPath);
    if (callback) callback('createDirectoryOnce found ' + dirPath);
  } catch(e) {
    try {
      fs.mkdirSync(dirPath);
      if (callback) callback('createDirectoryOnce created ' + dirPath);
    }catch(error){
      if (callback) callback(error);
    }
  }
}

function saveFile(filePath, data){
	checkFile(filePath, function(){
		fs.writeFile(filePath, data, (error) = {
		   if (error) {
			   console.error(error);
		   }
		});
	});
}

/*--fs helper------------------------------------------------------------------*/
function checkFile(filePath, callback){
	fs.stat(filePath, function(err, stat) {
		if(err === null) {
			callback();
		} else if(err.code === 'ENOENT') {
			fs.writeFile(filePath, {flag: 'wx'}, function (err, data) {
                callback();
            });
		} else {
			console.error('Some other error: ', err.code);
		}
	});
}

function loadFileSynch (filePath){
	var data = '';
	try {
		data = fs.readFileSync(filePath);
	} catch (err) {
		console.error('error: loading file', err.code);
	}
	return data;
}

/*--Other------------------------------------------------------------------*/
function isEmpty (str) {
    return !str || 0 === str.length;
}
function isINT (value) {
  return !isNaN(value) && parseInt(Number(value)) === value && !isNaN(parseInt(value));
}

function isRunning(process){
	try {
		return process.kill(pid,0);
	}
	catch (e) {
		return e.code === 'EPERM';
	}
}

function isWindows(){
	var windows = false;
	var plattform = (process.platform).substring(0,3);
	if(plattform === 'win'){ windows = true ;}
	return windows;
}

function log(text){
	var timeStamp  = getTimeStamp();
	var logString = '';
	try {
		if(text){
			logString = ('[LOG] ' + timeStamp + ' ' + text);
		}else {
			logString = ('[LOG] ' + timeStamp);
		}
		console.log(logString.toString('utf8'));
	} catch (error) {
		console.error('[LOG] ' + timeStamp + ' ' + 'error: ' + error);
	}
}

function getLocalIPs(){
	var interfaces = os.networkInterfaces();
	var ips = [];
	for (var k in interfaces) {
			for (var k2 in interfaces[k]) {
					var address = interfaces[k][k2];
							ips.push(address.address);
			}
	}
	return ips;
}

function getTimeStamp(){
	var today = new Date();
	var h = today.getHours();
	var m = today.getMinutes();
	var s = today.getSeconds();
	var timeStamp  = h + ":" + m + ":" + s;
	return timeStamp;
}

function getUserHome() {
  var uDir = process.env.USERPROFILE;
  if (getValidString(uDir) === '.'){
    uDir = process.env.HOME;
  }
  uDir = getValidString(uDir);
  return uDir;
}

function getValidInteger(value) {
	if(!isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10))){
		return value;
	}
  return 0;
}

function getValidString(value){
	if (typeof value === 'undefined' || !value)  { return '.';	}
	if(Boolean(value)){
			if(!isEmpty(value)){ return value; }
	}
  return '.';
}

function runCommand(cmd, args, opts){
	var pid = '';
	opts = opts || {};

  //if not detached and your main process dies, the child will be killed too
	if(!opts.detached){
			opts.detached = false ;
	}
  //inherit - [process.stdin, process.stdout, process.stderr] or [0,1,2]
	if(!opts.stdio){
		opts.stdio = 'inherit';
	}

	try{
		var child_process = require('child_process');
		var command = child_process.spawn(cmd, args, opts);
		pid = command.pid;
		log('runCommand spawned ' + cmd + ' with pid ' + pid);

		command.on('close', (code,signal)  => { if(signal){
	          log('Terminated by ' + signal); }});

		command.on('error', (error) => { log('Error: ' + error.message); });
		command.on('exit', (code) => { success = code.toString(); });

		process.on('uncaughtException', (err) => {
		  log('Uncaught Error: ' + err.message);
		});
	}catch(error){
		log('runCommand error ' + error);
	}
	return pid;
}

RunScript = function() {
	this.threads = {};
  this.killCommand = 'Time to kill Process';
};

util.inherits(RunScript,events.EventEmitter);

RunScript.prototype.start = function(scriptName) {
	var child,
      that = this;

  var onMessage = function (message) {
      		that.emit('event',['Forker ',this.pid,' recieved ',message]);
      },
    	onError = function(e) {
    		that.emit('event','child error',this.pid,e);
    	},
    	onDisconnect = function(e) {
    		that.emit('event','child disconnect',this.pid,'killing...');
    		this.kill();
    		delete that.threads[this.pid];
    	};

  child = child_process.fork(__dirname+path.sep+scriptName, {detached: true});
  child.on('disconnect',onDisconnect);
  child.on('error',onError);
  child.on('message',onMessage);
  that.threads[child.pid] = child;
};

RunScript.prototype.stop = function(pid) {
	var that = this;
	if ( typeof pid === 'undefined' ) {
		var allPids = Object.keys(this.threads);
		allPids.forEach(function(key,i,arr) {
			that.threads[key].disconnect();
		});
	} else if ( that.threads[pid] ) {
		that.threads[pid].disconnect();
	}
  process.kill(pid);
};

RunScript.prototype.destroy = function() {
	process.kill();
};

RunScript.prototype.checkEvent = function (e) {
  var info = e[3].info;
  if(!info){return;}
  if(info.startsWith(this.killCommand)){
    var kPID = info.slice(this.killCommand.length+2,-1);
    log('killing ' +kPID);
    this.stop(kPID);
  }else{
    log(info);
  }
};

RunScript.prototype.on('event',function(event) {this.checkEvent(event)});

function showData(data, comment, delay){
	if(delay){
		sleep(delay);
	}
	try {
		if(data){
			if(!comment){
				comment = '';
			}
			log('data ' + comment);
			if(data !== undefined){
				log(data.toString());
			} else {
				log('undefined');
			}
		}
	} catch (error) {
		console.error("showData data caused error: " + error);
	}
}

function sleep(delay, comment) {
	var sleeping = ' ...sleeping ' + delay;
	if(comment){
		console.log(comment + sleeping);
	}else {
		console.log(sleeping);
	}
  var start = new Date().getTime();
	while (new Date().getTime() < start + delay) {}
}

module.exports = {
  copyFileOnce:     copyFileOnce,
  getLocalIPs:      getLocalIPs,
  getTimeStamp:     getTimeStamp,
  getUserHome:      getUserHome,
  getValidInteger:  getValidInteger,
  getValidString:   getValidString,
  isDirSync:        isDirSync,
  isEmpty:          isEmpty,
  isINT:            isINT,
  isRunning:        isRunning,
  isWindows:        isWindows,
  loadFile:         loadFile,
  log:              log,
  mkDirOnce:        mkDirOnce,
  runCommand:       runCommand,
	RunScript:				RunScript,
  saveFile:         saveFile,
  sleep:            sleep,
  showData:         showData
};
