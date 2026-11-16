/**
 * ===================================================================
 * EMERGE ON HORIZON (EOH) - UNIFIED LEAD CAPTURE & NOTIFICATION SCRIPT
 * ===================================================================
 * 
 * This script captures ALL leads from the EOH website into ONE Google Sheet:
 * 1. "Send an inquiry" forms (Homepage & Contact page) -> Name, Email, Phone, Service, Message
 * 2. "Free eBook" popup modal -> Email, Name, eBook title
 * 3. "Footer newsletter" signups -> Name, Email
 *
 * For every submission, it automatically:
 * - Appends a structured row to the "Leads & Inquiries" sheet.
 * - Formats and freezes the header row with gold/dark styling.
 * - Sends an instant email notification to: ckrstudiodesign@gmail.com
 *
 * HOW TO UPDATE IN GOOGLE APPS SCRIPT:
 * 1. Open your existing Google Sheet ("EOH Leads & Subscribers").
 * 2. Click Extensions > Apps Script.
 * 3. Replace all code in Code.gs with THIS entire file and save (Ctrl + S).
 * 4. Click "Deploy" > "Manage deployments".
 * 5. Click the Pencil (Edit) icon.
 * 6. Under "Version", select "New version".
 * 7. Click "Deploy". (Your Web App URL stays the exact same!)
 */

var NOTIFICATION_EMAIL = "ckrstudiodesign@gmail.com";
var SHEET_NAME = "Leads & Inquiries";
var HEADERS = [
  "Date & Time",
  "Name",
  "Email Address",
  "Phone / WhatsApp",
  "Service / Program",
  "Message / Notes",
  "Source",
  "Page URL",
  "Status"
];

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var lock = LockService.getScriptLock();
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

    var name = (params.name || "Website Visitor").trim();
    var phone = (params.phone || "-").trim();
    var service = (params.service || params.source || "General Inquiry").trim();
    var message = (params.message || "eBook Download / Newsletter Signup").trim();
    var source = (params.source || "Website Form").trim();
    var page = (params.page || "Website").trim();

    var now = new Date();
    var timeZone = Session.getScriptTimeZone() || "Asia/Dubai";
    var formattedDate = Utilities.formatDate(now, timeZone, "yyyy-MM-dd HH:mm:ss");

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.getActiveSheet();
      sheet.setName(SHEET_NAME);
    }

    // Ensure header row exists and matches the unified structure
    ensureHeader(sheet);

    // Append unified lead row
    sheet.appendRow([
      formattedDate,
      name,
      email,
      phone,
      service,
      message,
      source,
      page,
      "New"
    ]);

    // Send instant notification email to ckrstudiodesign@gmail.com
    var recipient = params.notificationEmail || NOTIFICATION_EMAIL;
    if (recipient) {
      var isInquiry = (phone !== "-" && phone !== "") || (message !== "eBook Download / Newsletter Signup" && message !== "eBook Download");
      var subject = isInquiry
        ? "🚨 New Client Inquiry: " + name + " (" + service + ")"
        : "✨ New EOH Subscriber: " + email;

      var sheetUrl = ss.getUrl();
      var cleanPhone = phone.replace(/[^\d+]/g, '');
      var waDirect = cleanPhone ? "https://wa.me/" + cleanPhone.replace(/^\+/, '') : "";

      var htmlBody = "" +
        "<div style=\"font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #E9E1D6;border-radius:16px;overflow:hidden;background:#FAF7F2;\">" +
          "<div style=\"background:#1A0E08;padding:28px 24px;text-align:center;\">" +
            "<h1 style=\"color:#E5A93C;margin:0;font-size:22px;letter-spacing:1.5px;font-weight:700;\">EMERGE ON HORIZON</h1>" +
            "<p style=\"color:#F8F4EE;margin:6px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:2px;opacity:.9;\">" +
              (isInquiry ? "🔥 New Consultation & Inquiry Received" : "⭐ New Subscriber Notification") +
            "</p>" +
          "</div>" +
          "<div style=\"padding:32px 28px;background:#FFFFFF;\">" +
            "<p style=\"font-size:16px;color:#1A0E08;margin:0 0 20px 0;line-height:1.5;\">" +
              (isInquiry
                ? "A potential client just submitted an inquiry on the <strong>Emerge on Horizon</strong> website!"
                : "A visitor just entered their email on <strong>Emerge on Horizon</strong> to claim the eBook!") +
            "</p>" +
            "<table style=\"width:100%;border-collapse:collapse;margin:20px 0;\">" +
              "<tr style=\"border-bottom:1px solid #F0EAE1;\">" +
                "<td style=\"padding:10px 0;font-weight:600;color:#6B5D53;width:140px;\">Full Name:</td>" +
                "<td style=\"padding:10px 0;font-weight:700;color:#1A0E08;font-size:15px;\">" + name + "</td>" +
              "</tr>" +
              "<tr style=\"border-bottom:1px solid #F0EAE1;\">" +
                "<td style=\"padding:10px 0;font-weight:600;color:#6B5D53;\">Email Address:</td>" +
                "<td style=\"padding:10px 0;font-weight:700;color:#1A0E08;\">" +
                  "<a href=\"mailto:" + email + "\" style=\"color:#C98A1E;text-decoration:none;\">" + email + "</a>" +
                "</td>" +
              "</tr>" +
              (phone && phone !== "-" ? (
                "<tr style=\"border-bottom:1px solid #F0EAE1;\">" +
                  "<td style=\"padding:10px 0;font-weight:600;color:#6B5D53;\">Phone / WhatsApp:</td>" +
                  "<td style=\"padding:10px 0;font-weight:700;color:#1A0E08;\">" +
                    (waDirect
                      ? "<a href=\"" + waDirect + "\" style=\"color:#25D366;text-decoration:none;font-weight:bold;\">" + phone + " (Open WhatsApp)</a>"
                      : phone) +
                  "</td>" +
                "</tr>"
              ) : "") +
              "<tr style=\"border-bottom:1px solid #F0EAE1;\">" +
                "<td style=\"padding:10px 0;font-weight:600;color:#6B5D53;\">Service of Interest:</td>" +
                "<td style=\"padding:10px 0;color:#1A0E08;font-weight:600;\">" + service + "</td>" +
              "</tr>" +
              (isInquiry && message ? (
                "<tr style=\"border-bottom:1px solid #F0EAE1;\">" +
                  "<td style=\"padding:10px 0;font-weight:600;color:#6B5D53;vertical-align:top;\">Message / Details:</td>" +
                  "<td style=\"padding:10px 0;color:#1A0E08;line-height:1.5;\">" + message.replace(/\n/g, '<br>') + "</td>" +
                "</tr>"
              ) : "") +
              "<tr style=\"border-bottom:1px solid #F0EAE1;\">" +
                "<td style=\"padding:10px 0;font-weight:600;color:#6B5D53;\">Form Source:</td>" +
                "<td style=\"padding:10px 0;color:#6B5D53;\">" + source + "</td>" +
              "</tr>" +
              "<tr>" +
                "<td style=\"padding:10px 0;font-weight:600;color:#6B5D53;\">Submission Time:</td>" +
                "<td style=\"padding:10px 0;color:#1A0E08;\">" + formattedDate + "</td>" +
              "</tr>" +
            "</table>" +
            "<div style=\"margin-top:28px;text-align:center;display:flex;gap:12px;justify-content:center;\">" +
              (waDirect ? "<a href=\"" + waDirect + "\" style=\"display:inline-block;padding:12px 22px;background:#25D366;color:#FFFFFF;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;margin-right:10px;\">Reply via WhatsApp</a>" : "") +
              "<a href=\"" + sheetUrl + "\" style=\"display:inline-block;padding:12px 24px;background:#1A0E08;color:#FFFFFF;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;\">Open Google Sheet</a>" +
            "</div>" +
          "</div>" +
          "<div style=\"background:#F3EDE3;padding:14px 20px;text-align:center;font-size:12px;color:#8A7A6E;\">" +
            "Automated lead delivery to " + recipient + " · Emerge on Horizon" +
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
      .createTextOutput(JSON.stringify({ result: "success", email: email, name: name }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function ensureHeader(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    styleHeader(sheet);
  } else {
    // If the sheet already had the earlier simple header, upgrade it to the full 9 columns
    var firstRow = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), HEADERS.length)).getValues()[0];
    if (firstRow[3] !== "Phone / WhatsApp" || firstRow.length < HEADERS.length) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      styleHeader(sheet);
    }
  }
}

function styleHeader(sheet) {
  var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(11);
  headerRange.setBackground("#1A0E08");
  headerRange.setFontColor("#E5A93C");
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 160); // Date
  sheet.setColumnWidth(2, 170); // Name
  sheet.setColumnWidth(3, 230); // Email
  sheet.setColumnWidth(4, 170); // Phone
  sheet.setColumnWidth(5, 250); // Service
  sheet.setColumnWidth(6, 320); // Message
  sheet.setColumnWidth(7, 180); // Source
  sheet.setColumnWidth(8, 250); // Page URL
  sheet.setColumnWidth(9, 100); // Status
}
