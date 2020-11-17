"use strict";
//CardModel
class ele{
	id;
	static ids = 0;
	values;//[[key,value]]
	actions;//[[tokey,recipeid,%]]
	constructor(id = this.ids,values = [["Package","BASE"],["name","DEFAULT"]],actions = [],whenget = []){
		this.id = id;
		if(id == this.ids) this.ids++;
		this.values = deepCopy(values);
		this.actions = deepCopy(actions);
		this.whenget = deepCopy(whenget);
	}
	
	GetKeyValue(key = ""){
		if(key == "") return -1;
		for(var i = 0;i < values.length;i++){
			if(values[i][0] == key) return values[i][1];
		}
		return -1;
	}
	
	Change(key = "",value = 0){
		for(var i = 0;i < values.length;i++){
			if(key == this.values[i][0]){
				this.values[i][1] += value;
				return true;
			}
		}
		return false;
	}
	
	Add(key = "",value = 0){
		if(key == "") return false;
		for(var i = 0;i < values.length;i++){
			if(key == this.values[i][0]){
				return false;
			}
		}
		return this.values.push([key,value]);
	}
	
	Delete(key = ""){
		if(key == "") return false;
		for(var i = 0;i < values.length;i++){
			if(key == this.values[i][0]){
				this.values.splice(i,1);
				return true;
			}
		}
		return false
	}
	
	Doaction(tokey = "",recipeArray = [],checkplayer){
		if(tokey = "" || recipeArray.length == 0) return false;
		for(var i = 0;i < this.actions.length;i++){
			if(this.actions[i][0] == tokey){
				var GL = Math.random();
				if(GL >= this.actions[i][2]){
					for(var j = 0;j < recipeArray.length;j++){
						if(recipeArray[j].id == this.actions[i][1]){
							if(recipeArray[j].checkif(checkplayer) == true){
								
							}else{
								continue;
							}
						}else{
							continue;
						}
					}
				}else{
					continue;
				}
			}
		}
		return false;
	}
	static IDtoEle(eles = [],EleArray = []){
		if(eles.length*EleArray.length == 0) return [];
		ELE_ = [];
		for(var i = 0;i < eles.length;i++){
			for(var j = 0;j < EleArray.length;j++){
				if(eles[i] == EleArray[j].id){
					ELE_.push(EleArray[j]);
					break;
				}
			}
		}
		return ELE_;
	}
}
class recipe{
	id;
	static ids = 0;
	elevif;//[[eleid,elenum,key,value/*-x -> num<x,+x -> num >= x*/]]
	eleif;//[[eleid,elenum/*-x -> num<x,+x -> num >= x*/]]
	elevchanges;//[[eleid,elenum,changekey,changevalue]]///2
	elechanges;//[[eleid,elenum]]///3
	drawdeck;//[[deckid,num]]///1
	linked;//[[recipeid,%]]
	constructor(id = this.ids,elevif = [],eleif = [],elevchanges = [],elechanges = [],drawdeck = [],linked = []){
		this.id = id;
		if(id == this.ids) this.ids++;
		this.elevif = deepCopy(elevif);
		this.eleif = deepCopy(eleif);
		this.elevchanges = deepCopy(elevchanges);
		this.elechanges = deepCopy(elechanges);
		this.drawdeck = deepCopy(drawdeck);
		this.linked = deepCopy(linked);
	}
	checkif(checkplayer){
		//elevif
		var tempelev = [],tempele = [];
		for(var i = 0;i < this.elevif.length;i++){
			tempelev.push(0);
		}
		for(var i = 0;i < this.eleif.length;i++){
			tempele.push(0);
		}
		for(var i = 0;i < checkplayer.eles.length;i++){
			for(var j = 0;j < this.elevif.length;j++){
				if(this.elevif[j][0] == checkplayer.eles[i].id &&((this.elevif[j][3] >= 0 && checkplayer.eles[i].GetKeyValue(elevif[j][2]) >= this.elevif[j][3])||(this.elevif[j][3] < 0 && checkplayer.eles[i].GetKeyValue(elevif[j][2]) < -this.elevif[j][3]))){
					tempelev[j]++;
				}
			}
			for(var j = 0;j < this.eleif.length;j++){
				if(this.eleif[j][0] == checkplayer.eles[i].id){
					tempele[j]++;
				}
			}
		}
		for(var j = 0;j < this.elevif.length;j++){
			if(this.elevif[j][1] < tempelev[j]){
				return false;
			}
		}
		for(var j = 0;j < this.eleif.length;j++){
			if(this.eleif[j][1] >= 0){
				if(this.eleif[j][1] < tempele[j]) return false;
			}else{
				if(this.eleif[j][1] >= tempele[j]) return false;
			}
		}
		return true;
	}
	dorecipe(checkplayer){
		//DRAWCARD
		checkplayer.getEle(ele.IDtoEle());
	}
}//[recipe1,recipe2]
class deck{
	id;
	static ids = 0;
	eles_setting;//[eleid]
	defaultele;//eleid
	donemode;//0:抽完循环,1:抽完抽默认,2:抽完则空
	drawmode;//0.每次抽后重置,1.每次抽不重置
	eles;//[eleid]
	constructor(id = this.ids,donemode = 0,drawmode = 0,eles = [],defaultele = -1){
		this.id = id;
		if(id == this.ids) this.ids++;
		this.donemode = donemode;
		this.drawmode = drawmode;
		this.eles_setting = deepCopy(this.eles = deepCopy(eles));
		this.defaultele = defaultele;
	}
	Draw(num = 1){
		var gets = [];
		if(this.eles.length == 0 && this.donemode != 1) return [];
		
		var radm = Math.random();
		if(num == 1){
			if(this.eles.length == 0 && this.donemode == 1){
				gets.push(this.defaultele);
				return gets;
			}
			gets.push(eles[parseInt(radm*eles.length)]);
			this.eles.splice(parseInt(radm*this.eles.length),1);
			if(this.drawmode == 0) this.Reset();
			if(this.eles.length == 0 && this.donemode == 0) this.Reset();
			return gets;
		}else{
			if(this.eles.length == 0 && this.donemode == 1){
				gets.push(this.defaultele);
				gets.concat(this.Draw(num-1));
				return gets;
			}
			gets.push(this.eles[parseInt(radm*eles.length)])
			this.eles.splice(parseInt(radm*eles.length),1);
			if(this.drawmode == 0) this.Reset();
			if(this.eles.length == 0 && this.donemode == 0) this.Reset();
			gets.concat(this.Draw(num-1));
			return gets;
		}
	}
	
	Reset(){
		this.eles = deepCopy(this.eles_setting);
	}
}
class player{
	id;
	eles;//[ele]
	values;//[[key,value]]
	constructor(){
		
	}
	
	getEle(Eles = []){
		if(ELes.length == 0) return eles;
		eles.concat(ELes);
		return eles;
	}
}

class game{
	id;
	decks;
	players;
	recipes;
	eles;
}

class data{
	type;
	keys;//[key1,key2,key3...]
	addvalue(keys = [],value = []){
		if(keys.length == 0||keys.length != value.length) return this;
		for(var i = 0;i < keys.length;i++){
			this[keys[i].toString()] = value[i];
			this.keys.push(keys[i]);
		}
		return this;
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
module.exports = {
	ele,
	recipe,
	deck,
	player
}