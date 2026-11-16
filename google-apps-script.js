/**
 * ===================================================================
 * EMERGE ON HORIZON (EOH) - GOOGLE SHEETS & EMAIL NOTIFICATION SCRIPT
 * ===================================================================
 * 
 * This Google Apps Script automatically:
 * 1. Stores every subscriber email directly into your Google Sheet.
 * 2. Auto-creates and formats columns (Date & Time, Email, Source, Page, Status).
 * 3. Sends an instant notification email to: ckrstudiodesign@gmail.com
 *
 * HOW TO DEPLOY IN 2 MINUTES:
 * 1. Open Google Sheets (https://sheets.new) and name it: "EOH Leads & Subscribers"
 * 2. In the top menu, click: Extensions > Apps Script
 * 3. Delete any default code in Code.gs, and PASTE THIS ENTIRE SCRIPT.
 * 4. Click "Deploy" (top right button) > "New deployment".
 * 5. Under "Select type", choose "Web app".
 * 6. Set Description: "EOH Leads API"
 * 7. Set "Execute as": "Me"
 * 8. Set "Who has access": "Anyone"  <-- CRITICAL for website submissions!
 * 9. Click "Deploy", then "Authorize access", choose your Google account, click "Advanced" > "Go to EOH Leads API (unsafe)" > "Allow".
 * 10. Copy the "Web app URL" (looks like https://script.google.com/macros/s/AKfycb.../exec).
 * 11. Paste that URL into CONFIG.sheetScriptUrl in `js/ebook.js`.
 */

var NOTIFICATION_EMAIL = "ckrstudiodesign@gmail.com";
var SHEET_NAME = "Subscribers";

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 10 seconds for concurrent requests
  try {
    lock.waitLock(10000);
  } catch (lockErr) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: "Server busy, please retry" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var params = {};
    if (e && e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        params = e.parameter || {};
      }
    } else if (e && e.parameter) {
      params = e.parameter;
    }

    var email = (params.email || "").trim();
    if (!email) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", message: "Email is required" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var name = (params.name || "Subscriber").trim();
    var source = params.source || "Free eBook: Unlocking Horizons";
    var page = params.page || "Website";
    var now = new Date();
    var timeZone = Session.getScriptTimeZone() || "Asia/Dubai";
    var formattedDate = Utilities.formatDate(now, timeZone, "yyyy-MM-dd HH:mm:ss");

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.getActiveSheet();
      sheet.setName(SHEET_NAME);
    }

    // Auto-create and style header if sheet is brand new
    if (sheet.getLastRow() === 0) {
      var headers = ["Date & Time", "Email Address", "Name", "Source / Campaign", "Page URL", "Status"];
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setFontSize(11);
      headerRange.setBackground("#1A0E08");
      headerRange.setFontColor("#E5A93C");
      sheet.setFrozenRows(1);
      sheet.setColumnWidth(1, 170);
      sheet.setColumnWidth(2, 260);
      sheet.setColumnWidth(3, 160);
      sheet.setColumnWidth(4, 280);
      sheet.setColumnWidth(5, 300);
      sheet.setColumnWidth(6, 120);
    }

    // Append subscriber data row
    sheet.appendRow([formattedDate, email, name, source, page, "Active"]);

    // Send instant notification email to ckrstudiodesign@gmail.com
    var recipient = params.notificationEmail || NOTIFICATION_EMAIL;
    if (recipient) {
      var subject = "✨ New EOH Subscriber: " + email;
      var sheetUrl = ss.getUrl();
      
      var htmlBody = "" +
        "<div style=\"font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #E9E1D6;border-radius:16px;overflow:hidden;background:#FAF7F2;\">" +
          "<div style=\"background:#1A0E08;padding:28px 24px;text-align:center;\">" +
            "<h1 style=\"color:#E5A93C;margin:0;font-size:22px;letter-spacing:1.5px;font-weight:700;\">EMERGE ON HORIZON</h1>" +
            "<p style=\"color:#F8F4EE;margin:6px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:2px;opacity:.9;\">New Subscriber Notification</p>" +
          "</div>" +
          "<div style=\"padding:32px 28px;background:#FFFFFF;\">" +
            "<p style=\"font-size:16px;color:#1A0E08;margin:0 0 20px 0;line-height:1.5;\">" +
              "A visitor just entered their email on <strong>Emerge on Horizon</strong> to claim the eBook!" +
            "</p>" +
            "<table style=\"width:100%;border-collapse:collapse;margin:20px 0;\">" +
              "<tr style=\"border-bottom:1px solid #F0EAE1;\">" +
                "<td style=\"padding:12px 0;font-weight:600;color:#6B5D53;width:130px;\">Email:</td>" +
                "<td style=\"padding:12px 0;font-weight:700;color:#1A0E08;font-size:16px;\">" +
                  "<a href=\"mailto:" + email + "\" style=\"color:#C98A1E;text-decoration:none;\">" + email + "</a>" +
                "</td>" +
              "</tr>" +
              (name && name !== "Subscriber" ? (
                "<tr style=\"border-bottom:1px solid #F0EAE1;\">" +
                  "<td style=\"padding:12px 0;font-weight:600;color:#6B5D53;\">Name:</td>" +
                  "<td style=\"padding:12px 0;color:#1A0E08;\">" + name + "</td>" +
                "</tr>"
              ) : "") +
              "<tr style=\"border-bottom:1px solid #F0EAE1;\">" +
                "<td style=\"padding:12px 0;font-weight:600;color:#6B5D53;\">Resource:</td>" +
                "<td style=\"padding:12px 0;color:#1A0E08;\">" + source + "</td>" +
              "</tr>" +
              "<tr style=\"border-bottom:1px solid #F0EAE1;\">" +
                "<td style=\"padding:12px 0;font-weight:600;color:#6B5D53;\">Page:</td>" +
                "<td style=\"padding:12px 0;color:#6B5D53;font-size:13px;word-break:break-all;\">" + page + "</td>" +
              "</tr>" +
              "<tr>" +
                "<td style=\"padding:12px 0;font-weight:600;color:#6B5D53;\">Received At:</td>" +
                "<td style=\"padding:12px 0;color:#1A0E08;\">" + formattedDate + "</td>" +
              "</tr>" +
            "</table>" +
            "<div style=\"margin-top:28px;text-align:center;\">" +
              "<a href=\"" + sheetUrl + "\" style=\"display:inline-block;padding:12px 28px;background:#1A0E08;color:#FFFFFF;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;box-shadow:0 4px 14px rgba(26,14,8,.2);\">Open Google Sheet</a>" +
            "</div>" +
          "</div>" +
          "<div style=\"background:#F3EDE3;padding:14px 20px;text-align:center;font-size:12px;color:#8A7A6E;\">" +
            "Automated notification sent to " + recipient + " · Emerge on Horizon" +
          "</div>" +
        "</div>";

      try {
        MailApp.sendEmail({
          to: recipient,
          subject: subject,
          htmlBody: htmlBody
        });
      } catch (mailErr) {
        console.error("MailApp error: " + mailErr.toString());
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", email: email }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
