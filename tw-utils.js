var Twitter = require('twitter');
var q = require('q');
var _ = require('lodash');


function Utils(conf) {
  this.tw = new Twitter(conf.twitter);
}

module.exports = Utils;

Utils.prototype.getFriends = function() {
  return this._getFriendsLoop();
};

//---------------------------------------------------------------------

Utils.prototype._getFriendsLoop = function(cur, users) {
  users = users || [];

  return this._getFriendsCur(cur).then(function(data) {
    console.log('users count:', data.users.length);
    console.log('next cursor:', data.next_cursor_str);
    console.log('users:', _(data.users).pluck('screen_name').value().join(', '));
    console.log('---------');
    if (data.next_cursor_str !== '0') {
      return this._getFriendsLoop(data.next_cursor_str, users.concat(data.users));
    } else {
      return users.concat(data.users);
    }
  }.bind(this));

};

Utils.prototype._getFriendsCur = function(cursor) {
  var def = q.defer();

  var params = {};
  if (undefined !== cursor) {
    params.cursor = cursor;
  }
  this.tw.get('/friends/list.json', params, function(data) {
    if (data instanceof Error) {
      def.reject(data);
      return;
    }
    def.resolve(data);
  });

  return def.promise;
};