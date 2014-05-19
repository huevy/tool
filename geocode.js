var geocoder = require('geocoder');
var async = require('async');
var q = require('q');
// var _ = require('lodash');

module.exports = function geocode(addresses) {

  //Гибрид ежа с ужом (q + async). Ну работает жеж, ёба))
  return q.ninvoke(
    async,
    'mapSeries',
    addresses,
    function(addr, next) {
      geocoder.geocode(addr, function(err, res) {
        if (err) {
          setTimeout(function() {
            next(err);
          }, 1000);
          return;
        }
        if (res.results[0]) {
          setTimeout(function() {
            console.log('Location resolved:', addr, res.results[0].geometry.location);
            next(null, {
              address: addr,
              location: res.results[0].geometry.location
            });
          }, 1000);
        } else {
          setTimeout(function() {
            next(null, null);
          }, 1000);
        }
      });
    }
  );
};