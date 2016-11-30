
const fs = require('fs');
const helper = require('../../lib/node-helper');

function deletTempFile(fileName){
	fs.unlink(fileName, (err) => {
		  if (err) throw err;
		  helper.log('successfully deleted TempFile' + fileName);
		});
}

describe("Helper copyFileOnce", function () {
	var dirBad = './';
	var fileBad = './noThere.txt';
	var sourceFileOK = './README.md';
	var destinationFileOk = '../README.md';
	it("will return false if sourcefile is a directory", function () {
		expect(helper.copyFileOnce(dirBad, destinationFileOk)).toBe(false);
	});
	it("will return false if destinationfile is a directory", function () {
		expect(helper.copyFileOnce(sourceFileOK, dirBad)).toBe(false);
	});
	it("will return false if destinationfile exists", function () {
		expect(helper.copyFileOnce(sourceFileOK, sourceFileOK)).toBe(false);
	});
	it("will return false if sourcefile does not exist", function () {
		expect(helper.copyFileOnce(fileBad, destinationFileOk)).toBe(false);
	});
	it("will return false if destination does exist", function () {
		expect(helper.copyFileOnce(sourceFileOK, sourceFileOK)).toBe(false);
	});
	it("will return true copy succeeded", function () {
		expect(helper.copyFileOnce(sourceFileOK, destinationFileOk)).toBe(true);
		deletTempFile(destinationFileOk);
	});
});

describe("Helper getLocalIPs", function () {
	var ips = helper.getLocalIPs();
	var ip4LocalHost = '127.0.0.1';
	var ip6LocalHost = '::1';
	it("wil always contain the ipv4 localhost", function () {
		expect(ips).toContain(ip4LocalHost);
	});
	it("wil always contain the ipv6 localhost", function () {
		expect(ips).toContain(ip4LocalHost);
	});
});

describe("Helper getTimeStamp", function () {
	it("will always show hh:mm:ss", function (){
		var timeStamp = helper.getTimeStamp();
		expect(timeStamp).toMatch("[0-9][0-9]\:[0-9][0-9]\:[0-9][0-9]");
	});
});

describe("Helper isINT", function() {
	it("gives false if text", function (){
		expect(helper.isINT('text')).toBe(false);
	});
	it("gives true if number", function (){
		expect(helper.isINT(42)).toBe(true);
	});
});

describe("Helper isRunning", function() {
	it("gives false if searched for pid 111", function(){
		expect(helper.isRunning(111)).toBe(false);
	});
	it("gives true if searched for correct pid ", function(){
		var pid = process.pid;
		expect(helper.isRunning(pid)).toBe(true);
	});
});
