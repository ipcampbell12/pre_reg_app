let text = "Jaqui Gee Hennity Oakley Dannica Campbell";
const myArray = text.split(" ");
let nameArr;
if(myArray.length === 2){
     nameArr = [myArray[1],myArray[0]," "]
}
if(myArray.length === 3){
	nameArr = [myArray[2],myArray[0],myArray[1]]
}

if(myArray.length >= 4){
	nameArr = [myArray.slice(2).join(" "),myArray[0],myArray[1]]
}
console.log(nameArr)