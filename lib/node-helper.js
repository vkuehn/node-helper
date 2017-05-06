/*eslint-env node */
/*
this is called node-helper as node already has an utility
a single javascript file to make the repeating node js stuff a one liner.
No outside node dependencies wanted here !
look a the end of this file to see what's available

Tested on windows and Linux...sorry no darwin yet..
*/
'use strict';
const child_process = require('child_process');
const events        = require('events');
const fs            = require('fs');
const os            = require('os');
const util          = require('util');

let runScript;
let status = '';

/*--File System---------------------------------------------------------*/
function copyFileOnce(sourceFile, destinationFile, callback){
  var success = false;
  if(isDirSync(sourceFile)) {
    if (callback){ callback('copyFileOnce: ' + sourceFile + 'is a directory');}
  }
  if(isDirSync(destinationFile)) {
    if (callback){ callback('copyFileOnce: '+ destinationFile +' is a Directory');}
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
      var data = loadFileSynch(filePath);
      return data;
    } else {
      return '';
    }
  });
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
    fs.writeFile(filePath, data, function(error) {
      if (error) {
        console.error(error);
      }
    });
  });
}

/*--fs helper------------------------------------------------------------------*/
function checkFile(filePath, callback, data){
  fs.stat(filePath, function(err) {
    if(err === null) {
      callback(data);
    } else if(err.code === 'ENOENT') {
      fs.writeFile(filePath, {flag: 'wx'}, function (err) {
        callback(err);
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
function addZero(i) {
  if (i < 10) {
    i = '0' + i;
  }
  return i;
}

function getFileList(path){
  if(path){
    if(isDirSync(path)){
      var fileList = fs.readdirSync(path);
      return fileList;
    }
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
  var d = new Date();
  var h = addZero(d.getHours());
  var m = addZero(d.getMinutes());
  var s = addZero(d.getSeconds());
  var timeStamp = h + ':' + m + ':' + s;
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
  if (typeof value === 'undefined' || !value)  { return '.'; }
  if(!isEmpty(value)){ return '.'; }
  if(value){ return '' + value; }
  return '.';
}

function isEmpty (str) {
  return !str || 0 === str.length;
}
function isINT (value) {
  return !isNaN(value) && parseInt(Number(value)) === value && !isNaN(parseInt(value));
}

function isRunning(pid){
  if(pid){
    var allPids = Object.keys(this.threads);
    allPids.forEach(function(key) {
      if (key === pid) return true;
    });
  }
  return false;
}

function isWindows(){
  var windows = false;
  var plattform = (process.platform).substring(0,3);
  if(plattform === 'win'){ windows = true ;}
  return windows;
}

function runCommand(cmd, args, options){
  var opts = options || {};
  var pid = '';

  //if not detached and your main process dies, the child will be killed too
  if(!opts.detached){
    opts.detached = false ;
  }
  //inherit - [process.stdin, process.stdout, process.stderr] or [0,1,2]
  if(!opts.stdio){
    opts.stdio = 'inherit';
  }

  try{
    var command = child_process.spawn(cmd, args, opts);
    pid = command.pid;
    status = ('runCommand spawned ' + cmd + ' with pid ' + pid );

    command.on('close', (code,signal)  => { if(signal){console.log('Terminated by ' + signal); }} );

    command.on('error', (error) => { console.log('runCommand Error: ' + error.message); });
    command.on('exit', (code) => {
      if(code.toString() == 0){
        status = ('runCommand ' + cmd + ' finished ok');
      }else {
        status = ('runCommand ' + cmd + ' finished not ok');
      }
    });

    process.on('uncaughtException', (err) => { console.log('Uncaught Error: ' + err.message); });
  }catch(error){
    console.log('runCommand error ' + error);
  }
}
//===runScript================================================================
runScript = function() {
  this.child = {};
  this.childState = 'none';
  this.debug = false;
  this.killCommand = 'Time to kill Process';
  this.messages = [];
  this.threads = {};
};

util.inherits(runScript,events.EventEmitter);

runScript.prototype.getChildPid = function (){
  return this.child.pid;
};

runScript.prototype.resetMessages = function (){
  var tArr = this.messages.slice();
  this.messages = [];
  return tArr;
};
//store from the script
runScript.prototype.getMessages = function(){
  return this.resetMessages();
};

runScript.prototype.getState = function(){
  return this.childState;
};

//---------------------------------------------------------
//send to the script
runScript.prototype.send = function(message){
  if(message){
    this.child.send(message); 
  }
};

runScript.prototype.start = function(scriptName) {
  var that = this;

  var onMessage = function (message) {
      that.emit('event',['Forker ',this.pid,' recieved ',message]);
    },
    onError = function(e) {
      that.emit('event','child error',this.pid,e);
    },
    onDisconnect = function() {
      that.emit('event','child disconnect',this.pid,'killing...');
    };

  process.on('uncaughtException', function (err) {
    console.log('runScript Error ' + err);
  });
  fs.stat(scriptName, function(err) {
    if(err === null) {
      that.child = child_process.fork(scriptName, {detached: true});
      that.child.on('disconnect',onDisconnect);
      that.child.on('error',onError);
      that.child.on('message',onMessage);
      that.threads[that.child.pid] = that.child;
      console.log('runScript forked ' + scriptName + ' with pid ' + that.child.pid );
    } else {
      console.log('runScript' + scriptName + ' does not exist');
    }
  });
};

runScript.prototype.stop = function(pid) {
  var that = this;
  this.child.send('kill'); 
  if ( typeof pid === 'undefined' ) {
    var allPids = Object.keys(this.threads);
    allPids.forEach(function(key) {
      that.threads[key].disconnect();
    });
  } else if ( that.threads[pid] ) {
    that.threads[pid].disconnect();
  }
  process.kill(pid);
};

runScript.prototype.destroy = function() {
  process.kill();
};

runScript.prototype.on('event',function(event) {
  try{
    var info = event[3].info;
    if(info){
      if(info.startsWith(this.killCommand)){
        var kPID = info.slice(this.killCommand.length+2,-1);
        console.log('killing ' +kPID);
        this.stop(kPID);
      }else{
        this.messages.push(info);
        if(this.debug){console.log(info);}
      }
    }
    var cState = event[3].state;
    if(cState){
      this.childState = cState;
    }
  }catch (error){
    console.log('Error ' + error);
  }
});

function showData(data, comment, delay){
  if(delay){
    sleep(delay);
  }
  try {
    if(data){
      if(!comment){
        comment = '';
      }
      console.log('show ' + comment);
      if(data !== undefined){
        if(data.constructor === Array){
          data.forEach(function(d){console.log(d);});
        }else {
          console.log(data.toString());
        }
      } else {
        console.log('showData recieved undefined');
      }
    }
  } catch (error) {
    console.error('showData data caused error: ' + error);
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
  while (new Date().getTime() < start + delay) { /*nothing here*/ }
}

function state(newState) {
  if(newState){ status = newState; }
  return status;
}

module.exports = {
  copyFileOnce:     copyFileOnce,
  getFileList:		getFileList,
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
  mkDirOnce:        mkDirOnce,
  runCommand:       runCommand,
  runScript:        runScript,
  saveFile:         saveFile,
  sleep:            sleep,
  showData:         showData,
  state:            state
};
