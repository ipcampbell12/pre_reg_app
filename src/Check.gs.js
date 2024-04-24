function checkExists() {
  const ss = SpreadsheetApp.getActive();
  const currentSheet= ss.getActiveSheet();
  const names = ["All Responses","Scheduled Appointments"];
  const allResponses = getSheetValues(ss,names[0]);
  const scheduledApts = getSheetValues(ss,names[1]);
  const totalArr = [...allResponses,...scheduledApts].flat()
 // Logger.log(totalArr)
  const currentRange = currentSheet.getRange(2,1,currentSheet.getLastRow(),currentSheet.getLastColumn());
    const rows = currentRange.getNumRows();
    for(let i =2;i<rows;i++){
      const rowRange = currentSheet.getRange(i,6);
      const rowVal = rowRange.getValue();
     // Logger.log(rowVal)
      if(totalArr.includes(rowVal)){
       // Logger.log(`${rowVal} IS included`)
      continue;
      }else{
       // Logger.log(`${rowVal} IS DEFINITELY NOT included`)
        const checkRange = currentSheet.getRange(i,24,1,1);
        checkRange.insertCheckboxes().check()
      }
    }

}

function getSheetValues(ss,sheetName,range){
    const sheet = ss.getSheetByName(sheetName)
    const sheetRange = sheet.getRange("F2:F");
    const sheetValues= sheetRange.getValues();
    //Logger.log(sheetValues)
    return sheetValues;
}



function getCalendarEvents(){
  const calApp = CalendarApp;
  const calendarsNames = ["DO 103- EO Registration ","WC- Registration","WC- Registration"];
  const allEvents = []
  calendarsNames.forEach(calName => {
    const events = getAllEventsInMonth(calName,2024,4);
    allEvents.push(events)
  });
  const flatEvents = allEvents.flat().map(event => event.getTitle()).filter(event => event.includes("Kindergarten")||event.includes("Kinder")).filter(event => !event.includes("cancelled")).length;
  const flatNoEvents = allEvents.flat().map(event => event.getTitle()).filter(event => !event.includes("Kindergarten")).length;
  Logger.log(flatEvents)
  Logger.log(flatNoEvents)


  // const start = new Date("04/01/2024");
  // Logger.log(start)
  // const end = new Date("05/01/2024");
  // Logger.log(end)
  // const calendarEvents = calendarsNames.map(name => calApp.getCalendarsByName(name)[0]).map(calendar => calendar.getEvents());
  // const titles = calendarEvents.map(event => event[0].getTitle())
  // Logger.log(titles)

}


function getAllEventsInMonth(name, year, month) {
  var startDate = new Date(year, month - 1, 1);
  Logger.log(startDate)
  var endDate = new Date(year, month, 0);
  Logger.log(endDate)
  var events = CalendarApp.getCalendarsByName(name)[0].getEvents(startDate, endDate);
  
  return events;
}
