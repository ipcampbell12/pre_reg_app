function doGet(e) {

    //when you have multiple files you are including, you neeed createTemplateFromFile and evaluate to run the include scripts
    const output = HtmlService.createTemplateFromFile("event").evaluate();
    output
        .setTitle('FamU Web App')
    // .setFaviconUrl("https://resources.finalsite.net/images/f_auto,q_auto/v1665159970/woodburnsdorg/nkl3byyl3stazmgik9pk/WSDLogo.jpg")

    return output;
}

function getSs() {
    const ss = SpreadsheetApp.getActive()
    // const ss = app.openByUrl('https://docs.google.com/spreadsheets/d/1pWq5qvepZm26tamaOytrZ-nwiwMsw4TrC6TOBGiILZY/edit#gid=990015452');
    //const ss = app.openByUrl('https://docs.google.com/spreadsheets/d/12avH5SfqHnYYBIj6DCxfgl5KIRH-25-K6k-mlfcRYfw/edit#gid=1829392235');
    return ss;
}

function serverSideSumbitForm() {

}