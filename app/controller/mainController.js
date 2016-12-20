angular.module("DSApp")
.controller("mainController", function ($scope, $location, playersFactory){

  var data = playersFactory.getAll();

  $scope.players = data;

  $('input[name="name"]').keyup(function(event){
    if(event.keyCode == 13){
        $("#searchbutton").click();
    }
  });

  $scope.Search = function() {
    results = [];
    i=0;
    $('#mainview').fadeOut();
    data.forEach(function (e) {
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
