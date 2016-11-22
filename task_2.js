var http = require('http');
var fs = require('fs');
var url = require('url');
var req = require('request');
var cheerio = require('cheerio');
var ejs = require('ejs');
var normalizeUrl = require('normalize-url');
var async = require('async');
var util = require('util');
var titles = [];

//404 response
var send404Response = function (response) {
	response.writeHead(404, {"Content-Type": "text/plain"});
	response.write("Error! Code 404: Page not found!");
	response.end();
};

var renderTitles = function (response, titles) {
	console.log("qweqweqweqwe");
	ejs.renderFile("./page_titles.ejs", titles, {}, function(err, str){
		if(err){
			console.log(err.message);
		}
		console.log("asdasdasdasd");
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write(str);
		response.end();
		console.log("zxczxczxc");
	});
};

var get_title = function (requested_url, callback) {
	console.log(requested_url);
	//if requested url is not empty string
	if(requested_url.length > 0) {
		//ping on given url to get the reqesponse/html
		req(normalizeUrl(requested_url), function(error, res, body){
			if(error) {
				console.log(error.message);
				callback(error, {"requested_url": requested_url, "title": "Error: There was some error requesting the url."});
			} else {
				//parse the body to get title
				var $ = cheerio.load(body);
				callback(null, {"requested_url": requested_url, "title": $("title").text()})
			}
		});
	} else {
		console.log("Not found!!!");
		callback(null, {"requested_url": requested_url, "title": "Not Found"});
	}
};

//handle each request from user
var handleRequest = function (request, response) {
	console.log("a user tried to access the url: " + request.url);

	var parsedURL = url.parse(request.url, true);
	var queryData = parsedURL.query;

	request.on('error', function(err) {
		console.log(err);
		response.statusCode = 400;
		response.end();
	});

	response.on('error', function(err) {
		console.log(err);
	});

	if(request.method == "GET" && parsedURL.pathname == "/I/want/title" && queryData.address !== undefined && queryData.address.length > 0) {
		if(typeof queryData.address === "string") 
			queryData.address = [queryData.address];
		
		async.map(queryData.address, get_title, function(err, titles){
			if(err) {
				console.log(err);
			} else {
				console.log("I am done collecting titles now renderTitles");
				console.log(util.inspect(titles));
				renderTitles(response, {titles: titles});
			}
		});

	} else {
		send404Response(response);
	}
};

http.createServer(handleRequest).listen(8000);

console.log("Server is up and running. You can now access the site using http://localhost:8000");