
function openRegForm(e) {

  const active = e.source.getActiveSheet()
  const sheetName = active.getSheetName();

  if (sheetName !== "All Responses") {
    return;
  }

  const sheetsApp = SpreadsheetApp;
  const range = e.range;
  var row = range.getRow();
  var col = range.getColumn();
  const ui = sheetsApp.getUi();

  const studentName = getVal(row, COLS.name, 1, 1, active)
  Logger.log(`Student name is ${studentName}`)
  const parentName = getVal(row, COLS.parent, 1, 1, active)
  Logger.log(`Parent name is ${parentName}`)
  const studentNum = getVal(row, COLS.perm, 1, 1, active)
  Logger.log(`Student number is ${studentNum}`)
  const dobNote = active.getRange(row, COLS["DOB"]).getNote()
  const appointmentSchedBox = active.getRange(row, COLS["check"]);
  const appointmentSched = appointmentSchedBox.getValue();

  if ((col === COLS["check"] && appointmentSched === true) && sheetName === 'All Responses' && studentNum !== "" && dobNote !== "This student is too young for kindergarten") {
    const students = getAllData(parentName, "arrs", sheetName);
    Logger.log(students)
    const clientStudents = students.map(student => [student[COLS.name - 1].concat(',').concat(student[COLS.perm - 1]).concat(',').concat(row).concat(',').concat(sheetName).concat(';')]);
    Logger.log(clientStudents)
    saveStudentData(students)
    showRegForm(clientStudents)
  }
  else if ((col === COLS["check"] && appointmentSched === true) && sheetName === 'All Responses' && studentNum === "") {
    ui.alert(`You need to add a Student Number for ${studentName} in Column Y before you can schedule an appointment.`)
    appointmentSchedBox.setValue(false)
  }
  else if ((col === COLS["check"] && appointmentSched === true) && sheetName === 'All Responses' && dobNote === "This student is too young for kindergarten") {
    ui.alert(` ${studentName} is too young for kindergarten.`)
    appointmentSchedBox.setValue(false)
  }

}


const COLS = {
  "DOB": 7,
  "check": 24,
  "id": 23,
  "last": 22,
  "tooSoon": 2,
  "parent": 9,
  "name": 6,
  "perm": 25,
  "grade": 8,
  "oldSchool": 14,
}

function getVal(row, col, numRows, numCols, sheet) {
  return sheet.getRange(row, col, numRows, numCols).getValue()
}
function getVals(row, col, numRows, numCols, sheet) {
  return sheet.getRange(row, col, numRows, numCols).getValues()
}

function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name)
}


function saveStudentData(students) {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('STUDENT_INFO', JSON.stringify(students));

}

function getStudentData() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const studentInfo = JSON.parse(scriptProperties.getProperty('STUDENT_INFO'));
  //Logger.log(`Student info: ${studentInfo}`)
  return studentInfo;
}

function clearStudentData() {
  const userProperties = PropertiesService.getUserProperties()
  userProperties.deleteProperty('STUDENT_INFO');
}


function showRegForm(students) {
  var htmlServ = HtmlService.createTemplateFromFile("event");
  htmlServ.names = students;


  var html = htmlServ.evaluate();
  html.setHeight(450).setWidth(450);
  var ui = SpreadsheetApp.getUi();
  ui.showModalDialog(html, "Registration Appointment");

}





function getRegId() {
  const sheetNames = ['ENGLISH Responses', "SPANISH Responses", "RUSSIAN Responses"];
  const sheets = sheetNames.map(sheetName => getSheet(sheetName));
  let id = 0;
  sheets.forEach(sheet => {
    const length = sheet.getLastRow() - 1;
    id += length;
  });

  Logger.log(id);
  return id;
}


function getAllData(parent, type, name, elpa = "", lang = "", notes = "") {

  const rows = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name).getRange("A2:Z").getValues().filter(row => row[COLS.parent - 1] === parent);


  if (type === "text") {
    const descriptions = `${rows.map((row, idx) => getDescription(row, name, elpa[idx], lang, notes[idx]))}`
    // Logger.log(descriptions)
    return descriptions;
  }

  if (type === "arrs") {
    return rows;
  }

  if (type === "siblings") {
    const siblings = rows.map(row => row[COLS.name - 1]);
    return siblings;
  }

}


function getDescription(dataRow, lang, notes, siblings) {
  //Logger.log(`Description Language is ${lang}`)
  const description = ` \n 
    ${dataRow[COLS.name - 1].concat(`(${extractGradeNumber(dataRow[7])}) `)}
      \u2022  Home Language: ${lang} 
      \u2022  ${dataRow[9]}:${dataRow[8]}, ${dataRow[10]} 
      \u2022  DOB:${Utilities.formatDate(new Date(dataRow[5]), "GMT", "MM/dd/yyy")}
      \u2022  Grade:${dataRow[7]} 
      \u2022  Phone: ${dataRow[10]}
      \u2022  Last School: ${dataRow[13]} 
      \u2022  Student Number: ${dataRow[COLS.perm - 1]} 
      \u2022  Alternate Phone: ${dataRow[11]}
      \u2022  Other Info: ${dataRow[18] || ''} 
      \u2022  Boundary School: ${dataRow[25]} 
      \u2022  Language Program: ${dataRow[20]}
      \u2022  Other Notes: ${notes}
      \n `;
  return description;
}

function extractGradeNumber(grade) {
  const number = parseInt(grade, 10);
  return !isNaN(number) ? number : grade;
}

function formatDate(date) {
  if (!(date instanceof Date)) {
    return 'Invalid input';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}



function getSiblings(parent, data) {
  const siblings = data.filter(d => d[COLS.parent - 1] === parent).map(d => d[COLS.name - 1].concat(` (${d[COLS.grade - 1]})`));
  return siblings;
}

function sendEmail(email, staff, info) {
  const app = MailApp;

  if (staff === "Juaquina") {
    const otherMessage = "An incoming student may have a health or special education need";
    app.sendEmail({
      to: email,
      subject: `${staff}, a registration requires your attention`,
      body: otherMessage.concat('\n').concat(info),
      cc: "inpcampbell@woodburnsd.org"
    });
  }

  if (staff === "Debbie") {
    const otherMessage = "An incoming student is an IN state ELL";
    app.sendEmail(email, `${staff}, a registration requires your attention`, otherMessage.concat('\n').concat(info))
  }

  if (staff === "Ian") {
    const otherMessage = "An incoming student is an OUT OF STATE state ELL";
    app.sendEmail(email, `${staff}, a registration requires your attention`, otherMessage.concat('\n').concat(info))
  }
  if (staff === "ELPA") {
    const otherMessage = "An incoming student will soon have an ELPA score report to download";
    app.sendEmail(email, `Ian, a registration requires your attention`, otherMessage.concat('\n').concat(info))
  }


}

function sendAlerts(data, lang, notes, siblings, elpa, debbie, juaquina, ian) {
  Logger.log(data)
  data.forEach((student, idx) => {
    const info = getDescription(student, lang, notes, siblings);
    if (juaquina[idx] === true) {
      sendEmail(emails['juaquina'], "Juaquina", info)
    }
    if (ian[idx] === true) {
      Logger.log(`Out of state: ${info}`)
      sendEmail(emails['ian'], "Ian", info)
    }
    if (debbie[idx] === true) {
      sendEmail(emails['debbie'], "Debbie", info)
    }
    if (elpa[idx] === true) {
      sendEmail(emails['ian'], "ELPA", info)
    }


  })
}



function createEvent(date, time, elpa, lang, notes, debbie, juaquina, ian, calendar) {

  const calApp = CalendarApp;

  const data = getStudentData().filter(row => row !== "");

  //const studentName = data[0][2];

  const parent = data[0][COLS.parent - 1];

  const siblings = getSiblings(parent, data);
  Logger.log(siblings)
  const title = siblings.map((sibling, index) => sibling.concat(` ${elpa[index] ? 'ELPA' : ''}`));
  Logger.log(title)
  const hours = siblings.length;

  const aptTime = new Date(`${date} ${time}`);
  const endTime = new Date(aptTime.getTime() + (60 * hours) * 60 * 1000);

  const info = {
    description: `${data.map((row, idx) => getDescription(row, lang, notes[idx], siblings))}`
  }

  const regCal = calApp.getCalendarsByName(calendar)[0];
  const abrData = data.map(col => [ssFormatDate(col[0]), col[COLS.perm - 1], col[1], col[COLS.name - 1], ssFormatDate(col[COLS.DOB - 1]), col[COLS.grade - 1], col[14]])

  const opts = { elpa: elpa, debbie: debbie, juaquina: juaquina, ian: ian };
  const ui = SpreadsheetApp.getUi()

  console.log(opts)
  const response = ui.alert(`

    ${showSummary(siblings, opts)}
    
    Also, a calendar even will be created for ${ssFormatDate(aptTime)}.

    Would you like to proceed?
  
  `, ui.ButtonSet.YES_NO)

  if (response === ui.Button.YES) {
    regCal.createEvent(title, aptTime, endTime, info);
    sendToTabs(opts, abrData)
    data.forEach(row => moveRow(row, "Scheduled Appointments", 26))
    removeRows("All Responses", parent)
    sendAlerts(data, lang, notes, siblings, opts["elpa"], opts["debbie"], opts["juaquina"], opts["ian"]);
    SpreadsheetApp.getUi().alert("Appointment created and notifications sent");
  };

}

function showSummary(siblings, obj) {
  Logger.log(`Siblings are: ${siblings}`);
  Logger.log(`Opts are: ${obj}`);

  const summary = siblings.map((sibling, i) => {
    const notifications = [];

    if (obj['elpa'][i]) {
      notifications.push(" Ian (for ELPA) \n");
    }
    if (obj['debbie'][i]) {
      notifications.push(" Debbie \n");
    }
    if (obj['juaquina'][i]) {
      notifications.push(" Juaquina \n");
    }
    if (obj['ian'][i]) {
      notifications.push(" Ian (for out of state EL) \n");
    }

    return `For ${sibling}, notifications will be sent to: \n ${notifications.length !== 0 ? notifications.join(', ') : "nobody"} `;
  });

  Logger.log(summary)
  return summary;

}

function ssFormatDate(date) {
  return Utilities.formatDate(new Date(date), 'PST', 'MM/dd/yyyy')
}

function removeRows(sheet, parent) {
  const datSheet = SpreadsheetApp.getActive().getSheetByName(sheet);
  const rowNums = datSheet.createTextFinder(parent).matchEntireCell(true).findAll().map(row => row.getRow()).reverse();
  Logger.log(rowNums)
  rowNums.forEach(row => {
    try {
      datSheet.deleteRow(row)
    } catch {
      return;
    }

  })
}


function sendToTabs(opts, data) {

  data.forEach((row, idx) => {
    if (opts["debbie"][idx] === true) {
      moveRow(row, "Debbie", 7)
    }
    if (opts["elpa"][idx] === true) {
      moveRow(row, "ELPA Screener", 7)
    }
    if (opts["ian"][idx] === true) {
      moveRow(row, "Out of State EL", 7)
    }
    if (opts["juaquina"][idx] === true) {
      moveRow(row, "Juaquina", 7)
    }

  })


}

function moveRow(row, person, numCols) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(person);
  sheet.insertRowAfter(1)
  Logger.log(sheet)
  const range = sheet.getRange(2, 1, 1, numCols);
  Logger.log(range)
  range.setValues([row])
  if (person !== 'Scheduled Appointments') {
    sheet.getRange(range.getRow(), 8).insertCheckboxes()
  }

  if (person === 'Scheduled Appointments') {
    sheet.getRange(range.getRow(), 27).insertCheckboxes()
  }


}






function checkIt() {
  checkDate('09/01/2023', '11/12/2019')
}

function checkDate(startOfSchoolYear, studentBirthDate) {
  const startYearDate = new Date(startOfSchoolYear);
  const birthDate = new Date(studentBirthDate);

  // Calculate the reference year (5 years prior to the school year)
  const referenceYear = startYearDate.getFullYear() - 5;
  Logger.log(`The reference year is: ${referenceYear}`)

  // Set September 1 of the reference year as the reference date
  const referenceDate = new Date(`09-01-${referenceYear}`);
  Logger.log(`The reference date is: ${referenceDate}`)

  if (birthDate > referenceDate) {
    Logger.log("The student is too young");
    return "too young";
  }

  Logger.log("The student is good to start kinder");
  return "The student is good to start kinder";
}


function createOnEditTrigger() {
  ScriptApp.newTrigger('openRegForm')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();
}

function createSubmitTriggerMoveAndTrim() {
  ScriptApp.newTrigger('addResponsesToMain')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onFormSubmit()
    .create()

}


const emails = {
  maria: "inpcampbell@woodburnsd.org",
  ccindy: "inpcampbell@woodburnsd.org",
  juaquina: "inpcampbell@woodburnsd.org",
  debbie: "inpcampbell@woodburnsd.org",
  ian: "inpcampbell@woodburnsd.org"
}



function testIt() {
  hideRows("hide")
}

function addTest() {
  const range = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ENGLISH Responses').getRange(2, 3, 646, 1)
  const names = range.getValues();
  const newNames = names.map(name => ["TEST ".concat(name[0])]);


  range.setValues(newNames)

}

function check() {
  const date = new Date('9/20/23')
  const cal = CalendarApp.getCalendarsByName('WC- Registration')
  const events = cal[0].getEventsForDay(date)
  const stuff = events.map(event => event.getCreators())
  Logger.log(stuff)
}

