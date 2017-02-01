﻿var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var isConfig = false;
//Feel free to change this to whatever you wish.
var logfile = 'DedicatedServer.log';
var opts = {db: {authSource: 'admin'}};
var weapons = {};
var url = '';
var urldata = '';
var ratelimit = require('ratelimit');
var bytesPerSecond = 1500000; //1.5mb
ratelimit(MongoClient, bytesPerSecond);
try {
  logfile = JSON.parse(fs.readFileSync("./config.ini").toString()).log;
  ServerName = JSON.parse(fs.readFileSync("./config.ini").toString()).ServerName;
  DBuser = JSON.parse(fs.readFileSync("./config.ini").toString()).DBuser;
  DBpwd = JSON.parse(fs.readFileSync("./config.ini").toString()).DBpwd;
  DBname = JSON.parse(fs.readFileSync("./config.ini").toString()).DBname;
  url = "mongodb://"+DBuser+":"+DBpwd+"@livjatanserver.tk:27017/"+DBname+"?connectTimeoutMS=300000";
  urldata = "mongodb://"+DBuser+":"+DBpwd+"@livjatanserver.tk:27017/data?connectTimeoutMS=300000";
  function PullWeaponsFromDB(callback) {
    MongoClient.connect(urldata, opts, function(err, db) {
      db.collection('weapons').find({}).toArray(function(err, out) {
        if (err) {
          console.log("Failed to retrieve weapons.");
          setTimeout(function () {
            process.exit();
          }, 100);
        } else {
          callback(out);
        }
      });
    });
  }

  PullWeaponsFromDB(function(items) {
    weapons = items[0];
  });
} catch(ex) {
  if(ex.code == "ENOENT") {
    fs.writeFile('./config.ini', '{"log":"DedicatedServer.log","ServerName":"SomeServer01","DBuser":"AskMeForThat","DBpwd":"Same","DBname":"Same"}');
    console.log("config.ini created. Please fill the info needed in it.");
    fs.writeFile('run.bat', "node app.js \r\npause");
    console.log("run.bat created as well. You can start this tool from it now.");
  }
  setTimeout(function () {
    process.exit();
  }, 1000);
}

var ServerInfo = [];

try {
  ServerInfo = fs.readFileSync(process.env.USERPROFILE+"/AppData/Local/Warframe/"+logfile).toString().replace(/(\r\n|\r|\n)/g, '\n').split("\n");
} catch (e) {
  console.log("Start me after starting the dedicated server !");
  process.exit();
}

//Buffer per Game
var gamebuffer = [];
var gamebufferindex = 0;
var gamemap = "Unknown Map";
var killingspree = {};
var rev = {};
var oneshots = {};

//Change process.env.PATH.slice(0,1)to your Windows disk letter and process.env.USERNAME to your current Windows Account Name if you get any issue !
// The line below isn't the only one to change, use CTRL+H to change all of them!
var filename = process.env.USERPROFILE+"/AppData/Local/Warframe/"+logfile;
var starttime;
var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

var maps = require('./maps.json');
var games = require('./games.json');
var teamstatus = {};
var PvPHost = '';
var PvPSession = {};

setTimeout(function () {

  get_line(process.env.USERPROFILE+"/AppData/Local/Warframe/"+logfile, 6, function(err, line){
    try {
      time = line.slice(32,line.indexOf(' [UTC'));
      starttime = new Date(time).getTime();
    } catch (e) {
      console.log("Start me after starting the dedicated server !");
      process.exit();
    }
  });

  ServerInfo.forEach(function (e) {
    if (e.indexOf("MatchingServiceWeb::HostSession - settings") > -1) {
      PvPHost = JSON.parse(e.slice(e.indexOf("gs: ")+4,e.length));
      if (PvPHost.eloRating == 0) {
        PvPHost["RC"] = "on";
      } else {
        PvPHost["RC"] = "off";
      }
      PvPHost["region"] = "Unknown";
      if (PvPHost.regionId == 4) {
        PvPHost["region"] = "North-America";
      }
      if (PvPHost.regionId == 6) {
        PvPHost["region"] = "South-America";
      }
      if (PvPHost.regionId == 7) {
        PvPHost["region"] = "Europe";
      }
      if (PvPHost.regionId == 8) {
        PvPHost["region"] = "Asia";
      }
      if (PvPHost.regionId == 9) {
        PvPHost["region"] = "Oceania";
      }
      if (PvPHost.regionId == 14) {
        PvPHost["region"] = "Russia";
      }
    }
    if (e.indexOf("Loading game rules: LotusPvp") > -1) {
      if (e.slice(e.indexOf("LotusPvp")+8,e.indexOf("GameRules")) == "DM") {
        PvPHost["gameMode"] = "Annihilation";
      } else if (e.slice(e.indexOf("LotusPvp")+8,e.indexOf("GameRules")) == "TDM") {
        PvPHost["gameMode"] = "Team Annihilation";
      } else if (e.slice(e.indexOf("LotusPvp")+8,e.indexOf("GameRules")) == "CTF") {
        PvPHost["gameMode"] = "Cephalon Capture";
      } else if (e.slice(e.indexOf("LotusPvp")+8,e.indexOf("GameRules")) == "SB") {
        PvPHost["gameMode"] = "Lunaro";
      }
    }
    if (e.indexOf("Logged in ") > -1) {
      PvPHostName = e.slice(e.indexOf("in ")+3,e.indexOf("_"));
    }
  });

  PvPHost["Players"] = [];

  function fuseallDB(db, callback) {
    db.collection('players').find({}).toArray(function(err, out) {
      if (err) {} else {
        callback(out);
      }
    });
  }

  function savePlayerstoJSON(db, callback) {
    db.collection('players').find({}).toArray(function(err, out) {
      if (err) {} else {
        callback(out);
      }
    });
  }

  console.log(PvPHostName+"_Server is running "+PvPHost["gameMode"]+", in "+PvPHost["region"]+" region, with RC "+PvPHost["RC"]+".");
  console.log("");
  console.log("(If this info is off, you started me before launching your dedicated server.");
  console.log("Please run me again after launching it.)");
  console.log("");

  MongoClient.connect(url, opts, function(err, db) {
    var collection = db.collection("ServerInfo");
    PvPHost["Name"] = ServerName;
    serverquery = PvPHost;
    serverquery["LastUpdate"] = new Date().getTime();
    serverquery["Logging"] = true;
    serverquery["CurrentMap"] = "Unknown Map";
    collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});
    db.close(function (err, res) {
      if (err) {}
    });
  });

  lastline = "";
  fs.open(filename, 'r', function(err, fd) {
    fs.watchFile(filename, function(cstat, pstat) {
      var delta = cstat.size - pstat.size;
      if (delta <= 0) return;
      fs.read(fd, new Buffer(delta), 0, delta, pstat.size, function(err, bytes, buffer) {
        bwrite = buffer.toString().replace(/(\r\n|\r|\n)/g, '\n').split("\n");
        write = ""+lastline;
        lastline = bwrite.pop();
        write += bwrite.join("\n");
        fs.writeFile(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer"+ServerName+".log", write, function(err) {
          if(err) {
          return console.log(err);
          }
        });
      });
      setTimeout(function () {
        CheckSession();
        CheckKills();
        CheckJoins();
        if (PvPHost["gameMode"] != "Annihilation" && PvPHost["gameModeId"] != 406014) {
          CheckTeams();
        }
        CheckDisconnects();
        CheckMaps();
      }, 100);
    });
  });

process.on('SIGINT', (code) => {
  fs.stat(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer"+ServerName+".log", function(err, stat) {
    if(err == null) {
      fs.unlinkSync(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer"+ServerName+".log");
    } else {}
  });
  MongoClient.connect(url, opts, function(err, db) {
    if (err) {} else {
      var collection = db.collection("ServerInfo");
      serverquery["LastUpdate"] = new Date().getTime();
      serverquery["Logging"] = false;
      serverquery["Players"] = [];
      collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});
      db.close(function (err, res) {
        if (err) {}
      });
    }
  });
  setTimeout(function () {
    process.exit();
  }, 1000);
});

function getWeaponName(devname) {
  output = '';
  Object.keys(weapons).map(function(objectKey, index) {
    var value = weapons[objectKey];
    if (objectKey == devname) {
      output = value;
    } else {
      if (objectKey.indexOf(devname) > -1 && output == '') {
        output = value;
      }
    }
  });
  return output;
}

function getMapName(devname) {
  return maps[devname];
}

function sleep(millis) {
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while(curDate-date < millis);
}

function CheckSession() {
  buffersi = fs.readFileSync(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer"+ServerName+".log").toString().split("\n");
  if (PvPHost["Players"].length == 0) {
    PvPHost["hasStarted"] = false;
  }
  buffersi.forEach(function (e) {
    if (e.indexOf('SendSessionUpdate') > -1 && e.indexOf('{') > -1) {
      param = JSON.parse(e.slice(e.indexOf('params:')+7,e.length));
      if (param) {
        Object.keys(param).map(function(objectKey, index) {
          PvPHost[objectKey] = param[objectKey];
        });
        MongoClient.connect(url, opts, function(err, db) {
          var collection = db.collection("ServerInfo");
          serverquery = PvPHost;
          serverquery["LastUpdate"] = new Date().getTime();
          collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});
          db.close(function (err, res) {
            if (err) {}
          });
        });
      }
    }
  });
}

function CheckKills() {
  console.log('Checking for kills...');
  var kills = [];
  bufferk = fs.readFileSync(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer"+ServerName+".log").toString().split("\n");
  bufferk.forEach(function (e) {
    if (e.indexOf('was killed') > -1 && e.indexOf('using a') > -1) {
      wp = getWeaponName(e.slice(e.indexOf('using a ')+8, e.length-1).replace(/ /g, '+'));
      if (e.indexOf('/Layer') > -1 || e.indexOf('DamageTrigger') > -1) {
          kill = {
            timestamp: parseInt(starttime) + parseInt(e.slice(0, e.indexOf('.')+4).replace('.','')),
            victim: e.slice(e.indexOf(': ')+2, e.indexOf(' was')),
            killer: "Map"
          };
          if (e.indexOf('/Layer4') > -1) {
            if (e.indexOf('DamageTrigger3') > -1) {
              kill.weapon = "Environment";
            } else {
              kill.weapon = "Grineer Poison";
            }
          } else if (e.indexOf('/Layer1/DamageTrigger0') > -1) {
            kill.weapon = "Electric Floor";
          } else if (e.indexOf('/Layer1/DamageTrigger1') > -1) {
            kill.weapon = "Fire";
          } else if (e.indexOf('/Layer2/CorpusCoreLaserBeam') > -1) {
            kill.weapon = "Corpus Laser Beam";
          } else {
            kill.weapon = "Environment";
          }
          if (e.slice(e.indexOf('by ')+3, e.indexOf(' damage')).indexOf("/") > -1) {
            kill.shielddmg = e.slice(e.indexOf('by ')+3, e.indexOf(' / '));
            kill.healthdmg = e.slice(e.indexOf(' / ')+3, e.indexOf(' damage'));
          } else {
            kill.shielddmg = "0";
            kill.healthdmg = e.slice(e.indexOf('by ')+3, e.indexOf(' damage'));
          }
      } else {
        if (wp != '') {
          kill = {
            timestamp: parseInt(starttime) + parseInt(e.slice(0, e.indexOf('.')+4).replace('.','')),
            victim: e.slice(e.indexOf(': ')+2, e.indexOf(' was')),
            killer: e.slice(e.indexOf('from ')+5, e.indexOf(' using')),
            weapon: wp
          };
        } else {
          e = e+"\n";
          kill = {
            timestamp: parseInt(starttime) + parseInt(e.slice(0, e.indexOf('.')+4).replace('.','')),
            victim: e.slice(e.indexOf(': ')+2, e.indexOf(' was')),
            killer: e.slice(e.indexOf('from ')+5, e.indexOf(' using')),
            weapon: "Unknown Weapon"
          };
        }
        if (!(/^\+?(0|[1-9]\d*)$/.test(e.slice(0, 1)))) {
          kill.timestamp = 0;
          if (e.indexOf(":") > -1) {
            kill.victim = e.slice(e.indexOf(': ')+2, e.indexOf(' was'));
          } else {
            kill.victim = "Unknown";
          }
        }
        if (e.indexOf("/") > -1) {
          kill.shielddmg = e.slice(e.indexOf('by ')+3, e.indexOf(' / '));
          kill.healthdmg = e.slice(e.indexOf(' / ')+3, e.indexOf(' damage'));
        } else {
          kill.shielddmg = "0";
          kill.healthdmg = e.slice(e.indexOf('by ')+3, e.indexOf(' damage'));
        }
      }
      if (kill.killer == "a level 20 TURRET") {
        kill.killer = "BunkersGrineerTurret";
      }
      kills.push(kill);
    } else if (e.indexOf('was killed') > -1) {
      kill = {
        timestamp: parseInt(starttime) + parseInt(e.slice(0, e.indexOf('.')+4).replace('.','')),
        victim: e.slice(e.indexOf(': ')+2, e.indexOf(' was')),
        killer: "Bullet Jump",
        weapon: "Bullet Jump"
      };
      if (e.indexOf("/") > -1) {
        kill.shielddmg = e.slice(e.indexOf('by ')+3, e.indexOf(' / '));
        kill.healthdmg = e.slice(e.indexOf(' / ')+3, e.indexOf(' damage'));
      } else {
        kill.shielddmg = "0";
        kill.healthdmg = e.slice(e.indexOf('by ')+3, e.indexOf(' damage'));
      }
      kills.push(kill);
    }
  });
  var ik = 0;
  kills.forEach(function(e) {
    if (e.timestamp == 0) {
      date = "Unable to retrieve event time";
    } else {
      var date = new Date(e.timestamp);
      date = date.getDate()+' '+monthNames[date.getMonth()]+' '+date.getFullYear()+' - '+pad(date.getHours(),2)+':'+pad(date.getMinutes(),2)+':'+pad(date.getSeconds(),2)+':'+pad(date.getMilliseconds(), 3);
    }
    setTimeout(function () {
      //BufferingKills
      gamebuffer[gamebufferindex] = {
      "timestamp" : e.timestamp,
      "victim" : e.victim,
      "killer" : e.killer,
      "weapon" : e.weapon,
      "damage" : e.shielddmg,
      "totaldamage" : e.healthdmg
      };
      gamebufferindex++;
      //DBStuff
      PushKillToDB(e.victim.replace(/\./g,"\uff0e"),e.killer.replace(/\./g,"\uff0e"),e.weapon.replace(' ',''));
      if (e.killer == "Knusperhase" && (e.victim == "Sweetsarah" || e.victim == "redheadgirl_")) {} else {
        if (e.shielddmg == 0) {
          CheckAchievements(e.timestamp,e.victim.replace(/\./g,"\uff0e"),e.killer.replace(/\./g,"\uff0e"),e.weapon,e.healthdmg,e.healthdmg);
        } else {
          CheckAchievements(e.timestamp,e.victim.replace(/\./g,"\uff0e"),e.killer.replace(/\./g,"\uff0e"),e.weapon,e.shielddmg,e.healthdmg);
        }
      }
      if (FindPvPHostPlayers(e.victim)) {} else {
        if (e.victim != "BunkersGrineerTurret" && e.victim != "Map" && e.victim != "BulletJump" && e.victim != "Bullet Jump") {
          PvPHost["Players"].push(e.victim);
          MongoClient.connect(url, opts, function(err, db) {
            if (!err) {
              var collection = db.collection("ServerInfo");
              serverquery = PvPHost;
              serverquery["LastUpdate"] = new Date().getTime();
              collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});
              db.close(function (err, res) {
                if (err) {}
              });
            }
          });
        }
      }
      if (FindPvPHostPlayers(e.killer)) {} else {
        if (e.killer != "BunkersGrineerTurret" && e.killer != "Map" && e.killer != "BulletJump" && e.killer != "Bullet Jump") {
          PvPHost["Players"].push(e.killer);
          MongoClient.connect(url, opts, function(err, db) {
            if (!err) {
              var collection = db.collection("ServerInfo");
              serverquery = PvPHost;
              serverquery["LastUpdate"] = new Date().getTime();
              collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});
              db.close(function (err, res) {
                if (err) {}
              });
            }
          });
        }
      }
    }, ik);
    ik += 1337; //( ͡° ͜ʖ ͡°)
  })
}

function CheckJoins() {
  console.log('Checking for joins...');
  var joins = [];
  bufferj = fs.readFileSync(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer"+ServerName+".log").toString().split("\n");
  bufferj.forEach(function (e) {
    if (e.indexOf('AddPlayerToSession') > -1) {
      join = {timestamp: parseInt(starttime) + parseInt(e.slice(0, e.indexOf('.')+4).replace('.','')), player: e.slice(e.indexOf('AddPlayerToSession(')+19, e.indexOf(',mm='))};
      joins.push(join);
    }
  });
  var ij = 0;
  joins.forEach(function(e) {
    var date = new Date(e.timestamp);
    date = date.getDate()+' '+monthNames[date.getMonth()]+' '+date.getFullYear()+' - '+pad(date.getHours(),2)+':'+pad(date.getMinutes(),2)+':'+pad(date.getSeconds(),2)+':'+pad(date.getMilliseconds(), 3);
    setTimeout(function () {
      if (PvPHost["gameMode"] == "Annihilation" || PvPHost["gameModeId"] == 406014) {
        PvPHost["Players"].push(e.player);
        MongoClient.connect(url, opts, function(err, db) {
          if (!err) {
            var collection = db.collection("ServerInfo");
            serverquery = PvPHost;
            serverquery["LastUpdate"] = new Date().getTime();
            collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});
            db.close(function (err, res) {
              if (err) {}
            });
          }
        });
      }
    }, ij);
    ij += 1337; //( ͡° ͜ʖ ͡°)
  })
}

function CheckTeams() {
  console.log('Checking for team changes...');
  var teams = [];
  buffert = fs.readFileSync(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer"+ServerName+".log").toString().split("\n");
  buffert.forEach(function (e) {
    if (e.indexOf('PvpTeamSelect') > -1) {
      team = {timestamp: parseInt(starttime) + parseInt(e.slice(0, e.indexOf('.')+4).replace('.','')), player: e.slice(e.indexOf('Adding ')+7, e.indexOf(' to team')), team: e.slice(e.length-1,e.length)};
      teams.push(team);
    }
  });
  var it = 0;
  teams.forEach(function(e) {
    var date = new Date(e.timestamp);
    date = date.getDate()+' '+monthNames[date.getMonth()]+' '+date.getFullYear()+' - '+pad(date.getHours(),2)+':'+pad(date.getMinutes(),2)+':'+pad(date.getSeconds(),2)+':'+pad(date.getMilliseconds(), 3);
    setTimeout(function () {
      if (teamstatus[e.player]) {
        if (teamstatus[e.player] != e.team) {
          if (e.team == '0') {
            teamstatus[e.player] = '0';
            PvPHost["Players"].push({"Name":e.player,"Team":"Sun"});
            MongoClient.connect(url, opts, function(err, db) {
              var collection = db.collection("ServerInfo");
              serverquery = PvPHost;
              serverquery["LastUpdate"] = new Date().getTime();
              CleanPvPHostPlayers();
              collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});
              db.close(function (err, res) {
                if (err) {}
              });
            });
          } else if (e.team == '1') {
            teamstatus[e.player] = '1';
            PvPHost["Players"].push({"Name":e.player,"Team":"Moon"});
            MongoClient.connect(url, opts, function(err, db) {
              var collection = db.collection("ServerInfo");
              serverquery = PvPHost;
              serverquery["LastUpdate"] = new Date().getTime();
              CleanPvPHostPlayers();
              collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});
              db.close(function (err, res) {
                if (err) {}
              });
            });
          }
        }
      } else {
        if (e.team == '0') {
          teamstatus[e.player] = '0';
          PvPHost["Players"].push({"Name":e.player,"Team":"Sun"});
          MongoClient.connect(url, opts, function(err, db) {
            var collection = db.collection("ServerInfo");
            serverquery = PvPHost;
            serverquery["LastUpdate"] = new Date().getTime();
            CleanPvPHostPlayers();
            collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});
            db.close(function (err, res) {
              if (err) {}
            });
          });
        } else {
          teamstatus[e.player] = '1';
          PvPHost["Players"].push({"Name":e.player,"Team":"Moon"});
          MongoClient.connect(url, opts, function(err, db) {
            var collection = db.collection("ServerInfo");
            serverquery = PvPHost;
            serverquery["LastUpdate"] = new Date().getTime();
            CleanPvPHostPlayers();
            collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});
            db.close(function (err, res) {
              if (err) {}
            });
          });
        }
      }
    }, it);
    it += 1337; //( ͡° ͜ʖ ͡°)
  })
}

function CleanPvPHostPlayers() {
  Dup = {};
  PvPHost["Players"].forEach(function (e, index) {
    if (Dup[e.Name]) {
      PvPHost["Players"].splice(index,1);
    } else {
      Dup[e.Name] = 1;
    }
  });
}

function FindPvPHostPlayers(player) {
  found = false;
  PvPHost["Players"].forEach(function (e) {
    if (e == player) {
      found = true;
    }
  });
  return found;
}

function CheckDisconnects() {
  console.log('Checking for disconnects...');
  var disconnects = [];
  bufferd = fs.readFileSync(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer"+ServerName+".log").toString().split("\n");
  bufferd.forEach(function (e) {
    if (e.indexOf('Server: Client') > -1 && e.indexOf('disconnected') > -1 ) {
      disconnect = {timestamp: parseInt(starttime) + parseInt(e.slice(0, e.indexOf('.')+4).replace('.','')), player: e.slice(e.indexOf('Client "')+8, e.indexOf('" disconnected'))};
      disconnects.push(disconnect);
    }
  });
  var id = 0;
  disconnects.forEach(function(e) {
    var date = new Date(e.timestamp);
    date = date.getDate()+' '+monthNames[date.getMonth()]+' '+date.getFullYear()+' - '+pad(date.getHours(),2)+':'+pad(date.getMinutes(),2)+':'+pad(date.getSeconds(),2)+':'+pad(date.getMilliseconds(), 3);
    setTimeout(function () {
      if (PvPHost["gameMode"] == "Annihilation" || PvPHost["gameModeId"] == 406014) {
        rem = PvPHost["Players"].indexOf(e.player);
        if (rem > -1) {
          PvPHost["Players"].splice(rem, 1);
        }
        MongoClient.connect(url, opts, function(err, db) {
          var collection = db.collection("ServerInfo");
          serverquery = PvPHost;
          serverquery["LastUpdate"] = new Date().getTime();
          collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});
        });
      } else {
        PvPHost["Players"].forEach(function (el, i) {
          if (el.Name == e.player) {
            PvPHost["Players"].splice(i,1);
          }
        });
        MongoClient.connect(url, opts, function(err, db) {
          var collection = db.collection("ServerInfo");
          serverquery = PvPHost;
          serverquery["LastUpdate"] = new Date().getTime();
          collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});
        });
      }
    }, id);
    id += 1337; //( ͡° ͜ʖ ͡°)
  })
}

function CheckMaps() {
  console.log('Checking for maps changes...');
  var data = [];
  bufferm = fs.readFileSync(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer"+ServerName+".log").toString().split("\n");
  bufferm.forEach(function (e) {
    if (e.indexOf('Loading /Lotus/Levels/PVP/') > -1 && e.indexOf('.level') > -1 ) {
      map = {timestamp: parseInt(starttime) + parseInt(e.slice(0, e.indexOf('.')+4).replace('.','')), map: getMapName(e.slice(e.indexOf('PVP/')+4, e.indexOf('.level')))};
      data.push(map);
    }
  });
  var im = 0;
  data.forEach(function(e) {
    var date = new Date(e.timestamp);
    date = date.getDate()+' '+monthNames[date.getMonth()]+' '+date.getFullYear()+' - '+pad(date.getHours(),2)+':'+pad(date.getMinutes(),2)+':'+pad(date.getSeconds(),2)+':'+pad(date.getMilliseconds(), 3);
    setTimeout(function () {
      //Set new gamebuffer
      if (gamebuffer.length > 0) {
        EndOfGameAchievements();
        games[e.timestamp] = gamebuffer;
        games[e.timestamp].push({"Map":gamemap});
      }
      gamebufferindex = 0;
      gamebuffer = [];
      killingspree = {};
      rev = {};
      gamemap = e.map;
      MongoClient.connect(url, opts, function(err, db) {
        var collection = db.collection("ServerInfo");
        serverquery = PvPHost;
        serverquery["LastUpdate"] = new Date().getTime();
        serverquery["CurrentMap"] = e.map;
        collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});
        db.close(function (err, res) {
          if (err) {}
        });
      });
      fs.writeFile('./games.json', JSON.stringify(games, null, "\t"), 'utf-8');
    }, im);
    im += 1337; //( ͡° ͜ʖ ͡°)
  })
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function cleanArray(actual) {
  var newArray = new Array();
  for (var i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;
}

function get_line(filename, line_no, callback) {
    var stream = fs.createReadStream(filename, {
      flags: 'r',
      encoding: 'utf-8',
      fd: null,
      mode: 0666,
      bufferSize: 64 * 1024
    });

    var fileData = '';
    stream.on('data', function(data){
      fileData += data;

      // The next lines should be improved
      var lines = fileData.replace(/(\r\n|\r|\n)/g, '\n').split("\n");

      if(lines.length >= +line_no){
        stream.destroy();
        callback(null, lines[+line_no]);
      }
    });

    stream.on('error', function(){
      callback('Error', null);
    });

    stream.on('end', function(){
      callback('File end reached without finding line', null);
    });
}

function PushKillToDB(victim, killer, weapon) {
  dbw = "DeathBy"+weapon;
  dbk = "DeathBy"+killer;
  kww = "KillsWith"+weapon;
  kov = "KillOn"+victim;
  MongoClient.connect(url, opts, function(err, db) {
    if (err) {
      setTimeout(function () {
        PushKillToDB(victim, killer, weapon);
      }, 1000);
    } else {
      var collection = db.collection('players');

      vquery = {"Deaths":1};
      vquery[dbw] = 1;
      vquery[dbk] = 1;
      collection.update({ "Name":victim },{ $inc: vquery },{upsert: true});

      kquery = {"Kills":1};
      kquery[kww] = 1;
      kquery[kov] = 1;
      collection.update({ "Name":killer },{ $inc: kquery },{upsert: true});

      db.close(function (err, res) {
        if (err) {}
      });
    }
  });
}

function CheckAchievements(timestamp,victim,killer,weapon,damage,totaldamage) {

  MongoClient.connect(url, opts, function(err, db) {
    var query = {};

    if (!err) {
      //OverkillTrophy
      if (parseInt(totaldamage)-parseInt(damage) > 200) {
        query["hasTrophyOverkill1"] = 1;
      }
      if (parseInt(totaldamage)-parseInt(damage) > 250) {
        query["hasTrophyOverkill2"] = 1;
      }
      if (parseInt(totaldamage)-parseInt(damage) > 300) {
        query["hasTrophyOverkill3"] = 1;
      }

      //SniperHeadshotTrophy
      if (weapon == "Snipetron" && parseInt(totaldamage) > 250) {
        query["hasTrophySniperHS"] = 1;
      }
      if (weapon == "Snipetron Vandal" && parseInt(totaldamage) > 230) {
        query["hasTrophyOverkill3"] = 1;
      }
      if (weapon == "Rubico" && parseInt(totaldamage) > 250) {
        query["hasTrophySniperHS"] = 1;
      }
      if (weapon == "Vectis" && parseInt(totaldamage) > 247) {
        query["hasTrophySniperHS"] = 1;
      }
      if (weapon == "Vectis Prime" && parseInt(totaldamage) > 240) {
        query["hasTrophySniperHS"] = 1;
      }
      if (weapon == "Lanka" && parseInt(totaldamage) > 260) {
        query["hasTrophySniperHS"] = 1;
      }

      //OneshotTrophy
      if (parseInt(totaldamage) > 310) {
        query["hasTrophyOneshot1"] = 1;
        if (!oneshots[killer] || oneshots[killer] == 0) {
          oneshots[killer] = 1;
        } else if (oneshots[killer] == 1) {
          query["hasTrophyOneshot2"] = 1;
          oneshots[killer] = 2;
        } else if (oneshots[killer] >= 2) {
          query["hasTrophyOneshot3"] = 1;
          oneshots[killer] += 1;
        }
      } else {
        if (oneshots[killer]) {
          oneshots[killer] = 0;
        }
      }

      //StaffKillTrophy
      if (victim.indexOf("[DE]") > -1) {
        query["hasTrophyStaffKill"] = 1;
      }

      //RevengeTrophy
      rev[victim] = killer;
      if (rev[killer] == victim) {
        query["hasTrophyRevenge"] = 1;
      }

      //KillingSpreeTrophies
      if (killingspree[victim]) {
        killingspree[victim] = 0;
      }
      if (!killingspree[killer]) {
        killingspree[killer] = 1;
      } else {
        killingspree[killer] += 1;
        if (killingspree[killer] == 5) {
          query["hasTrophyKillingspree1"] = 1;
        }
        if (killingspree[killer] == 10) {
          query["hasTrophyKillingspree2"] = 1;
        }
        if (killingspree[killer] == 15) {
          query["hasTrophyKillingspree3"] = 1;
        }
        if (killingspree[killer] == 20) {
          query["hasTrophyKillingspree4"] = 1;
        }
        if (killingspree[killer] == 25) {
          query["hasTrophyKillingspree5"] = 1;
        }
        if (killingspree[killer] == 30) {
          query["hasTrophyKillingspree6"] = 1;
        }
      }
      if (Object.keys(query).length === 0) {} else {
        db.collection('players').update({ "Name":killer },{ $inc: query },{upsert: true});
      }
    }

    db.close(function (err, res) {
      if (err) {}
    });
  });

}

function EndOfGameAchievements() {

  MongoClient.connect(url, opts, function(err, db) {
    var collection = db.collection('players');

    if (!err) {
      //TotalKillTrophies
      totalkill = {};
      gamebuffer.forEach(function (e) {
        if (!totalkill[e.killer]) {
          totalkill[e.killer] = 1;
        }  else {
          totalkill[e.killer]++;
        }
      });
      Object.keys(totalkill).map(function(objectKey, index) {
        query = {};
        if (PvPHost["gameMode"] == "Annihilation") {
          if (totalkill[objectKey] >= 10) {
            query["hasTrophyTotalKill1"] = 1;
          }
          if (totalkill[objectKey] >= 15) {
            query["hasTrophyTotalKill2"] = 1;
          }
          if (totalkill[objectKey] >= 25) {
            query["hasTrophyTotalKill3"] = 1;
          }
        } else if (PvPHost["gameMode"] == "Team Annihilation") {
          if (totalkill[objectKey] >= 10) {
            query["hasTrophyTDMTotalKill1"] = 1;
          }
          if (totalkill[objectKey] >= 20) {
            query["hasTrophyTDMTotalKill2"] = 1;
          }
          if (totalkill[objectKey] >= 30) {
            query["hasTrophyTDMTotalKill3"] = 1;
          }
          if (totalkill[objectKey] >= 40) {
            query["hasTrophyTDMTotalKill4"] = 1;
          }
          if (totalkill[objectKey] >= 45) {
            query["hasTrophyTDMTotalKill5"] = 1;
          }
          if (totalkill[objectKey] >= 50) {
            query["hasTrophyTDMTotalKill6"] = 1;
          }
        }
        if (Object.keys(query).length === 0) {} else {
          collection.update({ "Name":objectKey },{ $inc: query },{upsert: true});
        }
      });

      //MutualKillTrophies
      gamebuffer.forEach(function (e) {
        if (e.victim == killer || e.killer == victim) {
          if (e.timestamp-timestamp < 500 && e.timestamp-timestamp > -500) {
            db.collection('players').update({ "Name":killer },{ $inc: {"hasTrophyMutualKill1":1} },{upsert: true});
          }
        }
      });

      //FastKillTrophies
      fastkill = {};
      gamebuffer.forEach(function (e) {
        if (!fastkill[e.killer]) {
          fastkill[e.killer] = [];
          fastkill[e.killer].push(e.timestamp);
        } else {
          fastkill[e.killer].push(e.timestamp);
        }
      });
      Object.keys(fastkill).map(function(objectKey, index) {
        query = {};
        for (var i = 0; i < fastkill[objectKey].length; i++) {
          if (fastkill[objectKey][i+1]) {
            if ((fastkill[objectKey][i]-fastkill[objectKey][i+1]) > -5000 && (fastkill[objectKey][i]-fastkill[objectKey][i+1]) < 5000) {
              query["hasTrophyFastKill1"] += 1;
              if (fastkill[objectKey][i+2]) {
                if ((fastkill[objectKey][i+1]-fastkill[objectKey][i+2]) > -5000 && (fastkill[objectKey][i+1]-fastkill[objectKey][i+2]) < 5000) {
                  query["hasTrophyFastKill2"] += 1;
                  if (fastkill[objectKey][i+3]) {
                    if ((fastkill[objectKey][i+2]-fastkill[objectKey][i+3]) > -5000 && (fastkill[objectKey][i+2]-fastkill[objectKey][i+3]) < 5000) {
                      query["hasTrophyFastKill3"] += 1;
                      if (fastkill[objectKey][i+4]) {
                        if ((fastkill[objectKey][i+3]-fastkill[objectKey][i+4]) > -5000 && (fastkill[objectKey][i+3]-fastkill[objectKey][i+4]) < 5000) {
                          query["hasTrophyFastKill4"] += 1;
                          if (fastkill[objectKey][i+5]) {
                            if ((fastkill[objectKey][i+4]-fastkill[objectKey][i+5]) > -5000 && (fastkill[objectKey][i+4]-fastkill[objectKey][i+5]) < 5000) {
                              query["hasTrophyFastKill5"] += 1;
                              if (fastkill[objectKey][i+6]) {
                                if ((fastkill[objectKey][i+5]-fastkill[objectKey][i+6]) > -5000 && (fastkill[objectKey][i+5]-fastkill[objectKey][i+6]) < 5000) {
                                  query["hasTrophyFastKill6"] += 1;
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (Object.keys(query).length === 0) {} else {
          collection.update({ "Name":objectKey },{ $inc: query },{upsert: true});
        }
      });

      //EnemyKDRTrophies
      enemykdr = {};
      gamebuffer.forEach(function (e) {
        if (!enemykdr[e.killer]) {
          enemykdr[e.killer] = {};
          enemykdr[e.killer][e.victim] = 1;
        } else {
          if (enemykdr[e.killer][e.victim]) {
            enemykdr[e.killer][e.victim] += 1;
          } else {
            enemykdr[e.killer][e.victim] = 1;
          }
        }
      });
      Object.keys(enemykdr).map(function(objectKey, index) {
          vkdr1 = [];
          vkdr2 = [];
          vkdr3 = [];
          kdrtk = 0;
          Object.keys(enemykdr[objectKey]).map(function(objv, index) {
            kdrtk += enemykdr[objectKey][objv];
            if (db[objv]["Kills"]) {
              keykdr = (parseInt(db[objv]["Kills"]) / parseInt(db[objv]["Deaths"]));
            } else {
              keykdr = (0.5 / parseInt(db[objv]["Deaths"]));
            }
            for (var i = 0; i < enemykdr[objectKey][objv]; i++) {
              if (keykdr <= 2) {
                vkdr1.push(keykdr);
              } else if (keykdr > 2) {
                vkdr2.push(keykdr);
              } else if (keykdr > 3) {
                vkdr3.push(keykdr);
              }
            }
          });
          if (kdrtk > 10) {
            if (vkdr1.length > vkdr2.length) {
              if (vkdr1.length > vkdr3.length) {
                collection.update({ "Name":objectKey },{ $inc: {"hasTrophyEnemyKDR1":1} },{upsert: true});
              }
            }
            if (vkdr2.length > vkdr1.length) {
              if (vkdr2.length > vkdr3.length) {
                collection.update({ "Name":objectKey },{ $inc: {"hasTrophyEnemyKDR2":1} },{upsert: true});
              }
            }
            if (vkdr3.length > vkdr1.length) {
              if (vkdr3.length > vkdr2.length) {
                collection.update({ "Name":objectKey },{ $inc: {"hasTrophyEnemyKDR3":1} },{upsert: true});
              }
            }
          }
      });

      //RespawnKillTrophies
      respawnk = {};
      gamebuffer.forEach(function (e) {
        if (!respawnk[e.victim]) {
          respawnk[e.victim] = [];
        }
        respawnk[e.victim].push(e.timestamp);
        respawnk[e.victim].push(e.killer);
      });
      Object.keys(respawnk).map(function(objectKey, index) {
        gamebuffer.forEach(function (e) {
          if (respawnk[objectKey] == e.killer && (respawnk[objectKey][0] - e.timestamp) < 8500) {
            collection.update({ "Name":objectKey },{ $inc: {"hasTrophyRespawnKill1":1} },{upsert: true});
            if (respawnk[objectKey][1] == e.victim) {
              collection.update({ "Name":objectKey },{ $inc: {"hasTrophyRespawnKill2":1} },{upsert: true});
            }
          }
        });
      });

      //PunchthroughTrophies
      punchthrough = {};
      gamebuffer.forEach(function (e) {
        if (!punchthrough[e.killer]) {
          punchthrough[e.killer] = [];
          punchthrough[e.killer].push(e.timestamp,e.weapon);
        } else {
          punchthrough[e.killer].push(e.timestamp,e.weapon);
        }
      });
      Object.keys(punchthrough).map(function(objectKey, index) {
        for (var i = 0; i < punchthrough[objectKey].length; i++) {
          if (punchthrough[objectKey][i+2]) {
            if ((punchthrough[objectKey][i]-punchthrough[objectKey][i+2]) > -100 && (punchthrough[objectKey][i]-punchthrough[objectKey][i+2]) < 100 && (punchthrough[objectKey][i+1] == punchthrough[objectKey][i+3])) {
              if (punchthrough[objectKey][i+1] == "Snipetron Vandal" || punchthrough[objectKey][i+1] == "Snipetron" || punchthrough[objectKey][i+1] == "Kohmak" || punchthrough[objectKey][i+1] == "Twin Kohmak" || punchthrough[objectKey][i+1] == "Lanka" || punchthrough[objectKey][i+1] == "Drakgoon" || punchthrough[objectKey][i+1] == "Embolist") {
                collection.update({ "Name":objectKey },{ $inc: {"hasTrophyPunchthrough1":1} },{upsert: true});
                if (punchthrough[objectKey][i+4]) {
                  if ((punchthrough[objectKey][i+2]-punchthrough[objectKey][i+4]) > -100 && (punchthrough[objectKey][i+2]-punchthrough[objectKey][i+4]) < 100 && (punchthrough[objectKey][i+3] == punchthrough[objectKey][i+5])) {
                    if (punchthrough[objectKey][i+3] == "Snipetron Vandal" || punchthrough[objectKey][i+3] == "Snipetron" || punchthrough[objectKey][i+3] == "Kohmak" || punchthrough[objectKey][i+3] == "Twin Kohmak" || punchthrough[objectKey][i+3] == "Lanka" || punchthrough[objectKey][i+3] == "Daikyu" || punchthrough[objectKey][i+3] == "Paris" || punchthrough[objectKey][i+3] == "Paris Prime" || punchthrough[objectKey][i+3] == "Cernos" || punchthrough[objectKey][i+3] == "Rakta Cernos" || punchthrough[objectKey][i+3] == "Dread" || punchthrough[objectKey][i+3] == "Drakgoon" || punchthrough[objectKey][i+3] == "Embolist") {
                      collection.update({ "Name":objectKey },{ $inc: {"hasTrophyPunchthrough2":1} },{upsert: true});
                    }
                  }
                }
              } else if (punchthrough[objectKey][i+1] == "Miter" || punchthrough[objectKey][i+1] == "Penta" || punchthrough[objectKey][i+1] == "Seer" || punchthrough[objectKey][i+1] == "Tonkor" || punchthrough[objectKey][i+1] == "Secura Penta" || punchthrough[objectKey][i+1] == "Zarr" || punchthrough[objectKey][i+1] == "Angstrum" || punchthrough[objectKey][i+1] == "Castanas" || punchthrough[objectKey][i+1] == "Sancti Castanas" || punchthrough[objectKey][i+1] == "Kulstar" || punchthrough[objectKey][i+1] == "Sonicor" || punchthrough[objectKey][i+1] == "Staticor") {
                collection.update({ "Name":objectKey },{ $inc: {"hasTrophyExplosion1":1} },{upsert: true});
                if (punchthrough[objectKey][i+4]) {
                  if ((punchthrough[objectKey][i+2]-punchthrough[objectKey][i+4]) > -100 && (punchthrough[objectKey][i+2]-punchthrough[objectKey][i+4]) < 100 && (punchthrough[objectKey][i+3] == punchthrough[objectKey][i+5])) {
                    if (punchthrough[objectKey][i+3] == "Miter" || punchthrough[objectKey][i+3] == "Penta" || punchthrough[objectKey][i+3] == "Seer" || punchthrough[objectKey][i+3] == "Tonkor" || punchthrough[objectKey][i+3] == "Secura Penta" || punchthrough[objectKey][i+3] == "Zarr" || punchthrough[objectKey][i+3] == "Angstrum" || punchthrough[objectKey][i+3] == "Castanas" || punchthrough[objectKey][i+3] == "Sancti Castanas" || punchthrough[objectKey][i+3] == "Kulstar" || punchthrough[objectKey][i+3] == "Sonicor" || punchthrough[objectKey][i+3] == "Staticor") {
                      collection.update({ "Name":objectKey },{ $inc: {"hasTrophyExplosion2":1} },{upsert: true});
                    }
                  }
                }
              } else if (punchthrough[objectKey][i+1] == "Daikyu" || punchthrough[objectKey][i+1] == "Paris" || punchthrough[objectKey][i+1] == "Paris Prime" || punchthrough[objectKey][i+1] == "Cernos" || punchthrough[objectKey][i+1] == "Rakta Cernos" || punchthrough[objectKey][i+1] == "Dread") {
                collection.update({ "Name":objectKey },{ $inc: {"hasTrophyPunchthrough1":1, "hasTrophyBowSpecial":1} },{upsert: true});
                if (punchthrough[objectKey][i+4]) {
                  if ((punchthrough[objectKey][i+2]-punchthrough[objectKey][i+4]) > -100 && (punchthrough[objectKey][i+2]-punchthrough[objectKey][i+4]) < 100 && (punchthrough[objectKey][i+3] == punchthrough[objectKey][i+5])) {
                    if (punchthrough[objectKey][i+1] == "Daikyu" || punchthrough[objectKey][i+1] == "Paris" || punchthrough[objectKey][i+1] == "Paris Prime" || punchthrough[objectKey][i+1] == "Cernos" || punchthrough[objectKey][i+1] == "Rakta Cernos" || punchthrough[objectKey][i+1] == "Dread") {
                      collection.update({ "Name":objectKey },{ $inc: {"hasTrophyPunchthrough2":1} },{upsert: true});
                    }
                  }
                }
              }
            }
          }
        }
      });

      //WarframeAnyTrophies
      ashkills = {};
      atlaskills = {};
      emberkills = {};
      excaliburkills = {};
      frostkills = {};
      hydroidkills = {};
      miragekills = {};
      rhinokills = {};
      vaubankills = {};
      zephyrkills = {};
      valkyrkills = {};
      trinitykills = {};

      gamebuffer.forEach(function (e) {
        if (e.weapon.indexOf("Ash")>-1) {
          if (!ashkills[e.killer]) {
            ashkills[e.killer] = [];
            ashkills[e.killer].push(e.timestamp);
          } else {
            ashkills[e.killer].push(e.timestamp);
          }
        } else if (e.weapon.indexOf("Atlas")>-1) {
          if (!atlaskills[e.killer]) {
            atlaskills[e.killer] = [];
            atlaskills[e.killer].push(e.timestamp);
          } else {
            atlaskills[e.killer].push(e.timestamp);
          }
        } else if (e.weapon.indexOf("Ember")>-1) {
          if (!emberkills[e.killer]) {
            emberkills[e.killer] = [];
            emberkills[e.killer].push(e.timestamp);
          } else {
            emberkills[e.killer].push(e.timestamp);
          }
        } else if (e.weapon.indexOf("Excalibur")>-1) {
          if (!excaliburkills[e.killer]) {
            excaliburkills[e.killer] = [];
            excaliburkills[e.killer].push(e.timestamp);
          } else {
            excaliburkills[e.killer].push(e.timestamp);
          }
        } else if (e.weapon.indexOf("Frost")>-1) {
          if (!frostkills[e.killer]) {
            frostkills[e.killer] = [];
            frostkills[e.killer].push(e.timestamp);
          } else {
            frostkills[e.killer].push(e.timestamp);
          }
        } else if (e.weapon.indexOf("Hydroid")>-1) {
          if (!hydroidkills[e.killer]) {
            hydroidkills[e.killer] = [];
            hydroidkills[e.killer].push(e.timestamp);
          } else {
            hydroidkills[e.killer].push(e.timestamp);
          }
        } else if (e.weapon.indexOf("Mirage")>-1 && e.totaldamage <48) {
          if (!miragekills[e.killer]) {
            miragekills[e.killer] = [];
            miragekills[e.killer].push(e.timestamp);
          } else {
            miragekills[e.killer].push(e.timestamp);
          }
        } else if (e.weapon.indexOf("Rhino")>-1) {
          if (!rhinokills[e.killer]) {
            rhinokills[e.killer] = [];
            rhinokills[e.killer].push(e.timestamp);
          } else {
            rhinokills[e.killer].push(e.timestamp);
          }
        } else if (true) {
          if (!vaubankills[e.killer]) {
            vaubankills[e.killer] = [];
            vaubankills[e.killer].push(e.timestamp,e.weapon);
          } else {
            vaubankills[e.killer].push(e.timestamp,e.weapon);
          }
        } else if (e.weapon.indexOf("Zephyr")>-1) {
          if (!zephyrkills[e.killer]) {
            zephyrkills[e.killer] = [];
            zephyrkills[e.killer].push(e.timestamp);
          } else {
            zephyrkills[e.killer].push(e.timestamp);
          }
        } else if (e.weapon.indexOf("Valkyr")>-1 && e.totaldamage > 110) {
          if (!valkyrkills[e.killer]) {
            valkyrkills[e.killer] = [];
            valkyrkills[e.killer].push(e.timestamp);
          } else {
            valkyrkills[e.killer].push(e.timestamp);
          }
        } else if (e.weapon.indexOf("Trinity")>-1) {
          if (!trinitykills[e.killer]) {
            trinitykills[e.killer] = [];
            trinitykills[e.killer].push(e.timestamp);
          } else {
            trinitykills[e.killer].push(e.timestamp);
          }
        }
      });

      //Ash
      Object.keys(ashkills).map(function(objectKey, index) {
        for (var i = 0; i < ashkills[objectKey].length; i++) {
          if (ashkills[objectKey][i+1]) {
            if ((ashkills[objectKey][i]-ashkills[objectKey][i+1]) > -3000 && (ashkills[objectKey][i]-ashkills[objectKey][i+1]) < 3000) {
              collection.update({ "Name":objectKey },{ $inc: {"hasTrophyAshkill":1} },{upsert: true});
            }
          }
        }
      });

      //Atlas
      Object.keys(atlaskills).map(function(objectKey, index) {
        for (var i = 0; i < atlaskills[objectKey].length; i++) {
          if (atlaskills[objectKey][i+1]) {
            if ((atlaskills[objectKey][i]-atlaskills[objectKey][i+1]) > -10000 && (atlaskills[objectKey][i]-atlaskills[objectKey][i+1]) < 10000) {
              collection.update({ "Name":objectKey },{ $inc: {"hasTrophyAtlaskill":1} },{upsert: true});
            }
          }
        }
      });

      //Ember
      Object.keys(emberkills).map(function(objectKey, index) {
        for (var i = 0; i < emberkills[objectKey].length; i++) {
          if (emberkills[objectKey][i+1]) {
            if ((emberkills[objectKey][i]-emberkills[objectKey][i+1]) > -10000 && (emberkills[objectKey][i]-emberkills[objectKey][i+1]) < 10000) {
              collection.update({ "Name":objectKey },{ $inc: {"hasTrophyEmberkill":1} },{upsert: true});
            }
          }
        }
      });

      //Excalibur
      Object.keys(excaliburkills).map(function(objectKey, index) {
        for (var i = 0; i < excaliburkills[objectKey].length; i++) {
          if (excaliburkills[objectKey][i+1] && excaliburkills[objectKey][i+2]) {
            if ((excaliburkills[objectKey][i]-excaliburkills[objectKey][i+1]) > -10000 && (excaliburkills[objectKey][i]-excaliburkills[objectKey][i+1]) < 10000 && (excaliburkills[objectKey][i]-excaliburkills[objectKey][i+2]) > -10000 && (excaliburkills[objectKey][i]-excaliburkills[objectKey][i+2]) < 10000) {
              collection.update({ "Name":objectKey },{ $inc: {"hasTrophyExcaliburkill":1} },{upsert: true});
            }
          }
        }
      });

      //Frost
      Object.keys(frostkills).map(function(objectKey, index) {
        for (var i = 0; i < frostkills[objectKey].length; i++) {
          if (frostkills[objectKey][i+1]) {
            if ((frostkills[objectKey][i]-frostkills[objectKey][i+1]) > -500 && (frostkills[objectKey][i]-frostkills[objectKey][i+1]) < 500) {
              collection.update({ "Name":objectKey },{ $inc: {"hasTrophyFrostkill":1} },{upsert: true});
            }
          }
        }
      });

      //Hydroid
      Object.keys(hydroidkills).map(function(objectKey, index) {
        for (var i = 0; i < hydroidkills[objectKey].length; i++) {
          if (hydroidkills[objectKey][i+1]) {
            if ((hydroidkills[objectKey][i]-hydroidkills[objectKey][i+1]) > -1000 && (hydroidkills[objectKey][i]-hydroidkills[objectKey][i+1]) < 1000) {
              collection.update({ "Name":objectKey },{ $inc: {"hasTrophyHydroidkill":1} },{upsert: true});
            }
          }
        }
      });

      //Mirage
      Object.keys(miragekills).map(function(objectKey, index) {
        for (var i = 0; i < miragekills[objectKey].length; i++) {
          if (miragekills[objectKey][i+1] && miragekills[objectKey][i+2]) {
            if ((miragekills[objectKey][i]-miragekills[objectKey][i+1]) > -10000 && (miragekills[objectKey][i]-miragekills[objectKey][i+1]) < 10000 && (miragekills[objectKey][i]-miragekills[objectKey][i+2]) > -10000 && (miragekills[objectKey][i]-miragekills[objectKey][i+2]) < 10000) {
              collection.update({ "Name":objectKey },{ $inc: {"hasTrophyMiragekill":1} },{upsert: true});
            }
          }
        }
      });

      //Rhino
      Object.keys(rhinokills).map(function(objectKey, index) {
        for (var i = 0; i < rhinokills[objectKey].length; i++) {
          if (rhinokills[objectKey][i+1]) {
            if ((rhinokills[objectKey][i]-rhinokills[objectKey][i+1]) > -500 && (rhinokills[objectKey][i]-rhinokills[objectKey][i+1]) < 500) {
              collection.update({ "Name":objectKey },{ $inc: {"hasTrophyRhinokill":1} },{upsert: true});
            }
          }
        }
      });

      //Vauban
      Object.keys(vaubankills).map(function(objectKey, index) {
        for (var i = 0; i < vaubankills[objectKey].length; i++) {
          if (vaubankills[objectKey][i+2]) {
            if (((vaubankills[objectKey][i]-vaubankills[objectKey][i+2]) > -5000 && (vaubankills[objectKey][i]-vaubankills[objectKey][i+2]) < 0 && vaubankills[objectKey][i+3].indexOf("Vauban")>-1) || ((vaubankills[objectKey][i]-vaubankills[objectKey][i+2]) > 0 && (vaubankills[objectKey][i]-vaubankills[objectKey][i+2]) < 5000 && vaubankills[objectKey][i+1].indexOf("Vauban")>-1)) {
              collection.update({ "Name":objectKey },{ $inc: {"hasTrophyVaubankill":1} },{upsert: true});
            }
          }
        }
      });

      //Zephyr
      Object.keys(zephyrkills).map(function(objectKey, index) {
        for (var i = 0; i < zephyrkills[objectKey].length; i++) {
          if (zephyrkills[objectKey][i+1]) {
            if ((zephyrkills[objectKey][i]-zephyrkills[objectKey][i+1]) > -5000 && (zephyrkills[objectKey][i]-zephyrkills[objectKey][i+1]) < 5000) {
              collection.update({ "Name":objectKey },{ $inc: {"hasTrophyZephyrkill":1} },{upsert: true});
            }
          }
        }
      });

      //Valkyr
      Object.keys(valkyrkills).map(function(objectKey, index) {
        for (var i = 0; i < valkyrkills[objectKey].length; i++) {
          if (valkyrkills[objectKey][i+1] && valkyrkills[objectKey][i+2]) {
            if ((valkyrkills[objectKey][i]-valkyrkills[objectKey][i+1]) > -10000 && (valkyrkills[objectKey][i]-valkyrkills[objectKey][i+1]) < 10000 && (valkyrkills[objectKey][i]-valkyrkills[objectKey][i+2]) > -10000 && (valkyrkills[objectKey][i]-valkyrkills[objectKey][i+2]) < 10000) {
              collection.update({ "Name":objectKey },{ $inc: {"hasTrophyValkyrkill":1} },{upsert: true});
            }
          }
        }
      });

      //Trinity
      Object.keys(trinitykills).map(function(objectKey, index) {
        for (var i = 0; i < trinitykills[objectKey].length; i++) {
          if (trinitykills[objectKey][i+1]) {
            if ((trinitykills[objectKey][i]-trinitykills[objectKey][i+1]) > -15000 && (trinitykills[objectKey][i]-trinitykills[objectKey][i+1]) < 15000) {
              collection.update({ "Name":objectKey },{ $inc: {"hasTrophyTrinitykill":1} },{upsert: true});
            }
          }
        }
      });
    }

    db.close(function (err, res) {
      if (err) {}
    });
  });

}

}, 100);
