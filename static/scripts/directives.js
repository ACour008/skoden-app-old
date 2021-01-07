'use strict'

var skodenDirectives = angular.module('skodenDirectives', []);

skodenDirectives.directive('player', ['$log', function($log) {
	return {
		restrict: 'E',
		scope: {},
		controller: ['$scope', 'SoundPlayer', '$sce', '$timeout',
		function PlayerController($scope, SoundPlayer, $sce, $timeout) {
			SoundPlayer.getPlayerHtml().then(function(oEmbed) {
				$scope.player_src = $sce.trustAsHtml(oEmbed.data.html);
			});
		}],
		link: function(scope, el, attr) {
			scope.$watch(
				// the 'thing' to watch: the Player widget - we're waiting for it to load.
				function() { return document.getElementById('sc-widget').children[0]; },
				// the callback function: do once changed (i.e., loaded)
				function(newValue, oldValue, scope) {
					if (newValue !== oldValue) {
						scope.$parent.main['widget'] = SC.Widget(document.getElementById('sc-widget').children[0]);
					}
				});
		},
		templateUrl: '../static/partials/player.html',
	}
}]);