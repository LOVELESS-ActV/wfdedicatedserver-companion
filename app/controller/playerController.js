angular.module('DSApp')
  .controller('playerController', function ($scope, $location, playersFactory) {

    i = $scope.players.filter(function (e) {
      return e.Name == $location.url().slice($location.url().indexOf("/player/")+8,$location.url().length);
    });
    Object.keys(i[0]).map(function(objectKey, index) {
      if (objectKey == 'Kills' || objectKey == 'Name' || objectKey == 'Deaths' || objectKey == 'KDR') {}
      else {
        i[0][objectKey.replace("KillOn","Kills On ").replace("DeathBy", "Deaths By ").replace("KillsWith", "Kills With ")] = i[0][objectKey];
        delete i[0][objectKey];
      }
    });
    $scope.player = i[0];

  });
