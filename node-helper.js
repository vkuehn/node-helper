/*eslint-env node */
/*
this is called node-helper as node already has an utility
a single javascript file to make the repeating node js stuff a one liner.
No outside node dependencies wanted here !

look a the end of this file to see what's available
*/
var fs = require("fs");

/*--File System---------------------------------------------------------*/
function copyFileOnce(sourceFile, destinationFile, callback){
	var success = false;
	if(isDirSync(sourceFile)) {
		if (callback) callback('copyFileOnce: ' + sourceFile + 'is a directory');
	}
	if(isDirSync(destinationFile)) {
		if (callback) callback('copyFileOnce: ' + destinationFile + ' is a Directory');
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
	if (typeof value === 'undefined' || !value)  {
    return '.';
	}
	if(Boolean(value)){
			if(!isEmpty(value)){
				return value;
			}
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

function showData(data, comment, delay){
	if(delay){
		sleep(delay);
	}
	try {
		if(data){
			if(!comment){
				comment = '';
			}
			console.log('data ' + comment);
			if(data !== undefined){
				console.log(data.toString());
			} else {
				console.log('undefined');
			}
		}
	} catch (error) {
		console.error("Showing data caused error: " + error);
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
  saveFile:         saveFile,
  sleep:            sleep,
  showData:         showData
};
