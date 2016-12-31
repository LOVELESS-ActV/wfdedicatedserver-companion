angular.module('DSApp', ['ngRoute']);

angular.module('DSApp')
  .config(function ($routeProvider) {
    $routeProvider
    .when('/',{
      templateUrl:'app/views/home.html'
    })
    .when('/games',{
      templateUrl:'app/views/games.html'
    })
    .when('/top',{
      templateUrl:'app/views/top.html'
    })
    .when('/all',{
      templateUrl:'app/views/all.html'
    })
    .when('/search',{
      templateUrl:'app/views/search.html'
    })
    .when('/search/results',{
      templateUrl:'app/views/search.html'
    })
    .when('/player/:Name',{
      templateUrl:'app/views/player.html'
    })
    .when('/player404',{
      templateUrl:'app/views/player404.html'
    })
    .when('/credits',{
      templateUrl:'app/views/credits.html'
    })
    .when('/404',{
      templateUrl:'app/views/404.html'
    })
    .otherwise({redirectTo:'/404'});
  });
