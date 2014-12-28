var q = require('q');
var _ = require('lodash');

var cursorRequest = require('./cursor-request');

function promisify(obj, method, args) {
  var def = q.defer();

  var args2 = (args || []).concat([function(result) {
    if (result instanceof Error) {
      def.reject(result);
    } else {
      def.resolve(result);
    }
  }]);

  obj[method].apply(obj, args2);
  return def.promise;
}


function fetch(twitter, url, params) {
  console.log('fetch:', url, params);
  return promisify(twitter, 'get', [url, params]);
}

function sleep(ms) {
  var def = q.defer();
  setTimeout(function() {
    def.resolve();
  }, ms);
  return def.promise;
};

function on429Retry(createPromise) {
  var min = 60000;
  var factor = 2;
  var max = 30 * 60000;

  var currentDelay = min;

  function loop() {
    return createPromise()
      .catch(function(error) {
        if (error && error.statusCode === 429) {
          if (currentDelay > max) {
            console.log('Delay is more than ' + max + 'ms. Giving up.');
            throw error;
          }
          console.log('Got "429 Too many requests" error. Sleeping ' + currentDelay + ' ms...');
          var promise = sleep(currentDelay).then(loop);
          currentDelay = currentDelay * factor;
          return promise;
        }
      });
  }
  return loop();

}


exports.list = function list(twitter, entityName, url, params) {
  return cursorRequest(
    params,
    function(params) {
      return on429Retry(fetch.bind(null, twitter, url, params));
    },
    function(res) {
      return res[entityName];
    },
    function(res) {
      return res.next_cursor_str;
    },
    function(req, cursor) {
      var newReq = _.assign({}, req, {
        cursor: cursor,
      });
      return newReq;
    })
};

exports.get = function get(twitter, url, params) {
  return on429Retry(function() {
    return promisify(twitter, 'get', [url, params]);
  });
};

exports.promisify = promisify;