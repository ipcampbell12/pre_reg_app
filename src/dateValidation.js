function checkGradeLevel(row, sheetName) {
    const responseSheet = getSheet("All Responses");

    //responses
    const grade = gradeLevelLookUp(getVal(row, COLS.grade, 1, 1, responseSheet), sheetName);
    // Logger.log(grade)
    const dob = getVal(row, COLS.DOB, 1, 1, responseSheet)
    const respYear = getVal(row, COLS.tooSoon, 1, 1, responseSheet);
    // Logger.log(`The year passed is ${respYear}`);

    const yearOpts = {
        "current": ["2023-2024", "the 2023-2024 school year"],
        "nextK": ['2024-2025', "the 2024-2025 school year (Kindergarten)"],
        "nextOther": ['2024-2025', "the 2024-2025 school year (1st-12th grade)"],
    }

    const schoolYear = respYear.includes(yearOpts["current"][0]) ? yearOpts["current"][0] :
        yearOpts["nextK"][0]
    // Logger.log(`The selected school year is ${schoolYear}`)
    // Logger.log(`The reported grade is ${grade}`)
    const dobGrade = getDobGrade(schoolYear, dob);
    // Logger.log(`The dobGrade is ${dobGrade}`)
    const match = grade === dobGrade ? true : false;
    // Logger.log(`Do the two match? ${match}`)
    return [match, grade, dobGrade]

}

function gradeLevelLookUp(gradeLevel, sheetName) {
    const lookupSheet = getSheet("Grade Level Lookup");
    const language = sheetName.split(' ')[0];
    //   Logger.log(language);
    const langOptions = lookupSheet.getRange(1, 1, 1, 3).getValues()[0];
    //  Logger.log(langOptions);
    const col = langOptions.indexOf(language) + 1;
    //  Logger.log(col);
    const lookupChart = getVals(2, 1, lookupSheet.getLastRow() - 1, 3, lookupSheet);
    //  Logger.log(lookupChart);
    let grade;
    if (language === 'ENGLISH') {
        grade = lookupChart.filter(row => row[2] === gradeLevel)[0][2];
        Logger.log(grade);
        return grade;
    } else if (language === 'RUSSIAN') {
        grade = lookupChart.filter(row => row[1] === gradeLevel)[0][2];
        Logger.log(grade);
        return grade;
    } else if (language === 'SPANISH') {
        grade = lookupChart.filter(row => row[0] === gradeLevel)[0][2];
        Logger.log(grade);
        return grade;
    }


}

function checkLang() {
    // gradeLevelLookUp('8-ой класс', "RUSSIAN Responses")
    checkGradeLevel(11, 'RUSSIAN Responses')
}

function getDobGrade(year, dob) {
    const gradeCheckSheet = getSheet("Grade Level/DOB")

    if (year === '2023-2024') {
        try {
            const chart = getVals(3, 1, 13, 3, gradeCheckSheet);
            const row = chart.filter(row => checkRow(row, dob) === true);
            //  Logger.log(row)
            // Logger.log('2023-2024 school year selected ')
            const grade = row[0][2]
            return grade;
        } catch (e) {
            Logger.log("Could not find a DOB grade for this student")
        }


    } else if (year === "2024-2025") {
        try {
            const chart = getVals(4, 4, 13, 3, gradeCheckSheet);
            const row = chart.filter(row => checkRow(row, dob) === true);
            //   Logger.log('2024-2025 school year selected')
            const grade = row[0][2]
            return grade;
        } catch (e) {
            Logger.log("Could not find a DOB grade for this student")
        }


    }


}

function checkRow(row, dob) {
    const dobDate = new Date(dob)
    const start = new Date(row[0])
    const end = new Date(row[1])
    const check = (dobDate > start && dobDate < end)
    //Logger.log(`Date within range? ${check}`)
    return check;
}
