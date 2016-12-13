var fs = require('fs');
var Discord = require('discord.io');
var isConfig = false;
var token = '';
var channels = [];
try {
  token = JSON.parse(fs.readFileSync("./config.ini").toString()).token;
  channels = JSON.parse(fs.readFileSync("./config.ini").toString()).channels;
} catch(ex) {
  if(ex.code == "ENOENT") {
    fs.writeFile('./config.ini', '{"token":"","channels":[""]}');
    console.log("config.ini created. Please fill the info needed in it.");
    fs.writeFile('run.bat', "node app.js \r\npause");
    console.log("run.bat created as well. You can start this tool from it now.");
    setTimeout(function () {
      process.exit();
    }, 100);
  }
}
//Change process.env.PATH.slice(0,1)to your Windows disk letter and process.env.USERNAME to your current Windows Account Name if you get any issue !
// The line below isn't the only one to change, use CTRL+H to change all of them!
var filename = process.env.USERPROFILE+"/AppData/Local/Warframe/DedicatedServer.log";
var starttime;
var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
var weapons = require('./weapons.json');
var maps = require('./maps.json');
var db = require('./players.json');

setTimeout(function () {
  var bot = new Discord.Client({
      autorun: true,
      token: token
  });

  bot.on('ready', function () {
    console.log(bot.username + " - (" + bot.id + ")");

    get_line(process.env.USERPROFILE+"/AppData/Local/Warframe/DedicatedServer.log", 6, function(err, line){
      try {
        time = line.slice(32,line.indexOf(' [UTC'));
        starttime = new Date(time).getTime();
      } catch (e) {
        console.log("Start me after starting the dedicated server !");
        process.exit();
      }
    });
    SendToChat(bot.username+" has successfully initiated. Starting loging...");
    fs.open(filename, 'r', function(err, fd) {
      fs.watchFile(filename, function(cstat, pstat) {
        var delta = cstat.size - pstat.size;
        if (delta <= 0) return;
        fs.read(fd, new Buffer(delta), 0, delta, pstat.size, function(err, bytes, buffer) {
          fs.writeFile(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer.log", buffer.toString(), function(err) {
            if(err) {
            return console.log(err);
            }
          });
        });
        setTimeout(function () {
          CheckKills();
          CheckJoins();
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
          request.vw = query[2];
        }
      } else if (query[1].indexOf("death")>-1) {
        request.victim = query[0];
        if (query[2]) {
          request.kw = query[2];
        }
      }
      request.channel = channelID;
      GetDBInfo(request);
    }
  });

process.on('SIGINT', (code) => {
  SendToChat("-Livjatan Bot is asked to close. Goodbye ! :hand_splayed:");
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
  SendToChat("-Livjatan Bot is asked to close. Goodbye ! :hand_splayed:");
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
  SendToChat("-Livjatan Bot is asked to close. Goodbye ! :hand_splayed:");
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
  SendToChat("-Livjatan Bot is asked to close. Goodbye ! :hand_splayed:");
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
  SendToChat("-Livjatan Bot is asked to close. Goodbye ! :hand_splayed:");
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
    if (objectKey.indexOf(devname) > -1) {
      output = value;
    }
  });
  return output;
}

function getMapName(devname) {
  return maps[devname];
}

function sleep(millis)
{
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
      }
      kills.push(kill);
    }
  });
  var ik = 0;
  kills.forEach(function(e) {
    var date = new Date(e.timestamp);
    date = date.getDate()+' '+monthNames[date.getMonth()]+' '+date.getFullYear()+' - '+pad(date.getHours(),2)+':'+pad(date.getMinutes(),2)+':'+pad(date.getSeconds(),2)+':'+pad(date.getMilliseconds(), 3);
    setTimeout(function () {
      if (e.killer == "Map") {
        SendToChat('`['+date+']'+' '+e.victim+' died from map hazard, '+e.weapon+' has dealt '+e.dmg+' damage upon him/her.`');
      } else {
        SendToChat('`['+date+']'+' '+e.victim+' was killed by '+e.killer+' using '+e.weapon+', dealing '+e.shielddmg+' shield damage and '+e.healthdmg+' health damage.`');
      }
      PushKillToDB(e.victim,e.killer,e.weapon.replace(' ',''));
    }, ik);
    ik += 1337; //( ͡° ͜ʖ ͡°)
  })
}

function CheckJoins() {
  console.log('Checking for joins...');
  var joins = [];
  bufferj = fs.readFileSync(process.env.USERPROFILE+"/AppData/Local/Warframe/Buffer.log").toString().split("\n");
  bufferj.forEach(function (e) {
    if (e.slice(e.length-2,e.length-1) == ")") {
      if (e.indexOf('AddPlayerToSession') > -1) {
        join = {timestamp: parseInt(starttime) + parseInt(e.slice(0, e.indexOf('.')+4).replace('.','')), player: e.slice(e.indexOf('AddPlayerToSession(')+19, e.indexOf(',mm=')), team: e.slice(e.indexOf('teamId=')+7,e.length-2)};
        joins.push(join);
      }
    }
  });
  var ij = 0;
  joins.forEach(function(e) {
    var date = new Date(e.timestamp);
    date = date.getDate()+' '+monthNames[date.getMonth()]+' '+date.getFullYear()+' - '+pad(date.getHours(),2)+':'+pad(date.getMinutes(),2)+':'+pad(date.getSeconds(),2)+':'+pad(date.getMilliseconds(), 3);
    setTimeout(function () {
      if (e.team == '255') {
        SendToChat('`['+date+']'+' '+e.player+' has joined.'+'`');
      } else {
        SendToChat('`['+date+']'+' '+e.player+' has joined on team '+e.team+'.`');
      }
    }, ij);
    ij += 1337; //( ͡° ͜ʖ ͡°)
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
      if (e.map.replace(' ','') == 'FreightLine' || e.map.replace(' ','') == 'Settlement') {
        //3 pictures available
        n = Math.floor(1+(Math.random()*3)).toString();
        UploadToChat("mapsimg/"+e.map.replace(' ','')+n+".png",'`['+date+']'+' Server has switched map to '+e.map+'.`');
      } else if (e.map.replace(' ','') == 'DockingBay' || e.map.replace(' ','') == 'NavigationArray') {
        //2 pictures available
        n = Math.floor(1+(Math.random()*2)).toString();
        UploadToChat("mapsimg/"+e.map.replace(' ','')+n+".png",'`['+date+']'+' Server has switched map to '+e.map+'.`');
      } else {
        //no picture available
        SendToChat('`['+date+']'+' Server has switched map to '+e.map+'.`');
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
      var lines = fileData.split("\n");

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
  if (!db[victim]) {
    db[victim] = {"Name":victim,"Deaths":1};
    if (!db[victim][dbw]) {
      db[victim][dbw] = 1;
    }
    if (!db[victim][dbk]) {
      db[victim][dbk] = 1;
    }
  } else {
    if (!db[victim]["Deaths"]) {
      db[victim]["Deaths"] = 1;
    } else {
      db[victim]["Deaths"] += 1;
    }
    if (!db[victim][dbw]) {
      db[victim][dbw] = 1;
    } else {
      db[victim][dbw] += 1;
    }
    if (!db[victim][dbk]) {
      db[victim][dbk] = 1;
    } else {
      db[victim][dbk] += 1;
    }
  }
  if (!db[killer]) {
    db[killer] = {"Name":killer,"Kills":1};
    if (!db[killer][kww]) {
      db[killer][kww] = 1;
    }
    if (!db[killer][kov]) {
      db[killer][kov] = 1;
    }
  } else {
    if (!db[killer]["Kills"]) {
      db[killer]["Kills"] = 1;
    } else {
      db[killer]["Kills"] += 1;
    }
    if (!db[killer][kww]) {
      db[killer][kww] = 1;
    } else {
      db[killer][kww] += 1;
    }
    if (!db[killer][kov]) {
      db[killer][kov] = 1;
    } else {
      db[killer][kov] += 1;
    }
  }
  fs.writeFile('./players.json', JSON.stringify(db, null, "\t"), 'utf-8');
}

function GetDBInfo(request) {
  if (request.killer) {
    if (!db[request.killer]) {
      message = "I don't have anything about "+request.killer+" in my database. :<";
    } else {
      if (!db[request.killer]["Kills"]) {
        message = "I don't have anything about kills by "+request.killer+" in my database. :<";
      } else {
        if (request.vw) {
          kov = "KillOn"+request.vw;
          if (db[request.killer][kov]) {
            message = request.killer+" have "+db[request.killer][kov]+" kills registered on/with a "+request.vw+". :>";
          } else {
            message = request.killer+" have no kills registered on/with a "+request.vw+". :>";
          }
        } else {
          message = request.killer+" have "+db[request.killer]["Kills"]+" kills registered. :>";
        }
      }
    }
  }
  if (request.victim) {
    if (!db[request.victim]) {
      message = "I don't have anything about "+request.victim+" in my database. :<";
    } else {
      if (!db[request.victim]["Deaths"]) {
        message = "I don't have anything about "+request.killer+"'s deaths in my database. :<";
      } else {
        if (request.kw) {
          kww = "DeathBy"+request.kw;
          if (db[request.victim][kww]) {
            message = request.victim+" have "+db[request.victim][kww]+" deaths registered from "+request.kw+". :>";
          } else {
            message = request.victim+" have no deaths registered from "+request.kw+". :>";
          }
        } else {
          message = request.victim+" have "+db[request.victim]["Deaths"]+" deaths registered. :>";
        }
      }
    }
  }
  bot.sendMessage({
    to: request.channel,
    message: message
  });
}


}, 100);
