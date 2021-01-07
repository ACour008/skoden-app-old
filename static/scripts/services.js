'use strict';

var skodenServices = angular.module('skodenServices', []);

skodenServices.factory('Breadcrumb', function() {
	function Breadcrumb(playlists) {
		this.playlists = playlists;
		this.currentPlaylist;
		this.trackIndex;
		this.nextTrack;
		this.prevTrack;
		this.changeTrackIndex = function(loc) {
			this.trackIndex = loc;
		  this.nextTrack = this.currentPlaylist.tracks[loc-1];
			this.prevTrack = this.currentPlaylist.tracks[loc+1];
		}
	}
	return Breadcrumb
});

skodenServices.service('SoundParser', ['$sce', function($sce) {
	this.parseTags = function(tagStr) {
		var i, tags;
		tags = tagStr.split(" ");
		for (i=0; i < tags.length; i++) {
			tags[i] = tags[i].split(/(?=[A-Z])/).join(" ");
		}
		return tags;
	}
	this.createDate = function(dateStr) {
		dateStr.replace(/\//g, "-").replace(" +0000", "Z").replace(" ", "T");
		return new Date(dateStr);
	}
	this.parseDescription = function(text, paragraphs) {
		var parArray, tempArray, i, link, ind, cnt;

		parArray = text.split("\n");
		parArray.filter(function(x) {
			return (x !== (undefined || ''));
		});
		for (i=0; i < parArray.length; i++) {
			parArray[i] = "<p>" + parArray[i] + "</p>";
			if (parArray[i].indexOf("@") > -1) {
				link = parArray[i].substring(parArray[i].indexOf("@")+1, parArray[i].indexOf(")"));
				ind = parArray[i].slice(0, parArray[i].indexOf("@"));
				cnt = parArray[i].slice(parArray[i].indexOf(")"));
				parArray[i] =[ind, '<a href="https://www.soundcloud.com/' + link + '" target="_blank">@'+ link + "</a>", cnt].join('');
			}
		}
		if (paragraphs > 0) {
			tempArray = [];
			for (i = 0; i<=paragraphs; i++) {
				tempArray[i] = parArray[i];
			} 
			return tempArray.join(" ");
		} else {
			return parArray.join(" ");
		}
	}
	this.parseAll = function(track) {
		track.tag_list = this.parseTags(track.tag_list);
		track.created_at = this.createDate(track.created_at);
		track.description = this.parseDescription(track.description);
		track.description = $sce.trustAsHtml(track.description);
		track.download_url = track.download_url;
	}
}]);

skodenServices.service('SoundPlayer', ['$http', '$log', function($http, $log) {
	var SOUNDCLOUD_CLIENT_KEY ='redacted';
	var SOUNDCLOUD_USER_ID = 'redacted';
	this.getTracks = function() {
		return $http({
			method:'GET',
			url: 'https://api.soundcloud.com/users/' + SOUNDCLOUD_USER_ID + '/tracks?client_id=' + SOUNDCLOUD_CLIENT_KEY,
		});
	}

	this.downloadPlaylist = function(playlist_id) {
		return $http({
			method:'GET',
			url: 'https://api.soundcloud.com/playlists/' + playlist_id + "?client_id=" + SOUNDCLOUD_CLIENT_KEY,
		});
	}

	this.getAllPlaylists = function() {
		return $http({
			method: 'GET',
			url: 'https://api.soundcloud.com/users/' + SOUNDCLOUD_USER_ID + "/playlists?client_id=" + SOUNDCLOUD_CLIENT_KEY,
		});
	}

	this.getPlayerHtml = function() {
		return $http({
			method: 'GET',
			url: 'https://soundcloud.com/oembed?format=json&client_id=redacted&url=http%3A%2F%2Fsoundcloud.com%2Fthe-skoden-chronicles%2Ftracks'
		})
	}
}]);