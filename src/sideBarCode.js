function initMenu() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('Report Functions')
        .addItem('Open Sidebar', 'openSideBar')
        .addItem("Authorize Script", "authorizeScript()")
        .addItem("Hide Checked rows", "hideRows")
        .addItem("Check Rows","checkExists")
        .addToUi()
}




function onOpen(e) {
    initMenu();
}

function authorizeScript() {
    const sheetsApp = SpreadsheetApp;
    const ui = sheetsApp.getUi();
    return ui;

}

function openSideBar() {
    var html = HtmlService.createHtmlOutputFromFile("sidebar").setTitle("Pre Registration Tools")
    var ui = SpreadsheetApp.getUi(); // Or DocumentApp or SlidesApp or FormApp.
    ui.showSidebar(html);
}

function createSpreadsheetOpenTrigger() {
    const ss = SpreadsheetApp.getActive();
    ScriptApp.newTrigger('openSideBar')
        .forSpreadsheet(ss)
        .onOpen()
        .create();
}

const sheetsArr = ["Scheduled Appointments", "ELPA Screener", "Out of State EL", "Debbie", "Juaquina"]

function ssActivateSheet(sheetName) {
    Logger.log(sheetName)
    const sheet = getSs().getSheetByName(sheetName)
    Logger.log(sheet.getName())
    sheet.activate()
}

function getStudentNums(type) {
    //Logger.log(sheetName)
    const sheet = getSs().getActiveSheet();

    if (type === "checked") {
        if (sheet.getSheetName() === "Scheduled Appointments") {
            return returnVals(sheet, 22, 3, true)
        }
        return returnVals(sheet, 2, 7, true)
    }

    if (type === "unchecked") {
        if (sheet.getSheetName() === "Scheduled Appointments") {
            return returnVals(sheet, 22, 3, false)
        }
        return returnVals(sheet, 2, 7, false)
    }

}

function hideRows(type) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();


    const sheetCols = {
        "27": "Scheduled Appointments",
        "8": ["Out of State EL", "Debbie", "Juaquina", "ELPA Screener"],
        "22": "All Responses"
    }

    if (sheetCols["8"].includes(sheet.getSheetName())) {
        hide(sheet, 8, type)
    }

    if (sheet.getSheetName() === sheetCols["27"]) {
        hide(sheet, 25, type)
    }
    if (sheet.getSheetName() === sheetCols["22"]) {
        hide(sheet, 22, type)
    }

}

function hide(sheet, col, type) {
    const range = sheet.getRange(1, col, sheet.getLastRow(), sheet.getLastColumn())
    const numRows = range.getNumRows()

    if (type === "hide") {
        for (let i = 1; i <= numRows; i++) {
            const rowRange = sheet.getRange(i, col)
            console.log(`The row being checked is ${rowRange.getRow()}`)
            if (rowRange.isChecked() === true) {
                console.log(`Row ${rowRange.getRow()} is checked and will be hidden`)
                sheet.hideRow(rowRange);
            }
        }
    }

    if (type === "unhide") {
        for (let i = 1; i <= numRows; i++) {
            sheet.unhideRow(sheet.getRange(i, col))
        }
    }

}


function returnVals(sheet, numCol, cols, checkType) {
    const vals = sheet.getRange(2, numCol, sheet.getLastRow() - 1, cols).getValues().filter(row => row.slice(-1)[0] === checkType).map(row => row[0]);
    //.filter(row => row[lastCol - 1] === checkType).map(row => row[numCol - 1]);
    Logger.log(vals)
    return vals;
}
