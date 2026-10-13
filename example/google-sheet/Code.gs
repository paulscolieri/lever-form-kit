// Deploy as a web app:
// 1. Create a Google Sheet (sheets.new), then open Extensions > Apps Script and paste this file over Code.gs.
// 2. Click Deploy > New deployment, choose type "Web app".
// 3. Set "Execute as" to Me and "Who has access" to Anyone, then click Deploy and approve the permissions.
// 4. Copy the Web app URL into SHEET_WEBHOOK_URL in your .env.local and Vercel settings. Treat it like a password.
// 5. Submit a test quote; the header row is written on the first submission. Redeploy (new version) after any edit here.
var COLUMNS = ["createdAt", "name", "email", "phone", "address", "lotSize", "addOns", "frequency", "rush", "eligible", "reason", "totalCents", "notes"];

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var record = JSON.parse(e.postData.contents);
  if (sheet.getLastRow() === 0) sheet.appendRow(COLUMNS);
  sheet.appendRow(COLUMNS.map(function (key) {
    var value = record[key];
    if (Array.isArray(value)) return value.join(", ");
    return value == null ? "" : value;
  }));
  return ContentService.createTextOutput("ok");
}
