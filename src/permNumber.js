//need to take into accoutn creating perm numbers for multiple students at once

function getPermsSS(type){
    const spreadsheetUrls = {
        oldPermSs:"https://docs.google.com/spreadsheets/d/1C8QapRuVRL3IkTyfriO2-CMsLAvAI7kYS5a3CuMGBTU/edit#gid=1205616074",
        newPermSs:"https://docs.google.com/spreadsheets/d/1-j-pfdAvNF6iTOgEpH5T4YCfqv7HwA4M4A1-NsXLBfU/edit#gid=0"
    }
   //Logger.log(`Type in ss function is ${type}`)
   const url  = type === "next year"? spreadsheetUrls.newPermSs : spreadsheetUrls.oldPermSs;
   const ss =  SpreadsheetApp.openByUrl(url);
   //Logger.log(`The spreadsheet is ${ss.getName()}`);
   return ss;
}

function splitName(name){
    const myArray = name.split(" ");
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
    //Logger.log(`The name arr is ${nameArr}`)
    return nameArr;

}

function makePermNumber(row,sheetName,type){
    //Logger.log(`The sheet name receieved is ${sheetName}`)
    const names = splitName(row[COLS.name - 1])
   // Logger.log("All the names are: "+names)
    const rowsToSend = [...names, row[COLS.DOB-1]," ",row[COLS.oldSchool - 1]];
    //Logger.log(rowsToSend)
    const permSs = getPermsSS(type);
    const permSheet = permSs.getSheetByName(sheetName);
    const permRange = permSheet.getRange(permSheet.getLastRow(), 1, 1, permSheet.getLastColumn())
    const lastPerm = permRange.getValues()[0][0];
   // Logger.log(`Last perm was ${lastPerm.toString()}`);
    const nextPerm = lastPerm + 1;
   // Logger.log(`The newly created perm is ${nextPerm}`)
    const newRange = permSheet.getRange(permSheet.getLastRow() + 1, 1, 1, 7);
    const newArr =[[nextPerm, ...rowsToSend]];
    //Logger.log("The new arr is: "+newArr)
    newRange.setValues(newArr);
    return nextPerm;
}


function setPermNumber(parent) {
    const rows = getAllData(parent,"perm","All Responses")
    //Logger.log(rows);
    
    rows.forEach((row,idx)=>{
        //Logger.log(`The row being sent is`+row)
        const type = row[1].includes("2024-2025") ? "next year" : "current year";
        //Logger.log(type);
        const sheetName = type === "current year" ? getMonth(row[0]) : "August";
        //Logger.log(sheetName);
        const rowNum = row.slice(-1)
        Logger.log(`The row number is ${rowNum}`)
        const perm = makePermNumber(row,sheetName,type);
        const responsePermSheet = getSheet("All Responses");
        responsePermSheet.getRange(rowNum,COLS.perm).setValue([perm])

    })
}


function getMonth(date) {
    const monthName = new Date(date).toLocaleDateString('default', { month:"long" })
    //Logger.log(`The perm sheet name is ${monthName}`)
    return monthName;
}

