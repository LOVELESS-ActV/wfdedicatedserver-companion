angular.module("DSApp")
.controller("mainController", function ($scope, $location, serverFactory, $http){

  $('input[name="name"]').keyup(function(event){
    if(event.keyCode == 13){
        $("#searchbutton").click();
    }
  });

  $(document).ready(function () {
    if ($("#teshin")) {
      setTimeout(function () {
        intro = Math.floor(Math.random()*7)+1;
        $("#teshin").attr("src", "app/sfx/TeshinIntro"+intro+".ogg");
        $('#teshin').prop("volume", 0.1);
        if ($('#teshin')[0]) {
          $('#teshin')[0].play();
        }
      }, 1000);
    }
  });
  $scope.isDM = false;

  var datab = serverFactory.getAll();

  setInterval(function () {
    var databe = $http.get("server.json").then(function (data) {return data});
    databe.then(function (data) {
      if (data.data[0]["gameMode"] != "Annihilation") {
        $scope.isDM = true;
      }
      $scope.playerson = data.data[0]["Players"];
    });
  }, 5000);

  datab.then(function (data) {
    if (data.data[0]["gameMode"] == "Annihilation") {
      $scope.isDM = true;
    }
    $scope.playerson = data.data[0]["Players"];
    $scope.server = data.data[0];
    var rotated = false;
    $scope.showplayers = function() {
      var div = document.getElementById('showplayerson'),
          deg = rotated ? 0 : -90;
          num = 0;
      div.style.webkitTransform = 'rotate('+deg+'deg)';
      div.style.mozTransform    = 'rotate('+deg+'deg)';
      div.style.msTransform     = 'rotate('+deg+'deg)';
      div.style.oTransform      = 'rotate('+deg+'deg)';
      div.style.transform       = 'rotate('+deg+'deg)';
      if (rotated == false) {
        document.getElementById('playersonlist').style.bottom= "0%";
      } else {
        num = $('#playersonlist [class*=playerlink]:visible').length;
        if (num<4) {
          $('#playersonlist').css("transition-delay","0.7s");
          document.getElementById('playersonlist').style.bottom= "-20%";
        } else {
          $('#playersonlist').css("transition-delay","1s");
          document.getElementById('playersonlist').style.bottom= "-40%";
        }
        $('#playersonlist').removeClass('transition');
      }
      rotated = !rotated;
    }
    setTimeout(function () {
      if ($scope.playerson) {
        $('.playerlink').click(function() {
          path = '#/player/'+$(this).attr("path");
          ViewFadeOut(path);
        });
      }
    }, 500);
  });

});
