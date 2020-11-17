"use strict";
const fs = require('fs');

var max = [
	[
		10,
		10,
		10,
		10,
		10,
		2,
		2,
		2,
		2,
		2,
		"默认"
	]
];
class worldbuilder{
	turn;
	id;
	basef= {
		"fire":{},
		"aqua":{},
		"earth":{},
		"ordo":{},
		"destro":{}
	}
	elesid = [];
	evdeckid = [];
	constructor(obj){
		for(var i in obj){
			this[i] = obj[i];
		}
	}
	toworld(){
		var tempworld = new world(this.id,defaultsetting,false);
		for(var i = 0;i < this.evdeckid.length;i++){
			tempworld.evdeck.push(eventsss.eve[this.evdeckid[i]]);
		}
		for(var i = 0;i < this.elesid.length;i++){
			tempworld.eles.push(ele.madeele[this.elesid[i]]);
		}
		tempworld.basef = this.basef;
		tempworld.turn = this.turn;
		return tempworld;
	}
}

class world{
	toworldbuilder(){
		var worldobj = {};
		worldobj.turn = this.turn;
		worldobj.id = this.id;
		worldobj.basef = this.basef;
		worldobj.elesid = [];
		for(var i = 0;i < this.eles.length;i++){
			worldobj.elesid.push(ele.madeele.indexOf(this.eles[i]));
		}
		worldobj.evdeckid = [];
		for(var i = 0;i < this.evdeck.length;i++){
			worldobj.evdeckid.push(eventsss.eve.indexOf(this.evdeck[i]));
		}
		var tempworldbuilder = new worldbuilder(worldobj);
		return tempworldbuilder;
	}
	turn = 0;
	static wds = [];
	id;
	//
	basef = {
		"fire":{},
		"aqua":{},
		"earth":{},
		"ordo":{},
		"destro":{}
	}
	eles = [];
	evdeck = [eventsss.eve[0],eventsss.eve[0],eventsss.eve[0],eventsss.eve[0],eventsss.eve[1],eventsss.eve[2]].sort(function(){return (parseInt(Math.random()*2) - 1)});
	constructor(id,worldtype = 0,add = true){
		this.basef.fire = {
			"min":0,
			"max":max[worldtype][0],
			"now":max[worldtype][5]
		}
		this.basef.aqua = {
			"min":0,
			"max":max[worldtype][1],
			"now":max[worldtype][6]
		}
		this.basef.earth = {
			"min":0,
			"max":max[worldtype][2],
			"now":max[worldtype][7]
		}
		this.basef.ordo = {
			"min":0,
			"max":max[worldtype][3],
			"now":max[worldtype][8]
		}
		this.basef.destro = {
			"min":0,
			"max":max[worldtype][4],
			"now":max[worldtype][9]
		}
		this.id = id;
		if(add == true){
			world.wds.push(this);
		}
	}
	checkworld(){
		for(var i in this.basef){
			if(this.basef[i].now > this.basef[i].max || this.basef[i].now < this.basef[i].min){
				return false;
			}
		}
		return true;
	}
	checkget(){
		for(var i = 0;i < this.eles.length;i++){
			var q = 0;
			for(var j in this.basef){
				this.basef[j].now += this.eles[i].eleget[q++];
			}
		}
	}
	geteles(eles = []){
		this.eles = this.eles.concat(eles);
		for(var i = 0;i < eles.length;i++){
			for(var q = 0;q < eles[i].washev.length;q++){
				this.evdeck.push(eventsss.eve[eles[i].washev[q]]);
			}
		}
		this.evdeck.sort(function(){return (parseInt(Math.random()*2) - 1)});
		return this.eles;
	}
	makeele(elem){
		var q = 0;
		var can = true;
		for(var j in this.basef){
			if(this.basef[j].now < elem.eleneed[q++]){
				can = false;
				break;
			}
		}
		if(can){
			q = 0;
			for(var j in this.basef){
				this.basef[j].now -= elem.eleneed[q++];
			}
			this.geteles([elem]);
			return true;
		}
		return false;
	}
	lostele(el){
		console.log(el);
		for(var i = 0;i < el.washev.length;i++){
			this.evdeck.splice(this.evdeck.indexOf(eventsss.eve[el.washev[i]]),1);
		}
		return this;
	}
	checkeve(ev){
		var q = 0;
		for(var j in this.basef){
			this.basef[j].now += ev.eleget[q++];
		}
		this.destoryele(ev.destr);
	}
	destoryele(num = 0){
		this.eles.sort(function(){return (parseInt(Math.random()*2) - 1)});
		var died = this.eles.splice(0,num);
		for(var i = 0;i < died.length;i++){
			this.lostele(died[i]);
		}
		this.eles.sort(function(a,b){return (a.name > b.name ? 1:-1)});
		return ele.elesToString(died);
	}
	breakele(el){
		this.eles.splice(this.eles.indexOf(el),1);
		this.lostele(el);
		return ele.eleToString(el);
	}
	trybreak(el,mode){
		if(mode != 1||mode != 2) return false;
		var useele = mode == 1 ? "fire":"destro";
		if(el.eledestroy <= this.basef[useele].now){
			this.basef[useele].now -= el.eledestroy;
			this.breakele(el);
		}
		return true;
	}
	endturn(){
		var str = "";
		
		this.checkget();
		
		var drawev = this.evdeck.shift();
		this.checkeve(drawev);
		this.evdeck.push(drawev);
		
		str += drawev.name + "：\n" + drawev.getdes() + "\n=====\n";
		
		this.turn++;
		
		str += world.worldtostring(this);
		
		if(this.checkworld() == false){
			str += "\n=====\n" + "你的世界已经崩坏..."
			world.wds.splice(world.wds.indexOf(this),1);
		}
		
		return str;
	}
	static worldtostring(wd,mode = 1){
		var str = "";
		if(mode == 1){//Short
			str += wd.id.toString() + "的世界：\n";
			var q = 0;
			for(var i in wd.basef){
				str += ELEname[q++] + "：" + wd.basef[i].min + "~" + wd.basef[i].now + "~" + wd.basef[i].max + "\n";
			}
			str += "造物数量：" + wd.eles.length + "\n";
			str += "已过世界轮：" + wd.turn;
		}else{
			
		}
		return str;
	}
	
}
var made = 0;
class elebuilder{
	name;
	des;
	eleneed;
	eleget;
	eledestroy;
	washev;
	constructor(obj){
		for(var i in obj){
			this[i] = obj[i];
		}
	}
	toele(){
		var tempele = new ele(this.name,this.des,this.eleneed,this.eleget,this.de,defaultsetting,false);
		for(var i in tempele){
			if(i == "washev"){
				for(var j = 0;j < this.washev.length;j++){
					tempele.washev.push(eventsss.eve[this.washev[j]]);
				}
			}else{
				tempele[i] = this[i];
			}
		}
		return tempele;
	}
}
class ele{
	toelebuilder(){
		var eleobj = {};
		eleobj.name = this.name;
		eleobj.des = this.des;
		eleobj.eleneed = this.eleneed;
		eleobj.eleget = this.eleget;
		eleobj.eledestroy = this.eledestroy;
		eleobj.washev = [];
		for(var j = 0;j < this.washev.length;j++){
			eleobj.washev.push(eventsss.eve.indexOf(this.washev[j]));
		}
		return (new elebuilder(eleobj));
	}
	name;
	des;
	eleneed;
	eleget;
	eledestroy;
	washev;
	static madeele = [];
	constructor(n = "造物"+(made++).toString()+"号",des = [""],need = [2,2,0,0,0],get = [0,0,0,0,0],de = 2,wa = [],add = true){
		this.name = n;
		this.des = des;
		this.eleneed = need;
		this.eleget = get;
		this.eledestroy = de;
		this.washev = wa;
		if(add){
			ele.madeele.push(this);
		}
	}
	getdes(){
		return this.des[parseInt(this.des.length*Math.random())];
	}
	static elesToString(eles = []){
		var tempdeck = [];
		var tempdeck2 = [];
		for(var i = 0;i < eles.length;i++){
			if(tempdeck.includes(eles[i].name) == true){
				tempdeck2[tempdeck.indexOf(eles[i].name)]++;
			}else{
				tempdeck.push(eles[i].name);
				tempdeck2.push(1);
			}
		}
		var str = "";
		for(var i = 0;i < tempdeck.length;i++){
			str += "\n" + tempdeck[i] + "*" + tempdeck2[i];
		}
		return str;
	}
	static eleToString(elem){
		var str = "";
		str += elem.name + "：\n";
		str += "合成所需->造物效益：\n"
		for(var i = 0;i < 5;i++){
			if(elem.eleneed[i] != 0 || elem.eleget[i] != 0){
				str += ELEname[i] + "：" + elem.eleneed[i].toString() + "->" + elem.eleget[i].toString() + "\n";
			}
		}
		str += "摧毁所需火/混沌：" + elem.eledestroy + "\n"
		str += "=======\n" + elem.getdes();
		return str; 
	}
}
const ELEname = [
	'火',
	'水',
	'地',
	'秩序',
	'混沌'
]
class eventsss{
	static eve = [];
	name;
	des;
	eleget;
	destr;
	constructor(n = "事件"+(made++).toString()+"号",des = [""],get = [0,0,0,0,0],de = 0){
		this.name = n;
		this.des = des;
		this.eleget = get;
		this.destr = de;
		eventsss.eve.push(this);
	}
	getdes = function(){
		return this.des[parseInt(this.des.length*Math.random())];
	}
}
function datacheck(data){
	if(data.message == ">>美丽新世界"){
		var can = -1;
		for(var i = 0;i < world.wds.length;i++){
			if(data.sender.user_id == world.wds[i].id){
				can = i;
				break;
			}
		}
		if(can != -1) return [-8];
		return [1,data];
	}else if(data.message == ">>我的世界"){
		var can = -1;
		for(var i = 0;i < world.wds.length;i++){
			if(data.sender.user_id == world.wds[i].id){
				can = i;
				break;
			}
		}
		if(can == -1) return [-3];
		return [5,data,can];
	}else if(data.message == ">>重构世界"){
		var can = -1;
		for(var i = 0;i < world.wds.length;i++){
			if(data.sender.user_id == world.wds[i].id){
				can = i;
				break;
			}
		}
		if(can == -1) return [-3];
		return [6,data,can];
	}else if(data.message == ">>帮助"){
		return [100];
	}else if(data.message == ">>保存"){
		return [101];
	}else if(data.message == ">>过"){
		var can = -1;
		for(var i = 0;i < world.wds.length;i++){
			if(data.sender.user_id == world.wds[i].id){
				can = i;
				break;
			}
		}
		if(can == -1) return [-3];
		return [7,data,can];
	}else if(data.message.split(" ").length == 2){
		if(data.message.split(" ")[0] == ">>查看"){
			if(data.message.split(" ")[1] == "造物列表"){
				return [4,data];
			}
			if(data.message.split(" ")[1] == "我的造物列表"){
				var can = -1;
				for(var i = 0;i < world.wds.length;i++){
					if(data.sender.user_id == world.wds[i].id){
						can = i;
						break;
					}
				}
				if(can == -1) return [-3];
				return [8,data,can];
			}
			for(var i = 0;i < ele.madeele.length;i++){
				if(data.message.split(" ")[1] == ele.madeele[i].name){
					return [3,data,i];
				}
			}
			return [-5];
		}
		if(data.message.split(" ")[0] == ">>合成"){
			var can = -1;
			for(var i = 0;i < world.wds.length;i++){
				if(data.sender.user_id == world.wds[i].id){
					can = i;
					break;
				}
			}
			if(can == -1) return [-3];
			for(var i = 0;i < ele.madeele.length;i++){
				if(data.message.split(" ")[1] == ele.madeele[i].name){
					return [2,data,i,can];
				}
			}
			return [-5];
		}
		if(data.message.split(" ")[0] == ">>焚烧"){
			var can = -1;
			for(var i = 0;i < world.wds.length;i++){
				if(data.sender.user_id == world.wds[i].id){
					can = i;
					break;
				}
			}
			if(can == -1) return [-3];
			for(var i = 0;i < world.wds[can].eles.length;i++){
				if(world.wds[can].eles == data.message.split(" ")[1]){
					return [9,data,i,can];
				}
			}
			return [-6];
		}
		if(data.message.split(" ")[0] == ">>解离"){
			var can = -1;
			for(var i = 0;i < world.wds.length;i++){
				if(data.sender.user_id == world.wds[i].id){
					can = i;
					break;
				}
			}
			if(can == -1) return [-3];
			for(var i = 0;i < world.wds[can].eles.length;i++){
				if(world.wds[can].eles == data.message.split(" ")[1]){
					return [10,data,i,can];
				}
			}
			return [-6];
		}
	}
	if(data.message[0] == ">" && data.message[1] == ">"){
		return [-1];
	}
	return false;
}
var Playerworlds = [];
function datado(check = [-1],data){
	if(check[0] == -1) return "指令错误呢~";
	if(check[0] == -5) return "没有这个造物呢。。";
	if(check[0] == -6) return "你的世界里没有这个造物呢。。";
	if(check[0] == -3) return "你还没创造世界呢。。";
	if(check[0] == -8) return "你已经创造了世界了。。";
	
	if(check[0] == 1){
		Playerworlds.push(new world(data.sender.user_id));
		return world.worldtostring(Playerworlds[Playerworlds.length - 1]);
	}
	if(check[0] == 2){
		if(world.wds[check[3]].makeele(ele.madeele[check[2]])){
			return "当前造物：" + ele.elesToString(world.wds[check[3]].eles);
		}else{
			return "元素不够无法合成~"
		}
	}
	if(check[0] == 3){
		return ele.eleToString(ele.madeele[check[2]]);
	}
	if(check[0] == 4){
		return "造物列表：" + ele.elesToString(ele.madeele);
	}
	if(check[0] == 5){
		return world.worldtostring(world.wds[check[2]]);
	}
	if(check[0] == 6){
		return world.worldtostring(world.wds[check[2]] = new world(data.sender.user_id));
	}
	if(check[0] == 7){
		return world.wds[check[2]].endturn();
	}
	if(check[0] == 8){
		return "你的造物列表：" + ele.elesToString(world.wds[check[2]].eles);
	}
	if(check[0] == 9){
		if(world.wds[check[3]].trybreak(ele.madeele[check[2]],1) == true){
			return "已销毁" + ele.madeele[check[2]].name + "\n" + "你的造物列表：" + ele.elesToString(world.wds[check[3]].eles);
		}
		return "火元素不够呢。。。"
	}
	if(check[0] == 10){
		if(world.wds[check[3]].trybreak(ele.madeele[check[2]],2) == true){
			return "已销毁" + ele.madeele[check[2]].name + "\n" + "你的造物列表：" + ele.elesToString(world.wds[check[3]].eles);
		}
		return "混沌元素不够呢。。。"
	}
	if(check[0] == 100){
		return HELP;
	}
	if(check[0] == 101){
		save();
		return "保存~";
	}
}
const defaultsetting = undefined;
var BASEele = [];
var BASEev = [];

function STARTSETTING(){
	/*BASEele.push(new ele("原始之焰",["世界零星的火焰。"],[2,0,0,0,0],[1,0,0,0,0],1,[1,4]));
	BASEele.push(new ele("原始之流",["世界零星的水流。"],[0,2,0,0,0],[0,1,0,0,0],1,[1,4]));
	BASEele.push(new ele("原始之壤",["世界零星的土壤。"],[0,0,2,0,0],[0,0,1,0,0],1,[1,4]));
	BASEele.push(new ele("原始次秩",["世界零星的秩序。"],[0,0,0,2,0],[0,0,0,1,0],1,[1,4]));
	BASEele.push(new ele("原始解离",["世界零星的混沌。"],[0,0,0,0,2],[0,0,0,0,1],1,[1,4]));
	BASEele.push(new ele("炽热之火",["火的集合。"],[4,0,0,0,1],[2,0,0,0,1],4,[2]));
	BASEele.push(new ele("星光",["最后的鸣息。"],[0,0,2,2,2],[1,0,1,0,1],3,[0,1,2]));
	BASEele.push(new ele("井",["迸发之地。"],[0,3,1,0,1],[0,1,0,0,0],2,[0,0,3]));
	BASEele.push(new ele("滩",["漫水金山。"],[0,4,2,0,0],[0,1,2,0,0],3,[3,5]));
	*/
	BASEev.push(new eventsss("平静",["犹如无浪之洋。","无不寻常之事。","寻常至不再寻常之事。"]));
	BASEev.push(new eventsss("溶解",["不稳定的宿命。","不够熟练，或造物之无意识。","总有一个要上路。"],[0,1,1,-1,2],1));
	BASEev.push(new eventsss("陨落",["天外来物。","或是赠与的零星点点。"],[2,0,2,0,1]));
	BASEev.push(new eventsss("暗涌",["滋润万物。","吞没万物。"],[-2,2,0,0,-1]));
	BASEev.push(new eventsss("平衡",["难得的稳定。","或许只是风暴前的平静。"],[0,0,0,1,-1]));
	BASEev.push(new eventsss("无法控制",["如同猛兽。","或许是秩序不再。。。"],[-2,2,0,-2,2]));
	//save();
	
	load();
}

function save(){
	var worldsto = [];
	for(var i = 0;i < world.wds.length;i++){
		worldsto.push(world.wds[i].toworldbuilder());
	}
	fs.writeFile('./lib/Sauls/worlds.json',JSON.stringify(worldsto,null,4),"utf-8",(err) => {
		console.log("worlds right");
	})
	
	/*var elesto = [];
	for(var i = 0;i < ele.madeele.length;i++){
		elesto.push(ele.madeele[i].toelebuilder());
	}
	fs.writeFile('./lib/Sauls/elements.json',JSON.stringify(elesto,null,4),"utf-8",(err) => {
		console.log("elements right");
	})*/
	
	/*fs.writeFile('./lib/Sauls/elements.json',JSON.stringify(ele.madeele,null,4),"utf-8",(err) => {
		console.log("elements right");
	})
	fs.writeFile('./lib/Sauls/event.json',JSON.stringify(eventsss.eve,null,4),"utf-8",(err) => {
		console.log("event right");
	})*/
}
function load(){
	fs.readFile('./lib/Sauls/elements.json',(err,bytesRead) => {
		var temp = JSON.parse(bytesRead);
		for(var i = 0;i < temp.length;i++){
			ele.madeele.push((new elebuilder(temp[i])).toele());
		}
		console.log("elements right");
		fs.readFile('./lib/Sauls/worlds.json',(err,bytesRead) => {
			var temp = JSON.parse(bytesRead);
			for(var i = 0;i < temp.length;i++){
				world.wds.push((new worldbuilder(temp[i])).toworld());
			}
			console.log("worlds right");
		})
	})
	
	/*fs.readFile('./lib/Sauls/elements.json',(err,bytesRead) => {
		ele.madeele = JSON.parse(bytesRead);
		console.log("elements right");
	})
	fs.readFile('./lib/Sauls/event.json',(err,bytesRead) => {
		eventsss.eve = JSON.parse(bytesRead);
		console.log("event right");
	})*/
}

var HELP = `指令大全
===
>>美丽新世界：创造新的世界
>>重构世界：    世界重来枪
>>查看 造物名字
>>查看 (我的)造物列表
>>合成 造物名字
>>解离：    用混沌毁灭造物
>>焚烧：      用火毁灭造物
>>过：      过去一个世界轮
>>保存      十分有效的保存`;
var savetime = 60;
var sav = setInterval(save,savetime*1000);
module.exports = {
	max,
	ele,
	world,
	datacheck,
	datado,
	eventsss,
	STARTSETTING,
	BASEele,
	BASEev,
	HELP,
	save,
	load,
	savetime
}