angular.module('DSApp')
  .factory('gamesFactory', function ($http, $q) {

    var factory = {};

    var deferred = $q.defer();
    $http.get("games.json").then(function (data) {
      deferred.resolve(data);
    });

    factory.getAll = function () {
      return deferred.promise;
    };

    return factory;
  });
