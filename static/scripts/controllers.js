'use strict';
var skodenControllers = angular.module('skodenControllers', []);

skodenControllers.controller('MainCtrl', ['$scope', '$http', '$log', '$sce', '$window', 'Breadcrumb', 'SoundParser', 'SoundPlayer',
	function($scope, $http, $log, $sce, $window, Breadcrumb, SoundParser, SoundPlayer) {
		$scope.windowWidth = window.innerWidth;
		$scope.main = {
			title: "",
			tracks: [],
			playlists: [],
			changeUrl: function(url) {
				$window.location.href = url;
				return false;
			}
		}
		$scope.main.changePlaylistAndIndex = function(index, track) {
			$scope.main.playlists.currentPlaylist = $scope.main.playlists.playlists[index];
			$scope.main.playlists.changeTrackIndex(track);
			$scope.main.changeUrl('/');
		}
		// AJAX call to get all tracks, then parse them for templates.
		/* All tracks also needed to reference against the player widget when
		/* user presses play button.                                       */
		SoundPlayer.getTracks().then(function(obj) {
			$scope.main.tracks = obj.data;
			$scope.main.tracks.forEach(function(track) {
				SoundParser.parseAll(track);
			});
		});

		// Get all playlists. Used by view pages.
		SoundPlayer.getAllPlaylists().then(function(obj) {
			var playlists = obj.data;
			playlists.forEach(function(playlist) {
				// Prep playlist data for template
				playlist.created_at = SoundParser.createDate(playlist.created_at);
				playlist.last_modified = SoundParser.createDate(playlist.last_modified);
				playlist.description = SoundParser.parseDescription(playlist.description);
				playlist.description = $sce.trustAsHtml(playlist.description);
				// Prep all track data for template
				playlist.tracks.forEach(function(track) {
					SoundParser.parseAll(track);
				});
				//Sort tracklist by most current
				playlist.tracks.sort(function(a, b) {
					return b.created_at - a.created_at;
				});
			});
			// Sort playlists by most current
			playlists.sort(function(a, b) {
				return a.created_at - b.created_at;
			});
			// Ready to prep breadcrumb info.
			// Array set from most to least current. Index w/ highest number least current
			$scope.main.playlists = new Breadcrumb(playlists);
			$scope.main.playlists.trackIndex = 0;
			$scope.main.playlists.currentPlaylist = $scope.main.playlists.playlists[0];
			$scope.main.playlists.prevTrack = $scope.main.playlists.currentPlaylist.tracks[$scope.main.playlists.trackIndex+1];
			$scope.main.playlists.nextTrack = undefined;
		});
	}
]);

skodenControllers.controller('IndexCtrl', ['$scope', '$log', function($scope, $log) {
		document.title = "The Skoden Chronicles";
		$scope.main.title = "Listen to Season One of the Skoden Chronicles Here!";
		$scope.$watch('main.playlists.currentPlaylist', function(newPL, oldPL, scope) {
			if (newPL != undefined) {
				$scope.playlist = newPL.tracks;
			}
		}, true);
		$scope.changeTrackIndex = function(loc) {
			$scope.main.playlists.changeTrackIndex(loc);
		}
	}
]);


skodenControllers.controller('PodcastCtrl', ['$scope', '$http', '$log', '$window', 'SoundPlayer', 'SoundParser',
	function($scope, $http, $log, $window, SoundPlayer, SoundParser) {
		document.title = "Podcasts";
		$scope.main.title = "Download All the Podcasts You Could Ever Wish For!";
		$scope.playing = false;
		$scope.hoverIn = function() {
			this.hoverOpts = true;
		}
		$scope.hoverOut = function() {
			this.hoverOpts = false;
		}
		$scope.viewPodcast = function(permalink, index, playlist) {
			var route = '/view/' + permalink;
			$scope.main.playlists.currentPlaylist = playlist;
			$scope.main.playlists.changeTrackIndex(index);
			$window.location.href = route;
		}
		$scope.download = function(url) {
			$http({
				method: 'POST',
				url: '/download-track',
				data: url
			})
			.then(function(data) { window.location = data });
		}
		$scope.$watch('main.playlists', function callBack(newPL) {
			if (newPL != undefined) {
				$scope.data = newPL.playlists;
			}
		}, true);
	}
]);

skodenControllers.controller('TeamCtrl', ['$scope', function($scope) {
	document.title = "The Team";
	$scope.main.title = "Skoden Chronicles is created by One Angry Ojibwe Boy";
	$scope.message = "Make it go away!";
	$scope.showMuse = true;
	$scope.toggleMessage = function() {
		$scope.showMuse = !$scope.showMuse;
		if (!$scope.showMuse) {
			$scope.message = "Jk. Show me again.";
		} else {
			$scope.message = "Make it go away!";
		}
	}
}]);


skodenControllers.controller('ContactCtrl', ['$scope', '$http', '$location', '$sce',
	function($scope, $http, $location, $sce) {
		document.title = "Contact";
		$scope.main.title = "You got something to say to us? #Skoden";
		$scope.data = {};
		$scope.botChk = false;
		$scope.message = "";
		$scope.message_status = "";
		$scope.recipients = [{"label": "general", "value": "General Inquiries", "group": "General Inquiries"}];
		$scope.check = function() {
			$scope.botChk = !$scope.botChk;
		}

		$scope.submitForm = function(isValid) {
			$scope.submitting = true;
			$scope.success = false;
			$scope.failure = false;
			$scope.message = "Sending Email..."
			if (isValid && !$scope.botChk) {
				$http({
					url:'/',
					method: 'POST',
					data: JSON.stringify($scope.data, null, '\t'),
					headers: {'Content-Type': 'application/json;charset=UTF-8'}
				})
				.success(
				// Success
				  function(data) {
					  $scope.submitting = false;
					  $scope.success = true;
					  $scope.failure = false;
					  $scope.message = data.success
					  $scope.form.$setPristine();
					  $scope.data = {}
				  }
			  )
			  .error(
				//Failure
				  function(data) {
					  $scope.submitting = false;
					  $scope.success = false;
					  $scope.failure = true;
					  $scope.message = "Please fix the following errors:";
					  $scope.errors = data.errors
				  }
			  );
		  }
	  }
}]);

skodenControllers.controller('ViewPodcastCtrl', ['$scope', '$log', '$routeParams', '$http', '$window', 'SoundPlayer', 'SoundParser',
	function($scope, $log, $routeParams, $http, $window, SoundPlayer, SoundParser) {	
		$scope.main.title = "Current Podcast";
		$scope.playing = false;
		
		$scope.hoverIn = function() {
			this.hoverOpts = true;
		}
		$scope.hoverOut = function() {
			this.hoverOpts = false;
		}
		$scope.play = function(track) {
			$scope.main.tracks.forEach(function(element, index) {
				if (element.title == track.title) {
					$scope.playing = !$scope.playing;
					$scope.main.widget['skip'](index);
				}
			});
		}
		$scope.pause = function() {
			$scope.playing = !$scope.playing;
			$scope.main.widget['pause']();
		}
		$scope.download = function(url) {
			$http({
				method: 'POST',
				url: '/download-track',
				data: url
			})
			.then(function(data) { window.location = data })
		}
		$scope.changeTrack = function(permalink, index) {
			var route = '/#/view/' + permalink;
			$scope.main.playlists.changeTrackIndex(index);
			$window.location.href = route;
		}
		$scope.$watch('main.playlists', function(newPL, oldPL, scope) {
			if (newPL != undefined) {
				// get current playlist and show the track we need to.
				newPL.currentPlaylist.tracks.forEach(function(track) {
					if (track.permalink === $routeParams.title) {
						$scope.data = track;
					}
				});
			}
		}, true);
}]);

skodenControllers.controller('NewsCtrl', ['$scope', '$http', '$sce', '$log', '$location', 'SoundParser',
	function($scope, $http, $sce, $log, $location, SoundParser) {
		document.title = "News";
		$scope.main.title = "Stay updated on all the Skoden Chronicles is doing!";
		$http({
			method: 'GET',
			url: 'https://skodenchronicles.com/static/data/posts.json'
		})
		.then(function(json) {
			$scope.news_posts = json.data.data.reverse();

			$scope.news_posts.forEach(function(post) {
				post.attributes.body = $sce.trustAsHtml(post.attributes.body);
				post.attributes.date_created = SoundParser.createDate(post.attributes.date_created);
			})
		})
	}
]);

skodenControllers.controller('NewsViewCtrl', ['$scope', '$http', '$routeParams', '$sce', '$log', 'SoundParser',
	function($scope, $http, $routeParams, $sce, $log, SoundParser) {
		$scope.main.title = "Current News Post";
		$scope.goBack = function() {
			window.history.back();
		}
		$http({
			method: 'GET',
			url: 'https://skodenchronicles.com/static/data/posts.json'
		})
		.then(function(json) {
			json.data.data.forEach(function(post) {
				if (post.attributes.permalink == $routeParams.headline) {
					$scope.post = post;
					$scope.post.attributes.body = $sce.trustAsHtml(post.attributes.body);
					$scope.post.attributes.date_created = SoundParser.createDate($scope.post.attributes.date_created);
				}
			})
		});
	}
]);

skodenControllers.controller('MediaCtrl', ['$scope',
	function($scope) {
		document.title = "Media";
		$scope.main.title = "Everything for press releases, images and other things!"
	}
]);
