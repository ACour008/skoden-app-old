'use strict';

var skodenFilters = angular.module('skodenFilters', []);

skodenFilters.filter('cut', function() {
	return function (value, wordwise, max, tail) {
		if (!value) return '';

		max = parseInt(max, 10);
		if (!max) return value;
		if (value.length <= max) return value;

		value = value.substr(0, max);
		if (wordwise) {
			var lastspace = value.lastIndexOf('');
			if (lastspace !== -1) {
				if (value.charAt(lastspace-1) === '.' || value.charAt(lastspace-1) === ",") {
					lastspace = lastspace -1;
				}
				value = value.substr(0, lastspace);
			}
		}
		return value + (tail || '...');
	}
});

skodenFilters.filter('title', function() {
	return function (value) {
		if (!value) return;
		return value.substr(0, value.indexOf(':'));
	}
});

skodenFilters.filter('subtitle', function() {
	return function (value){ 
		if (!value) return;
		return value.substr(value.indexOf(':')+1, value.length-1);
	}
});

skodenFilters.filter('resize', function() {
	return function (string) {
		var size = {
			t500: 't500x500.jpg',
			crop: 't400x400.jpg',
			t300: 't300x300.jpg',
			large: 'large.jpg',
			t64: 't64x64.jpg',
			badge: 'badge.jpg',
			small: 'small.jpg',
			tiny: 'tiny.jpg',
			mini: 'mini.jpg' 
		}
		if (!string) return;
		return string.replace('large.jpg', 't500x500.jpg');
	}
});

skodenFilters.filter('sortbyname', ['$log', function($log) {
	return function(data, name) {
		var output = [];

		data.forEach(function(obj) {
			// Why label_name and not album? Soundcloud API has no attribute album. :( //
			if (obj.label_name == name) {
				// add element to array
				output.push(obj);
			}
		});
		
		if (!name) {
			output = data;
		}
		return output;
	}
}]);
