"use strict";
/*class Stack{
	num;
	
	length;
	constructor(){
		this.num = new Array();
		this.length = 0;
	}
	push(num){
		var n = this.num[this.length++] = num;
		return n;
	}
	pop(){
		var n = this.num[--this.length];
		return n;
	}
	isEmpty(){
		return this.length == 0 ? true : false;
	}
}
var i = 0;
var data;
function calculateit(str){
	data = str;
	i = 0;
	calculate(1);
}
function calculate(level){
	var stack = new Stack();
	for(;i < data.length;i++){
		if(indeck(data[i],numberchara) == true){
			var tempnum = [0,1];
			var intox = false;
			for(;i < data.length;i++){
				if(data[i] == '.' && intox == false){
					intox = true;
					continue;
				}else if(data[i] == '.' && intox == true){
					return null;
				}
				tempnum[0] = tempnum[0]*10 + parseInt(data[i]);
				if(intox == true){
					tempnum[1] *= 10;
				}
				if(i + 1 < data.length && indeck(data[i + 1],numberchara) != true){
					break;
				}
			}
			stack.push(tempnum[0]/tempnum[1]);
		}else
		if((data[i] == '-' || data[i] == '+')&&level <= 1){//
			var tempstr = "";
			stack.push((data[i] == '-' ? -1:1)*calculate(tempstr));
		}else
		if((data[i] == '/' || data[i] == '*')&&level <= 2){//
			var tempstr = "";
			for(var j = i + 1;j < data.length;j++) tempstr += data[j];
			stack.push(calculate(tempstr));
		}else
		if((data[i] == '(' || data[i] == ')')&&level <= 999){
			
		}
	}
	if(level == 1){
		
	}
}
function indeck(str,deck){
	for(var i = 0;i < str;i++){
		for(var j = 0;j < deck.length;j++)
			if(str[i] != deck[j]) return false;
	}
	return true;
}
const numberchara = ['0','1','2','3','4','5','6','7','8','9','.'];
module.exports = {
	calculate;
}*/
var data;
var i;
function calculate(level){
	var num = [[0,1],[0,1]];
	var numlen = 0;
	var thischara;
	while(data[i] == ' ' && i + 1 < data.length) i++;
	if(indeck(data[i],numberchara) == true){
		var intox = false;
		for(;i < data.length;i++){
			if(data[i] == '.' && intox == false){
				intox = true;
				continue;
			}else if(data[i] == '.' && intox == true){
				return NaN;
			}
			num[0][0] = num[0][0]*10 + parseInt(data[i]);
			if(intox == true){
				num[0][1] *= 10;
			}
			if(i + 1 < data.length && indeck(data[i + 1],numberchara) != true){
				i++;
				break;
			}
		}
		numlen++;
	}
	while(data[i] == ' ' && i + 1 < data.length) i++;
	if(level <= 1 && (data[i] == '+' || data[i] == '-')){
		var chara = data[i++];
		if(numlen == 0){
			numlen++;
		}
		thischara = '+';
		num[1] = calculate(1);
		num[1][0] *= (chara == '+' ? 1 : -1);
		numlen++;
	}else if(level <= 3 && data[i] == '/' && numlen > 0){
		var chara = data[i++];
		num[1] = calculate(3);
		numlen++;
		thischara = '/';
	}else if(level <= 3 && data[i] == '*' && numlen > 0){
		var chara = data[i++];
		num[1] = calculate(2);
		numlen++;
		thischara = '*';
	}/*else{
		console.log("~");
	}
	console.log(num);
	console.log(numlen);
	console.log(level);*/
	if(numlen == 0) return NaN;
	if(level == 0 && numlen == 1){//初始
		return num[0][0] / num[0][1];
	}
	if(numlen == 1) return num[0];
	if(level == 0){
		if(thischara == '+'){
			var tempnum1 = num[0][1];
			var tempnum2 = num[1][1];
			num[1][1] *= tempnum1;
			num[1][0] *= tempnum1;
			num[0][1] *= tempnum2;
			num[0][0] *= tempnum2;
			return (num[0][0] + num[1][0])/num[0][1];
		}else if(thischara == '*'){
			return (num[0][0] * num[1][0])/(num[0][1] * num[1][1]);
		}else if(thischara == '/'){
			return (num[0][0] * num[1][1])/(num[0][1] * num[1][0]);
		}
	}
	if(thischara == '+'){// + - 1
		//console.log("+");
		var tempnum1 = num[0][1];
		var tempnum2 = num[1][1];
		num[1][1] *= tempnum1;
		num[1][0] *= tempnum1;
		num[0][1] *= tempnum2;
		num[0][0] *= tempnum2;
		return [(num[0][0] + num[1][0]),num[0][1]];
	}else if(thischara == '*'){//* 2
		//console.log("*");
		return [(num[0][0] * num[1][0]),(num[0][1] * num[1][1])];
	}else if(thischara == '/'){// / 3
		//console.log("/");
		return [(num[0][0] * num[1][1]),(num[0][1] * num[1][0])];
	}
}
function textcheck(data){
	if(data[0] == 'j' && data[1] == 's'){
		for(var i = 2;i < data.length;i++){
			if(indeck(data[i],calchara) == false){
				return false;
			}
		}
		return true
	}
	return false;
}
function cal(str){
	data = str;
	i = 0;
	return calculate(0);
}
function indeck(str,deck){
	for(var i = 0;i < str.length;i++){
		for(var j = 0;j < deck.length;j++)
			if(str[i] == deck[j]) return true;
	}
	return false;
}
const numberchara = ['0','1','2','3','4','5','6','7','8','9','.'];
const calchara = ['0','1','2','3','4','5','6','7','8','9','.','+','-','*','/'];
module.exports = {
	cal,
	textcheck
}