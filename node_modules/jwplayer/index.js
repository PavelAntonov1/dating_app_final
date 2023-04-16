/*
 *	jwplayer platform API code
 *	implemented only video/create 
 *	@dependencies : request, sha1, php2js
 *	@todo : implement full api
*/


var request = require('request');
var sha1 = require('sha1');
var php2js = require('php2js');
var APIConfig = {
		url: 'http://api.jwplatform.com/v1/videos/create',
		key: '',/*Here goes your key*/
		secret: '',/*Here goes your secret*/
		format: 'json',
		kit: 'php-1.4'
	};

var jwplayer = {

	/*
	 *	Make http / https request to the url provided by the API
	 *	Nodejs request module used 
	 *	qs: {resumable: 'True', api_nonce: 27479055, api_timestamp: 1452165900, api_key: 'nX1xGB0G', api_format: 'php', api_kit: 'php-1.4', api_signature: '4500a129ea2e19b7a3550589462724e782e54374'}, //Query string data
	 *	@todo integrate with sails and angular
	*/
	makeRequest : function(reqUrl, cb) {
		request({
		    url: reqUrl, //URL to hit
		    method: 'GET', //Specify the method
		    headers: { //We can define headers too
		        'Content-Type': 'MyContentType',
		        'Custom-Header': 'Custom Value'
		    }
		}, cb);
	},

	/*
	 *	Generate the url for API call and make the request as well
	 *	Construct Signature Base String
	 *	applied key sort
	*/
	setArguments : function (args, cb) {
		args['api_nonce'] = Math.floor(Math.random() * (100000000));
		args['api_timestamp'] = Math.floor(Date.now() / 1000);
		args['api_key'] = APIConfig.key;
		args['api_format'] = APIConfig.format;
		args['api_kit'] = APIConfig.kit;

	/*applying k sort*/
		var orderedArgs = {};

		Object.keys(args).sort().forEach(function(key) {
		  orderedArgs[key] = args[key];
		});

	/*Construct Signature Base String*/
		var sbs = '';
		Object.keys(orderedArgs).forEach(function(key) {
			if(sbs != '') {
				sbs += "&";
			}
			sbs += php2js.rawurlencode(key) + "=" + php2js.rawurlencode(orderedArgs[key]);
		});

		//console.log(sha1(sbs + APIConfig.secret));

		args['api_signature'] = sha1(sbs + APIConfig.secret);
		
		var testUrl = APIConfig.url + '?' + php2js.http_build_query(args, "", "&");
		jwplayer.makeRequest(testUrl, cb);
	},

	
};

module.exports = jwplayer;
