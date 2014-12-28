var Twitter = require('twitter');
var q = require('q');
var _ = require('lodash');

var twitterQuery = require('./twitter-query');



function Utils(conf) {
  this.tw = new Twitter(conf.twitter);
}

module.exports = Utils;

Utils.prototype.getFriends = function() {
  return twitterQuery.list(this.tw, 'users', '/friends/list.json', {
    count: 200,
  });
};

Utils.prototype.getFollowers = function(idStr) {
  return twitterQuery.list(this.tw, 'users', '/followers/list.json', {
    user_id: idStr,
    count: 200,
    skip_status: true,
    include_user_entities: false,
  });
};

Utils.prototype.getMyself = function() {
  return twitterQuery.get(this.tw, '/account/verify_credentials.json', {});
};