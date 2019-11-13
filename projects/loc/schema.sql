pragma foreign_keys=ON;  --bugbug does this apply forever to the db or just this session of sqlite???

create table if not exists game (
       gameid integer primary key,   --mastered elsewhere, hence not autonum/serial ???
       gamename varchar(20) not null,
       n int not null,
       m int not null
);

create table if not exists player (
       playerid integer primary key,  --mastered elsewhere???
       uniquename varchar(20) not null
);

create table if not exists playergame (  --can player play game, etc
       playerid integer player,
       gameid integer game references game,
       canPlay varchar(10) not null,
       primary key (playerId,gameid)
);

create table if not exists problem (  --game plus init data
       problemid integer primary key autoincrement,
       gameid integer references game,
       hashid varchar(20) not null,
       prstart integer not null,
       prend integer not null,
       extraproblem varchar(400),
       parentid integer references problem,  --selfref is root indicator
       anstart integer,  --answer start
       anend integer,  --answer end
       anaction varchar(20),
       extraanswer varchar(400),
       UNIQUE(hashid,gameid,prstart,prend)
);

create table if not exists assignment( -- problem plus player
       assignmentid integer primary key autoincrement,
       problemid integer references problem,
       playerid integer references player,
       sentat datetime not null,
       sentip varchar(100) not null,
       resultat datetime,
       resultip varchar(100),
       rstart integer,
       rend integer,
       raction varchar(20),
       extraresult varchar(400),
       unique(playerid,problemid)
);


create table if not exists dd (  -- for all domain data (hopefully)
       dd varchar(20),  --riskfactor, organ, condition, etc   
       token varchar(40), --the official name within the domain (what user both sees and picks in prototype)
       pres varchar(100), --with pretty version, i have no intent to use as the other is readable enough for a "game"
       text varchar(400), --for a help button or something in the rules.  won't be used in prototype
       unique(dd,token)
);
