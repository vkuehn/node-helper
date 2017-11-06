/*eslint-env node */
/*
this is called node-helper as node already has an utility
a single javascript file to make the repeating node js stuff a one liner.
No outside node dependencies wanted here !
look a the end of this file to see what's available

Tested on windows,linux and mac
*/
'use strict';
const fs            = require('fs');
const os            = require('os');

let status = '';

/*--File System---------------------------------------------------------*/
function copyFileOnce(sourceFile, destinationFile, callback){
  let success = false;
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
  let data = '';
  fs.stat(filePath, function(err) {
    console.log('Error:' + err);
  });
  data = fs.readFileSync(filePath);
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
      const fileList = fs.readdirSync(path);
      return fileList;
    }
  }
}

function getLocalIPs(){
  const interfaces = os.networkInterfaces();
  let ips = [];
  for (let k in interfaces) {
    for (let k2 in interfaces[k]) {
      let address = interfaces[k][k2];
      ips.push(address.address);
    }
  }
  return ips;
}

function getTimeStamp(){
  let d = new Date();
  let h = addZero(d.getHours());
  let m = addZero(d.getMinutes());
  let s = addZero(d.getSeconds());
  return h + ':' + m + ':' + s;
}

function getValidInteger(value) {
  if(!isNaN(value) && parseInt(Number(value)) === value && !isNaN(parseInt(value, 10))){
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

function isWindows(){
  let windows = false;
  let plattform = (process.platform).substring(0,3);
  if(plattform === 'win'){ windows = true ;}
  return windows;
}

function sleep(delay, comment) {
  let sleeping = ' ...sleeping ' + delay;
  if(comment){
    console.log(comment + sleeping);
  }else {
    console.log(sleeping);
  }
  let start = new Date().getTime();
  while (new Date().getTime() < start + delay) { /*nothing here*/ }
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

function state(newState) {
  if(newState){ status = newState; }
  return status;
}

module.exports = {
  copyFileOnce:     copyFileOnce,
  getFileList:		  getFileList,
  getLocalIPs:      getLocalIPs,
  getTimeStamp:     getTimeStamp,
  getValidInteger:  getValidInteger,
  getValidString:   getValidString,
  isDirSync:        isDirSync,
  isEmpty:          isEmpty,
  isINT:            isINT,
  isWindows:        isWindows,
  loadFile:         loadFile,
  mkDirOnce:        mkDirOnce,
  saveFile:         saveFile,
  sleep:            sleep,
  showData:         showData,
  state:            state
};
