angular.module("DSApp")
.controller("gamesController", function ($scope, gamesFactory) {

  var data = gamesFactory.getAll();

  data.then(function (datab) {
    p = [];
    r = [];
    game = [];
    Object.keys(datab.data).map(function(objectKey, index) {
      if (Object.keys(datab.data[objectKey]).length > 2) {
        p.push(objectKey);
      }
    });
    p.splice(0,p.length-6);
    for (var i = 0; i < p.length; i++) {
      game.push(datab.data[p[i]]);
    }
    game1map = game[5][game[5].length-1].Map;
    $('#game1pic').css("background","url(" + GetMapImg(game1map) + ") no-repeat");
    $scope.game1map = game1map;
    game2map = game[4][game[4].length-1].Map;
    $('#game2pic').css("background","url(" + GetMapImg(game2map) + ") no-repeat");
    $scope.game2map = game2map;
    game3map = game[3][game[3].length-1].Map;
    $('#game3pic').css("background","url(" + GetMapImg(game3map) + ") no-repeat");
    $scope.game3map = game3map;
    game4map = game[2][game[2].length-1].Map;
    $('#game4pic').css("background","url(" + GetMapImg(game4map) + ") no-repeat");
    $scope.game4map = game4map;
    game5map = game[1][game[1].length-1].Map;
    $('#game5pic').css("background","url(" + GetMapImg(game5map) + ") no-repeat");
    $scope.game5map = game5map;
    game6map = game[0][game[0].length-1].Map;
    $('#game6pic').css("background","url(" + GetMapImg(game6map) + ") no-repeat");
    $scope.game6map = game6map;

    game1players = [];
    game1playersobj = {};
    for (var i = 0; i+1 < game[5].length-1; i++) {
      victim = game[5][i].victim;
      killer = game[5][i].killer;
      if (killer != "Map" && killer != "BunkersGrineerTurret") {
        if (!game1playersobj[killer]) {
        game1playersobj[killer] = {"Name":killer,"Kills":0,"Deaths":0};
        }
        if (!game1playersobj[victim]) {
        game1playersobj[victim] = {"Name":victim,"Kills":0,"Deaths":0};
        }
        game1playersobj[killer]["Kills"] += 1;
        game1playersobj[victim]["Deaths"] += 1;
      }
    }
    Object.keys(game1playersobj).map(function(objectKey, index) {
      game1players.push(game1playersobj[objectKey]);
    });
    $scope.game1players = game1players;
    game1dateobj = new Date(parseInt(p[5]));
    game1date = [pad(game1dateobj.getDate(),2)+"/"+pad(game1dateobj.getMonth()+1,2)+"/"+game1dateobj.getFullYear(), pad(game1dateobj.getHours(),2)+":"+pad(game1dateobj.getMinutes(),2)];
    $scope.game1date = game1date;

    game2players = [];
    game2playersobj = {};
    for (var i = 0; i < game[4].length-1; i++) {
      victim = game[4][i].victim;
      killer = game[4][i].killer;
      if (killer != "Map" && killer != "BunkersGrineerTurret") {
        if (!game2playersobj[killer]) {
        game2playersobj[killer] = {"Name":killer,"Kills":0,"Deaths":0};
        }
        if (!game2playersobj[victim]) {
        game2playersobj[victim] = {"Name":victim,"Kills":0,"Deaths":0};
        }
        game2playersobj[killer]["Kills"] += 1;
        game2playersobj[victim]["Deaths"] += 1;
      }
    }
    Object.keys(game2playersobj).map(function(objectKey, index) {
      game2players.push(game2playersobj[objectKey]);
    });
    $scope.game2players = game2players;
    game2dateobj = new Date(parseInt(p[4]));
    game2date = [pad(game2dateobj.getDate(),2)+"/"+pad(game2dateobj.getMonth()+1,2)+"/"+game2dateobj.getFullYear(), pad(game2dateobj.getHours(),2)+":"+pad(game2dateobj.getMinutes(),2)];
    $scope.game2date = game2date;

    game3players = [];
    game3playersobj = {};
    for (var i = 0; i+1 < game[3].length-1; i++) {
      victim = game[3][i].victim;
      killer = game[3][i].killer;
      if (killer != "Map" && killer != "BunkersGrineerTurret") {
        if (!game3playersobj[killer]) {
        game3playersobj[killer] = {"Name":killer,"Kills":0,"Deaths":0};
        }
        if (!game3playersobj[victim]) {
        game3playersobj[victim] = {"Name":victim,"Kills":0,"Deaths":0};
        }
        game3playersobj[killer]["Kills"] += 1;
        game3playersobj[victim]["Deaths"] += 1;
      }
    }
    Object.keys(game3playersobj).map(function(objectKey, index) {
      game3players.push(game3playersobj[objectKey]);
    });
    $scope.game3players = game3players;
    game3dateobj = new Date(parseInt(p[3]));
    game3date = [pad(game3dateobj.getDate(),2)+"/"+pad(game3dateobj.getMonth()+1,2)+"/"+game3dateobj.getFullYear(), pad(game3dateobj.getHours(),2)+":"+pad(game3dateobj.getMinutes(),2)];
    $scope.game3date = game3date;

    game4players = [];
    game4playersobj = {};
    for (var i = 0; i+1 < game[2].length-1; i++) {
      victim = game[2][i].victim;
      killer = game[2][i].killer;
      if (killer != "Map" && killer != "BunkersGrineerTurret") {
        if (!game4playersobj[killer]) {
        game4playersobj[killer] = {"Name":killer,"Kills":0,"Deaths":0};
        }
        if (!game4playersobj[victim]) {
        game4playersobj[victim] = {"Name":victim,"Kills":0,"Deaths":0};
        }
        game4playersobj[killer]["Kills"] += 1;
        game4playersobj[victim]["Deaths"] += 1;
      }
    }
    Object.keys(game4playersobj).map(function(objectKey, index) {
      game4players.push(game4playersobj[objectKey]);
    });
    $scope.game4players = game4players;
    game4dateobj = new Date(parseInt(p[2]));
    game4date = [pad(game4dateobj.getDate(),2)+"/"+pad(game4dateobj.getMonth()+1,2)+"/"+game4dateobj.getFullYear(), pad(game4dateobj.getHours(),2)+":"+pad(game4dateobj.getMinutes(),2)];
    $scope.game4date = game4date;

    game5players = [];
    game5playersobj = {};
    for (var i = 0; i+1 < game[1].length-1; i++) {
      victim = game[1][i].victim;
      killer = game[1][i].killer;
      if (killer != "Map" && killer != "BunkersGrineerTurret") {
        if (!game5playersobj[killer]) {
        game5playersobj[killer] = {"Name":killer,"Kills":0,"Deaths":0};
        }
        if (!game5playersobj[victim]) {
        game5playersobj[victim] = {"Name":victim,"Kills":0,"Deaths":0};
        }
        game5playersobj[killer]["Kills"] += 1;
        game5playersobj[victim]["Deaths"] += 1;
      }
    }
    Object.keys(game5playersobj).map(function(objectKey, index) {
      game5players.push(game5playersobj[objectKey]);
    });
    $scope.game5players = game5players;
    game5dateobj = new Date(parseInt(p[1]));
    game5date = [pad(game5dateobj.getDate(),2)+"/"+pad(game5dateobj.getMonth()+1,2)+"/"+game5dateobj.getFullYear(), pad(game5dateobj.getHours(),2)+":"+pad(game5dateobj.getMinutes(),2)];
    $scope.game5date = game5date;

    game6players = [];
    game6playersobj = {};
    for (var i = 0; i+1 < game[0].length-1; i++) {
      victim = game[0][i].victim;
      killer = game[0][i].killer;
      if (killer != "Map" && killer != "BunkersGrineerTurret") {
        if (!game6playersobj[killer]) {
        game6playersobj[killer] = {"Name":killer,"Kills":0,"Deaths":0};
        }
        if (!game6playersobj[victim]) {
        game6playersobj[victim] = {"Name":victim,"Kills":0,"Deaths":0};
        }
        game6playersobj[killer]["Kills"] += 1;
        game6playersobj[victim]["Deaths"] += 1;
      }
    }
    Object.keys(game6playersobj).map(function(objectKey, index) {
      game6players.push(game6playersobj[objectKey]);
    });
    $scope.game6players = game6players;
    game6dateobj = new Date(parseInt(p[0]));
    game6date = [pad(game6dateobj.getDate(),2)+"/"+pad(game6dateobj.getMonth()+1,2)+"/"+game6dateobj.getFullYear(), pad(game6dateobj.getHours(),2)+":"+pad(game6dateobj.getMinutes(),2)];
    $scope.game6date = game6date;

    setTimeout(function () {
      if ($scope.game6players) {
        $('.playerlink').click(function() {
          path = '#/player/'+$(this).attr("path");
          ViewFadeOut(path);
        });
      }
    }, 500);
  });

  function GetMapImg(map) {
    var bg = [];
    if (map == "Navigation Array") {
      var bg = ['http://i.imgur.com/2MjDZSa.jpg',
                'http://i.imgur.com/EuKls2c.jpg',
                'http://i.imgur.com/NY2Qs5Z.jpg',
                'http://i.imgur.com/nZnvlqi.jpg',
                'http://i.imgur.com/JfC4bSA.jpg',
                'http://i.imgur.com/5ItAYw2.jpg'];
    }
    if (map == "Luna Ruins") {
      var bg = ['http://i.imgur.com/phZyfZo.jpg',
                'http://i.imgur.com/SUex1kP.jpg',
                'http://i.imgur.com/PwXwYJp.jpg',
                'http://i.imgur.com/ivM8VrP.jpg',
                'http://i.imgur.com/ZwMof23.jpg',
                'http://i.imgur.com/0mrAT8E.jpg',
                'http://i.imgur.com/lVFwBXT.jpg',
                'http://i.imgur.com/itvu0aI.jpg',
                'http://i.imgur.com/FGO1lDx.jpg'];
    }
    if (map == "Forgotten Halls") {
      var bg = ['http://i.imgur.com/3SRaK2u.jpg',
                'http://i.imgur.com/xJyg3rj.jpg',
                'http://i.imgur.com/yZ5J7QE.jpg',
                'http://i.imgur.com/pgrJj0Z.jpg',
                'http://i.imgur.com/DMBPQ0c.jpg'];
    }
    if (map == "Freight Line") {
        var bg = ['http://i.imgur.com/J07L9vf.jpg',
                  'http://i.imgur.com/IUkNiof.jpg',
                  'http://i.imgur.com/qDOjld3.jpg',
                  'http://i.imgur.com/Jt9YGDi.jpg'];
    }
    if (map == "Cephalon Spires") {
      var bg = ['http://i.imgur.com/yz1swZB.jpg',
                'http://i.imgur.com/s0Ea5UD.jpg',
                'http://i.imgur.com/ZK8rjO1.jpg',
                'http://i.imgur.com/JxG0J3Y.jpg'];
    }
    if (map == "Docking Bay") {
      var bg = ['http://i.imgur.com/zWAX8Ed.jpg',
                'http://i.imgur.com/ylJCQ8p.jpg',
                'http://i.imgur.com/xdDRbNJ.jpg'];
    }
    if (map == "Infested Frigate") {
      var bg = ['http://i.imgur.com/edsA8LG.jpg',
                'http://i.imgur.com/Tacl2Vt.jpg',
                'http://i.imgur.com/cnjVmHe.jpg',
                'http://i.imgur.com/1V2iDaI.jpg',
                'http://i.imgur.com/dN4CS5r.jpg',
                'http://i.imgur.com/20qUcCh.jpg',
                'http://i.imgur.com/xCtVTGT.jpg',
                'http://i.imgur.com/U5Zwlvb.jpg'];
    }
    if (map == "Core") {
      var bg = ['http://i.imgur.com/OZ9ji5I.jpg',
                'http://i.imgur.com/vVH8XGv.jpg',
                'http://i.imgur.com/JnF4Ny3.jpg',
                'http://i.imgur.com/MdVcWQQ.jpg',
                'http://i.imgur.com/k7m0zpj.jpg',
                'http://i.imgur.com/i5vUbr6.jpg',
                'http://i.imgur.com/9sq6BjZ.jpg',
                'http://i.imgur.com/uR9N2b8.jpg'];
    }
    return bg[Math.floor(Math.random() * bg.length)];
  }

  function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }
});
