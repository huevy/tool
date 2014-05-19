var q = require('q');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var mkdirp = require('mkdirp');
var TwUtils = require('./tw-utils');
var geocode = require('./geocode');

var fsWrite = q.denodeify(fs.writeFile);
var fsRead = q.denodeify(fs.readFile);
var fsMkdirp = q.denodeify(mkdirp);

var F_CONF = process.env.HOME + '/.huevy-tool.json';
var F_FRIENDS = './users.json';
var F_LOCATIONS = './locations.json';
var F_GEO = './geo.json';

var config = require(F_CONF);
var tw = new TwUtils(config);

var commands = {
	sync: cmdSync,
	locate: cmdLocate,
	geocode: cmdGeocode
};

module.exports = commands;

function cmdSync() {
	tw.getFriends()
		.then(writeFriends)
		.then(function() {
			console.log('Users file rewritten: ' + F_FRIENDS);
		})
		.done();
}

function cmdGeocode() {
	q.all([
		readJSON(F_LOCATIONS),
		readJSON(F_GEO)
	])
		.then(updateGeocodeFromLocations)
		.then(writeGeo)
		.then(function() {
			console.log('Geocoding file updated: ' + F_GEO);
		})
		.done();
}

function cmdLocate() {
	q.all([
		readJSON(F_LOCATIONS),
		readJSON(F_FRIENDS)
	])
		.then(updateLocationsFromFriends)
		.then(function(newLocations) {
			return writeJSON(newLocations, F_LOCATIONS);
		})
		.then(function() {
			console.log('Location file updated: ' + F_LOCATIONS);
		})
		.done();
}

function updateGeocodeFromLocations(data) {
	var locations = data.shift() || {};
	var geo = data.shift() || {};

	var uniqPlaces = _(locations)
		.values()
		.pluck('location')
		.uniq()
		.remove(function(place) {
			return !(geo.hasOwnProperty(place));
		})
		.value();

	return geocode(uniqPlaces)
		.then(function(results) {
			for (var i = 0; i < results.length; i++) {
				var result = results[i];
				if (result) {
					geo[result.address] = result.location;
				}
			}
			return geo;
		});
}

function updateLocationsFromFriends(data) {
	var locations = data.shift() || {};
	var friends = data.shift();
	var newLocations = _(friends)
		.remove(function(user) {
			return !(locations.hasOwnProperty(user.screen_name));
		})
		.map(function(user) {
			return {
				name: user.name,
				screen_name: user.screen_name,
				location: 'TODO!!!'
			};
		})
		.value();

	for (var i = 0; i < newLocations.length; i++) {
		var loc = newLocations[i];
		locations[loc.screen_name] = loc;
	}

	return locations;

}

function writeFriends(users) {
	return writeJSON(users, F_FRIENDS);
}

function writeGeo(geo) {
	return writeJSON(geo, F_GEO);
}

function readJSON(file) {
	var def = q.defer();
	fsRead(file, 'utf8').then(function(data) {
		// console.log(JSON.parse(data));
		def.resolve(JSON.parse(data));
	}, function() {
		def.resolve(null);
	});
	return def.promise;
}

function writeJSON(value, file) {
	var str = JSON.stringify(value, false, 2);
	return fsMkdirp(path.dirname(file)).then(function() {
		return fsWrite(file, str);
	})
}

function backupFile() {

}