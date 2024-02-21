function sendNotificationEmail() {
    const link = SpreadsheetApp.getActive().getUrl();
    const app = MailApp;
    app.sendEmail(emails["maria"], "Pre Registration Form Submitted", `A pre-registration form has been submitted to the pre-registration spreadsheet: \n ${link}
        \n Please check this spreadsheet to make a registration appointment for this registration.
      `);
}

function trimResponses(srcSheet) {
    // const responeSheets = ["ENGLISH Responses", "SPANISH Responses", "RUSSIAN Responses"]
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('All Responses')

    const range = sheet.getRange(sheet.getLastRow(), 1, 1, COLS.check);
    const row = range.getRow()
    // const id = getRegId()
    // sheet.getRange(row, COLS.id).setValue(id + 1)
    // srcSheet.getRange(srcSheet.getLastRow(), COLS.id).setValue(id + 1)
    //Logger.log(`The row is ${row}`)
    sheet.getRange(row, COLS.check).insertCheckboxes()

    range.trimWhitespace();
    const val = range.getValues()[0][COLS.DOB - 1];
    // Logger.log(val)
    const regVal = range.getValues()[0][1];

    const regTypes = {
        "current": ['09/01/2023', "the 2023-2024 school year"],
        "nextK": ['09/01/2024', "the 2024-2025 school year (Kindergarten)"],
        "nextOther": ['09/01/2024', "the 2024-2025 school year (1st-12th grade)"],
    }

    let validation;

    //  Logger.log(regVal)
    if (regVal === regTypes["current"][1]) {
        validation = checkDate(regTypes["current"][0], val);
    } else if (regVal === regTypes["nextK"][1] || regTypes["nextOther"][1]) {
        validation = checkDate(regTypes["nextK"][0], val);
    }

    if (validation === "too young") {
        // Logger.log("This part of the code has run");
        range.setBackground("red")
        sheet.getRange(sheet.getLastRow(), COLS.DOB).setNote("This student is too young for kindergarten")
    }

    const tooSoonCol = sheet.getRange(range.getRow(), COLS.tooSoon);
    const tooSoonVal = tooSoonCol.getValue()

    if (tooSoonVal === 'the 2024-2025 school year (1st-12th grade)' || tooSoonVal === "the 2024-2025 school year (Kindergarten)") {
        tooSoonCol.setNote("Contact this student in a few months")
        range.setBackground('orange')
    }

    const sheetName = srcSheet.getSheetName()

    const gradeCheck = checkGradeLevel(row, sheetName)
    if (gradeCheck[0] === false && validation !== "too young") {
        range.setBackground("yellow")
        //  Logger.log("Making this student's row yellow")
        sheet.getRange(sheet.getLastRow(), COLS.DOB).setNote(`This student's repoted grade and DOB don't match; the reported grade is ${gradeCheck[1]}, but the student's grade based on DOB should be ${gradeCheck[2]}`)
    }


}

function addResponsesToMain() {

    const lock = LockService.getScriptLock();
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    const sheets = ['ENGLISH Responses', "SPANISH Responses", "RUSSIAN Responses"];
    const destSheet = ss.getSheetByName('All Responses');

    //get lock
    try {
        lock.tryLock(10000);
    } catch (e) {
        Logger.log(`There was an error: ${e}`)
    }

    //start critical logic
    sheets.forEach(sheetName => {
        const srcSheet = ss.getSheetByName(sheetName);
        const srcRange = srcSheet.getRange(srcSheet.getLastRow(), 1, 1, COLS["last"]);

        if (srcRange.getRow() > 1 && srcRange.getNote() !== "Student already added") {
            const rowVals = srcRange.getValues();
            const destRange = destSheet.getRange(destSheet.getLastRow() + 1, 1, 1, COLS["last"]);
            Logger.log(`This row  on ${sheetName} sheet has data:`, rowVals)
            destRange.setValues(rowVals)
            srcRange.setNote("Student already added");
            destRange.setBackground("white");
            //srcSheet.deleteRow(srcRange.getRow())
            trimResponses(srcSheet);
            sendNotificationEmail();
            return;
        } else {
            console.log(`Nothing to add from ${srcSheet.getSheetName()}`);
        }
    });

    //end critical logic
    lock.releaseLock();

    // Ensure the lock is released before exiting.
    if (lock.hasLock()) {
        throw new Error("Lock violation");
    }
    else {
        return;
    }

}