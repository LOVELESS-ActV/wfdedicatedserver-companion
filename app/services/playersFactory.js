angular.module('DSApp')
  .factory('playersFactory', function () {

    var factory = {};

    p=[];

    $.ajax({
      url:"players.json",
      method:'GET',
      success: function (data) {
        Object.keys(data).map(function(objectKey, index) {
          if (data[objectKey]["Kills"] == undefined) {
            data[objectKey]["Kills"]=0;
          }
          if (data[objectKey]["Deaths"] == undefined) {
            data[objectKey]["Deaths"]=0;
          }
          if (data[objectKey]["Kills"] == 0) {
            data[objectKey]["KDR"] = Math.round(("0.5"/data[objectKey]["Deaths"]) * 100) / 100;
          } else {
            data[objectKey]["KDR"] = Math.round((data[objectKey]["Kills"]/data[objectKey]["Deaths"]) * 100) / 100;
          }
          p.push(data[objectKey]);
        });
      },
      error: function () {}
    });

    factory.getAll = function () {
      return p;
    };

    return factory;

  });
