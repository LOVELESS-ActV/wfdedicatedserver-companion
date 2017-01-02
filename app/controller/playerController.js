angular.module('DSApp')
  .controller('playerController', function ($scope, $location, playersFactory) {

    var data = playersFactory.getAll();

    var weapsn = {
                  "Ack&Brunt":"Ack&Brunt",
                  "Aklato":"Aklato",
                  "AkSomati":"AkSomati",
                  "AkstilettoPrime":"Akstiletto Prime",
                  "Akstilleto":"Akstilleto",
                  "Akzani":"Akzani",
                  "Amphis":"Amphis",
                  "Amprex":"Amprex",
                  "Angstrum":"Angstrum",
                  "Anku":"Anku",
                  "Ankyros Prime":"Ankyros Prime",
                  "Ash":"Ash",
                  "AshPrime":"Ash Prime",
                  "Atlas":"Atlas",
                  "Atterax":"Atterax",
                  "Attica":"Attica",
                  "Azima":"Azima",
                  "Banshee":"Banshee",
                  "BoarPrime":"Boar Prime",
                  "Boltace":"Boltace",
                  "TelosBoltace":"Telos Boltace",
                  "Boltor":"Boltor",
                  "BoltorPrime":"Boltor Prime",
                  "TelosBoltor":"Telos Boltor",
                  "Mk1-Bo":"Mk1-Bo",
                  "BoPrime":"Bo Prime",
                  "Brakk":"Brakk",
                  "Braton":"Braton",
                  "Mk1-Braton":"Mk1-Braton",
                  "BratonPrime":"Braton Prime",
                  "BrokenSceptre":"Broken Sceptre",
                  "BrokenWar":"Broken War",
                  "Bronco":"Bronco",
                  "Burston":"Burston",
                  "BurstonPrime":"Burston Prime",
                  "Buzlok":"Buzlok",
                  "SanctiCastanas":"Sancti Castanas",
                  "Caustacyst":"Caustacyst",
                  "CeramicDagger":"Ceramic Dagger",
                  "Cerata":"Cerata",
                  "Cernos":"Cernos",
                  "MutalistCernos":"Mutalist Cernos",
                  "CernosPrime":"Cernos Prime",
                  "RaktaCernos":"Rakta Cernos",
                  "Cestra":"Cestra",
                  "ChromaEffigy":"Chroma Effigy",
                  "Daikyu":"Daikyu",
                  "DexDakra":"Dex Dakra",
                  "DakraPrime":"Dakra Prime",
                  "DarkDagger":"Dark Dagger",
                  "RaktaDarkDagger":"Rakta Dark Dagger",
                  "DarkSword":"DarkSword",
                  "DeraVandal":"Dera Vandal",
                  "Despair":"Despair",
                  "Destreza":"Destreza",
                  "MaraDetron":"Mara Detron",
                  "Chroma":"Chroma",
                  "Dread":"Dread",
                  "PrismaDualCleavers":"Prisma Dual Cleavers",
                  "DualEther":"Dual Ether",
                  "DualIchor":"Dual Ichor",
                  "Ember":"Ember",
                  "EmberPrime":"Ember Prime",
                  "Embolist":"Embolist",
                  "Environment":"Environment",
                  "EtherReaper":"EtherReaper",
                  "ExaltedBlade":"Exalted Blade",
                  "Excalibur":"Excalibur",
                  "ExcaliburPrime":"Excalibur Prime",
                  "Fang":"Fang",
                  "FangPrime":"Fang Prime",
                  "FluxRifle":"Flux Rifle",
                  "FrostPrime":"Frost Prime",
                  "Furis":"Furis",
                  "DexFuris":"Dex Furis",
                  "Mk1-Furis":"Mk1-Furis",
                  "Galatine":"Galatine",
                  "Galatine Prime":"Galatine Prime",
                  "Gammacor":"Gammacor",
                  "SynoidGammacor":"Synoid Gammacor",
                  "GazalMachete":"Gazal Machete",
                  "Glaive":"Glaive",
                  "GlaivePrime":"Glaive Prime",
                  "Glaxion":"Glaxion",
                  "Gorgon":"Gorgon",
                  "PrismaGorgon":"Prisma Gorgon",
                  "GorgonWraith":"Gorgon Wraith",
                  "PrismaGrakata":"Prisma Grakata",
                  "Grinlok":"Grinlok",
                  "Halikar":"Halikar",
                  "Hate":"Hate",
                  "HeatSword":"Heat Sword",
                  "Hek":"Hek",
                  "Vaykor Hek":"Vaykor Hek",
                  "Hikou":"Hikou",
                  "HikouPrime":"Hikou Prime",
                  "Grakata":"Grakata",
                  "Hind":"Hind",
                  "Inaros":"Inaros",
                  "Ivara":"Ivara",
                  "JatKittag":"Jat Kittag",
                  "Karak":"Karak",
                  "KarakWraith":"Karak Wraith",
                  "Kesheg":"Kesheg",
                  "Kestrel":"Kestrel",
                  "Kogake":"Kogake",
                  "Kohmak":"Kohmak",
                  "TwinKohmak":"Twin Kohmak",
                  "Kraken":"Kraken",
                  "Kronen":"Kronen",
                  "Kulstar":"Kulstar",
                  "Kunai":"Kunai",
                  "Mk1-Kunai":"Mk1-Kunai",
                  "Lacera":"Lacera",
                  "Lanka":"Lanka",
                  "Lato":"Lato",
                  "Lato Vandal":"Lato Vandal",
                  "Latron":"Latron",
                  "LatronPrime":"Latron Prime",
                  "LatronWraith":"Latron Wraith",
                  "SecuraLecta":"Secura Lecta",
                  "Lex":"Lex",
                  "AkLex":"AkLex",
                  "LexPrime":"Lex Prime",
                  "Limbo":"Limbo",
                  "LokiPrime":"Loki Prime",
                  "Mag":"Mag",
                  "SanctiMagistar":"Sancti Magistar",
                  "Magnus":"Magnus",
                  "MagPrime":"Mag Prime",
                  "VaykorMarelok":"Vaykor Marelok",
                  "Mesa":"Mesa",
                  "Mios":"Mios",
                  "Mirage":"Mirage",
                  "Miter":"Miter",
                  "Nekros":"Nekros",
                  "Nezha":"Nezha",
                  "DragonNikana":"Dragon Nikana",
                  "NikanaPrime":"Nikana Prime",
                  "Nikondi":"Nikondi",
                  "Nova":"Nova",
                  "Nova Prime":"Nova Prime",
                  "Nyx":"Nyx",
                  "NyxPrime":"Nyx Prime",
                  "Oberon":"Oberon",
                  "Obex":"Obex",
                  "Ogris":"Ogris",
                  "Opticor":"Opticor",
                  "Orthos Prime":"Orthos Prime",
                  "Orvius":"Orvius",
                  "Pangolin Sword":"Pangolin Sword",
                  "Panthera":"Panthera",
                  "Paris":"Paris",
                  "Mk1-Paris":"Mk1-Paris",
                  "ParisPrime":"Paris Prime",
                  "Penta":"Penta",
                  "SecuraPenta":"Secura Penta",
                  "Pyrana":"Pyrana",
                  "ReaperPrime":"Reaper Prime",
                  "Rhino":"Rhino",
                  "RhinoPrime":"Rhino Prime",
                  "GrineerTurretRocket":"Grineer Turret Rocket",
                  "TwinRogga":"Twin Rogga",
                  "Rubico":"Rubico",
                  "Saryn":"Saryn",
                  "SarynPrime":"Saryn Prime",
                  "Seer":"Seer",
                  "Sibear":"Sibear",
                  "Sicarus":"Sicarus",
                  "SicarusPrime":"Sicarus Prime",
                  "Silva&Aegis":"Silva&Aegis",
                  "SynoidSimulor":"Synoid Simulor",
                  "Skana":"Skana",
                  "PrismaSkana":"Prisma Skana",
                  "Snipetron":"Snipetron",
                  "SnipetronVandal":"Snipetron Vandal",
                  "Sobek":"Sobek",
                  "Soma":"Soma",
                  "SomaPrime":"Soma Prime",
                  "Spectra":"Spectra",
                  "Spira":"Spira",
                  "Staticor":"Staticor",
                  "Stradavar":"Stradavar",
                  "Strun":"Strun",
                  "Mk1-Strun":"Mk1-Strun",
                  "StrunWraith":"Strun Wraith",
                  "Supra":"Supra",
                  "Sybaris":"Sybaris",
                  "DexSybaris":"Dex Sybaris",
                  "Sydon":"Sydon",
                  "VaykorSydon":"Vaykor Sydon",
                  "Talons":"Talons",
                  "Tekko":"Tekko",
                  "Tetra":"Tetra",
                  "PrismaTetra":"Prisma Tetra",
                  "Tiberon":"Tiberon",
                  "Tigris":"Tigris",
                  "TigrisPrime":"Tigris Prime",
                  "SanctiTigris":"Sancti Tigris",
                  "Tipedo":"Tipedo",
                  "Titania":"Titania",
                  "Tonbo":"Tonbo",
                  "Tonkor":"Tonkor",
                  "Trinity":"Trinity",
                  "TrinityPrime":"Trinity Prime",
                  "TwinGrakatas":"Twin Grakatas",
                  "WraithTwinVipers":"Wraith Twin Vipers",
                  "Valkyr":"Valkyr",
                  "ValkyrPrime":"Valkyr Prime",
                  "AkVasto":"AkVasto",
                  "VastoPrime":"Vasto Prime",
                  "Vasto":"Vasto",
                  "Vauban":"Vauban",
                  "VaubanPrime":"Vauban Prime",
                  "Vectis":"Vectis",
                  "VectisPrime":"Vectis Prime",
                  "VenkaPrime":"Venka Prime",
                  "TwinVipers":"Twin Vipers",
                  "Viper":"Viper",
                  "Volt":"Volt",
                  "VoltPrime":"Volt Prime",
                  "Zarr":"Zarr",
                  "Zenistar":"Zenistar",
                  "Zephyr":"Zephyr",
                  "Zhuge":"Zhuge",
                  "PsychicBolts":"Psychic Bolts",
                  "VoltShield":"Volt Shield",
                  "CorpusCoreLaser":"Corpus Core Laser",
                  "Cronus":"Cronus",
                  "DarkSplitSword-Heavy":"Dark Split Sword - Heavy",
                  "ChromaEffigy":"Chroma Effigy",
                  "DualZoren":"Dual Zoren",
                  "DualCestra":"Dual Cestra",
                  "Boar":"Boar",
                  "Ankyros":"Ankyros",
                  "Marelok":"Marelok",
                  "Twin Basolk":"Twin Basolk",
                  "Harpak":"Harpak",
                  "Atomos":"Atomos",
                  "Nukor":"Nukor",
                  "Synapse":"Synapse",
                  "Scoliac":"Scoliac",
                  "Lesion":"Lesion",
                  "Karyst":"Karyst",
                  "Wukong":"Wukong",
                  "DragonNikana":"Dragon Nikana",
                  "Magistar":"Magistar",
                  "SpiraPrime":"Spira Prime",
                  "ScindoPrime":"Scindo Prime",
                  "SecuraDual Cestra":"Secura Dual Cestra",
                  "Venka":"Venka",
                  "Okina":"Okina",
                  "Akjagara":"Akjagara",
                  "BratonVandal":"Braton Vandal",
                  "MacheteWraith":"Machete Wraith",
                  "Nikana":"Nikana",
                  "DualKamasPrime":"Dual Kamas Prime",
                  "Kama":"Kama",
                  "DualKamas":"Dual Kamas",
                  "War":"War",
                  "SolsticeSpheres":"Solstice Spheres",
                  "SolsticeScythe":"Solstice Scythe",
                  "DualCleaver":"Dual Cleaver",
                  "Javlok":"Javlok",
                  "Hirudo":"Hirudo",
                  "Nidus":"Nidus",
                  "AkMagnus":"AkMagnus",
                  "UnknownWeapon":"Unknown Weapon"
                };

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
        datab.data[objectKey].Name = datab.data[objectKey].Name.replace("\uff0e",".");
        p.push(datab.data[objectKey]);
      });
      $scope.allplayers = p;
      i = $scope.allplayers.filter(function (e) {
        return e.Name == $location.url().slice($location.url().indexOf("/player/")+8,$location.url().length);
      });
      $scope.player = i[0];
      if (i[0].Name == "-Livjatan") {
        $scope.hasAvatar = true;
        $scope.srank = playersFactory.getsrank("-Livjatan");
        $scope.rank = "17";
        $scope.favweaps = [
          {'background': 'url("app/img/weapons/Primaries.png") -1045px -240px','background-size' : '1200% 900%','Name':'Opticor'},
          {'background': 'url("app/img/weapons/Secondaries.png") -285px -80px','background-size' : '1200% 700%','Name':'Bronco'},
          {'background': 'url("app/img/weapons/Melee.png") -95px -80px','background-size' : '1200% 1100%','Name':'Caustacyst'}
        ];
      }
      if (i[0].Name == "Seiguro") {
        $scope.hasAvatar = false;
        $scope.rank = "8";
        // $scope.favweaps = ["Opticor","Bronco"];
      }
      if (i[0].Name == "Toddworld") {
        $scope.hasAvatar = false;
        $scope.rank = "21";
        // $scope.favweaps = ["Opticor","Bronco"];
      }
      if (i[0].Name == "Map") {
        $scope.hasAvatar = false;
        // $scope.rank = "30";
        // $scope.favweaps = ["Opticor","Bronco"];
      }
      if (i[0].Name == "TacticalBusch") {
        $scope.hasAvatar = false;
        $scope.rank = "4";
        // $scope.favweaps = ["Opticor","Bronco"];
      }
      if (i[0].Name == "novaliszero") {
        $scope.hasAvatar = false;
        $scope.rank = "16";
        // $scope.favweaps = ["Opticor","Bronco"];
      }
      if (i[0].Name == "Gabun") {
        $scope.hasAvatar = false;
        $scope.rank = "14";
        // $scope.favweaps = ["Opticor","Bronco"];
      }
      if (i[0].Name == "-Eliminator-one-") {
        $scope.hasAvatar = false;
        $scope.rank = "23";
        // $scope.favweaps = ["Opticor","Bronco"];
      }
      if (i[0].Name == "Amrens") {
        $scope.hasAvatar = false;
        $scope.rank = "20";
        // $scope.favweaps = ["Opticor","Bronco"];
      }
      if (i[0].Name == "K3BLIN") {
        $scope.hasAvatar = false;
        $scope.rank = "22";
        // $scope.favweaps = ["Opticor","Bronco"];
      }
      if (i[0].Name == "binkich") {
        $scope.hasAvatar = false;
        $scope.rank = "5";
        // $scope.favweaps = ["Opticor","Bronco"];
      }
      if (i[0].Name == "Flameghost") {
        $scope.hasAvatar = false;
        $scope.rank = "23";
        // $scope.favweaps = ["Opticor","Bronco"];
      }
      if (i[0].Name == "PibitoBechi") {
        $scope.hasAvatar = false;
        $scope.rank = "15";
        // $scope.favweaps = ["Opticor","Bronco"];
      }
      if (i[0].Name == "Toxiicanna") {
        $scope.hasAvatar = false;
        $scope.rank = "23";
        // $scope.favweaps = ["Opticor","Bronco"];
      }
      if (playersFactory.getsrank(i[0].Name) <= 15) {
        $scope.srank = playersFactory.getsrank(i[0].Name);
      }

      nemesis = 0;
      nemesisname = '';
      despisedweapon = 0;
      despisedweaponname = '';
      weaponofchoice = 0;
      weaponofchoicename = '';
      punchingbag = 0;
      punchingbagname = '';
      Object.keys(i[0]).map(function(objectKey, index) {
        if (objectKey.indexOf("DeathBy") > -1 && weapsn[objectKey.slice(objectKey.indexOf("DeathBy")+7,objectKey.length)] == undefined) {
          if (i[0][objectKey] > nemesis) {
            nemesis = i[0][objectKey];
            nemesisname = objectKey.slice(objectKey.indexOf("DeathBy")+7,objectKey.length);
          } else if (i[0][objectKey] == nemesis) {
            nemesisname += " / "+objectKey.slice(objectKey.indexOf("DeathBy")+7,objectKey.length);
          }
        } else if (objectKey.indexOf("DeathBy") > -1 && weapsn[objectKey.slice(objectKey.indexOf("DeathBy")+7,objectKey.length)] != undefined) {
          if (i[0][objectKey] > despisedweapon) {
            despisedweapon = i[0][objectKey];
            despisedweaponname = weapsn[objectKey.slice(objectKey.indexOf("DeathBy")+7,objectKey.length)];
          } else if (i[0][objectKey] == despisedweapon) {
            despisedweaponname += " / "+weapsn[objectKey.slice(objectKey.indexOf("DeathBy")+7,objectKey.length)];
          }
        } else if (objectKey.indexOf("KillsWith") > -1 && weapsn[objectKey.slice(objectKey.indexOf("KillsWith")+9,objectKey.length)] != undefined) {
          if (i[0][objectKey] > weaponofchoice) {
            weaponofchoice = i[0][objectKey];
            weaponofchoicename = weapsn[objectKey.slice(objectKey.indexOf("KillsWith")+9,objectKey.length)];
          } else if (i[0][objectKey] == weaponofchoice) {
            weaponofchoicename += " / "+weapsn[objectKey.slice(objectKey.indexOf("KillsWith")+9,objectKey.length)];
          }
        } else if (objectKey.indexOf("KillOn") > -1) {
          if (i[0][objectKey] > punchingbag) {
            punchingbag = i[0][objectKey];
            punchingbagname = objectKey.slice(objectKey.indexOf("KillOn")+6,objectKey.length);
          } else if (i[0][objectKey] == punchingbag) {
            punchingbagname += " / "+objectKey.slice(objectKey.indexOf("KillOn")+6,objectKey.length);
          }
        }
      });
      if (nemesisname.indexOf("/") == -1) {
        $scope.nemesism = "is";
      } else {
        $scope.nemesism = "es";
      }
      if (punchingbagname.indexOf("/") == -1) {
        $scope.punchingbagm = "";
      } else {
        $scope.punchingbagm = "s";
      }
      if (weaponofchoicename.indexOf("/") == -1) {
        $scope.weaponofchoicem = "";
      } else {
        $scope.weaponofchoicem = "s";
      }
      if (despisedweaponname.indexOf("/") == -1) {
        $scope.despisedweaponm = "";
      } else {
        $scope.despisedweaponm = "s";
      }
      $scope.nemesis = nemesisname;
      $scope.punchingbag = punchingbagname;
      $scope.weaponofchoice = weaponofchoicename;
      $scope.despisedweapon = despisedweaponname;

      setTimeout(function () {
        $('.plist div').sort(function(a,b){
          if (index == 0) {
              return a.dataset.sid < b.dataset.sid;
          }
          index = 40;
          $('.plist').html("");
        }).appendTo('.nlist');
        $('#Name').remove();
        $('#Kills').remove();
        $('#Deaths').remove();
        $('#KDR').remove();
        $('#hasAva').remove();
        $('#rank').remove();
        $('#_id').remove();
        $('*[id*=hasTro]:visible').each(function() {
            $(this).remove();
        });
        Variety = 0;

        $('*[id*=KillsW]').each(function() {
          Variety += 1;
          $(this).text($(this).text().replace("Kills With ",""));
          $(this).html("<td class='tabLitem'>"+weapsn[$(this).text().slice(0,$(this).text().indexOf(" :"))]+"</td><td class='colonmark'>:</td>"+"<td class='tabRitem'>"+$(this).text().slice($(this).text().indexOf(" :")+3,$(this).text().length)+"</td>");
          $("#TKillWBody").append("<tr>"+$(this).html()+"</tr>");
          sortTable($('#TKillW'));
          $(this).remove();
        });
        $('*[id*=KillO]').each(function() {
          $(this).text($(this).text().replace("Kills On ","").replace("\uff0e","."));
          $(this).html("<td class='tabLitem'>"+$(this).text().slice(0,$(this).text().indexOf(" :"))+"</td><td class='colonmark'>:</td>"+"<td class='tabRitem'>"+$(this).text().slice($(this).text().indexOf(" :")+3,$(this).text().length)+"</td>");
          $("#TKillsOBody").append("<tr>"+$(this).html()+"</tr>");
          sortTable($('#TKillsO'));
          $(this).remove();
        });
        $('*[id*=DeathB]').each(function() {
          if (weapsn[$(this).text().slice(10,$(this).text().indexOf(" :"))] != undefined) {
            $(this).text($(this).text().replace("Deaths By ",""));
            $(this).html("<td class='tabLitem'>"+weapsn[$(this).text().slice(0,$(this).text().indexOf(" :"))]+"</td><td class='colonmark'>:</td>"+"<td class='tabRitem'>"+$(this).text().slice($(this).text().indexOf(" :")+3,$(this).text().length)+"</td>");
            $("#TDeathsWBody").append("<tr>"+$(this).html()+"</tr>");
            sortTable($('#TDeathsW'));
            $(this).remove();
          } else {
            $(this).text($(this).text().replace("Deaths By ","").replace("\uff0e","."));
            $(this).html("<td class='tabLitem'>"+$(this).text().slice(0,$(this).text().indexOf(" :"))+"</td><td class='colonmark'>:</td>"+"<td class='tabRitem'>"+$(this).text().slice($(this).text().indexOf(" :")+3,$(this).text().length)+"</td>");
            $("#TDeathsBBody").append("<tr>"+$(this).html()+"</tr>");
            sortTable($('#TDeathsB'));
            $(this).remove();
          }
        });
        $('#playeraside').css("height",function (index) {
          return "auto";
        });
        $('#playerstats').css("height",function (index) {
          return "auto";
        });
      }, 0);
    });

    index = 0;


    $scope.separator = {'height':'auto','background':'linear-gradient(to bottom, rgba(0,0,0,0) 0%,rgba(255,255,255,0.2) 33%,rgba(255,255,255,0.2) 66%,rgba(0,0,0,0) 100%)','margin-top':'-60px'};

    $scope.FadeMO = function (element) {
      if (element == "srank") {
        if ($('#srankh').css('opacity') == 0) {
          $('#srankh').fadeTo(250, 1);
        }
      }
      if (element == "rank") {
        if ($('#rankh').css('opacity') == 0) {
          $('#rankh').fadeTo(250, 1);
        }
      }
      if (element == "favweaps") {
        if ($('#favweapsh').css('opacity') == 0) {
          $('#favweapsh').fadeTo(250, 1);
        }
      }
    }

    $scope.FadeML = function (element) {
      if (element == "srank") {
        if ($('#srankh').css('opacity') == 1) {
          $('#srankh').fadeTo("slow", 0);
        }
      }
      if (element == "rank") {
        if ($('#rankh').css('opacity') == 1) {
          $('#rankh').fadeTo("slow", 0);
        }
      }
      if (element == "favweaps") {
        if ($('#favweapsh').css('opacity') == 1) {
          $('#favweapsh').fadeTo("slow", 0);
        }
      }
    }

    $scope.fades = function (e) {
      setTimeout(function () {
        if ($(e[1]).css("display") == "inline-block") {
          $(e[1]).fadeOut(300);
          setTimeout(function () {
              $(e[0]).fadeIn(300);
          }, 310);
        } else {
          $(e[0]).fadeOut(300);
          setTimeout(function () {
            $(e[1]).fadeIn(300).css("display","inline-block");
          }, 310);
        }
      }, 300);
    }

    $scope.trophyplaceholder = "Unknown";
    $scope.trophyfastkills = "Fastkills";
    $scope.trophytotalkills = "DMTotalkills";
    $scope.trophyTDMtotalkills = "TDMTotalkills";
    $scope.trophyoverkill = "Overkill";
    $scope.trophyenemyKDR = "EnemyKDR";
    $scope.trophymutual = "Mutual";

    $scope.openItems = function (item) {
      var i, tabcontent, tablinks;

      // Get all elements with class="tabcontent" and hide them
      tabcontent = document.getElementsByClassName("tabcontent");
      for (i = 0; i < tabcontent.length; i++) {
        $('#'+tabcontent[i].id).fadeOut();
      }

      // Get all elements with class="tablinks"
      tablinks = document.getElementsByClassName("tablinks");

      // Show the current tab, remove the class "active" from elements with class="tablinks" then add an "active" class to the link that opened the tab
      setTimeout(function () {
        $('#'+item).fadeIn();
        for (i = 0; i < tablinks.length; i++) {
          $('#'+tablinks[i].id).removeClass("active");
        }
        $('#'+item+"T").addClass("active");
      }, 400);
  }

  function sortTable(table) {
    var tbody = table.find('tbody');

    tbody.find('tr').sort(function(a, b) {
        if (parseInt($('td:last', a).text()) < parseInt($('td:last', b).text())) return 1;
        else if (parseInt($('td:last', a).text()) > parseInt($('td:last', b).text())) return -1;
        else return 0;
        // if (asc) {
        //     return $('td:last', a).text().localeCompare(parseInt($('td:last', b).text()));
        // } else {
        //     return $('td:last', b).text().localeCompare(parseInt($('td:last', a).text()));
        // }
    }).appendTo(tbody);
  }

  });
