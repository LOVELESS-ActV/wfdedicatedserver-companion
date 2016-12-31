angular.module('DSApp')
  .factory('playersFactory', function ($http, $q) {

    var factory = {};

    var deferred = $q.defer();
    $http.get("players.json").then(function (data) {
      deferred.resolve(data);
    });

    factory.getAll = function () {
      return deferred.promise;
    };

    var playerkills = 0;
    factory.getsrank = function (player) {
      var allkills = [];
      d = p.filter(function(el) {
        return el.Name != "Map";
      });
      d.forEach(function (e) {
        if (e.Name == player) {
          playerkills = e.Kills;
        }
        allkills.push(e.Kills);
      });
      allkills.sort(function(a,b){return b - a});
      return allkills.findIndex(pk)+1;
    }

    function pk(e) {
      return e==playerkills;
    }

    return factory;

  });
