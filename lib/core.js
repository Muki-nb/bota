"use strict";
const path = require("path");
const fs = require("fs");
const querystring = require("querystring");
const url = require("url");
const crypto = require("crypto");
const oicq = require("oicq");
const http = require("http");
const https = require("https");
const WebSocket = require("ws");
const api = require("./api");
const global_config = require("../config");
const ra = require("./getrandom");
const diy = require("./diybot");
const Sauls = require("./Sauls");
const default_config = {
    host:     "0.0.0.0",
    port:     5700,
    use_http: false,
    use_ws:   false,

    platform: 2,
    kickoff: false,
    ignore_self: true,

    access_token: "",
    secret: "",
    post_timeout: 30,
    post_message_format: "string",
    enable_heartbeat: false,
    heartbeat_interval: 15000,
    post_url: [],
    ws_reverse_url: [],
    ws_reverse_reconnect_interval: 3000,
}
const config = {};
let bot, account, dir, server, wss, online = false, websockets = new Set();

function startup(arg) {
	Sauls.STARTSETTING();
    account = arg;
    if (!global_config[account]) {
        console.log("未找到该账号的配置，请确认配置文件。");
        process.exit();
    }
    dir = path.join(process.mainModule.path, "data", account.toString());
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, {recursive: true, mode: 0o755});
    Object.assign(config, default_config, global_config[account]);
    if (global_config.debug)
        config.log_level = "debug";
    config.device_path = dir;
    if (config.enable_heartbeat && (config.use_ws || config.ws_reverse_url.length)) {
        setInterval(()=>{
            const json = JSON.stringify({
                self_id: account,
                time: parseInt(Date.now()/1000),
                post_type: "meta_event",
                meta_event_type: "heartbeat",
                interval: config.heartbeat_interval,
            })
            websockets.forEach((ws)=>{
                ws.send(json);
            });
            if (wss) {
                wss.clients.forEach((ws)=>{
                    ws.send(json);
                });
            }
        }, config.heartbeat_interval);
    }
    createBot();
    createServer();
    createReverseWS();
}

function inputPassword() {
    console.log("请输入密码：");
    process.stdin.once("data", (input)=>{
        input = input.toString().trim();
        const password = crypto.createHash("md5").update(input).digest();
        fs.writeFileSync(path.join(dir, "password"), password);
        bot.login(password);
    })
}

function createBot() {
    bot = oicq.createClient(account, config);
    api.setBot(bot);
    bot.on("system.login.captcha", (data)=>{
        const filepath = path.join(dir, `captcha.jpg`);
        fs.writeFileSync(filepath, data.image);
        bot.logger.info(`验证码已更新并保存到文件(${filepath})，请查看并输入: `);
        process.stdin.once("data", (input)=>{
            bot.captchaLogin(input);
        });
    });
    bot.on("system.login.device", (data)=>{
        process.stdin.once("data", bot.login.bind(bot));
    });
    bot.on("system.login.error", (data)=>{
        if (data.message.includes("密码错误"))
            inputPassword();
        else
            bot.terminate();
    });

    bot.on("system.online", ()=>{
        online = true;
        dipatch({
            self_id: account,
            time: parseInt(Date.now()/1000),
            post_type: "meta_event",
            meta_event_type: "lifecycle",
            sub_type: "enable",
        });
    });
    bot.on("system.offline", (data)=>{
        online = false;
        dipatch({
            self_id: account,
            time: parseInt(Date.now()/1000),
            post_type: "meta_event",
            meta_event_type: "lifecycle",
            sub_type: "disable",
        });
        if (data.sub_type === "network") {
            bot.logger.warn("网络断开，3秒后尝试重新连接。");
            setTimeout(createBot, 3000);
        }
    });

    bot.on("request", dipatch);
    bot.on("notice", dipatch);
    bot.on("message", (data)=>{
        if (config.post_message_format === "string")
            data.message = data.raw_message;
		const action = data.message_type === "private" ? "sendPrivateMsg" : "sendGroupMsg";
		const id = data.message_type === "private" ? data.user_id : data.group_id;
		const sender = data.sender.user_id;
		var reply = '';
		if(data.message == "ping"){
			bot[action](id,"嘭！");
		}else if(data.message == "围攻" && action == "sendGroupMsg"){
			var hasgame = false;
			var gn = 0;
			for(var i = 0;i < games_len;i++){
				if(games[i].group_id == id){
					hasgame = true;
					gn = i;
					break;
				}
			}
			console.log(games);
			if(hasgame == true){
				if(games[gn].type == 1){
				if((games[gn].player1_id != sender || sender == 1181144657)&& games[gn].waitting == true){
					games[gn].add(data.sender);
					bot[action](id,"后手已进入，" + games[gn].mapsee() + "\n先后手轮流输入 上下左右进行游戏。");
				}else if(games[gn].end == true){
					games[gn] = new Game(1,id,data.sender);
					bot[action](id,"先手已进入。");
				}}else{
					if((games[gn].player1_id != sender || sender == 1181144657)&& games[gn].waitting == true){
					games[gn].add(data.sender);
					bot[action](id,`${charaterinGame[games[gn].playersnum - 1]}(${games[gn].playersnum})已进入。`);
					if(games[gn].playersnum == 4){
						setTimeout(function(){bot[action](id,`${games[gn].mapsee()}\n${charaterinGame[0] + charaterinGame[1] + charaterinGame[2] + charaterinGame[3]}轮流输入 上下左右 进行游戏！`)},Math.random*2000);
					}
					}else if(games[gn].end == true){
					games[gn] = new Game(2,id,data.sender);
					bot[action](id,`${charaterinGame[games[gn].playersnum - 1]}(${games[gn].playersnum})已进入。`);
					}
				}
			}else{
				games[games_len] = new Game(1,id,data.sender);
				bot[action](id,"先手已进入。");
				games_len++;
			}
		}else if(data.message == "多人围攻" && action == "sendGroupMsg"){
			var hasgame = false;
			var gn = 0;
			for(var i = 0;i < games_len;i++){
				if(games[i].group_id == id){
					hasgame = true;
					gn = i;
					break;
				}
			}
			console.log(games);
			if(hasgame == true){
				if((games[gn].player1_id != sender || sender == 1181144657)&& games[gn].waitting == true){
					games[gn].add(data.sender);
					bot[action](id,`${charaterinGame[games[gn].playersnum - 1]}(${games[gn].playersnum})已进入。`);
					if(games[gn].playersnum == 4){
						setTimeout(function(){bot[action](id,`${games[gn].mapsee()}\n${charaterinGame[0] + charaterinGame[1] + charaterinGame[2] + charaterinGame[3]}轮流输入 上下左右 进行游戏！`)},Math.random*2000);
					}
				}else if(games[gn].end == true){
					games[gn] = new Game(2,id,data.sender);
					bot[action](id,`${charaterinGame[games[gn].playersnum - 1]}(${games[gn].playersnum})已进入。`);
				}
			}else{
				games[games_len] = new Game(2,id,data.sender);
				bot[action](id,`${charaterinGame[games[games_len].playersnum - 1]}(${games[games_len].playersnum})已进入。`);
				games_len++;
			}
		}else if(data.message == "上" && action == "sendGroupMsg"){
			var hasgame = false;
			var gn = 0;
			for(var i = 0;i < games_len;i++){
				if(games[i].group_id == id){
					hasgame = true;
					gn = i;
					break;
				}
			}
			if(hasgame == true && games[gn].end == false && games[gn].waitting == false){
				if(games[gn].type == 1){
				if(games[gn].player1_id == sender && games[gn].waitting == false && games[gn].dangqian == 1)
					bot[action](id,games[gn].trymove(1,3));
				else if(games[gn].player2_id == sender && games[gn].waitting == false && games[gn].dangqian == 2)
					bot[action](id,games[gn].trymove(2,3));
				else if(games[gn].player1_id == sender && games[gn].waitting == false && games[gn].dangqian == 2){
					bot[action](id,"当前行动方不是你~");
				}else if(games[gn].player2_id == sender && games[gn].waitting == false && games[gn].dangqian == 1){
					bot[action](id,"当前行动方不是你~");
				}}else{
					if(games[gn].players_id[games[gn].dangqian] == sender){
						bot[action](id,games[gn].trymove(games[gn].dangqian,3));
					}else if(games[gn].players_id[0] == sender || games[gn].players_id[1] == sender || games[gn].players_id[2] == sender || games[gn].players_id[3] == sender){
						bot[action](id,"当前行动方不是你~");
					}
				}
			}
		}else if(data.message == "下" && action == "sendGroupMsg"){
			var hasgame = false;
			var gn = 0;
			for(var i = 0;i < games_len;i++){
				if(games[i].group_id == id){
					hasgame = true;
					gn = i;
					break;
				}
			}
			if(hasgame == true && games[gn].end == false && games[gn].waitting == false){
				if(games[gn].type == 1){
				if(games[gn].player1_id == sender && games[gn].waitting == false && games[gn].dangqian == 1)
					bot[action](id,games[gn].trymove(1,1));
				else if(games[gn].player2_id == sender && games[gn].waitting == false && games[gn].dangqian == 2)
					bot[action](id,games[gn].trymove(2,1));
				else if(games[gn].player1_id == sender && games[gn].waitting == false && games[gn].dangqian == 2){
					bot[action](id,"当前行动方不是你~");
				}else if(games[gn].player2_id == sender && games[gn].waitting == false && games[gn].dangqian == 1){
					bot[action](id,"当前行动方不是你~");
				}}else{
					if(games[gn].players_id[games[gn].dangqian] == sender){
						bot[action](id,games[gn].trymove(games[gn].dangqian,1));
					}else if(games[gn].players_id[0] == sender || games[gn].players_id[1] == sender || games[gn].players_id[2] == sender || games[gn].players_id[3] == sender){
						bot[action](id,"当前行动方不是你~");
					}
				}
			}
		}else if(data.message == "左" && action == "sendGroupMsg"){
			var hasgame = false;
			var gn = 0;
			for(var i = 0;i < games_len;i++){
				if(games[i].group_id == id){
					hasgame = true;
					gn = i;
					break;
				}
			}
			if(hasgame == true && games[gn].end == false && games[gn].waitting == false){
				if(games[gn].type == 1){
				if(games[gn].player1_id == sender && games[gn].waitting == false && games[gn].dangqian == 1)
					bot[action](id,games[gn].trymove(1,4));
				else if(games[gn].player2_id == sender && games[gn].waitting == false && games[gn].dangqian == 2)
					bot[action](id,games[gn].trymove(2,4));
				else if(games[gn].player1_id == sender && games[gn].waitting == false && games[gn].dangqian == 2){
					bot[action](id,"当前行动方不是你~");
				}else if(games[gn].player2_id == sender && games[gn].waitting == false && games[gn].dangqian == 1){
					bot[action](id,"当前行动方不是你~");
				}}else{
					if(games[gn].players_id[games[gn].dangqian] == sender){
						bot[action](id,games[gn].trymove(games[gn].dangqian,4));
					}else if(games[gn].players_id[0] == sender || games[gn].players_id[1] == sender || games[gn].players_id[2] == sender || games[gn].players_id[3] == sender){
						bot[action](id,"当前行动方不是你~");
					}
				}
			}
		}else if(data.message == "右" && action == "sendGroupMsg"){
			var hasgame = false;
			var gn = 0;
			for(var i = 0;i < games_len;i++){
				if(games[i].group_id == id){
					hasgame = true;
					gn = i;
					break;
				}
			}
			if(hasgame == true && games[gn].end == false && games[gn].waitting == false){
				if(games[gn].type == 1){
				if(games[gn].player1_id == sender && games[gn].waitting == false && games[gn].dangqian == 1)
					bot[action](id,games[gn].trymove(1,2));
				else if(games[gn].player2_id == sender && games[gn].waitting == false && games[gn].dangqian == 2)
					bot[action](id,games[gn].trymove(2,2));
				else if(games[gn].player1_id == sender && games[gn].waitting == false && games[gn].dangqian == 2){
					bot[action](id,"当前行动方不是你~");
				}else if(games[gn].player2_id == sender && games[gn].waitting == false && games[gn].dangqian == 1){
					bot[action](id,"当前行动方不是你~");
				}}else{
					if(games[gn].players_id[games[gn].dangqian] == sender){
						bot[action](id,games[gn].trymove(games[gn].dangqian,2));
					}else if(games[gn].players_id[0] == sender || games[gn].players_id[1] == sender || games[gn].players_id[2] == sender || games[gn].players_id[3] == sender){
						bot[action](id,"当前行动方不是你~");
					}
				}
			}
		}else if(data.message[0] == ":" && data.message[1] == ":" && sender == 1181144657){
			var str = "";
			for(var i = 2;i < data.message.length;i++){
				str += data.message[i];
			}
			str = str.replace(/&#93;/g,"]");
			str = str.replace(/&#91;/g,"[");
			str = str.replace(/&amp;/g,"&");
			console.log(str);
			console.log(eval(str));
		}else if(data.message[0] == ":" && sender == 1181144657){
			var str = "";
			for(var i = 1;i < data.message.length;i++){
				str += data.message[i];
			}
			console.log(eval(str));
		}else if(data.message == "~Del~" && sender == 1181144657){
			var num = -1;
			for(var i = 0;i < games_len;i++){
				if(games[i].group_id == id){
					num = i;
					break;
				}
			}
			if(num != -1){
				for(var i = num;i < games_len - 1;i++){
					games[i] = games[i+1];
				}
				games_len--;
			}
		}else if(data.message == "~Clean~" && sender == 1181144657){
			var ngames_len = games_len;
			for(var i = 0;i < games_len;i++){
				if(games[i].end == true){
					for(var i = num;i < games_len - 1;i++){
						games[i] = games[i+1];
					}
					games[games_len - 1] = null;
					games_len--;
					i--;
				}
			}
		}else if(data.message.split(" ").length > 1 && data.message.split(" ")[0] == "跟我念"){
			if(sender == 1181144657){
				var str = "";
				for(var i = data.message.split(" ")[0].length + 1;i < data.message.length;i++){
					str += data.message[i];
				}
				bot[action](id,str);
			}else{
				bot[action](id,"跟我念 不要回答！不要回答！不要回答！");
			}
		}else if(data.message == "随"){
			bot[action](id,"画图 " + ra.build(lengthhh(lengg)) + "=" + ra.build(lengthhh(lengg)));
		}else if(data.message == "随!"){
			bot[action](id,"画图 " + ra.buildZ(lengthhh(lengg)));
		}else if(data.message.split(' ').length == 3 && data.message.split(' ')[0] == "随" && isNaN(parseInt(data.message.split(' ')[1])) == false && isNaN(parseInt(data.message.split(' ')[2])) == false){
			var num1 = parseInt(data.message.split(' ')[1]) > 50 ? 50 : parseInt(data.message.split(' ')[1]);
			var num2 = parseInt(data.message.split(' ')[2]) > 50 ? 50 : parseInt(data.message.split(' ')[2]);
			bot[action](id,"画图 " + ra.build(lengthhh(num1),lengthhh(num2)) + "=" + ra.build(lengthhh(num1),lengthhh(num2)));
		}else if(data.message.split(' ').length == 5 && data.message.split(' ')[0] == "随" && isNaN(parseInt(data.message.split(' ')[1])) == false && isNaN(parseInt(data.message.split(' ')[2])) == false && isNaN(parseInt(data.message.split(' ')[3])) == false && isNaN(parseInt(data.message.split(' ')[4])) == false){
			var num1 = parseInt(data.message.split(' ')[1]) > 50 ? 50 : parseInt(data.message.split(' ')[1]);
			var num2 = parseInt(data.message.split(' ')[2]) > 50 ? 50 : parseInt(data.message.split(' ')[2]);
			var num3 = parseInt(data.message.split(' ')[3]) > 50 ? 50 : parseInt(data.message.split(' ')[3]);
			var num4 = parseInt(data.message.split(' ')[4]) > 50 ? 50 : parseInt(data.message.split(' ')[4]);
			bot[action](id,"画图 " + ra.build(lengthhh(num1),lengthhh(num2)) + "=" + ra.build(lengthhh(num3),lengthhh(num4)));
		}else if(data.message.split(' ').length == 2 && data.message.split(' ')[0] == "随!" && isNaN(parseInt(data.message.split(' ')[1])) == false){
			var num1 = parseInt(data.message.split(' ')[1]) > 100 ? 50 : parseInt(data.message.split(' ')[1]);
			bot[action](id,"画图 " + ra.buildZ(lengthhh(num1)));
		}else if(data.message.split(' ').length == 3 && data.message.split(' ')[0] == "随!" && isNaN(parseInt(data.message.split(' ')[1])) == false && isNaN(parseInt(data.message.split(' ')[2])) == false){
			var num1 = parseInt(data.message.split(' ')[1]) > 100 ? 100 : parseInt(data.message.split(' ')[1]);
			var num2 = parseInt(data.message.split(' ')[2]) > 50 ? 50 : parseInt(data.message.split(' ')[2]);
			bot[action](id,"画图 " + ra.buildZ(lengthhh(num1),lengthhh(num2)));
		}else if(data.message.split(' ').length == 2 && data.message.split(' ')[0] == '转'){
			var str = "";
			for(var i = 0;i < data.message.split(' ')[1].length;i++) str += data.message.split(' ')[1][i];
			bot[action](id,"画图 " + ra.xtoy(str));
		}else if(data.message == "diy" && (((('G' + id.toString() in diycds)&&(diycds['G' + id.toString()] == true)) == false && action == 'sendGroupMsg')||action == 'sendPrivateMsg'||sender == 1181144657)){
			bot[action](id,diy.build());
			if(action == 'sendGroupMsg' && sender != 1181144657){
				diycds['G' + id.toString()] = true;
				console.log(diycds);
				setTimeout(function(){diycds['G' + id.toString()] = false;},diycd*1000);
			}
		}else if(data.message.split(' ').length == 2 && data.message.split(' ')[0] == "diy" && (((('G' + id.toString() in diycds)&&(diycds['G' + id.toString()] == true)) == false && action == 'sendGroupMsg')||action == 'sendPrivateMsg'||sender == 1181144657)){
			if(data.message.split(' ')[1] == "(法术)"){
				bot[action](id,diy.getstr('',1));
				if(action == 'sendGroupMsg' && sender != 1181144657){
					diycds['G' + id.toString()] = true;
					console.log(diycds);
					setTimeout(function(){diycds['G' + id.toString()] = false;},diycd*1000);
				}
			}else if(data.message.split(' ')[1] == "(生物)"){
				bot[action](id,diy.getstr('',0));
				if(action == 'sendGroupMsg' && sender != 1181144657){
					diycds['G' + id.toString()] = true;
					console.log(diycds);
					setTimeout(function(){diycds['G' + id.toString()] = false;},diycd*1000);
				}
			}else{
				str = data.message.split(' ')[1];
				str = str.replace(/&#93;/g,"]");
				str = str.replace(/&#91;/g,"[");
				str = str.replace(/&amp;/g,"&");
				bot[action](id,diy.getstr(str));
				if(action == 'sendGroupMsg' && sender != 1181144657){
					diycds['G' + id.toString()] = true;
					console.log(diycds);
					setTimeout(function(){diycds['G' + id.toString()] = false;},diycd*1000);
				}
			}
		}else if(data.message.split(' ').length == 3 && isNaN(parseInt(data.message.split(' ')[2])) == false && data.message.split(' ')[0] == "diy" && sender == 1181144657){
			var ti = 0;
			if(data.message.split(' ')[1] == "(法术)"){
				for(var i = 0;i < parseInt(data.message.split(' ')[2]);i++){
					setTimeout(function(){bot[action](id,diy.getstr('',1));},(ti++)*1200 + 500);
				}
			}else if(data.message.split(' ')[1] == "(生物)"){
				for(var i = 0;i < parseInt(data.message.split(' ')[2]);i++){
					setTimeout(function(){bot[action](id,diy.getstr('',0));},(ti++)*1200 + 500);
				}
			}else{
				str = data.message.split(' ')[1];
				str = str.replace(/&#93;/g,"]");
				str = str.replace(/&#91;/g,"[");
				str = str.replace(/&amp;/g,"&");
				for(var i = 0;i < parseInt(data.message.split(' ')[2]);i++){
					setTimeout(function(){bot[action](id,diy.getstr(str));},(ti++)*1200 + 500);
				}
			}
			
		}else if(data.message.split(' ').length == 3 && data.message.split(' ')[0] == "diy" && (((('G' + id.toString() in diycds)&&(diycds['G' + id.toString()] == true)) == false && action == 'sendGroupMsg')||action == 'sendPrivateMsg'||sender == 1181144657)){
			if(data.message.split(' ')[2] == "(法术)"){
				bot[action](id,diy.getstr(data.message.split(' ')[1],1));
				if(action == 'sendGroupMsg' && sender != 1181144657){
					diycds['G' + id.toString()] = true;
					console.log(diycds);
					setTimeout(function(){diycds['G' + id.toString()] = false;},diycd*1000);
				}
			}else if(data.message.split(' ')[2] == "(生物)"){
				bot[action](id,diy.getstr(data.message.split(' ')[1],0));
				if(action == 'sendGroupMsg' && sender != 1181144657){
					diycds['G' + id.toString()] = true;
					console.log(diycds);
					setTimeout(function(){diycds['G' + id.toString()] = false;},diycd*1000);
				}
			}else{
				bot[action](id,'没有这个类别。。。');
			}
		}else if(data.message.split(' ').length == 4 && isNaN(parseInt(data.message.split(' ')[3])) == false && data.message.split(' ')[0] == "diy" && sender == 1181144657 && ['(法术)','(生物)'].includes(data.message.split(' ')[2]) == true){
			var ti = 0;
			var fssw = -1;
			if(data.message.split(' ')[2] == "(生物)"){fssw = 0}else if(data.message.split(' ')[2] == "(法术)"){fssw = 1};
			str = data.message.split(' ')[1];
			str = str.replace(/&#93;/g,"]");
			str = str.replace(/&#91;/g,"[");
			str = str.replace(/&amp;/g,"&");
			for(var i = 0;i < parseInt(data.message.split(' ')[3]);i++){
				setTimeout(function(){bot[action](id,diy.getstr(str,fssw));},(ti++)*1200 + 500);
			}
		}else if(data.message.split(' ').length == 2 && isNaN(parseInt(data.message.split(' ')[1])) == false && data.message.split(' ')[0] == "diy测试" && sender == 1181144657){
			bot[action](id,"那么多diy需要" + diy.testtime(parseInt(data.message.split(' ')[1])) + "ms的时间~");
		}else if(data.message == 'diy库'){
			bot[action](id,
				"diy库 by Muki：\n输入>>diy即可为您随机设计（缝合）一张diy~\n=====\n进阶：>>diy [词缀] [(类型)]可以直接设计一张含有词缀的该类型diy~\n>>diy [(类型)]这样也是可行的哦~\n=====\n以上“>>”与“[]”仅表示输入和可选符，无需输入，‘(、)’用英文括号，‘：，。’用中文~\n=====\n支持正则表达式，但是()+-默认为带\\，所以使用时请带上\\，例如A\\+B => A+B"
			);
			if(action == 'sendGroupMsg' && sender != 1181144657){
				diycds['G' + id.toString()] = true;
				console.log(diycds);
				setTimeout(function(){diycds['G' + id.toString()] = false;},diycd*400);
			}
		}else if(Sauls.datacheck(data) != false){
			setTimeout(function(){bot[action](id,Sauls.datado(Sauls.datacheck(data),data));},500);
		}
		
        dipatch(data);
    });

	const filepath = path.join(dir, "password");
	if (fs.existsSync(filepath)) {
		bot.login(fs.readFileSync(filepath));
	} else {
        inputPassword();
    }
}
var diycds = {};
var diycd = 20;

var lengg = 5;
var lengthhh = (leng = 5) => parseInt(leng*Math.random() + leng/2);
function dipatch(event) {
    const json = JSON.stringify(event);
    const options = {
        method: 'POST',
        timeout: config.post_timeout,
        headers: {
            'Content-Type': 'application/json',
            "X-Self-ID": account.toString()
        }
    }
    if (config.secret) {
        options.headers["X-Signature"] = crypto.createHmac("sha1", config.secret.toString()).update(json).digest("hex");
    }
    for (let url of config.post_url) {
        const protocol = url.startsWith("https") ? https: http;
        try {
            const req = protocol.request(url, options, (res)=>{
                bot.logger.debug(`post上报事件到${url}: ` + json);
                onHttpRes(event, res);
            }).on("error", ()=>{});
            req.end(json);
        } catch (e) {}
    }
    if (wss) {
        wss.clients.forEach((ws)=>{
            bot.logger.debug(`正向ws上报事件: ` + json);
            ws.send(json);
        });
    }
    websockets.forEach((ws)=>{
        bot.logger.debug(`反向ws上报事件: ` + json);
        ws.send(json);
    });
}

function createServer() {
    if (!config.use_http && !config.use_ws)
        return;
    server = http.createServer(async(req, res)=>{
        if (config.access_token) {
            if (!req.headers["authorization"])
                return res.writeHead(401).end();
            if (!req.headers["authorization"].includes(config.access_token))
                return res.writeHead(403).end();
        }
        if (req.method === "GET") {
            bot.logger.debug(`收到GET请求: ` + req.url);
            const qop = url.parse(req.url);
            let query = querystring.parse(qop.query);
            try {
                const ret = await api.apply({
                    action: qop.pathname.replace("/", ""),
                    params: query
                });
                res.setHeader("Content-Type", "application/json; charset=utf-8");
                res.end(ret);
            } catch (e) {
                res.writeHead(404).end();
            }
        } else if (req.method === "POST") {
            onHttpReq(req, res);
        }
    });
    if (config.use_ws) {
        wss = new WebSocket.Server({server});
        wss.on("connection", (ws, req)=>{
            ws.on("error", (data)=>{});
            if (config.access_token) {
                if (!req.headers["authorization"])
                    return ws.close(1401);
                if (!req.headers["authorization"].includes(config.access_token))
                    return ws.close(1403);
            }
            ws.on("message", (data)=>{
                onWSMessage(ws, data);
				
				
            });
        });
    }
    try {
        server.listen(config.port, config.host, ()=>{
            bot.logger.info(`开启http服务器成功，监听${server.address().address}:${server.address().port}`);
        });
    } catch (e) {
        bot.logger.error(e);
        process.exit(0);
    }
}
function createReverseWS() {
    const headers = {
        "X-Self-ID": account.toString(),
        "X-Client-Role": "Universal",
    };
    if (config.access_token)
        headers.Authorization = "Bearer " + config.access_token;
    for (let url of config.ws_reverse_url) {
        createWSClient(url, headers);
    }
}
function createWSClient(url, headers) {
    try {
        const ws = new WebSocket(url, {headers});
        websockets.add(ws);
        ws.on("open", ()=>{
            bot.logger.info(`反向ws连接(${url})连接成功。`)
        });
        ws.on("message", (data)=>{
            onWSMessage(ws, data);
        });
        ws.on("error", ()=>{});
        ws.on("close", ()=>{
            bot.logger.error(`反向ws连接(${url})被关闭，将在${config.ws_reverse_reconnect_interval}毫秒后尝试连接。`)
            websockets.delete(ws);
            setTimeout(()=>{
                createWSClient(url, headers);
            }, config.ws_reverse_reconnect_interval)
        })
    } catch (e) {}
}

async function onHttpRes(event, res) {
    let data = [];
    res.on("data", (chunk)=>data.push(chunk));
    res.on("end", async()=>{
        if (!online) return;
        data = Buffer.concat(data).toString();
        try {
            data = JSON.parse(data);
            api.quickOperate(event, data);
        } catch (e) {}
    })
}
function onHttpReq(req, res) {
    let data = [];
    req.on("data", (chunk)=>data.push(chunk));
    req.on("end", async()=>{
        try {
            if (!online) {
                var ret = JSON.stringify({
                    retcode: 104, status: "failed"
                });
            } else {
                data = Buffer.concat(data).toString();
                bot.logger.debug(`收到POST请求: ` + data);
                data = JSON.parse(data);
                var ret = await api.apply(data);
            }
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(ret);
        } catch (e) {
            if (e instanceof api.NotFoundError)
                res.writeHead(404).end();
            else
                res.writeHead(400).end();
        }
    })
}
async function onWSMessage(ws, data) {
    bot.logger.debug(`收到ws消息: ` + data);
    if (!online) {
        return ws.send(JSON.stringify({
            retcode: 104, status: "failed"
        }));
    }
    try {
        data = JSON.parse(data);
        if (data.action === ".handle_quick_operation") {
            api.handleQuickOperation(data);
            var ret = JSON.stringify({
                retcode: 1,
                status: "async",
                data: null
            });
        } else {
            var ret = await api.apply(data);
        }
        ws.send(ret);
    } catch (e) {
        if (e instanceof api.NotFoundError)
            var retcode = 1404;
        else
            var retcode = 1400;
        ws.send(JSON.stringify({
            retcode: retcode,
            status: "failed",
            data: null,
            echo: data.echo
        }));
    }
}
//============================
const GameMax = 50;
var games = new Array(GameMax);
var games_len = 0;
var biggestnum_ = 4;
var biggest_ = 6;
const biggest = () => biggest_;
const biggestnum = () => biggestnum_;
const charaterinGame = ["💜","💛","💚","💙"]
class Game{
	type;
	group_id;
	//双人
	player1_id;
	player1_card;
	player2_id;
	player2_card;
	waitting;
	map;
	player1_loca = [0,0];
	player2_loca = [biggest() - 2,biggest() - 2];
	dangqian = 1;
	end = false;
	//多人
	players_id;
	players_card;
	players_loca;
	players_alive;
	playersnum;
	playerpaiming;
	playerpaiminglen;
	constructor(typ,group,player1){
		this.type = typ;
		this.group_id = group;
		if(this.type == 1){//双人
			this.player1_id = player1.user_id;
			//this.player1_card = player1.card;
			this.player2_id = 0;
			//this.player2_card = "";
			this.waitting = true;
			this.rebuildmap();
		}else{
			this.players_alive = [true,true,true,true];
			this.players_card = ["","","",""];
			this.players_card[0] = player1.card;
			this.players_id = new Array(4);
			this.players_id[0] = player1.user_id;
			this.playersnum = 1;
			this.waitting = true;
			this.players_loca = [[0,0],[0,0],[0,0],[0,0]];
			this.players_loca[0] = [1,2];
			this.rebuildmap();
			this.playerpaiming = [-1,-1,-1,-1];
			this.playerpaiminglen = 0;
			this.dangqian = 0;
		}
	}
	add(player){
		if(this.waitting == true && this.type == 1){
			this.player2_id = player.user_id;
			//this.player2_card = player.card;
			this.waitting = false;
		}else if(this.waitting == true && this.type == 2){
			this.players_card[this.playersnum] = player.card;
			this.players_id[this.playersnum++] = player.user_id;
			if(this.playersnum == 2){
				this.players_loca[this.playersnum - 1] = [biggest() - 1 - 2,1]
			}else if(this.playersnum == 3){
				this.players_loca[this.playersnum - 1] = [biggest() - 1 - 1,biggest() - 1 - 2]
			}else if(this.playersnum == 4){
				this.players_loca[this.playersnum - 1] = [2,biggest() - 1 - 1]
				this.waitting = false;
			}
		}
	}
	rebuildmap(){
		this.map = new Array(biggest());
		for(var i = 0;i < biggest();i++){
			this.map[i] = new Array(biggest());
			for(var j = 0;j < biggest();j++){
				this.map[i][j] = 0;
			}
		}
		this.dangqian = 1;
		console.log(this.map);
	}
	mapsee(){
		var str = "棋盘：";
		for(var i = 0;i < biggest();i++){
			str += "\n";
			if(this.type == 1){
				for(var j = 0;j < biggest();j++){
					if(this.player1_loca[0] == i && this.player1_loca[1] == j){
						str += `${charaterinGame[0]}`;;
					}else if(this.player2_loca[0] == i && this.player2_loca[1] == j){
						str += `${charaterinGame[3]}`;
					}else if(this.map[i][j] != biggestnum()){
						str += `${this.map[i][j]}⃣`;
					}else{
						str += `️❌`;
					}
				}
			}else{
				for(var j = 0;j < biggest();j++){
					if(this.players_loca[0][0] == i && this.players_loca[0][1] == j){
						str += `${charaterinGame[0]}`;
					}else if(this.players_loca[1][0] == i && this.players_loca[1][1] == j){
						str += `${charaterinGame[1]}`;
					}else if(this.players_loca[2][0] == i && this.players_loca[2][1] == j){
						str += `${charaterinGame[2]}`;
					}else if(this.players_loca[3][0] == i && this.players_loca[3][1] == j){
						str += `${charaterinGame[3]}`;
					}else if(this.map[i][j] != (biggestnum() + 2)){
						str += `${this.map[i][j]}⃣`;
					}else{
						str += `️❌`;
					}
				}
			}
		}
		if(this.type == 1){
		str += `\n️${charaterinGame[0]}:${this.map[this.player1_loca[0]][this.player1_loca[1]]}⃣\n${charaterinGame[3]}:${this.map[this.player2_loca[0]][this.player2_loca[1]]}⃣`;
		}else{
		str += (this.players_alive[0] == true)?`\n️${charaterinGame[0]}:${this.map[this.players_loca[0][0]][this.players_loca[0][1]]}⃣`:`\n️❌`;
		str += (this.players_alive[1] == true)?`\n️${charaterinGame[1]}:${this.map[this.players_loca[1][0]][this.players_loca[1][1]]}⃣`:`\n️❌`;
		str += (this.players_alive[2] == true)?`\n️${charaterinGame[2]}:${this.map[this.players_loca[2][0]][this.players_loca[2][1]]}⃣`:`\n️❌`;
		str += (this.players_alive[3] == true)?`\n️${charaterinGame[3]}:${this.map[this.players_loca[3][0]][this.players_loca[3][1]]}⃣`:`\n️❌`;
		}
		return str;
	}
	move(who,fx){
		var fxb = this.getfx(fx);
		var times = 0;
		if(this.type==1){
		if(who == 1){
			if((this.player1_loca[0] + fxb[0] != this.player2_loca[0] || this.player1_loca[1] + fxb[1] != this.player2_loca[1]) && (this.player1_loca[0] + fxb[0] >= 0 && this.player1_loca[0] + fxb[0] <= biggest() - 1 && this.player1_loca[1] + fxb[1] >= 0 && this.player1_loca[1] + fxb[1] <= biggest() - 1) && (this.map[this.player1_loca[0] + fxb[0]][this.player1_loca[1] + fxb[1]] != biggestnum())){
				if(this.map[this.player1_loca[0]][this.player1_loca[1]] != biggestnum()) this.map[this.player1_loca[0]][this.player1_loca[1]] += 1;
				this.player1_loca[0] += fxb[0];
				this.player1_loca[1] += fxb[1];
				times++;
			}
			while((this.player1_loca[0] + fxb[0] != this.player2_loca[0] || this.player1_loca[1] + fxb[1] != this.player2_loca[1]) && (this.player1_loca[0] + fxb[0] >= 0 && this.player1_loca[0] + fxb[0] <= biggest() - 1 && this.player1_loca[1] + fxb[1] >= 0 && this.player1_loca[1] + fxb[1] <= biggest() - 1) && (this.map[this.player1_loca[0] + fxb[0]][this.player1_loca[1] + fxb[1]] == this.map[this.player1_loca[0]][this.player1_loca[1]]) && (this.map[this.player1_loca[0] + fxb[0]][this.player1_loca[1] + fxb[1]] != biggestnum())){
				this.map[this.player1_loca[0]][this.player1_loca[1]] += 1;
				this.player1_loca[0] += fxb[0];
				this.player1_loca[1] += fxb[1];
				times++;
			}
			if(times > 0) this.map[this.player1_loca[0]][this.player1_loca[1]] += 1;
		}else if(who == 2){
			if((this.player2_loca[0] + fxb[0] != this.player1_loca[0] || this.player2_loca[1] + fxb[1] != this.player1_loca[1]) && (this.player2_loca[0] + fxb[0] >= 0 && this.player2_loca[0] + fxb[0] <= biggest() - 1 && this.player2_loca[1] + fxb[1] >= 0 && this.player2_loca[1] + fxb[1] <= biggest() - 1) && (this.map[this.player2_loca[0] + fxb[0]][this.player2_loca[1] + fxb[1]] != biggestnum())){
				if(this.map[this.player2_loca[0]][this.player2_loca[1]] != biggestnum()) this.map[this.player2_loca[0]][this.player2_loca[1]] += 1;
				this.player2_loca[0] += fxb[0];
				this.player2_loca[1] += fxb[1];
				times++;
			}
			while((this.player2_loca[0] + fxb[0] != this.player1_loca[0] || this.player2_loca[1] + fxb[1] != this.player1_loca[1]) && (this.player2_loca[0] + fxb[0] >= 0 && this.player2_loca[0] + fxb[0] <= biggest() - 1 && this.player2_loca[1] + fxb[1] >= 0 && this.player2_loca[1] + fxb[1] <= biggest() - 1) && (this.map[this.player2_loca[0] + fxb[0]][this.player2_loca[1] + fxb[1]] == this.map[this.player2_loca[0]][this.player2_loca[1]]) && (this.map[this.player2_loca[0] + fxb[0]][this.player2_loca[1] + fxb[1]] != biggestnum())){
				this.map[this.player2_loca[0]][this.player2_loca[1]] += 1;
				this.player2_loca[0] += fxb[0];
				this.player2_loca[1] += fxb[1];
				times++;
			}
			if(times > 0) this.map[this.player2_loca[0]][this.player2_loca[1]] += 1;
		}
		if(times == 0){
			return false;
		}else{
			return true;
		}}
		else if(this.type == 2){
			if(this.movable(who,fxb) && (this.players_loca[who][0] + fxb[0] >= 0 && this.players_loca[who][0] + fxb[0] <= biggest() - 1 && this.players_loca[who][1] + fxb[1] >= 0 && this.players_loca[who][1] + fxb[1] <= biggest() - 1) && (this.map[this.players_loca[who][0] + fxb[0]][this.players_loca[who][1] + fxb[1]] != biggestnum() + 2)){
				if(this.map[this.players_loca[who][0]][this.players_loca[who][1]] != biggestnum() + 2) this.map[this.players_loca[who][0]][this.players_loca[who][1]] += 1;
				this.players_loca[who][0] += fxb[0];
				this.players_loca[who][1] += fxb[1];
				times++;
			}
			while(this.movable(who,fxb) && (this.players_loca[who][0] + fxb[0] >= 0 && this.players_loca[who][0] + fxb[0] <= biggest() - 1 && this.players_loca[who][1] + fxb[1] >= 0 && this.players_loca[who][1] + fxb[1] <= biggest() - 1) && (this.map[this.players_loca[who][0] + fxb[0]][this.players_loca[who][1] + fxb[1]] == this.map[this.players_loca[who][0]][this.players_loca[who][1]]) && (this.map[this.players_loca[who][0] + fxb[0]][this.players_loca[who][1] + fxb[1]] != biggestnum() + 2)){
				this.map[this.players_loca[who][0]][this.players_loca[who][1]] += 1;
				this.players_loca[who][0] += fxb[0];
				this.players_loca[who][1] += fxb[1];
				times++;
			}
			if(times > 0) this.map[this.players_loca[who][0]][this.players_loca[who][1]] += 1;
			if(times == 0){
			return false;
			}else{
			return true;
			}
		}
	}
	movable(who,fxb){//多人使用
		for(var i = 0;i < 4;i++){
			if((this.players_loca[who][0] + fxb[0] != this.players_loca[i][0] || this.players_loca[who][1] + fxb[1] != this.players_loca[i][1])){
				continue;
			}else{
				return false;
			}
		}
		return true;
	}
	trymove(who,fx){
		if(this.type == 1){
			if(this.move(who,fx) == true){
				this.dangqian ^= 3;
				return this.mapsee();
			}else{
				if(this.wintest(who) == true){
					this.end = true;
					return "移动失败，由于无法再移动，你已经失败。";
				}else{
					return "移动失败~";
				}
			}
		}else if(this.type == 2){
			if(this.move(who,fx) == true){
				var nextone = -1;
				for(var i = 1;i < 4;i++){
					if(this.players_alive[(who + i)%4] == true){
						nextone = (who + i)%4;
						break;
					}
				}
				this.dangqian = nextone;
				return this.mapsee() + `\n轮到${charaterinGame[nextone]}(${this.players_card[nextone]})！`;
			}else{
				if(this.wintest(who) == true){
					var nextone = -1;
					this.players_alive[who] = false;
					for(var i = 1;i < 4;i++){
						if(this.players_alive[(who + i)%4] == true){
							nextone = (who + i)%4;
							break;
						}
					}
					var onlyone = true,onlynum = -1;
					for(var i = 0;i < 4;i++){
						if(this.players_alive[i] == true){
							if(onlynum != -1){
								onlyone = false;
								break;
							}
							onlynum = i;
						}
					}
					if(onlyone == true){
						this.playerpaiming[this.playerpaiminglen++] = who;
						this.playerpaiming[this.playerpaiminglen++] = onlynum;
						this.end = true;
						return "移动失败，由于无法再移动，" + charaterinGame[who] + `(${this.players_card[who]})` + "已经失败。" + `\n${charaterinGame[onlynum]}获得最终胜利！\n1.${charaterinGame[this.playerpaiming[3]]}\n2.${charaterinGame[this.playerpaiming[2]]}\n3.${charaterinGame[this.playerpaiming[1]]}\n4.${charaterinGame[this.playerpaiming[0]]}`;
					}
					this.playerpaiming[this.playerpaiminglen++] = who;
					this.dangqian = nextone;
					return "移动失败，由于无法再移动，" + charaterinGame[who] + `(${this.players_card[who]})` + "已经失败。";
				}else{
					return "移动失败~";
				}
			}
		}
	}
	wintest(who){
		if(this.type == 1){
		var newmap = deepCopy(this.map);
		
		var p1x = this.player1_loca[0],p1y = this.player1_loca[1],p2x = this.player2_loca[0],p2y = this.player2_loca[1];
		/*p1l[0] = p1x;
		p1l[1] = p1y;
		p2l[0] = p2x;
		p2l[1] = p2y;
		console.log(p1l);
		console.log(p2l);*/
		var lose = true;
		for(var i = 1;i <= 4;i++){
			if(this.move(who,i) == true){
				console.log(newmap);
				lose = false;
				this.player1_loca[0] = p1x;
				this.player1_loca[1] = p1y;
				this.player2_loca[0] = p2x;
				this.player2_loca[1] = p2y;
				this.map = deepCopy(newmap);
				return lose;
			}
			this.map = deepCopy(newmap);
			this.player1_loca[0] = p1x;
			this.player1_loca[1] = p1y;
			this.player2_loca[0] = p2x;
			this.player2_loca[1] = p2y;
		}
		this.map = deepCopy(newmap);
		this.player1_loca[0] = p1x;
		this.player1_loca[1] = p1y;
		this.player2_loca[0] = p2x;
		this.player2_loca[1] = p2y;
		return lose;}else{
			var lose = true;
			var newmap = deepCopy(this.map);
			var newplayerloca = deepCopy(this.players_loca);
			for(var i = 1;i <= 4;i++){
				if(this.move(who,i) == true){
					lose = false;
					this.players_loca = deepCopy(newplayerloca);
					this.map = deepCopy(newmap);
					return lose;
				}
				this.players_loca = deepCopy(newplayerloca);
				this.map = deepCopy(newmap);
			}
			this.players_loca = deepCopy(newplayerloca);
			this.map = deepCopy(newmap);
			return lose;
		}
	}
	getfx(fx){
		var fxb = [0,0];
		switch(fx){
			case 1://下
				fxb[0] = 1;
				break;
			case 2://右
				fxb[1] = 1;
				break;
			case 3://上
				fxb[0] = -1;
				break;
			case 4://左
				fxb[1] = -1;
				break;
		}
		return fxb;
	}
}

function deepCopy(obj){
	var out = [],i = 0,len = obj.length;
	for(;i < len;i++){
		if(obj[i] instanceof Array){
			out[i] = deepCopy(obj[i]);
		}
		else out[i] = obj[i];
	}
	return out;
}
//============================
module.exports = startup;
