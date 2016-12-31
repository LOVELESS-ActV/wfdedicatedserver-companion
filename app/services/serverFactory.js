angular.module('DSApp')
  .factory('serverFactory', function ($http, $q) {

    var factory = {};

    var deferred = $q.defer();
    $http.get("server.json").then(function (data) {
      deferred.resolve(data);
    });

    factory.getAll = function () {
      return deferred.promise;
    };

    return factory;
  });
