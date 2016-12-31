var fs = require('fs');
var Discord = require('discord.io');
var express = require('express'),
    server = express();
var MongoClient = require('mongodb').MongoClient;
var path = require('path');
var isConfig = false;
var token = 'DedicatedServer';
var channels = [];
//Feel free to change this to whatever you wish.
var port = 8080;
var logfile = 'DedicatedServer.log';
var opts = {db: {authSource: 'admin'}};
var url = '';
var urldata = '';
try {
  token = JSON.parse(fs.readFileSync("./config.ini").toString()).token;
  channels = JSON.parse(fs.readFileSync("./config.ini").toString()).channels;
  port = JSON.parse(fs.readFileSync("./config.ini").toString()).port;
  logfile = JSON.parse(fs.readFileSync("./config.ini").toString()).log;
  ServerName = JSON.parse(fs.readFileSync("./config.ini").toString()).ServerName;
  DBuser = JSON.parse(fs.readFileSync("./config.ini").toString()).DBuser;
  DBpwd = JSON.parse(fs.readFileSync("./config.ini").toString()).DBpwd;
  url = "mongodb://"+DBuser+":"+DBpwd+"@livjatanserver.tk:27017/"+DBuser;
  urldata = "mongodb://"+DBuser+":"+DBpwd+"@livjatanserver.tk:27017/data";
} catch(ex) {
  if(ex.code == "ENOENT") {
    fs.writeFile('./config.ini', '{"token":"","channels":[""],"port":8080,"log":"DedicatedServer.log","ServerName":"SomeServer01","DBuser":"AskMeForThat","DBpwd":"Same"}');
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

//If you haven't any token set in config.ini, I'll lend you one that belongs to a public bot
//Ask me if you need to join the server it'll post on.
if (token == '') {
  token = "MjYwNzY2NTY4OTU3MzQ1Nzk1.CzrsBQ.q2xFtOwtyLTGDxTJJoNQcP4SasA";
  channels = ["260804735978831872"];
}

//Change process.env.PATH.slice(0,1)to your Windows disk letter and process.env.USERNAME to your current Windows Account Name if you get any issue !
// The line below isn't the only one to change, use CTRL+H to change all of them!
var filename = process.env.USERPROFILE+"/AppData/Local/Warframe/"+logfile;
var starttime;
var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
var weapons = {};

function PullWeaponsFromDB(callback) {
  MongoClient.connect(urldata, opts, function(err, db) {
    db.collection('weapons').find({}).toArray(function(err, out) {
      return callback(out);
    });
  });
}

PullWeaponsFromDB(function(items) {
  weapons = items[0];
});

var maps = require('./maps.json');
var games = require('./games.json');
var teamstatus = {};
var PvPHost = '';
var PvPSession = {};

setTimeout(function () {
  var bot = new Discord.Client({
      autorun: true,
      token: token
  });

bot.on('ready', function () {
  console.log(bot.username + " - (" + bot.id + ")");

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

  SendToChat(bot.username+" has successfully initiated. Starting loging...");
  server.use('/app', express.static(__dirname + '/app'));
  server.use(express.static(__dirname));
  server.get('/', function(req, res){
    res.sendFile(path.join(__dirname + '/index.html'));
  });
  server.get('/server.json', function(req, res){
    MongoClient.connect(url, opts, function(err, db) {
      db.collection('ServerInfo').find({}).toArray(function(err, out) {
        res.json(out);
      });
    });
  });
  server.get('/players.json', function(req, res){
    MongoClient.connect("mongodb://Tenno:WarframePvP@livjatanserver.tk:27017/", opts, function(err, db) {
      dblist = [];
      var getplayers = function (dbp, callback) {
        dbp.collection('players').find({}).toArray(function(err, out) {
          callback(out);
        });
      }
      db.admin().listDatabases(function(err, dbs) {
        dbs.databases.forEach(function (db) {
          if (db.name != "admin" && db.name != "local" && db.name != "data" && db.name != "Tenno") {
            MongoClient.connect("mongodb://Tenno:WarframePvP@livjatanserver.tk:27017/"+db.name, opts, function(err, dbp) {
              getplayers(dbp, function (inp) {
                MongoClient.connect("mongodb://Tenno:WarframePvP@livjatanserver.tk:27017/Tenno", opts, function(err, dbpl) {
                  for (var i = 0; i < inp.length; i++) {
                    delete inp[i]["_id"];
                    localname = inp[i]["Name"];
                    delete inp[i]["Name"];
                    dbpl.collection('players').update({ "Name":localname },{ $inc: inp[i] },{upsert: true});
                  }
                  getplayers(dbpl, function (out) {
                    dbpl.collection('players').remove();
                    res.json(out);
                  })
                });
              });
            });
          }
        });
      });
    });
  });
  server.listen(port, function (e) {
    console.log('WebServer started. Go to http://localhost:'+port+'/');
  }).on('error', function (e) {
    if (e.code == 'EADDRINUSE') {
      console.log("Port "+port+" already in use...");
      console.log("Change it in config.ini !");
      setTimeout(function () {
      }, 1000);
    }
  });

  console.log(PvPHostName+"_Server is running "+PvPHost["gameMode"]+", in "+PvPHost["region"]+" region, with RC "+PvPHost["RC"]+".");
  console.log("");
  console.log("(If this info is off, you started me before launching your dedicated server.");
  console.log("Please run me again after launching it.)");
  console.log("");

  MongoClient.connect(url, opts, function(err, db) {
    var collection = db.collection("ServerInfo");
    PvPHost["Name"] = ServerName;
    serverquery = PvPHost;
    collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});

    db.close();
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
        fs.writeFile(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer.log", write, function(err) {
          if(err) {
          return console.log(err);
          }
        });
      });
      setTimeout(function () {
        CheckKills();
        CheckJoins();
        if (PvPHost["gameMode"] != "Annihilation") {
          CheckTeams();
        }
        CheckDisconnects();
        CheckMaps();
      }, 100);
    });
  });
});

bot.on('message', function (user, userID, channelID, message, rawEvent) {
    // if ((message[1] == '@' && message[2] == '!' && message[3] == '2' && message[7] == '6' && message[12] == '9') ) {
    //   bot.sendMessage({
    //     to: channelID,
    //     message: response.message
  	// 	});
    // }
    if (message.slice(2,20) == bot.id) {
      query = message.slice(22,message.length).split(" ");
      request = {};
      if (query[1].indexOf("kill")>-1) {
        request.killer = query[0];
        if (query[2]) {
          request.vw = message.slice(message.indexOf(query[2]),message.length);
        }
        request.channel = channelID;
        request.query = "kill";
        GetDBInfo(request);
      } else if (query[1].indexOf("death")>-1) {
        request.victim = query[0];
        if (query[2]) {
          request.kw = message.slice(message.indexOf(query[2]),message.length);
        }
        request.channel = channelID;
        request.query = "death";
        GetDBInfo(request);
      } else if (query[1].indexOf("KDR")>-1) {
        request.kdr = query[0];
        request.channel = channelID;
        request.query = "KDR";
        GetDBInfo(request);
      } else if (message.indexOf("wkill")) {
        request.weapon = message.slice(22,message.indexOf(" wkill"));
        queryw = message.slice(message.indexOf("wkill"),message.length).split(" ");
        if (queryw[1]) {
          request.wv = queryw[1];
        }
        request.channel = channelID;
        request.query = "weapon";
        console.log(request);
        GetDBInfo(request);
      } else {
        bot.sendMessage({
          to: channelID,
          message: 'Sorry, I'+"'"+'m not sure what you mean by "'+message.slice(22,message.length)+'"... :<'
        });
      }
    }
  });

process.on('SIGINT', (code) => {
  SendToChat(bot.username+" is asked to close. Goodbye ! :hand_splayed:");
  fs.stat('foo.txt', function(err, stat) {
    if(err == null) {
      fs.unlinkSync(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer.log");
    } else {}
  });
  setTimeout(function () {
    process.exit();
  }, 200);
});

process.on('exit', (code) => {
  SendToChat(bot.username+" is asked to close. Goodbye ! :hand_splayed:");
  fs.stat('foo.txt', function(err, stat) {
    if(err == null) {
      fs.unlinkSync(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer.log");
    } else {}
  });
  setTimeout(function () {
    process.exit();
  }, 200);
});

process.on('SIGQUIT', (code) => {
  SendToChat(bot.username+" is asked to close. Goodbye ! :hand_splayed:");
  fs.stat('foo.txt', function(err, stat) {
    if(err == null) {
      fs.unlinkSync(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer.log");
    } else {}
  });
  setTimeout(function () {
    process.exit();
  }, 200);
});

process.on('SIGSTOP', (code) => {
  SendToChat(bot.username+" is asked to close. Goodbye ! :hand_splayed:");
  fs.stat('foo.txt', function(err, stat) {
    if(err == null) {
      fs.unlinkSync(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer.log");
    } else {}
  });
  setTimeout(function () {
    process.exit();
  }, 200);
});

process.on('SIGTERM', (code) => {
  SendToChat(bot.username+" is asked to close. Goodbye ! :hand_splayed:");
  fs.stat('foo.txt', function(err, stat) {
    if(err == null) {
      fs.unlinkSync(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer.log");
    } else {}
  });
  setTimeout(function () {
    process.exit();
  }, 200);
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

function CheckKills() {
  console.log('Checking for kills...');
  var kills = [];
  bufferk = fs.readFileSync(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer.log").toString().split("\n");
  bufferk.forEach(function (e) {
    wp = getWeaponName(e.slice(e.indexOf('using a ')+8, e.length-1).replace(" ", ""));
    if (e.indexOf('was killed') > -1 && e.indexOf('using a') > -1) {
      if (e.indexOf('DamageTrigger') > -1) {
        if (wp !== '') {
          kill = {
            timestamp: parseInt(starttime) + parseInt(e.slice(0, e.indexOf('.')+4).replace('.','')),
            victim: e.slice(e.indexOf(': ')+2, e.indexOf(' was')),
            killer: "Map",
            weapon: wp,
            dmg: e.slice(e.indexOf('by ')+3, e.indexOf(' damage'))
          };
        } else {
          e = e+"\n";
          kill = {
            timestamp: parseInt(starttime) + parseInt(e.slice(0, e.indexOf('.')+4).replace('.','')),
            victim: e.slice(e.indexOf(': ')+2, e.indexOf(' was')),
            killer: "Map",
            weapon: "Unknown Weapon",
            dmg: e.slice(e.indexOf('by ')+3, e.indexOf(' damage'))
          };
        }
      } else {
        if (wp !== '') {
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
        if (e.indexOf("/") > -1) {
          kill.shielddmg = e.slice(e.indexOf('by ')+3, e.indexOf(' / '));
          kill.healthdmg = e.slice(e.indexOf(' / ')+3, e.indexOf(' damage'));
        } else {
          kill.shielddmg = "0";
          kill.healthdmg = e.slice(e.indexOf('by ')+3, e.indexOf(' damage'));
        }
        if (!(/^\+?(0|[1-9]\d*)$/.test(e.slice(0, 1)))) {
          kill.timestamp = 0;
          if (e.indexOf(":") > -1) {
            kill.victim = e.slice(e.indexOf(': ')+2, e.indexOf(' was'));
          } else {
            kill.victim = "Unknown";
          }
        }
      }
      if (kill.killer == "a level 20 TURRET") {
        kill.killer = "BunkersGrineerTurret";
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
      if (e.killer == "Map") {
        SendToChat('`['+date+']'+' '+e.victim+' died from map hazard, '+e.weapon+' has dealt '+e.dmg+' damage upon him/her.`');
      } else if (e.shielddmg == "0") {
        SendToChat('`['+date+']'+' '+e.victim+' was killed by '+e.killer+' using '+e.weapon+', dealing '+e.healthdmg+' damage.`');
      } else {
        SendToChat('`['+date+']'+' '+e.victim+' was killed by '+e.killer+' using '+e.weapon+', dealing '+e.shielddmg+' damage out of '+e.healthdmg+' potential damage.`');
      }
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
      PushKillToDB(e.victim.replace(".","\uff0e"),e.killer.replace(".","\uff0e"),e.weapon.replace(' ',''));
      CheckAchievements(e.timestamp,e.victim.replace(".","\uff0e"),e.killer.replace(".","\uff0e"),e.weapon,e.shielddmg,e.healthdmg);
    }, ik);
    ik += 1337; //( ͡° ͜ʖ ͡°)
  })
}

function CheckJoins() {
  console.log('Checking for joins...');
  var joins = [];
  bufferj = fs.readFileSync(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer.log").toString().split("\n");
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
      if (PvPHost["gameMode"] == "Annihilation") {
        PvPHost["Players"].push(e.player);
        MongoClient.connect(url, opts, function(err, db) {
          var collection = db.collection("ServerInfo");
          serverquery = PvPHost;
          collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});
        });
      }
      SendToChat('`['+date+']'+' '+e.player+' has joined.'+'`');
    }, ij);
    ij += 1337; //( ͡° ͜ʖ ͡°)
  })
}

function CheckTeams() {
  console.log('Checking for team changes...');
  var teams = [];
  buffert = fs.readFileSync(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer.log").toString().split("\n");
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
              collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});
            });
            SendToChat('`['+date+']'+' '+e.player+' is now on team Sun.`');
          } else if (e.team == '1') {
            teamstatus[e.player] = '1';
            PvPHost["Players"].push({"Name":e.player,"Team":"Moon"});
            MongoClient.connect(url, opts, function(err, db) {
              var collection = db.collection("ServerInfo");
              serverquery = PvPHost;
              collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});
            });
            SendToChat('`['+date+']'+' '+e.player+' is now on team Moon.`');
          }
        }
      } else {
        if (e.team == '0') {
          teamstatus[e.player] = '0';
          PvPHost["Players"].push({"Name":e.player,"Team":"Sun"});
          MongoClient.connect(url, opts, function(err, db) {
            var collection = db.collection("ServerInfo");
            serverquery = PvPHost;
            collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});
          });
          SendToChat('`['+date+']'+' '+e.player+' is now on team Sun.`');
        } else {
          teamstatus[e.player] = '1';
          PvPHost["Players"].push({"Name":e.player,"Team":"Moon"});
          MongoClient.connect(url, opts, function(err, db) {
            var collection = db.collection("ServerInfo");
            serverquery = PvPHost;
            collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});
          });
          SendToChat('`['+date+']'+' '+e.player+' is now on team Moon.`');
        }
      }
    }, it);
    it += 1337; //( ͡° ͜ʖ ͡°)
  })
}

function CheckDisconnects() {
  console.log('Checking for disconnects...');
  var disconnects = [];
  bufferd = fs.readFileSync(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer.log").toString().split("\n");
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
      if (PvPHost["gameMode"] == "Annihilation") {
        rem = PvPHost["Players"].indexOf(e.player);
        if (rem > -1) {
          PvPHost["Players"].splice(rem, 1);
        }
        MongoClient.connect(url, opts, function(err, db) {
          var collection = db.collection("ServerInfo");
          serverquery = PvPHost;
          collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});
        });
      } else if (PvPHost["gameMode"] == "Team Annihilation") {
        delete PvPHost["Players"][e.player];
        MongoClient.connect(url, opts, function(err, db) {
          var collection = db.collection("ServerInfo");
          serverquery = PvPHost;
          collection.update({ "Name":ServerName },{ $set: serverquery },{upsert: true});
        });
      }
      SendToChat('`['+date+']'+' '+e.player+' has disconnected.`');
    }, id);
    id += 1337; //( ͡° ͜ʖ ͡°)
  })
}

function CheckMaps() {
  console.log('Checking for maps changes...');
  var data = [];
  bufferm = fs.readFileSync(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer.log").toString().split("\n");
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
      if (e.map.replace(' ','') == 'Outpost' || e.map.replace(' ','') == 'Bunkers' || e.map.replace(' ','') == 'Shipyards') {
        SendToChat('`['+date+']'+' Server has switched map to '+e.map+'.`');
      } else {
        if (e.map.replace(' ','') == 'FreightLine' || e.map.replace(' ','') == 'CephalonSpires' || e.map.replace(' ','') == 'DockingBay') {
          //4 pictures available
          n = Math.floor(1+(Math.random()*4)).toString();
        } else if (e.map.replace(' ','') == 'ForgottenHalls') {
          //5 pictures available
          n = Math.floor(1+(Math.random()*5)).toString();
        } else if (e.map.replace(' ','') == 'NavigationArray' || e.map.replace(' ','') == 'Settlement') {
          //6 pictures available
          n = Math.floor(1+(Math.random()*6)).toString();
        } else if (e.map.replace(' ','') == 'Core' || e.map.replace(' ','') == 'InfestedFrigate') {
          //8 pictures available
          n = Math.floor(1+(Math.random()*8)).toString();
        } else if (e.map.replace(' ','') == 'LunaRuins') {
          //9 pictures available
          n = Math.floor(1+(Math.random()*9)).toString();
        }
        for (var prop in teamstatus) delete teamstatus[prop];
        //Set new gamebuffer
        EndOfGameAchievements();
        if (gamebuffer.length > 0) {
          games[e.timestamp] = gamebuffer;
          games[e.timestamp].push({"Map":gamemap});
        }
        gamebufferindex = 0;
        gamebuffer = [];
        killingspree = {};
        rev = {};
        gamemap = e.map;
        fs.writeFile('./games.json', JSON.stringify(games, null, "\t"), 'utf-8');
        UploadToChat("data/maps/"+e.map.replace(' ','')+"/"+n+".png",'`['+date+']'+' Server has switched map to '+e.map+'.`');
      }
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

function typeOf (obj) {
  return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
}

function Get(data) {
  return data;
}

function SendToChat(data) {
  channels.forEach(function (e) {
    bot.sendMessage({
      to: e,
      message: data
    });
  })
}

function UploadToChat(path, data) {
  channels.forEach(function (e) {
    bot.uploadFile({
      to: e,
      file: path,
      message: data
    }, function(response) {});
  })
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
    var collection = db.collection('players');

    vquery = {"Deaths":1};
    vquery[dbw] = 1;
    vquery[dbk] = 1;
    collection.update({ "Name":victim },{ $inc: vquery },{upsert: true});

    kquery = {"Kills":1};
    kquery[kww] = 1;
    kquery[kov] = 1;
    collection.update({ "Name":killer },{ $inc: kquery },{upsert: true});

    db.close();
  });
}

function CheckAchievements(timestamp,victim,killer,weapon,damage,totaldamage) {

  MongoClient.connect(url, opts, function(err, db) {
    var collection = db.collection('players');

  //OverkillTrophy
  if (parseInt(totaldamage)-parseInt(damage) > 200) {
    collection.update({ "Name":killer },{ $inc: {"hasTrophyOverkill1":1} },{upsert: true});
  }
  if (parseInt(totaldamage)-parseInt(damage) > 250) {
    collection.update({ "Name":killer },{ $inc: {"hasTrophyOverkill2":1} },{upsert: true});
  }
  if (parseInt(totaldamage)-parseInt(damage) > 300) {
    collection.update({ "Name":killer },{ $inc: {"hasTrophyOverkill3":1} },{upsert: true});
  }

  //SniperHeadshotTrophy
  if (weapon == "Snipetron" && parseInt(totaldamage) > 250) {
    collection.update({ "Name":killer },{ $inc: {"hasTrophySniperHS":1} },{upsert: true});
  }
  if (weapon == "Snipetron Vandal" && parseInt(totaldamage) > 230) {
    collection.update({ "Name":killer },{ $inc: {"hasTrophyOverkill3":1} },{upsert: true});
      if (!db[killer]["hasTrophySniperHS"]) {
        db[killer]["hasTrophySniperHS"] = 0;
      }
      db[killer]["hasTrophySniperHS"] += 1;
  }
  if (weapon == "Rubico" && parseInt(totaldamage) > 250) {
    collection.update({ "Name":killer },{ $inc: {"hasTrophySniperHS":1} },{upsert: true});
  }
  if (weapon == "Vectis" && parseInt(totaldamage) > 247) {
    collection.update({ "Name":killer },{ $inc: {"hasTrophySniperHS":1} },{upsert: true});
  }
  if (weapon == "Vectis Prime" && parseInt(totaldamage) > 240) {
    collection.update({ "Name":killer },{ $inc: {"hasTrophySniperHS":1} },{upsert: true});
  }
  if (weapon == "Lanka" && parseInt(totaldamage) > 260) {
    collection.update({ "Name":killer },{ $inc: {"hasTrophySniperHS":1} },{upsert: true});
  }

  //OneshotTrophy
  if (parseInt(totaldamage) > 310) {
    collection.update({ "Name":killer },{ $inc: {"hasTrophyOneshot1":1} },{upsert: true});
    if (!oneshots[killer] || oneshots[killer] == 0) {
      oneshots[killer] = 1;
    } else if (oneshots[killer] == 1) {
      collection.update({ "Name":killer },{ $inc: {"hasTrophyOneshot2":1} },{upsert: true});
      oneshots[killer] = 2;
    } else if (oneshots[killer] >= 2) {
      collection.update({ "Name":killer },{ $inc: {"hasTrophyOneshot3":1} },{upsert: true});
      oneshots[killer] += 1;
    }
  } else {
    if (oneshots[killer]) {
      oneshots[killer] = 0;
    }
  }

  //StaffKillTrophy
  if (victim.indexOf("[DE]") > -1) {
    collection.update({ "Name":killer },{ $inc: {"hasTrophyStaffKill":1} },{upsert: true});
  }

  //MutualKillTrophies
  gamebuffer.forEach(function (e) {
    if (e.victim == killer || e.killer == victim) {
      if (e.timestamp-timestamp < 500 && e.timestamp-timestamp > -500) {
        collection.update({ "Name":killer },{ $inc: {"hasTrophyMutualKill1":1} },{upsert: true});
      }
    }
  });

  //RevengeTrophy
  rev[victim] = killer;
  if (rev[killer] == victim) {
    collection.update({ "Name":killer },{ $inc: {"hasTrophyRevenge":1} },{upsert: true});
  }

  //KillingSpreeTrophies
  killingspreemka = {};
  gamebuffer.forEach(function (e) {
    if (!killingspreemka[e.killer]) {
      killingspreemka[e.killer] = 1;
    } else {
      killingspreemka[e.killer] += 1;
    }
  });
  killingspreemk = Object.keys(killingspreemka).reduce(function(a, b){ return killingspreemka[a] > killingspreemka[b] ? a : b });
  if (killingspree[victim]) {
    killingspree[victim] = 0;
  }
  if (!killingspree[killer]) {
    killingspree[killer] = 1;
  } else {
    killingspree[killer] += 1;
    if (killingspree[killer] >= 5) {
      collection.update({ "Name":killer },{ $inc: {"hasTrophyKillingspree1":1} },{upsert: true});
    }
    if (killingspree[killer] >= 10) {
      collection.update({ "Name":killer },{ $inc: {"hasTrophyKillingspree2":1} },{upsert: true});
    }
    if (killingspree[killer] >= 15) {
      collection.update({ "Name":killer },{ $inc: {"hasTrophyKillingspree3":1} },{upsert: true});
    }
    if (killingspree[killer] >= 20) {
      collection.update({ "Name":killer },{ $inc: {"hasTrophyKillingspree4":1} },{upsert: true});
    }
    if (killingspree[killer] >= 25) {
      collection.update({ "Name":killer },{ $inc: {"hasTrophyKillingspree5":1} },{upsert: true});
    }
    if (killingspree[killer] >= 30) {
      collection.update({ "Name":killer },{ $inc: {"hasTrophyKillingspree6":1} },{upsert: true});
    }
  }

  db.close();
});

}

function EndOfGameAchievements() {

  MongoClient.connect(url, opts, function(err, db) {
    var collection = db.collection('players');

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
    if (PvPHost["gameMode"] == "Annihilation") {
      if (totalkill[objectKey] >= 10) {
        collection.update({ "Name":objectKey },{ $inc: {"hasTrophyTotalKill1":1} },{upsert: true});
      }
      if (totalkill[objectKey] >= 15) {
        collection.update({ "Name":objectKey },{ $inc: {"hasTrophyTotalKill2":1} },{upsert: true});
      }
      if (totalkill[objectKey] >= 25) {
        collection.update({ "Name":objectKey },{ $inc: {"hasTrophyTotalKill3":1} },{upsert: true});
      }
    } else if (PvPHost["gameMode"] == "Team Annihilation") {
      if (totalkill[objectKey] >= 10) {
        collection.update({ "Name":objectKey },{ $inc: {"hasTrophyTDMTotalKill1":1} },{upsert: true});
      }
      if (totalkill[objectKey] >= 20) {
        collection.update({ "Name":objectKey },{ $inc: {"hasTrophyTDMTotalKill2":1} },{upsert: true});
      }
      if (totalkill[objectKey] >= 30) {
        collection.update({ "Name":objectKey },{ $inc: {"hasTrophyTDMTotalKill3":1} },{upsert: true});
      }
      if (totalkill[objectKey] >= 40) {
        collection.update({ "Name":objectKey },{ $inc: {"hasTrophyTDMTotalKill4":1} },{upsert: true});
      }
      if (totalkill[objectKey] >= 45) {
        collection.update({ "Name":objectKey },{ $inc: {"hasTrophyTDMTotalKill5":1} },{upsert: true});
      }
      if (totalkill[objectKey] >= 50) {
        collection.update({ "Name":objectKey },{ $inc: {"hasTrophyTDMTotalKill6":1} },{upsert: true});
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
    for (var i = 0; i < fastkill[objectKey].length; i++) {
      if (fastkill[objectKey][i+1]) {
        if ((fastkill[objectKey][i]-fastkill[objectKey][i+1]) > -5000 && (fastkill[objectKey][i]-fastkill[objectKey][i+1]) < 5000) {
          collection.update({ "Name":objectKey },{ $inc: {"hasTrophyFastKill1":1} },{upsert: true});
          if (fastkill[objectKey][i+2]) {
            if ((fastkill[objectKey][i+1]-fastkill[objectKey][i+2]) > -5000 && (fastkill[objectKey][i+1]-fastkill[objectKey][i+2]) < 5000) {
              collection.update({ "Name":objectKey },{ $inc: {"hasTrophyFastKill2":1} },{upsert: true});
              if (fastkill[objectKey][i+3]) {
                if ((fastkill[objectKey][i+2]-fastkill[objectKey][i+3]) > -5000 && (fastkill[objectKey][i+2]-fastkill[objectKey][i+3]) < 5000) {
                  collection.update({ "Name":objectKey },{ $inc: {"hasTrophyFastKill3":1} },{upsert: true});
                  if (fastkill[objectKey][i+4]) {
                    if ((fastkill[objectKey][i+3]-fastkill[objectKey][i+4]) > -5000 && (fastkill[objectKey][i+3]-fastkill[objectKey][i+4]) < 5000) {
                      collection.update({ "Name":objectKey },{ $inc: {"hasTrophyFastKill4":1} },{upsert: true});
                      if (fastkill[objectKey][i+5]) {
                        if ((fastkill[objectKey][i+4]-fastkill[objectKey][i+5]) > -5000 && (fastkill[objectKey][i+4]-fastkill[objectKey][i+5]) < 5000) {
                          collection.update({ "Name":objectKey },{ $inc: {"hasTrophyFastKill5":1} },{upsert: true});
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
        console.log(kdrtk);
        if (db[objv]["Kills"]) {
          keykdr = (parseInt(db[objv]["Kills"]) / parseInt(db[objv]["Deaths"]));
        } else {
          keykdr = (0.5 / parseInt(db[objv]["Deaths"]));
        }
        for (var i = 0; i < enemykdr[objectKey][objv]; i++) {
          console.log(objv+" has been killed "+enemykdr[objectKey][objv]+"times.");
          if (keykdr <= 2) {
            vkdr1.push(keykdr);
          } else if (keykdr > 2) {
            vkdr2.push(keykdr);
          } else if (keykdr > 3) {
            vkdr3.push(keykdr);
          }
        }
      });
      console.log(vkdr1);
      console.log(vkdr2);
      console.log(vkdr3);
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

  db.close();
});

}

function GetDBInfo(request) {
  MongoClient.connect(url, opts, function(err, db) {
    db.collection('players_'+ServerName).find({}).toArray(function(err, docs) {
      message = '';
      if (request.query == "kill") {
        docs.forEach(function (e) {
          if (e.Name == request.killer) {
            if (e.Kills > 0) {
              if (request.vw) {
                kov = "KillOn"+request.vw;
                kww = "KillsWith"+request.vw.replace(" ","");
                if (e.kov > 0) {
                  message = request.killer+" have "+e.kov+" kills registered on "+request.vw+". :>";
                } else {
                  if (e.kww > 0) {
                    message = request.killer+" have "+e.kww+" kills registered with "+request.vw+". :>";
                  } else {
                    message = request.killer+" have no kills registered on/with "+request.vw+". :>";
                  }
                }
              } else {
                message = request.killer+" have "+e.Kills+" kills registered. :>";
              }
            } else {
              message = "I don't have anything about kills by "+request.killer+" in my database. :<";
            }
          }
        });
        if (message == '') {
          message = "I don't have anything about "+request.killer+" in my database. :<";
        }
      }

      if (request.query == "death") {
        docs.forEach(function (e) {
          if (e.Name == request.victim) {
            if (e.Deaths > 0) {
              if (request.kw) {
                kww = "DeathBy"+request.kw.replace(" ","");
                if (e.kww > 0) {
                  message = request.victim+" have "+e.kww+" deaths registered from "+request.kw+". :>";
                } else {
                  message = request.victim+" have no deaths registered from "+request.kw+". :>";
                }
              } else {
                message = request.victim+" have "+e.Deaths+" deaths registered. :>";
              }
            } else {
              message = "I don't have anything about "+request.killer+"'s deaths in my database. :<";
            }
          }
        });
        if (message == '') {
          message = "I don't have anything about "+request.victim+" in my database. :<";
        }
      }

      if (request.query == "KDR") {
        docs.forEach(function (e) {
          if (e.Name == request.victim) {
            if (e.Deaths > 0 && e.Kills >= 0) {
              message = request.kdr+" have a "+(e.Kills/e.Deaths)+" Kill/Death Rate. :>";
            } else if(e.Deaths > 0 && e.Kills == undefined) {
              message = request.kdr+" have a "+(0.5/e.Deaths)+" Kill/Death Rate. :>";
            }
          }
        });
        if (message == '') {
          message = "I don't have anything about "+request.kdr+" in my database. :<";
        }
      }

      if (request.query == "weapon") {
        docs.forEach(function (e) {
          kww = "KillsWith"+request.weapon.replace(" ","");
          dbw = "DeathBy"+request.weapon.replace(" ","");
          totalkills = 0;
          if (e.dbw > 0) {
            totalkills += e.dbw;
          }

          if (totalkills == 0) {
            message = "I don't have anything about kills with "+request.weapon+" in my database. :<";
          } else {
            if (request.wv) {
              if (e.Name == request.wv && e.dbw > 0) {
                message = request.weapon+" have "+e.dbw+" kills registered on "+request.wv+". :>";
              } else {
                message = "I don't have anything about kills with "+request.weapon+" on "+request.wv+" in my database. :<";
              }
            } else {
              message = request.weapon+" have "+totalkills+" kills registered. :>";
            }
          }
        });
        if (message == '') {
          message = "I don't have anything about "+request.kdr+" in my database. :<";
        }
      }

      bot.sendMessage({
        to: request.channel,
        message: message
      });
    });
  });

}

}, 100);
