function createPermNumberTrigger() {
    ScriptApp.newTrigger('setPermNumber')
        .forSpreadsheet(SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1pWq5qvepZm26tamaOytrZ-nwiwMsw4TrC6TOBGiILZY/edit#gid=2017203191"))
        .onEdit()
        .create();
}

function permSs() {
    const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1C8QapRuVRL3IkTyfriO2-CMsLAvAI7kYS5a3CuMGBTU/edit#gid=384564419");
    return ss;
}

const rowNum = 114;
const dateVal = "2/15/2024 11:14:52";

function makeId(rowNum, date) {
    const rawDate = new Date(date);
    const mm = rawDate.getMonth() + 1;
    const strMonth = mm.toString();
    const strRow = rowNum.toString();
    const zeroMonth = strMonth.length !== 2 ? `0${strMonth}` : strMonth;
    const zeroRow = strRow.length !== 2 ? `0${strRow}` : strRow;
    const yy = rawDate.getFullYear().toString().slice(-2);
    const id = `pr${zeroMonth}${yy}${zeroRow}`;
    const monthName = rawDate.toLocaleDateString(undefined, { month: 'short' })
    return [id, monthName];
}


function setPermNumber(e) {
    const eRange = e.range;
    const eSheet = e.source.getSheet();
    Logger.log("The eSheet is ", eSheet.getSheetName())
    var row = eRange.getRow();
    Logger.log("The Row is ", row)
    var col = eRange.getColumn();
    Logger.log("The column is ", col)
    const permCheck = getVal(row, COLS.perm, 1, 1)
    Logger.log(permCheck)
    Logger.log(getVal(row, COLS.name, 1, 1, eSheet))

    if ((col === COLS.perm && permCheck === true) && eSheet === "All Responses") {
        Logger.log("The perm number trigger has triggered")
        const rowVals = getVals(row, 1, 1, 23);
        const rowsToSend = [rowVals[0][COLS.name - 1], rowVals[0][COLS.DOB], rowVals[0][COLS.oldSchool - 1]]
        Logger.log(rowsToSend);

        //create perm
        const permSheet = getPermSheet(rowVals[0][0])
        const permRange = permSheet.getRange(permSheet.getLastRow(), 1, 1, permSheet.getLastColumn())
        const lastPerm = permRange.getValues()[0][0];
        Logger.log(`Last perm was ${lastPerm.toString()}`);
        const nextPerm = lastPerm + 1;

        Logger.log(`The next perm is ${nextPerm.toString()}`);

        const newRange = permSheet.getRange(permSheet.getLastRow() + 1, 1, 1, 4);
        newRange.setValues([nextPerm, ...rowsToSend]);

        preRegPermRange.setValue([nextPerm]);
    }

}

function getPermSheet(date) {
    const permSs = permSs();
    const monthName = new Date(date).toLocaleDateString(undefined, { month })
    const permSheet = permSs.getSheetByName(monthName)
    const sheetName = permSheet.getSheetName();
    Logger.log(`The perm sheet name is ${sheetName}`)
    return permSheet;
}

