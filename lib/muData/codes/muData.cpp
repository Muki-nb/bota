#include<bits/stdc++.h>
using namespace std;
const int minc = 3;
istream filein;
string obj = "";
string inobj;
int inobjl = 0;
void buildobj(int num1,int num2){
	if(inobjl)
	for(int i = 0;i < num1;i++) 
		obj += '=';
	obj += '\n';
	
	for(int i = 0;i < num1;i++) 
		obj += '=';
	obj += '\n';
	/*while(!filein.peek() == EOF){
		filein>>str;
		if(str[0] == '=' && str.length == num1){
			return;
		}
		if()
	}*/
}
int main(int argc,char* argv[]){
	if(argc < minc) return 1;//²ÎÊýÈ±Ê§ 
	if(argv[1] == "Save"){
		inobj = string(argv[2]);
	}else if(argv[1] == "Get"){
		const char* filename = argv[2];
		filein.open(filename);
		
		obj += '{';
		while(filein>>str){
			
		}
		obj += '}';
	}
}
