'use strict';

var myApp = angular.module('skodenApp', [
	'ngRoute',
	'ngMeta',
	'skodenControllers',
	'skodenDirectives',
	'skodenServices',
	'skodenFilters',
]);

var metaObj = {
	"og:site_name": "Skoden Chronicles",
	"og:title": "The Skoden Chronicles Podcast | Offical Website",
	"og:description": "Get acquainted with the team by connecting with us online. All our episodes of Season 1 are available to listen to or for download. Stay up to date with contemporary decolonial theory at its finest.",
	"og:image": "image",
	"og:url": "https://skodenchronicles.com",
	"twitter:card": "summary",
	"twitter:site": "@SkodenPodcast",
	"twitter:creator": "@AshCourchene",
}

myApp.config(['$routeProvider', '$locationProvider', 'ngMetaProvider',
	function($routeProvider, $locationProvider, ngMetaProvider) {
		$routeProvider.
			when('/', {
				templateUrl: '../static/partials/home.html',
				controller: 'IndexCtrl',
				data: { meta: metaObj }
			}).
			when('/podcasts', {
				templateUrl: '../static/partials/podcasts.html',
				controller: 'PodcastCtrl',
				data: { meta: metaObj }
			}).
			when('/team', {
				templateUrl: '../static/partials/team.html',
				controller: 'TeamCtrl',
				data: { meta: metaObj }
			}).
			when('/contact', {
				templateUrl: '../static/partials/contact.html',
				controller: 'ContactCtrl',
				data: { meta: metaObj }
			}).
			when('/view/:title', {
				templateUrl: '../static/partials/view.html',
				controller: 'ViewPodcastCtrl',
			}).
			when('/news', {
				templateUrl: '../static/partials/news.html',
				controller: 'NewsCtrl',
				data: { meta: metaObj }
			}).
			when('/news/:headline', {
				templateUrl: './static/partials/view-news.html',
				controller: 'NewsViewCtrl',
			}).
			when('/media', {
				templateUrl: '../static/partials/media.html',
				controller: 'MediaCtrl',
			}).
			otherwise({
				redirectTo: '/'
			});
		$locationProvider.html5Mode(false);
		ngMetaProvider.setDefaultTag('author', 'Our host');
	}])
.run(['ngMeta', function(ngMeta) {
	ngMeta.init()
}]);;