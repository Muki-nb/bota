var chosemode = 0,xg = 0,fzx = 0;
var chosenid = [];
var efchosen = [];
var limchosen = {};
var SAFE = 20000;
var loggg = true;
function build(swfsxz = -1){
	var str = "bug";
	var swfs = parseInt(Math.random()*2);
	if(swfsxz != -1){swfs = swfsxz;}
	chosenid = [];
	efchosen = [];
	limchosen = {};
	fzx = 0;
	xg = 0;
	chosemode = 0;
	var safelen = 0
	if(swfs == 0){//生物
		do{
			chosemode = parseInt(Math.random()*deck.mode.length);
		}while(deck.mode[chosemode][1] == 1);
		xg = deck.mode[chosemode][2];
		str = deck.mode[chosemode][0];
		if(loggg == true) console.log(str);
		if(loggg == true) console.log(chosemode);
		while(((checkhaskey(str) == true)||(str.search(/:;/) != -1||str.search(/;:/) != -1))&&safelen < SAFE){
			
			safelen++;
			if(loggg == true) console.log(str);
			if(str.indexOf("<word>") != -1){
				str = str.replace("<word>",
					function(){
						var chose;
						do{
							safelen++;
							chose = parseInt(Math.random()*deck.word.length);
						}while((chosenid.includes(deck.word[chose][0])||deck.word[chose][2]==1)&&safelen < SAFE);
						chosenid.push(deck.word[chose][0]);
						if(loggg == true) console.log(deck.word[chose][1]);
						var temp = deck.word[chose][1];
						while(temp.search(/:;[\s\S]*;:/) != -1&&safelen < SAFE){
							safelen++;
							var isnone = parseInt(Math.random()*2);
							if(isnone == 1){
								temp = temp.replace(/:;.*;:/,"");
							}else{
								temp = temp.replace(/:;/,"");
								temp = temp.replace(/(.*)(;:)(.*)$/,"$1$3");
							}
						}
						return temp;
					}
				);
			}
			while(str.indexOf("<timepoint>") != -1&&safelen < SAFE){
				safelen++;
				str = str.replace("<timepoint>",
					function(){
						var chose;
						do{
							safelen++;
							chose = parseInt(Math.random()*deck.timepoint.length);
						}while((chosenid.includes(deck.timepoint[chose][0])||deck.timepoint[chose][2]==1)&&safelen < SAFE);
						if(deck.timepoint[chose][3] == 1) fzx = 1;
						chosenid.push(deck.timepoint[chose][0]);
						if(loggg == true) console.log(deck.timepoint[chose][1]);
						var temp = deck.timepoint[chose][1];
						while(temp.search(/:;[\s\S]*;:/) != -1&&safelen < SAFE){
							safelen++;
							var isnone = parseInt(Math.random()*2);
							if(isnone == 1){
								temp = temp.replace(/:;.*;:/,"");
							}else{
								temp = temp.replace(/:;/,"");
								temp = temp.replace(/(.*)(;:)(.*)$/,"$1$3");
							}
						}
						return temp;
					}
				);
			}
			if(str.indexOf("<if>") != -1){
				str = str.replace("<if>",
					function(){
						var chose;
						safelen++;
						chose = parseInt(Math.random()*deck["if"].length);
						if(loggg == true) console.log(deck["if"][chose][0]);
						var temp = deck["if"][chose][0];
						while(temp.search(/:;[\s\S]*;:/) != -1&&safelen < SAFE){
							safelen++;
							var isnone = parseInt(Math.random()*2);
							if(isnone == 1){
								temp = temp.replace(/:;.*;:/,"");
							}else{
								temp = temp.replace(/:;/,"");
								temp = temp.replace(/(.*)(;:)(.*)$/,"$1$3");
							}
						}
						return temp;
					}
				);
			}
			if(str.indexOf("<effect>") != -1){
				str = str.replace("<effect>",
					function(){
						var chose;
						do{
							safelen++;
							chose = parseInt(Math.random()*deck["effect"].length);
						}while((deck["effect"][chose][1]==1||deck["effect"][chose][3] < fzx||efchosen.includes(chose)||deck['effect'][chose][2] == (xg^1))&&safelen < SAFE);
						efchosen.push(chose);
						if(loggg == true) console.log(deck["effect"][chose][0]);
						var temp = deck["effect"][chose][0];
						while(temp.search(/:;[\s\S]*;:/) != -1&&safelen < SAFE){
							safelen++;
							var isnone = parseInt(Math.random()*2);
							if(isnone == 1){
								temp = temp.replace(/:;.*;:/,"");
							}else{
								temp = temp.replace(/:;/,"");
								temp = temp.replace(/(.*)(;:)(.*)$/,"$1$3");
							}
						}
						return temp;
					}
				);
			}
			str = str.replace("<num>",
				deck.num(6)
			);
			str = str.replace("<num_>",
				deck.num(5,true)
			);
			str = str.replace("<num_z>",
				deck.num(3,false,true)
			);
			str = str.replace("<num_z_zh>",
				Hanzi[parseInt(deck.num(3,false,true))]
			);
			str = str.replace("<num_z_nor>",
				deck.num(6,false,true,1)
			);
			str = str.replace("<num_z_big>",
				deck.num(10,false,true,3)
			);
			str = str.replace("<num_z_zero>",
				deck.num(5,false,true,0)
			);
			for(var key in deck.limit){
				
				if(str.indexOf("<limit." + key + ">") != -1){
					str = str.replace("<limit." + key + ">",
						function(){
							var chose;
							do{
								safelen++;
								chose = parseInt(Math.random()*((deck.limit[key]).length));
								if(loggg == true) console.log(chose);
							}while((key in limchosen)&&(limchosen[key].includes(chose))&&safelen < SAFE);
							if(loggg == true) console.log(chose);
							if(loggg == true) console.log(deck.limit[key].length);
							if(loggg == true) console.log((deck.limit[key]).length);
							if(key in limchosen == false){
								limchosen[key] = [];
							}
							limchosen[key].push(chose);
							var temp = deck.limit[key][chose];
							while(temp.search(/:;[\s\S]*;:/) != -1&&safelen < SAFE){
								safelen++;
								var isnone = parseInt(Math.random()*2);
								if(isnone == 1){
									temp = temp.replace(/:;.*;:/,"");
								}else{
									temp = temp.replace(/:;/,"");
									temp = temp.replace(/(.*)(;:)(.*)$/,"$1$3");
								}
							}
							return temp;
						}
					);
				}
			}
			while(str.search(/:;[\s\S]*;:/) != -1&&safelen < SAFE){
				safelen++;
				var isnone = parseInt(Math.random()*2);
				if(isnone == 1){
					str = str.replace(/:;.*;:/,"");
				}else{
					str = str.replace(/:;/,"");
					str = str.replace(/(.*)(;:)(.*)$/,"$1$3");
				}
			}
		}
		if(loggg == true) console.log(safelen);
		var cst = costdeck[parseInt(Math.random()*costdeck.length)];
		var power = weitiaodeck[parseInt(Math.random()*weitiaodeck.length)] + 2*cst + 2;
		if(str.search(/获胜/) != -1||str.search(/失败/) != -1){
			cst -= 2;
			str += '\n(谜神的卡牌)'
		}
		str = (cst > 0 ? cst : 0) + '/' + (power > 0 ? power : 3) + '\n' + str;
	}else{//法术
		do{
			chosemode = parseInt(Math.random()*deck.mode.length);
		}while(deck.mode[chosemode][1] == 0);
		xg = deck.mode[chosemode][2];
		str = deck.mode[chosemode][0];
		if(str.search(/竞赛/) != -1) fzx = 1;
		if(loggg == true) console.log(str);
		if(loggg == true) console.log(chosemode);
		while(((checkhaskey(str) == true)||(str.search(/:;/) != -1||str.search(/;:/) != -1))&&safelen < SAFE){
			safelen++;
			if(loggg == true) console.log(str);
			if(str.indexOf("<word>") != -1){
				str = str.replace("<word>",
					function(){
						var chose;
						do{
							safelen++;
							chose = parseInt(Math.random()*deck.word.length);
						}while((chosenid.includes(deck.word[chose][0]))&&safelen < SAFE);
						chosenid.push(deck.word[chose][0]);
						if(loggg == true) console.log(deck.word[chose][1]);
						return deck.word[chose][1];
					}
				);
			}
			
			while(str.indexOf("<timepoint>") != -1&&safelen < SAFE){
				
				safelen++;
				str = str.replace("<timepoint>",
					function(){
						var chose;
						do{
							safelen++;
							chose = parseInt(Math.random()*deck.timepoint.length);
						}while((chosenid.includes(deck.timepoint[chose][0])||deck.timepoint[chose][2]==0)&&safelen < SAFE);
						if(deck.timepoint[chose][3] == 0) fzx = 1;
						chosenid.push(deck.timepoint[chose][0]);
						if(loggg == true) console.log(deck.timepoint[chose][1]);
						if(loggg == true) console.log(chose);
						var temp = deck.timepoint[chose][1];
						while(temp.search(/:;[\s\S]*;:/) != -1&&safelen < SAFE){
							safelen++;
							var isnone = parseInt(Math.random()*2);
							if(isnone == 1){
								temp = temp.replace(/:;.*;:/,"");
							}else{
								temp = temp.replace(/:;/,"");
								temp = temp.replace(/(.*)(;:)(.*)$/,"$1$3");
							}
						}
						return temp;
					}
				);
			}
			if(str.indexOf("<if>") != -1){
				str = str.replace("<if>",
					function(){
						var chose;
						do{
							safelen++;
							chose = parseInt(Math.random()*deck["if"].length);
						}while(deck["if"][chose][1] == 0&&safelen < SAFE)
						if(loggg == true) console.log(deck["if"][chose][0]);
						var temp = deck["if"][chose][0];
						while(temp.search(/:;[\s\S]*;:/) != -1&&safelen < SAFE){
							safelen++;
							var isnone = parseInt(Math.random()*2);
							if(isnone == 1){
								temp = temp.replace(/:;.*;:/,"");
							}else{
								temp = temp.replace(/:;/,"");
								temp = temp.replace(/(.*)(;:)(.*)$/,"$1$3");
							}
						}
						return temp;
					}
				);
			}
			if(str.indexOf("<effect>") != -1){
				str = str.replace("<effect>",
					function(){
						var chose;
						do{
							safelen++;
							chose = parseInt(Math.random()*deck["effect"].length);
						}while((deck["effect"][chose][1]==0||deck["effect"][chose][3] < fzx||efchosen.includes(chose)||deck['effect'][chose][2] == (xg^1))&&safelen < SAFE);
						efchosen.push(chose);
						if(loggg == true) console.log(deck["effect"][chose][0]);
						var temp = deck["effect"][chose][0];
						while(temp.search(/:;[\s\S]*;:/) != -1&&safelen < SAFE){
							safelen++;
							var isnone = parseInt(Math.random()*2);
							if(isnone == 1){
								temp = temp.replace(/:;.*;:/,"");
							}else{
								temp = temp.replace(/:;/,"");
								temp = temp.replace(/(.*)(;:)(.*)$/,"$1$3");
							}
						}
						return temp;
					}
				);
			}
			str = str.replace("<num>",
				deck.num(6)
			);
			str = str.replace("<num_>",
				deck.num(5,true)
			);
			str = str.replace("<num_z>",
				deck.num(3,false,true)
			);
			str = str.replace("<num_z_zh>",
				Hanzi[parseInt(deck.num(3,false,true))]
			);
			str = str.replace("<num_z_nor>",
				deck.num(6,false,true,1)
			);
			str = str.replace("<num_z_big>",
				deck.num(10,false,true,3)
			);
			str = str.replace("<num_z_zero>",
				deck.num(5,false,true,0)
			);
			for(var key in deck.limit){
				
				if(str.indexOf("<limit." + key + ">") != -1){
					str = str.replace("<limit." + key + ">",
						function(){
							var chose;
							do{
								safelen++;
								chose = parseInt(Math.random()*((deck.limit[key]).length));
								if(loggg == true) console.log(chose);
							}while((key in limchosen)&&(limchosen[key].includes(chose))&&safelen < SAFE);
							if(loggg == true) console.log(chose);
							if(loggg == true) console.log(deck.limit[key].length);
							if(loggg == true) console.log((deck.limit[key]).length);
							if(key in limchosen == false){
								limchosen[key] = [];
							}
							limchosen[key].push(chose);
							var temp = deck.limit[key][chose];
							while(temp.search(/:;[\s\S]*;:/) != -1&&safelen < SAFE){
								safelen++;
								var isnone = parseInt(Math.random()*2);
								if(isnone == 1){
									temp = temp.replace(/:;.*;:/,"");
								}else{
									temp = temp.replace(/:;/,"");
									temp = temp.replace(/(.*)(;:)(.*)$/,"$1$3");
								}
							}
							return temp;
						}
					);
				}
			}
			while(str.search(/:;[\s\S]*;:/) != -1&&safelen < SAFE){
				safelen++;
					var isnone = parseInt(Math.random()*2);
					if(isnone == 1){
						str = str.replace(/:;.*;:/,"");
					}else{
						str = str.replace(/:;/,"");
						str = str.replace(/(.*)(;:)(.*)$/,"$1$3");
					}
				}
		}
		if(loggg == true) console.log(safelen);
		var cst = fscostdeck[parseInt(Math.random()*fscostdeck.length)];
		if(str.search(/竞赛/) != -1) cst = 0;
		if(str.search(/获胜/) != -1||str.search(/失败/) != -1){
			cst -= 2;
			str += '\n(谜神的卡牌)'
		}
		
		str = (cst >= 0 ? cst : 0) + 'c\n' + str;
	}
	return str;
}
function checkhaskey(str){
	for(var i = 0;i < str.length;i++){
		if(str[i] == '<') return true;
	}
	return false;
}
var deck = {
	'mode':[
		['<timepoint>：如果<if>，<effect>',0,0],//[...,/*0:生物,1:法术,2:皆可*/,/*0:瞬时,1:光环*/]
		['<timepoint>：如果<if>，<effect>',0,0],
		['<timepoint>：如果<if>，<effect>',0,0],
		['<timepoint>：如果<if>，<effect>',0,0],
		['<timepoint>：如果<if>，<effect>',0,0],
		['<timepoint>：如果<if>，<effect>',0,0],
		['<timepoint>：<effect>',0,0],
		['<timepoint>：<effect>',0,0],
		['<timepoint>：<effect>',0,0],
		['<timepoint>：<effect>',0,0],
		['<timepoint>：<effect>',0,0],
		['<timepoint>：<effect>',0,0],
		
		['<timepoint>：<effect>，如果<if>，<effect>',0,0],
		['<timepoint>，<timepoint>：如果<if>，<effect>',0,0],
		['<timepoint>，<timepoint>：<effect>',0,0],
		['<timepoint>，<timepoint>，<timepoint>：<effect>',0,0],
		['<timepoint>，<timepoint>，<timepoint>：<effect>',0,0],
		['<timepoint>：<effect>。<timepoint>：<effect>',0,0],
		['<timepoint>：<effect>。<timepoint>：<effect>',0,0],
		['<word>。<timepoint>：<effect>',0,0],
		['<word>。<timepoint>：<effect>',0,0],
		['<word>。<timepoint>：<effect>',0,0],
		['<word>。<timepoint>：<effect>',0,0],
		['<word>。<timepoint>：<effect>',0,0],
		['<word>。<timepoint>：<effect>',0,0],
		['<word>。<timepoint>：如果<if>，<effect>',0,0],
		['<word>。<timepoint>：如果<if>，<effect>',0,0],
		['<word>。<timepoint>：如果<if>，<effect>',0,0],
		['<word>，<word>。<timepoint>：<effect>',0,0],
		['<word>，<word>',0,0],
		['<word>',0,0],
		
		['<word>，<word>。<effect>',0,1],
		['<word>。<effect>',0,1],
		['<if>时，<timepoint>，<effect>',2,1],
		['<if>时，<timepoint>，<effect>',0,1],
		['<if>时，<timepoint>，<effect>',1,1],
		['<effect>',1,0],
		['<effect>，然后<effect>',1,0],
		['<effect>',1,0],
		['<effect>，然后<effect>',1,0],
		['<effect>',1,0],
		['<effect>，然后<effect>',1,0],
		['<effect>',1,0],
		['<effect>，然后<effect>',1,0],
		['<effect>',1,0],
		['<effect>，然后<effect>',1,0],
		['<effect>',1,0],
		['<effect>，然后<effect>',1,0],
		['<effect>',1,0],
		['<effect>，然后<effect>',1,0],
		['<effect>',1,0],
		['<effect>，然后<effect>',1,0],
		['<effect>',1,0],
		['<effect>，然后<effect>',1,0],
		['<effect>',1,0],
		['<effect>，然后<effect>',1,0],
		['如果<if>，<effect>',1,0],
		['如果<if>，<effect>',1,0],
		['如果<if>，<effect>',1,0],
		['如果<if>，<effect>',1,0],
		['如果<if>，<effect>',1,0],
		['如果<if>，<effect>',1,0],
		['如果<if>，<effect>',1,0],
		['<effect>。<timepoint>，<effect>',1,0],
		['<effect>',1,1],
		['竞赛(<num_z>)：<timepoint>，<if>。奖励：<effect>:;，然后重启竞赛;:',1,0]
	],
	'timepoint':[
		[0,"技能(<num_>)",0,0],//id,...,/*0生物,1法术,2皆可*/,/*0皆可,1非指向*/
		[7,"进场时",0,0],
		[2,"死亡时",0,1],
		[3,"被代替时",0,1],
		[4,"你的回合结束时",2,1],
		[4,"出牌阶段开始时",2,1],
		[5,"威吓",0,1],
		[7,"后备",0,1],
		[8,"<limit.player_>超载(<num_z>)时",2,1],
		[11,"对峙",0,1],
		[12,"支援",0,1],
		[13,"被攻击后",0,1],
		[14,"占领据点后",0,1],
		[41,"敌方回合结束时",2,1],
		[42,"任一方回合结束时",2,1],
		//===============================
		[100,"<limit.player_>使用一张<limit.legacy>牌后",2,1],
		[100,"<limit.player_>使用一张<limit.legacy>生物牌后",2,1],
		[100,"<limit.player_>使用一张<limit.legacy>法术牌后",2,1],
		[101,"每当一个<limit.belong_1>:;<limit.legacy>;:生物死亡后",2,1],
		[101,"每当一个<limit.belong_1><limit.legacy>生物进场后",2,1],
		[101,"每当一个<limit.belong_1><limit.legacy>生物被代替后",2,1],
		[101,"每当一个<limit.belong_1><limit.legacy>生物被攻击后",2,1],
		[102,"每当<limit.player_>抽一张牌",2,1],
		[102,"<limit.belong_1>在本回合使用<num_z_zh>张牌后",2,1]
	],
	'word':[
		[5,"威吓",0],//id,...,/*0生物,1法术,2皆可*/
		[6,"守军",0],
		[7,"后备",0],
		[9,"不屈",0],
		[10,"护盾",0]
	],
	'if':[
		["超载(<num_z>)",1],//...,/*0生物，1皆可*/
		["没有超载(<num_z>)",1],
		["<limit.time>，<limit.player>超载(<num_z>)",1],
		["<limit.time>，<limit.player>没有超载(<num_z>)",1],
		["在<limit.location>",1],
		["在<limit.location>或<limit.location>",1],
		["<limit.location>或<limit.location>为空",1],
		["<limit.location>为空",1],
		["没有可以使用的手牌",1],
		["<limit.belong_>能量为0",1],
		["<limit.belong_>能量不少于<num_z>",1],
		["<limit.belong_>能量不多于<num_z>",1],
		["双方能量相同",1],
		["牌面描述为黄色",1],
		["牌面描述为白色",1],
		["手上只有生物牌",1],
		["手上只有法术牌",1],
		["手上还有同名牌",1],
		["<limit.time>，<limit.player>使用过<num_z_zh>张<limit.legacy>牌",1],
		//["手上有<name>",1],
		["你生物更少",1],
		["敌方生物更少",1],
		["你生物更多",1],
		["敌方生物更多",1],
		["你手牌更少",1],
		["敌方手牌更少",1],
		["你手牌更多",1],
		["敌方手牌更多",1],
		["你能量更少",1],
		["敌方能量更少",1],
		["你能量更多",1],
		["敌方能量更多",1],
		["<limit.location>的所有牌面描述各不相同",1],
		["<limit.location>的所有能耗各不相同",1],
		["<limit.location>的所有力量各不相同",1],
		["<limit.belong_>据点为空",1],
		["<limit.player>占领着据点",1],
		["<limit.time>有<limit.belong>生物死亡",1],
		["<limit.time>没有<limit.belong>生物死亡",1],
		["<limit.player>有三个生物",1],
		["没有生物",1],
		["没有友方生物",1],
		["没有敌方生物",1],
		//====================
		["没有对位生物",0],
		["自身力量不为白色",0],
		["自身力量为白色",0],
		["自身力量为黄色",0],
		["自身力量为绿色",0],
		["有力量更高的敌方生物",0],
		["有力量更低的敌方生物",0],
		["有力量相同的敌方生物",0],
		["有力量更高的友方生物",0],
		["有力量更低的友方生物",0],
		["有力量相同的友方生物",0],
		["有力量更高的生物",0],
		["有力量更低的生物",0],
		["有力量相同的生物",0],
		["是最高力量",0],
		["是最低力量",0],
		["其他两个场地都有友方生物",0],
		["在<limit.land>",0],
		["在<limit.land>或<limit.land>",0],
		["不大于<num_z_big>",0],
		["不小于<num_z_big>",0]
	],
	'effect':[
		["对位生物-<num_z_nor>",0,2,1],//...,/*0生物，1法术，2皆可*/,/*0瞬时,1光环,2皆可*/,/*0指向,1非指向*/
		["对位生物+<num_z_nor>",0,2,1],
		["其他友方生物-<num_z_nor>",0,2,1],
		["其他友方生物+<num_z_nor>",0,2,1],
		["所有敌方生物-<num_z_nor>",2,2,1],
		["所有敌方生物+<num_z_nor>",2,2,1],
		["随机一个友方生物:;永久;:-<num_z_nor>",2,0,1],
		["随机一个友方生物:;永久;:+<num_z_nor>",2,0,1],
		["随机一个敌方生物:;永久;:-<num_z_nor>",2,0,1],
		["随机一个敌方生物:;永久;:+<num_z_nor>",2,0,1],
		["所有生物-<num_z_nor>",2,2,1],
		["所有生物+<num_z_nor>",2,2,1],
		["使一个生物:;永久;:+<num_z_nor>",2,0,0],
		["使一个生物:;永久;:-<num_z_nor>",2,0,0],
		["使一个友方生物:;永久;:+<num_z_nor>",2,0,0],
		["使一个友方生物:;永久;:-<num_z_nor>",2,0,0],
		["使一个敌方生物:;永久;:+<num_z_nor>",2,0,0],
		["使一个敌方生物:;永久;:-<num_z_nor>",2,0,0],
		["使你<limit.location_>的所有生物牌:;永久;:-<num_z_nor>",2,0,0],
		["使你<limit.location_>的所有生物牌:;永久;:+<num_z_nor>",2,0,0],
		["使敌方<limit.location_>的所有生物牌:;永久;:-<num_z_nor>",2,0,0],
		["使敌方<limit.location_>的所有生物牌:;永久;:+<num_z_nor>",2,0,0],
		["使<limit.land>的友方生物+<num_z_nor>",2,0,1],
		["使<limit.land>的友方生物-<num_z_nor>",2,0,1],
		["使<limit.land>的敌方生物+<num_z_nor>",2,0,1],
		["使<limit.land>的敌方生物-<num_z_nor>",2,0,1],
		["使<limit.land>的生物+<num_z_nor>",2,0,1],
		["使<limit.land>的生物-<num_z_nor>",2,0,1],
		["使<limit.clocation>友方生物+<num_z_nor>",2,0,1],
		["使<limit.clocation>友方生物-<num_z_nor>",2,0,1],
		["使<limit.clocation>敌方生物+<num_z_nor>",2,0,1],
		["使<limit.clocation>敌方生物-<num_z_nor>",2,0,1],
		["使<limit.clocation>生物+<num_z_nor>",2,0,1],
		["使<limit.clocation>生物-<num_z_nor>",2,0,1],
		["<limit.land>的友方生物+<num_z_nor>",2,1,1],
		["<limit.land>的友方生物-<num_z_nor>",2,1,1],
		["<limit.land>的敌方生物+<num_z_nor>",2,1,1],
		["<limit.land>的敌方生物-<num_z_nor>",2,1,1],
		["<limit.land>的生物+<num_z_nor>",2,1,1],
		["<limit.land>的生物-<num_z_nor>",2,1,1],
		["使<limit.belong_2_>牌库的前<num_z_zh>张生物牌+<num_z>",2,0,1],
		["使<limit.belong_2_>牌库的前<num_z_zh>张生物牌-<num_z>",2,0,1],
		["使<limit.belong_2_>牌库的前<num_z_zh>张牌能耗+<num_z>",2,0,1],
		["使<limit.belong_2_>牌库的前<num_z_zh>张牌能耗-<num_z>",2,0,1],
		["使一个偶数力量的生物减半",2,0,0],
		["使一个:;友方;:生物变为<num_z_nor>",2,0,0],
		["使一个:;敌方;:生物变为<num_z_nor>",2,0,0],
		["使一个:;友方;:生物变为12",2,0,0],
		["使一个:;敌方;:生物变为12",2,0,0],
		["使一个:;友方;:生物变为6",2,0,0],
		["使一个:;敌方;:生物变为6",2,0,0],
		["使一个:;友方;:生物变为1",2,0,0],
		["使一个:;敌方;:生物变为1",2,0,0],
		["使所有偶数力量的生物减半",2,0,0],
		["使所有奇数力量的生物:;永久;:-<num_z>",2,0,0],
		["使所有奇数力量的生物:;永久;:+<num_z>",2,0,0],
		["使所有偶数力量的生物:;永久;:-<num_z>",2,0,0],
		["使所有偶数力量的生物:;永久;:+<num_z>",2,0,0],
		["消灭一个生物",2,0,0],
		["消灭一个友方生物",2,0,0],
		["消灭一个敌方生物",2,0,0],
		["消灭一个<limit.legacy>生物",2,0,0],
		["消灭一个<limit.legacy>友方生物",2,0,0],
		["消灭一个<limit.legacy>敌方生物",2,0,0],
		["消灭一个<word>生物",2,0,0],
		["消灭一个<word>或<word>生物",2,0,0],
		["消灭一个<word>，<word>或<word>生物",2,0,0],
		["随机消灭一个生物",2,0,1],
		["随机消灭一个友方生物",2,0,1],
		["随机消灭一个敌方生物",2,0,1],
		["随机消灭一个<limit.legacy>生物",2,0,1],
		["随机消灭一个<limit.legacy>友方生物",2,0,1],
		["随机消灭一个<limit.legacy>敌方生物",2,0,1],
		["消灭一个不大于<num_z_nor>的生物",2,0,0],
		["消灭一个不大于<num_z_nor>的友方生物",2,0,0],
		["消灭一个不大于<num_z_nor>的敌方生物",2,0,0],
		["消灭一个不小于<num_z_nor>的生物",2,0,0],
		["消灭一个不小于<num_z_nor>的友方生物",2,0,0],
		["消灭一个不小于<num_z_nor>的敌方生物",2,0,0],
		["消灭一个不大于<num_z_big>的生物",2,0,0],
		["消灭一个不大于<num_z_big>的友方生物",2,0,0],
		["消灭一个不大于<num_z_big>的敌方生物",2,0,0],
		["消灭一个不小于<num_z_big>的生物",2,0,0],
		["消灭一个不小于<num_z_big>的友方生物",2,0,0],
		["消灭一个不小于<num_z_big>的敌方生物",2,0,0],
		["消灭一个相同力量的敌方生物",0,0,0],
		["消灭一个相同力量的生物",0,0,0],
		["消灭一个相同力量的友方生物",0,0,0],
		["随机消灭一个相同力量的敌方生物",0,0,1],
		["随机消灭一个相同力量的生物",0,0,1],
		["随机消灭一个相同力量的友方生物",0,0,1],
		["消灭其他友方生物",0,0,1],
		["消灭所有友方生物",2,0,1],
		["消灭所有敌方生物",2,0,1],
		["死亡:;，然后重新召唤自身;:",0,0,1],
		["消灭对位生物",0,0,1],
		["消灭一个<limit.clocation>生物",2,0,0],
		
		["冰冻一个生物",2,0,0],
		["冰冻一个友方生物",2,0,0],
		["冰冻一个敌方生物",2,0,0],
		["冰冻一个<limit.legacy>生物",2,0,0],
		["冰冻一个<limit.legacy>友方生物",2,0,0],
		["冰冻一个<limit.legacy>敌方生物",2,0,0],
		["随机冰冻一个生物",2,0,1],
		["随机冰冻一个友方生物",2,0,1],
		["随机冰冻一个敌方生物",2,0,1],
		["随机冰冻一个<limit.legacy>生物",2,0,1],
		["随机冰冻一个<limit.legacy>友方生物",2,0,1],
		["随机冰冻一个<limit.legacy>敌方生物",2,0,1],
		["冰冻一个不大于<num_z_nor>的生物",2,0,0],
		["冰冻一个不大于<num_z_nor>的友方生物",2,0,0],
		["冰冻一个不大于<num_z_nor>的敌方生物",2,0,0],
		["冰冻一个不小于<num_z_nor>的生物",2,0,0],
		["冰冻一个不小于<num_z_nor>的友方生物",2,0,0],
		["冰冻一个不小于<num_z_nor>的敌方生物",2,0,0],
		["冰冻一个不大于<num_z_big>的生物",2,0,0],
		["冰冻一个不大于<num_z_big>的友方生物",2,0,0],
		["冰冻一个不大于<num_z_big>的敌方生物",2,0,0],
		["冰冻一个不小于<num_z_big>的生物",2,0,0],
		["冰冻一个不小于<num_z_big>的友方生物",2,0,0],
		["冰冻一个不小于<num_z_big>的敌方生物",2,0,0],
		["冰冻一个相同力量的敌方生物",0,0,0],
		["冰冻一个相同力量的生物",0,0,0],
		["冰冻一个相同力量的友方生物",0,0,0],
		["随机冰冻一个相同力量的敌方生物",0,0,1],
		["随机冰冻一个相同力量的生物",0,0,1],
		["随机冰冻一个相同力量的友方生物",0,0,1],
		["冰冻其他友方生物",0,0,1],
		["冰冻所有友方生物",2,0,1],
		["冰冻所有敌方生物",2,0,1],
		["冰冻对位生物",0,0,1],
		["冰冻自身",0,0,1],
		["冰冻一个<limit.clocation>生物",2,0,0],
		["解冻一个生物",2,0,0],
		["解冻一个友方生物",2,0,0],
		["解冻一个敌方生物",2,0,0],
		
		["攻击",0,0,1],
		["立即攻击",0,0,1],
		["放弃据点",0,0,1],
		["所有<limit.belong_1>生物放弃据点",2,0,1],
		["占领据点",0,0,1],
		["抢夺敌方空据点",0,0,1],
		
		["获得“<timepoint>：召唤<num_z_zh>个<limit.pscard_sw>”",0,0,1],
		["使一个生物获得“<timepoint>：召唤<num_z_zh>个<limit.pscard_sw>”",2,0,0],
		["所有<limit.belong_1>生物获得“<timepoint>：召唤<num_z_zh>个<limit.pscard_sw>”",2,0,1],
		
		["+<num_z>:;，或获得“<word>”;:",0,0,1],
		["-<num_z>:;，或立即攻击”;:",0,0,1],
		["-<num_z>:;，或召唤<num_z_zh>个<limit.pscard_sw>”;:",0,0,1],
		
		["双方各抽<num_z_zh>张:;生物;:牌",2,0,1],
		["双方各抽<num_z_zh>张:;法术;:牌",2,0,1],
		["抽<num_z_zh>张:;<num_z_zero>能耗;:牌",2,0,1],
		["抽<num_z_zh>张:;<num_z_zero>能耗的;:生物牌",2,0,1],
		["抽<num_z_zh>张:;<num_z_zero>能耗的;:法术牌",2,0,1],
		["抽<num_z_zh>张:;能耗不小于<num_z_zero>的;:生物牌",2,0,1],
		["抽<num_z_zh>张:;能耗不大于<num_z_zero>;:法术牌",2,0,1],
		["抽<num_z_zh>张:;<num_z_nor>力量的;:生物牌",2,0,1],
		["抽<num_z_zh>张:;力量更高的;:生物牌",0,0,1],
		["抽<num_z_zh>张:;力量更低的;:生物牌",0,0,1],
		["抽<num_z_zh>张:;力量不小于<num_z_nor>的;:生物牌",2,0,1],
		["抽<num_z_zh>张:;力量不大于<num_z_nor>的;:生物牌",2,0,1],
		
		["召唤<num_z_zh>个复制",0,0,1],
		["召唤<num_z_zh>个力量相同的复制",0,0,1],
		[":;敌方;:召唤<num_z_zh>个-<num_z>的复制",0,0,1],
		
		["弃<num_z_zh>张牌",2,0,1],
		["弃<num_z_zh>张生物牌",2,0,1],
		["弃<num_z_zh>张法术牌",2,0,1],
		["弃掉你手上最左边的牌",2,0,1],
		["弃掉你手上最右边的牌",2,0,1],
		["弃掉敌方手上最左边的牌",2,0,1],
		["弃掉敌方手上最右边的牌",2,0,1],
		["敌方抽<num_z_zh>张牌",2,0,1],
		["敌方弃<num_z_zh>张牌",2,0,1],
		["敌方抽<num_z_zh>张生物牌",2,0,1],
		["敌方弃<num_z_zh>张法术牌",2,0,1],
		
		["挑选一张<limit.legacy>牌",2,0,1],
		["挑选一张<limit.legacy>生物牌",2,0,1],
		["挑选一张<limit.legacy>法术牌",2,0,1],
		["挑选一张<num_z_nor>能耗牌",2,0,1],
		["挑选一张力量更高的生物牌",0,0,1],
		["挑选一张力量更低的生物牌",0,0,1],
		["挑选一张相同力量的生物牌",0,0,1],
		["挑选一张力量不大于<num_z_big>的生物牌",2,0,1],
		["挑选一张力量不小于<num_z_big>的生物牌",2,0,1],
		["挑选一张力量不大于<num_z_nor>的生物牌",2,0,1],
		["挑选一张力量不小于<num_z_nor>的生物牌",2,0,1],
		["挑选一张能耗不大于<num_z_nor>的牌",2,0,1],
		["挑选一张能耗不小于<num_z_nor>的牌",2,0,1],
		["挑选一张能耗相同的牌",2,0,1],
		["挑选一张能耗相同的生物牌",2,0,1],
		["挑选一张能耗相同的法术牌",2,0,1],
		["挑选一张能耗不大于<num_z_nor>的生物牌",2,0,1],
		["挑选一张能耗不小于<num_z_nor>的生物牌",2,0,1],
		["挑选一张能耗不大于<num_z_nor>的法术牌",2,0,1],
		["挑选一张能耗不小于<num_z_nor>的法术牌",2,0,1],
		
		["从<limit.belong_3><limit.location_>挑选一张<limit.legacy>牌",2,0,1],
		["从<limit.belong_3><limit.location_>挑选一张<limit.legacy>生物牌",2,0,1],
		["从<limit.belong_3><limit.location_>挑选一张<limit.legacy>法术牌",2,0,1],
		["从<limit.belong_3><limit.location_>挑选一张<num_z_nor>能耗牌",2,0,1],
		["从<limit.belong_3><limit.location_>挑选一张力量更高的生物牌",0,0,1],
		["从<limit.belong_3><limit.location_>挑选一张力量更低的生物牌",0,0,1],
		["从<limit.belong_3><limit.location_>挑选一张相同力量的生物牌",0,0,1],
		["从<limit.belong_3><limit.location_>挑选一张力量不大于<num_z_big>的生物牌",2,0,1],
		["从<limit.belong_3><limit.location_>挑选一张力量不小于<num_z_big>的生物牌",2,0,1],
		["从<limit.belong_3><limit.location_>挑选一张力量不大于<num_z_nor>的生物牌",2,0,1],
		["从<limit.belong_3><limit.location_>挑选一张力量不小于<num_z_nor>的生物牌",2,0,1],
		["从<limit.belong_3><limit.location_>挑选一张能耗不大于<num_z_nor>的牌",2,0,1],
		["从<limit.belong_3><limit.location_>挑选一张能耗不小于<num_z_nor>的牌",2,0,1],
		["从<limit.belong_3><limit.location_>挑选一张能耗不大于<num_z_nor>的生物牌",2,0,1],
		["从<limit.belong_3><limit.location_>挑选一张能耗不小于<num_z_nor>的生物牌",2,0,1],
		["从<limit.belong_3><limit.location_>挑选一张能耗不大于<num_z_nor>的法术牌",2,0,1],
		["从<limit.belong_3><limit.location_>挑选一张能耗不小于<num_z_nor>的法术牌",2,0,1],
		
		["从<limit.belong_3><limit.location_>挑选一张<limit.legacy>牌变成<limit.pscard>",2,0,1],
		["从<limit.belong_3><limit.location_>挑选一张<limit.legacy>生物牌变成<limit.pscard>",2,0,1],
		["从<limit.belong_3><limit.location_>挑选一张<limit.legacy>法术牌变成<limit.pscard>",2,0,1],
		
		["从你的<limit.location_>随机召唤一个生物",2,0,1],
		["从敌方<limit.location_>随机召唤一个生物",2,0,1],
		["敌方从你的<limit.location_>随机召唤一个生物",2,0,1],
		["敌方从其<limit.location_>随机召唤一个生物",2,0,1],
		["从你的<limit.location_>随机召唤一个力量更高的生物",0,0,1],
		["从你的<limit.location_>随机召唤一个力量更低的生物",0,0,1],
		["从你的<limit.location_>随机召唤一个相同力量的生物",0,0,1],
		["从你的<limit.location_>随机召唤一个能耗相同的生物",2,0,1],
		["从你的<limit.location_>随机召唤一个力量不大于<num_z_big>的生物",2,0,1],
		["从你的<limit.location_>随机召唤一个力量不小于<num_z_big>的生物",2,0,1],
		["从你的<limit.location_>随机召唤一个力量不大于<num_z_nor>的生物",2,0,1],
		["从你的<limit.location_>随机召唤一个力量不小于<num_z_nor>的生物",2,0,1],
		["从你的<limit.location_>随机召唤一个能耗不大于<num_z_nor>的生物",2,0,1],
		["从你的<limit.location_>随机召唤一个能耗不小于<num_z_nor>的生物",2,0,1],
		["从敌方弃牌堆召唤最后一个生物",2,0,1],
		["从你的弃牌堆召唤最后一个生物",2,0,1],
		["召唤敌方牌库顶第一个生物的复制",2,0,1],
		["召唤你的牌库顶第一个生物",2,0,1],
		["挑选一张力量更高的生物牌召唤",0,0,1],
		["挑选一张力量更低的生物牌召唤",0,0,1],
		["挑选一张相同力量的生物牌召唤",0,0,1],
		["挑选一张能耗相同的生物牌召唤",2,0,1],
		["挑选一张力量不大于<num_z_big>的生物牌召唤",2,0,1],
		["挑选一张力量不小于<num_z_big>的生物牌召唤",2,0,1],
		["挑选一张力量不大于<num_z_nor>的生物牌召唤",2,0,1],
		["挑选一张力量不小于<num_z_nor>的生物牌召唤",2,0,1],
		["挑选一张能耗不大于<num_z_nor>的生物牌召唤",2,0,1],
		["挑选一张能耗不小于<num_z_nor>的生物牌召唤",2,0,1],
		
		["从<limit.location_>:;或<limit.location_>;:召唤自身",0,0,1],
		
		
		["左边的生物-<num_z>，右边的生物-<num_z>",0,1,1],
		["左边的生物+<num_z>，右边的生物-<num_z>",0,1,1],
		["左边的生物+<num_z>，右边的生物+<num_z>",0,1,1],
		["左边的生物-<num_z>，右边的生物+<num_z>",0,1,1],
		
		["将自身洗回牌库",2,0,1],
		["弃掉自身",2,0,1],
		["弃掉<limit.belong_2_><limit.location_>所有能耗最高的牌",2,0,1],
		["弃掉<limit.belong_2_><limit.location_>所有能耗最低的牌",2,0,1],
		["复制<limit.belong_2_><limit.location_>所有能耗最高的牌",2,0,1],
		["复制<limit.belong_2_><limit.location_>所有能耗最低的牌",2,0,1],
		["将自身移回手牌",2,0,1],
		["将一个<limit.belong_1><limit.location_>生物洗回牌库",2,0,0],
		["将一个<limit.belong_1>生物洗回牌库",2,0,0],
		["将一个<limit.belong_1><limit.location_>生物移回手牌",2,0,0],
		["将一个<limit.belong_1>生物移回手牌",2,0,0],
		["将所有:;<limit.belong_1>;:生物移回手牌",2,0,0],
		
		["选择一个<limit.belong_1>生物，各将<num_z_zh>张复制置入双方<limit.location_>",2,0,0],
		
		["置入:;敌方;:手牌",2,0,1],
		
		["移动到你的随机空场地",0,0,1],
		["使一个<limit.belong_1>生物移动到随机同方空场地",2,0,0],
		["使一个<limit.belong_1>生物移动到随机同方空场地，并获得“<word>”",2,0,0],
		["使一个<limit.belong_1>生物移动到随机同方空场地，然后立即攻击",2,0,0],
		["使一个<limit.belong_1>生物立即攻击",2,0,0],
		
		["使一个<limit.belong_1>生物获得“<timepoint>：<effect>”",2,0,0],
		["使一个<limit.belong_1>生物获得“<word>”",2,0,0],
		
		
		["将所在场地变成<limit.land>",0,0,1],
		["将所在场地变成<limit.land>，并使其上所有<limit.belong_1>生物+<num_z>",0,0,1],
		["将所在场地变成<limit.land>，并使其上所有<limit.belong_1>生物-<num_z>",0,0,1],
		
		["从<limit.belong_3><limit.location_>挑选一张牌弃掉，增加等于其能耗的力量",0,0,1],
		["从<limit.belong_3><limit.location_>挑选一张生物牌弃掉，增加等于其<limit.creationnumber>的力量",0,0,1],
		
		["与对位生物交换",0,0,1],
		["复制对位生物的牌面描述",0,0,1],
		["复制一个<limit.belong_1>生物的牌面描述",0,0,0],
		
		["获得<num_z_zh>张<limit.pscard>:;，然后立即结束回合;:",2,0,1],
		["敌方获得<num_z_zh>张<limit.pscard>:;，然后立即结束回合;:",2,0,1],
		[":;敌方;:获得<num_z_zh>张<num_z_zero>能耗牌",2,0,1],
		["获得<num_z_zh>张<num_z_zero>能耗牌:;，然后立即结束回合;:",2,0,1],
		["双方各获得<num_z_zh>张<limit.pscard>:;，然后立即结束回合;:",2,0,1],
		
		["能耗-<num_z>",2,0,1],
		["能耗:;永久;:+<num_z>",2,0,1],
		["使你<limit.location_>的牌能耗:;永久;:+<num_z>",2,0,1],
		["使你<limit.location_>的牌能耗-<num_z>",2,0,1],
		["使敌方<limit.location_>的牌能耗:;永久;:+<num_z>",2,0,1],
		["使敌方<limit.location_>的牌能耗-<num_z>",2,0,1],
		["使你手上随机一张牌能耗:;永久;:+<num_z>",2,0,1],
		["使你手上随机一张牌能耗-<num_z>",2,0,1],
		["使敌方手上随机一张牌能耗:;永久;:+<num_z>",2,0,1],
		["使敌方手上随机一张牌能耗-<num_z>",2,0,1],
		
		
		["能量-<num_z>:;，然后立即结束回合;:",2,0,1],
		["能量+<num_z>:;，然后立即结束回合;:",2,0,1],
		["敌方能量-<num_z>",2,0,1],
		["敌方能量+<num_z>",2,0,1],
		["双方能量-<num_z>",2,0,1],
		["双方能量+<num_z>",2,0,1],
		["行动方能量-<num_z>",2,0,1],
		["行动方能量+<num_z>",2,0,1],
		[":;敌方;:能量变为<num_z_zero>",2,0,1],
		["双方能量变为<num_z_zero>",2,0,1],
		
		["消耗<num_z>点能量",2,0,1],
		["消耗<limit.belong_3>所有能量",2,0,1],
		
		["与<limit.belong_3><limit.location_>的随机一张:;法术;:牌交换",2,0,1],
		["与<limit.belong_3><limit.location_>的随机一张:;生物;:牌交换",2,0,1],
		
		["使<limit.belong_2_>获得<num_z_zh>个额外回合",0,0,1],
		
		[":;敌方;:获胜",2,0,1],
		[":;敌方;:失败",2,0,1],
		
		["使用上一个法术",1,0,1],
		
		["变为<num_z_zh>张",2,0,1],
		
		["<limit.time>，+<num_z>",0,0,1],
		["+<num_z>",0,0,1],
		["永久+<num_z>",0,0,1],
		["力量变为能耗的<num_z_zh>倍",0,0,1],
		[":;<limit.belong_2_>;:<limit.location_>每有一张牌，+<num_z>",0,0,1],
		["<limit.belong_2_><limit.location_>每有一张牌，-<num_z>",0,0,1],
		["<limit.belong_2_><limit.location_>每有一张牌，使一个友方生物:;永久;:+<num_z>",2,0,0],
		["<limit.belong_2_><limit.location_>每有一张牌，使一个友方生物:;永久;:-<num_z>",2,0,0],
		["<limit.belong_2_><limit.location_>每有一张牌，使一个生物+<num_z>",2,0,0],
		["<limit.belong_2_><limit.location_>每有一张牌，使一个生物-<num_z>",2,0,0],
		["<limit.belong_><limit.location_>每有一张牌，使一个敌方生物+<num_z>",2,0,0],
		["<limit.belong_><limit.location_>每有一张牌，使一个敌方生物-<num_z>",2,0,0],
		["<limit.belong_2_>手上每有一张不能使用的牌，+<num_z>",0,2,1],
		["<limit.belong_2_>手上每有一张能使用的牌，+<num_z>",0,2,1],
		["<limit.belong_2_>手上每有一张不能使用的牌，-<num_z>",0,2,1],
		["<limit.belong_2_>手上每有一张能使用的牌，-<num_z>",0,2,1],
		["<limit.belong_2_>手上每有一张<limit.legacy>牌，+<num_z>",0,2,1],
		["<limit.belong_2_>手上每有一张<limit.legacy>牌，-<num_z>",0,2,1],
		["<limit.belong_2_>手上每有一张不能使用的牌，使一个<limit.belong_1>生物+<num_z>",2,0,0],
		["<limit.belong_2_>手上每有一张能使用的牌，使一个<limit.belong_1>生物+<num_z>",2,0,0],
		["<limit.belong_2_>手上每有一张不能使用的牌，使一个<limit.belong_1>生物-<num_z>",2,0,0],
		["<limit.belong_2_>手上每有一张能使用的牌，使一个<limit.belong_1>生物-<num_z>",2,0,0],
		["<limit.belong_2_>手上每有一张<limit.legacy>牌，使一个<limit.belong_1>生物+<num_z>",2,0,0],
		["<limit.belong_2_>手上每有一张<limit.legacy>牌，使一个<limit.belong_1>生物-<num_z>",2,0,0],
		
		["召唤<num_z_zh>个<limit.pscard_sw>:;，不能召唤的置入<limit.belong_3><limit.location_>;:",2,0,1],
		["敌方召唤<num_z_zh>个<limit.pscard_sw>:;，不能召唤的置入<limit.belong_3><limit.location_>;:",2,0,1],
		["敌方召唤<num_z_zh>个<limit.pscard_sw>:;，不能召唤的洗入<limit.belong_3><limit.location_>;:",2,0,1],
		["召唤<num_z_zh>个<limit.pscard_sw>:;，不能召唤的洗入<limit.belong_3><limit.location_>;:",2,0,1]
		
		
	],
	'from':[
		
	],
	'buff':[
		[],//...,/*0牌,1生物*/,/*0生物牌,1法术牌,2皆可*/
	],
	'limit':{
		'player':[
			"你",
			"敌方",
			"任一方",
			"行动方"
		],
		'player_':[
			"你",
			"敌方",
			"任一方"
		],
		'belong':[
			"友方",
			"敌方",
			"任一方",
			"行动方",
			""
		],
		'belong_':[
			"你的",
			"敌方",
			"任一方",
			"行动方"
		],
		'belong_1':[
			"友方",
			"敌方",
			'',
			''
		],
		'belong_2':[
			"友方",
			"敌方",
			"行动方"
		],
		'belong_2_':[
			"你",
			"敌方",
			"行动方"
		],
		'belong_3':[
			"你的",
			"敌方"
		],
		'time':[
			'本回合中',
			'上个回合中',
			'本局游戏中'
		],
		'legacy':[
			'其他阵营',
			'矩阵',
			'智械',
			'帝国',
			'联邦',
			'祸岛',
			'蜂巢',
			'',
			'',
			'',
			'',
			'',
			'',
			''
		],
		'land':[
			'山地',
			'平原',
			'海岛',
			'沙漠',
			'森林'
		],
		'location':[
			'场上',
			'牌库',
			'手上',
			'弃牌堆'
		],
		'location_':[
			'牌库',
			'手上',
			'弃牌堆'
		],
		'clocation':[
			'在据点上的',
			'不在据点上的'
		],
		'creationnumber':[
			'能耗',
			'力量'
		],
		'pscard':[
			'入侵',
			'激励',
			'蛹',
			'1/4的魔狼机甲',
			'2/6的魔狼机甲',
			'5/12的魔狼机甲',
			'鬼牌',
			'联合研发',
			'零件堆',
			'肉块',
			'地雷'
		],
		'pscard_fs':[
			'入侵',
			'激励',
			'鬼牌',
			'联合研发',
			'肉块'
		],
		'pscard_sw':[
			'蛹',
			'1/4的魔狼机甲',
			'2/6的魔狼机甲',
			'5/12的魔狼机甲',
			'零件堆',
			'地雷',
			'磁能兔'
		],
		'Pinzhi':[
			'白色',
			'蓝色',
			'紫色',
			'橙色'
		]
	},
	'num':function(n = 6,chara = false,Z = false,least = 1){
		var num = parseInt(Math.random()*n*2 - n);
		if(chara == true){
			return (num > 0 ? '+' : '') + num.toString();
		}else{
			if(Z == true) num = (num > 0?num:-num)+least;
			return num.toString();
		}
	}
}
var costdeck = [
	1,1,1,
	2,2,2,2,
	3,3,3,3,3,
	4,4,4,4,4,
	5,5,5,5,5,
	6,6,6,6,
	7,7,7,
	8,8,
	9,
	10
];
var fscostdeck = [
	0,0,0,0,0,0,0,0,0,
	1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
	2,2,2,2,2,2,2,2,2,2,
	3,3,3,3,3,3,3,3,
	4,4,4,4,
	5,5,5,
	6,6,
	7,
	8,
	9,
	10
]
var weitiaodeck = [
	-3,
	-2,-2,-2,
	-1,-1,-1,-1,-1,-1,
	0,0,0,0,0,
	+1,+1,+1,+1,
	+2,+2,
	+3
]
var Hanzi = [
	"零",
	"一",
	"两",
	"三",
	"四",
	"五",
	"六",
	"七",
	"八",
	"九",
	"十"
]
var gnmax = 65555;
function getstr(str,fssws = -1){
	var temp = loggg;
	loggg = false;
	str = str.replace('(','\\(');
	str = str.replace(')','\\)');
	str = str.replace('\\\\(','(');
	str = str.replace('\\\\)',')');
	str = str.replace('+','\\+');
	str = str.replace('\\\\+','+');
	str = str.replace('-','\\-');
	str = str.replace('\\\\-','-');
	for(var i = 0;i < gnmax;i++){
		var diyget = build(fssws);
		//if(temp == true)console.log(diyget);
		if(diyget.search(str) != -1 || diyget.indexOf(str) != -1) return diyget;
	}
	loggg = temp;
	return '脑洞不够，还没diy到呢。。。';
}
function testtime(ttt = gnmax){
	var temp = loggg;
	loggg = false;
	var t = new Date();
	for(var i = 0;i < ttt;i++){
		build();
	}
	loggg = temp;
	return (new Date()).getTime() - t.getTime();
}
module.exports = {
	build,
	getstr,
	gnmax,
	testtime
}