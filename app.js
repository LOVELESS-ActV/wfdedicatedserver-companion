var fs = require('fs');
var Discord = require('discord.io');
//Change process.env.PATH.slice(0,1)to your Windows disk letter and process.env.USERNAME to your current Windows Account Name if you get any issue !
// The line below isn't the only one to change, use CTRL+H to change all of them!
var filename = process.env.PATH.slice(0,1)+":/Users/"+process.env.USERNAME+"/AppData/Local/Warframe/DedicatedServer.log";
var starttime;
var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
var weapons = require('./weapons.json');
var maps = require('./maps.json');
var bot = new Discord.Client({
    autorun: true,
    //Change the token below before starting the bot !!!
    token: ""
});
//Set the channels ID on which to post the output messages here
var channels = ['846545example6588'];
var db = require('./players.json');
var newkiller = require('./playertemplate.json');
var newvictim = JSON.parse(JSON.stringify(newkiller));

bot.on('ready', function () {
  console.log(bot.username + " - (" + bot.id + ")");
  get_line(process.env.PATH.slice(0,1)+":/Users/"+process.env.USERNAME+"/AppData/Local/Warframe/DedicatedServer.log", 6, function(err, line){
    time = line.slice(32,line.indexOf(' [UTC'));
    starttime = new Date(time).getTime();
  });
  SendToChat("-Livjatan Bot has successfully initiated. Starting loging...");
  fs.open(filename, 'r', function(err, fd) {
    fs.watchFile(filename, function(cstat, pstat) {
      var delta = cstat.size - pstat.size;
      if (delta <= 0) return;
      fs.read(fd, new Buffer(delta), 0, delta, pstat.size, function(err, bytes, buffer) {
        fs.writeFile(process.env.PATH.slice(0,1)+":/Users/"+process.env.USERNAME+"/AppData/Local/Warframe/Buffer.log", buffer.toString(), function(err) {
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

process.on('SIGINT', (code) => {
  SendToChat("-Livjatan Bot is asked to close. Goodbye ! :hand_splayed:");
  fs.stat('foo.txt', function(err, stat) {
    if(err == null) {
      fs.unlinkSync(process.env.PATH.slice(0,1)+":/Users/"+process.env.USERNAME+"/AppData/Local/Warframe/Buffer.log");
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
      fs.unlinkSync(process.env.PATH.slice(0,1)+":/Users/"+process.env.USERNAME+"/AppData/Local/Warframe/Buffer.log");
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
      fs.unlinkSync(process.env.PATH.slice(0,1)+":/Users/"+process.env.USERNAME+"/AppData/Local/Warframe/Buffer.log");
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
      fs.unlinkSync(process.env.PATH.slice(0,1)+":/Users/"+process.env.USERNAME+"/AppData/Local/Warframe/Buffer.log");
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
      fs.unlinkSync(process.env.PATH.slice(0,1)+":/Users/"+process.env.USERNAME+"/AppData/Local/Warframe/Buffer.log");
    } else {}
  });
  setTimeout(function () {
    process.exit();
  }, 200);
});

function getWeaponName(devname) {
  return weapons[devname];
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
  bufferk = fs.readFileSync(process.env.PATH.slice(0,1)+":/Users/"+process.env.USERNAME+"/AppData/Local/Warframe/Buffer.log").toString().split("\n");
  bufferk.forEach(function (e) {
    if (e.indexOf('was killed') > -1 && e.indexOf('using a') > -1) {
      if (e.indexOf('DamageTrigger') > -1) {
        kill = {timestamp: parseInt(starttime) + parseInt(e.slice(0, e.indexOf('.')+4).replace('.','')), victim: e.slice(e.indexOf(': ')+2, e.indexOf(' was')), killer: "Map", weapon: getWeaponName(e.slice(e.indexOf('using a ')+8, e.length-1).replace(" ", "")), dmg: e.slice(e.indexOf('by ')+3, e.indexOf('damage'))};
      } else {
        kill = {timestamp: parseInt(starttime) + parseInt(e.slice(0, e.indexOf('.')+4).replace('.','')), victim: e.slice(e.indexOf(': ')+2, e.indexOf(' was')), killer: e.slice(e.indexOf('from ')+5, e.indexOf(' using')), weapon: getWeaponName(e.slice(e.indexOf('using a ')+8, e.length-1).replace(" ", "")), shielddmg: e.slice(e.indexOf('by ')+3, e.indexOf(' / ')), healthdmg: e.slice(e.indexOf(' / ')+3, e.indexOf(' damage'))};
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
        SendToChat('`['+date+']'+' '+e.victim+' died from map hazard, '+e.weapon+' has dealt '+e.dmg+' upon him/her.`');
      } else {
        SendToChat('`['+date+']'+' '+e.victim+' was killed by '+e.killer+' using '+e.weapon+', dealing '+e.shielddmg+' shield damage and '+e.healthdmg+' health damage.`');
      }
      // PushKillToDB(e.victim,e.killer,e.weapon.replace(' ',''));
    }, ik);
    ik += 1337; //( ͡° ͜ʖ ͡°)
  })
}

function CheckJoins() {
  console.log('Checking for joins...');
  var joins = [];
  bufferj = fs.readFileSync(process.env.PATH.slice(0,1)+":/Users/"+process.env.USERNAME+"/AppData/Local/Warframe/Buffer.log").toString().split("\n");
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
  bufferd = fs.readFileSync(process.env.PATH.slice(0,1)+":/Users/"+process.env.USERNAME+"/AppData/Local/Warframe/Buffer.log").toString().split("\n");
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
  bufferm = fs.readFileSync(process.env.PATH.slice(0,1)+":/Users/"+process.env.USERNAME+"/AppData/Local/Warframe/Buffer.log").toString().split("\n");
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
  var victimIndex = 1;
  var killerIndex = 1;
  db.forEach(function (e) {
    if (victim == e.name) {
      e.deaths += 1;
      dbw = "DeathBy"+weapon;
      e[dbw] += 1;
      dbk = "DeathBy"+killer;
      e[dbk] += 1;
    } else {
      victimIndex ++;
    }
    if (killer == e.name) {
      e.kills += 1;
      kww = "KillsWith"+weapon;
      e[kww] += 1;
      kov = "KillOn"+victim;
      e[kov] += 1;
    } else {
      killerIndex ++;
    }
  });
  if (killerIndex >= db.length) {
    newkiller.name = killer;
    newkiller.kills = 1;
    kww = "KillsWith"+weapon;
    newkiller[kww] = 1;
    kov = "KillOn"+victim;
    newkiller[kov] += 1;
    db.push(newkiller);
  }
  if (victimIndex >= db.length) {
    newvictim.name = victim;
    newvictim.deaths = 1;
    dbw = "DeathBy"+weapon;
    newvictim[dbw] = 1;
    dbk = "DeathBy"+killer;
    newvictim[dbk] += 1;
    db.push(newvictim);
  }
  fs.writeFile('./players.json', JSON.stringify(db, null, "\t"), function(err) {
    if(err) throw (err);
  });
}
