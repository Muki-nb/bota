function build(length =(parseInt(Math.random()*4 + 3)),i = (parseInt(Math.random()*10))){
	var str = "";
	var mode = Math.random()*10;
	if(length <= 0){
		mode = parseInt(Math.random()*4);
		var num = parseInt(Math.random()*i+i/4+1);
		if(mode == 0)
			str += 'x'
		if(mode == 1)
			str += 'y'
		if(mode == 2)
			str += num.toString();
		if(mode == 3)
			str += '(' + (-num).toString() + ')';
		return str;
	}
	if(mode > 8){
		str += '|';
	}else if(mode > 7){
		str += 'sin('
	}else if(mode > 6){
		str += 'cos('
	}else if(mode > 5){
		str += '('
	}else if(mode > 4){
		str += 'tan('
	}else if(mode > 3){
		var xmode = parseInt(Math.random()*5);
		if(xmode == 0)
			str += 'x+'
		if(xmode == 1)
			str += 'x-'
		if(xmode == 2)
			str += 'x*'
		if(xmode == 3)
			str += 'x/'
		if(xmode == 4)
			str += 'x^'
	}else if(mode > 2){
		var ymode = parseInt(Math.random()*5);
		if(ymode == 0)
			str += 'y+'
		if(ymode == 1)
			str += 'y-'
		if(ymode == 2)
			str += 'y*'
		if(ymode == 3)
			str += 'y/'
		if(ymode == 4)
			str += 'y^'
	}else if(mode > 1){
		var num = parseInt(Math.random()*i+i/4+1);
		str += num.toString();
		var xmode = parseInt(Math.random()*5);
		if(xmode == 0)
			str += '+'
		if(xmode == 1)
			str += '-'
		if(xmode == 2)
			str += '*'
		if(xmode == 3)
			str += '/'
		if(xmode == 4)
			str += '^'
	}
	str += build(length - 1,parseInt(Math.random()*i+i/4));
	if(mode > 8){
		if(length != 1){
			if(str[str.length - 1] != 'x' || str[str.length - 1] != 'y' ||!([0,1,2,3,4,5,6,7,8,9].includes(str[str.length - 1]))){
				str += '+';
				str += build(0,parseInt(Math.random()*i+i/4));
			}else{
				var xmode = parseInt(Math.random()*5);
				if(xmode == 0)
					str += '+'
				if(xmode == 1)
					str += '-'
				if(xmode == 2)
					str += '*'
				if(xmode == 3)
					str += '/'
				if(xmode == 4)
					str += '^'
				str += build(0,parseInt(Math.random()*i+i/2));
			}
		}
		str += '|';
	}else if(mode > 4){
		if(length != 1){
			if(str[str.length - 1] != 'x' || str[str.length - 1] != 'y' ||!([0,1,2,3,4,5,6,7,8,9].includes(str[str.length - 1]))){
				str += '+';
				str += build(0,parseInt(Math.random()*i+i/4));
			}else{
				var xmode = parseInt(Math.random()*5);
				if(xmode == 0)
					str += '+'
				if(xmode == 1)
					str += '-'
				if(xmode == 2)
					str += '*'
				if(xmode == 3)
					str += '/'
				if(xmode == 4)
					str += '^'
				str += build(0,parseInt(Math.random()*i+i/4));
			}
		}
		str += ')'
	}
	return str;
}
function xtoy(str){
	var tstr = "";
	for(var i = 0;i < str.length;i++){
		if(str[i] == 'x'){
			tstr += "y";
		}else if(str[i] == 'y'){
			tstr += "x";
		}else{
			tstr += str[i];
		}
	}
	return tstr;
}
function buildZ(len,i){
	var str = build(len,i);
	str = str.replace(/\x/g,"z");
	str = str.replace(/\y/g,"z");
	str = str.replace(/1/g,"i");
	str = str.replace(/0/g,"i");
	return str;
}
module.exports = {
	build,
	xtoy,
	buildZ
}