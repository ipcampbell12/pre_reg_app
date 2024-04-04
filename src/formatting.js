function createOnEditFormatTrigger() {
    ScriptApp.newTrigger('formatRow')
        .forSpreadsheet(SpreadsheetApp.getActive())
        .onEdit()
        .create();
}

function formatRow(e) {
    const range = e.range;
    const row = range.getRow();
    const active = e.source.getActiveSheet();
    const sheetName = active.getSheetName();

    if (sheetName === "All Responses") {
        return;
    }

    const isChecked = range.isChecked();
    const column = range.getColumn();

    const sheetCols = {
        "27": "Scheduled Appointments",
        "8": ["Out of State EL", "Debbie", "Juaquina", "ELPA Screener"],
    }

    if (sheetCols["8"].includes(sheetName) || sheetName === sheetCols["27"]) {
        highlight(active, 8, 27, row, isChecked, column);
    }
}

function highlight(sheet, targetCol1, targetCol2, row, isChecked, column) {
    const color = (isChecked && (column === targetCol1 || column === targetCol2)) ? "yellow" : "white";
    sheet.getRange(row, 1, 1, sheet.getLastColumn()).setBackground(color);
}
// function formatRow(e) {

//     const range = e.range;
//     const row = range.getRow();
//     const active = e.source.getActiveSheet();

//     const sheetCols = {
//         "27": "Scheduled Appointments",
//         "8": ["Out of State EL", "Debbie", "Juaquina", "ELPA Screener"],
//     }

//     if (sheetCols["8"].includes(active.getSheetName())) {
//         highlight(active, 8, row, range);
//         return;
//     }

//     if (active.getSheetName() === sheetCols["27"]) {
//         highlight(active, 27, row, range);
//         return;
//     }

// }

// function highlight(sheet, col, row, range) {
//     const color = (range.isChecked() === true && range.getColumn() === col) ? "yellow" : "white";
//     sheet.getRange(row, 1, 1, sheet.getLastColumn()).setBackground(color);
// }
