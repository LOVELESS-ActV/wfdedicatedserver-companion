angular.module("DSApp")
.controller("listController", function ($scope, playersFactory) {

  var data = playersFactory.getAll();

  data.then(function (datab) {
    p = [];
    Object.keys(datab.data).map(function(objectKey, index) {
      if (datab.data[objectKey]["Kills"] == undefined) {
        datab.data[objectKey]["Kills"]=0;
      }
      if (datab.data[objectKey]["Deaths"] == undefined) {
        datab.data[objectKey]["Deaths"]=0;
      }
      if (datab.data[objectKey]["Kills"] == 0) {
        datab.data[objectKey]["KDR"] = Math.round(("0.5"/datab.data[objectKey]["Deaths"]) * 100) / 100;
      } else {
        datab.data[objectKey]["KDR"] = Math.round((datab.data[objectKey]["Kills"]/datab.data[objectKey]["Deaths"]) * 100) / 100;
      }
      if (datab.data[objectKey].Name != "Map" && datab.data[objectKey].Name.indexOf("a level") == -1) {
        datab.data[objectKey].Name = datab.data[objectKey].Name.replace("\uff0e",".");
        p.push(datab.data[objectKey]);
      }
    });
    $scope.players = p;
    setTimeout(function () {
      if ($scope.players) {
        $('.playerlink').click(function() {
          path = '#/player/'+$(this).attr("path");
          ViewFadeOut(path);
        });
      }
    }, 500);
    $scope.Search = function() {
      results = [];
      i=0;
      $('#mainview').fadeOut();
      p.forEach(function (e) {
        i++;
        if (e.Name.toLowerCase().indexOf($('input[name="name"]').val().toLowerCase()) > -1 && e.Name != NaN) {
          results.push(e.Name);
        }
      });
      setTimeout(function () {
        if (results[1]) {
          setTimeout(function () {
            window.location.replace("#/search/results");
            $('#mainview').hide();
            setTimeout(function () {
              $('#mainview').html('<div id="container"><section><article style="text-align:center;"><h1>Found multiple results : </h1>'+
              Renderresults(results)
              +'<br></article></section></div><br><br><br>');
                $('#mainview').fadeIn();
            }, 200);
          }, 500);
        } else {
          if (results[0]) {
            ViewFadeOut('#/player/'+results[0]);
          } else {
            $scope.searchname = $('input[name="name"]').val();
            ViewFadeOut('#/player404');
          }
        }
      }, 1000);
    }
    function Renderresults(res) {
      finalstring = '';
      res.forEach(function (e) {
        finalstring += '<div><a onclick="ViewFadeOut('+"'"+'#/player/'+e+"'"+')">'+e+'</a></div><br>';
      })
      return finalstring;
    }
  });
});
