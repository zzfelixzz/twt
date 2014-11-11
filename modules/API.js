var Twit = require("Twit");
var _ = require("lodash");
var fs = require("fs");
var Logger

var TwitterExpandURL = require("twitter-expand-url");

function API(config){
	this.client = new Twit({
		consumer_key: config.TWT_CONSUMER_KEY,
		consumer_secret: config.TWT_CONSUMER_SECRET,
		access_token: config.TWT_ACCESS_TOKEN,
		access_token_secret: config.TWT_ACCESS_TOKEN_SECRET
	});
}

API.total_expand = 0;
API.expanded = 0;

function _processData(data, cb){

	API.total_expand = data.length;

	for(var i = 0; i < data.length; i++){
		var expander = new TwitterExpandURL();
		expander.expand(i, data[i], {force: false}, function(err, results){
			if(err){
				return cb({msg: err.msg})
			}
			if(results){
				console.log(results);
			}
			API.expanded ++;
			if(API.total_expand === API.expanded){
				console.log("DONE", API.total_expand, API.expanded);
			}
		});
	}

	return cb(null, data);
}

API.prototype.tweet = function(status, cb){
	if(status.length > 140){
		return cb({
			msg: "tweet is too long"
		});
	}
	this.client.post('statuses/update', {
		status: status
	}, function(err, data, response) {
		if(err){
			return cb({msg: "could not post tweet / " + err.message});
		}
		if(data){
			return cb(null, {
				msg: "tweet posted"
			});
		}
	});
}

API.prototype.search = function(query, limit, cb){
	limit = limit || 15;
	this.client.get('search/tweets', {
		q: query + "+exclude:retweets+exclude:replies",
		count: limit
	},(function(err, data, response) {
		if(err){
			return cb({
				msg: "could not get tweets / " + err.message
			});
		}
		var msg = "displaying " + limit + " latest search results for '" + query + "'";
		if(limit === 1){
			msg = "displaying last search results for '" + query + "'";
		}
		_processData.call(this, data.statuses, function(err, data){
			return cb(null, {
				data: data,
				msg: msg
			});
		});
	}).bind(this));
}

API.prototype.home_timeline = function(limit, cb){
	limit = limit || 15;
	this.client.get('statuses/home_timeline', {
		count: limit
	}, (function(err, data, response) {
		if(err){
			return cb({
				msg: "could not get home timeline / " + err.message
			});
		}
		var msg = "displaying " + limit + " latest tweets on your timeline";
		if(limit === 1){
			msg = "displaying last tweet on your timeline";
		}
		_processData.call(this, data, function(err, data){
			return cb(null, {
				data: data,
				msg: msg
			});
		});
	}).bind(this));
}

API.prototype.mentions_timeline = function(limit, cb){
	limit = limit || 15;
	this.client.get('statuses/mentions_timeline', {
		count: limit
	}, (function(err, data, response) {
		if(err){
			return cb({
				msg: "could not get mentions / " + err.message
			});
		}
		var msg = "displaying " + limit + " latest mentions";
		if(limit === 1){
			msg = "displaying last mention";
		}
		_processData.call(this, data, function(err, data){
			return cb(null, {
				data: data,
				msg: msg
			});
		});
	}).bind(this));
}

API.prototype.direct_messages = function(limit, cb){
	limit = limit || 15;
	this.client.get('direct_messages', {
		count: limit
	}, (function(err, data, response) {
		if(err){
			return cb({
				msg: "could not get mentions / " + err.message
			});
		}
		var msg ="displaying " + limit + " latest direct messages";
		if(limit === 1){
			msg = "displaying last direct message";
		}
		_processData.call(this, data, function(err, data){
			return cb(null, {
				data: data,
				msg: msg,
				dm: true
			});
		});
	}).bind(this));
}

API.prototype.user_timeline = function(screen_name, limit, cb){
	limit = limit || 15;
	if(screen_name.indexOf("@") === 0){
		screen_name = screen_name.substring(1, screen_name.length)
	}
	this.client.get('statuses/user_timeline', {
		screen_name: screen_name,
		count: limit
	}, (function(err, data, response) {
		if(err){
			return cb({
				msg: "could not get tweets of user " + screen_name + " / " + err.message
			});
		}
		var msg = "displaying last " + limit + " tweets by @" + screen_name;
		if(limit === 1){
			msg = "displaying last tweet by @" + screen_name;
		}
		_processData.call(this, data, function(err, data){
			return cb(null, {
				data: data,
				msg: msg
			});
		});
	}).bind(this));
}

module.exports = API;
