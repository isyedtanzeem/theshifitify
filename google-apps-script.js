/**
 * ============================================================================
 * SHIFTIFY PACKERS & MOVERS - GOOGLE APPS SCRIPT WEBHOOK & AUTOMATION (2026)
 * ============================================================================
 * 
 * Features:
 * 1. Automatic Tab & Header Creation:
 *    - Automatically creates "Leads", "Followups", "Quotations", and "Invoices" tabs
 *    - Applies frozen header rows, bold colored styling, and column formatting.
 * 2. Real-time Email Notifications:
 *    - Sends instantaneous email notifications to shiftify.leads@gmail.com
 *    - Includes one-click "Call Customer" and "WhatsApp Customer" quick action buttons.
 * 3. Bidirectional Admin Sync:
 *    - Handles website inquiries, admin-created leads, status changes,
 *      follow-ups, quotations, and invoices.
 * 4. Safe Error Handling & CORS:
 *    - Fully compatible with Node.js backend fetch and browser JSON requests.
 * 
 * ============================================================================
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open your Google Sheet (https://sheets.google.com).
 * 2. Click "Extensions" > "Apps Script".
 * 3. Delete any existing code in Code.gs and paste this entire script.
 * 4. Click "Deploy" (top-right blue button) > "New deployment".
 * 5. Select type: "Web app".
 * 6. Description: "Shiftify Admin & Lead Webhook 2026".
 * 7. Execute as: "Me" (your Google account).
 * 8. Who has access: "Anyone" (CRITICAL for receiving webhooks).
 * 9. Click "Deploy", review permissions, and copy the Web App URL.
 * 10. Paste the Web App URL into your environment variable: GOOGLE_APPS_SCRIPT_URL
 * ============================================================================
 */

// Global Configuration
var NOTIFICATION_EMAIL = "shiftify.leads@gmail.com";
var COMPANY_NAME = "Shiftify Packers & Movers";
var COMPANY_PHONE = "+91 98452 01449";

/**
 * Handle incoming POST requests from Shiftify Website & Admin Portal
 */
function doPost(e) {
  try {
    var rawData = e.postData ? e.postData.contents : null;
    if (!rawData) {
      return createJsonResponse({ success: false, error: "Empty POST body received" }, 400);
    }

    var data = JSON.parse(rawData);
    var action = data.action || "createLead";
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    switch (action) {
      case "createLead":
        return handleCreateLead(ss, data);

      case "updateLead":
        return handleUpdateLead(ss, data);

      case "updateLeadStatus":
        return handleUpdateLeadStatus(ss, data);

      case "createFollowup":
        return handleCreateFollowup(ss, data);

      case "completeFollowup":
        return handleCompleteFollowup(ss, data);

      case "createQuotation":
        return handleCreateQuotation(ss, data);

      case "createInvoice":
        return handleCreateInvoice(ss, data);

      default:
        // Default to create lead if standard lead fields are provided
        if (data.leadId && data.name && data.phone) {
          return handleCreateLead(ss, data);
        }
        return createJsonResponse({ success: false, error: "Unrecognized action: " + action }, 400);
    }
  } catch (err) {
    Logger.log("doPost Error: " + err.toString());
    return createJsonResponse({ success: false, error: err.toString() }, 500);
  }
}

/**
 * Handle GET requests for health check and optional data query
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "ping";
  if (action === "ping") {
    return createJsonResponse({
      success: true,
      message: "Shiftify Google Apps Script Webhook is active and listening.",
      timestamp: new Date().toISOString()
    });
  }

  if (action === "getLeads") {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateSheet(ss, "Leads", getLeadsHeaders());
    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    var leads = [];

    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      var lead = {};
      for (var j = 0; j < headers.length; j++) {
        lead[headers[j]] = row[j];
      }
      leads.push(lead);
    }

    return createJsonResponse({ success: true, count: leads.length, leads: leads });
  }

  return createJsonResponse({ success: true, status: "OK" });
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

/**
 * 1. Create Lead in 'Leads' tab and send email notification
 */
function handleCreateLead(ss, data) {
  var sheet = getOrCreateSheet(ss, "Leads", getLeadsHeaders());
  var leadId = data.leadId || generateFallbackLeadId();
  var timestamp = data.createdAt ? new Date(data.createdAt) : new Date();
  var formattedTime = Utilities.formatDate(timestamp, "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");

  var rowData = [
    leadId,
    formattedTime,
    data.name || "N/A",
    "'" + (data.phone || "").toString().replace(/\D/g, ""), // text format for phone
    data.email || "",
    data.fromLocation || "",
    data.toLocation || "",
    data.movingDate || "",
    data.movingType || "House Shifting",
    data.source || "Website",
    data.status || "NEW",
    data.notes || "",
    data.quotationId || "",
    data.invoiceId || ""
  ];

  sheet.appendRow(rowData);

  // Send instantaneous email notification
  try {
    var targetEmail = data.targetEmail || NOTIFICATION_EMAIL;
    sendNewLeadEmailNotification(targetEmail, data, leadId, formattedTime);
  } catch (emailErr) {
    Logger.log("Email Notification Failed: " + emailErr.toString());
  }

  return createJsonResponse({
    success: true,
    message: "Lead recorded in Google Sheet",
    leadId: leadId
  });
}

/**
 * 2. Update existing lead row in 'Leads' tab
 */
function handleUpdateLead(ss, data) {
  var sheet = getOrCreateSheet(ss, "Leads", getLeadsHeaders());
  var leadId = data.leadId;
  if (!leadId) {
    return createJsonResponse({ success: false, error: "Missing leadId for update" }, 400);
  }

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var rowIndex = -1;

  for (var i = 1; i < values.length; i++) {
    if (values[i][0] && values[i][0].toString().trim().toUpperCase() === leadId.toString().trim().toUpperCase()) {
      rowIndex = i + 1; // 1-indexed for Sheets
      break;
    }
  }

  if (rowIndex === -1) {
    // Lead not found in sheet, append as new
    return handleCreateLead(ss, data);
  }

  // Update columns: Name (C), Phone (D), Email (E), From (F), To (G), MovingDate (H), MovingType (I), Source (J), Status (K), Notes (L)
  if (data.name) sheet.getRange(rowIndex, 3).setValue(data.name);
  if (data.phone) sheet.getRange(rowIndex, 4).setValue("'" + data.phone.toString().replace(/\D/g, ""));
  if (data.email !== undefined) sheet.getRange(rowIndex, 5).setValue(data.email || "");
  if (data.fromLocation) sheet.getRange(rowIndex, 6).setValue(data.fromLocation);
  if (data.toLocation) sheet.getRange(rowIndex, 7).setValue(data.toLocation);
  if (data.movingDate) sheet.getRange(rowIndex, 8).setValue(data.movingDate);
  if (data.movingType) sheet.getRange(rowIndex, 9).setValue(data.movingType);
  if (data.source) sheet.getRange(rowIndex, 10).setValue(data.source);
  if (data.status) sheet.getRange(rowIndex, 11).setValue(data.status);
  if (data.notes !== undefined) sheet.getRange(rowIndex, 12).setValue(data.notes || "");
  if (data.quotationId) sheet.getRange(rowIndex, 13).setValue(data.quotationId);
  if (data.invoiceId) sheet.getRange(rowIndex, 14).setValue(data.invoiceId);

  return createJsonResponse({ success: true, message: "Lead " + leadId + " updated in Google Sheet" });
}

/**
 * 3. Update only the status of a lead
 */
function handleUpdateLeadStatus(ss, data) {
  var sheet = getOrCreateSheet(ss, "Leads", getLeadsHeaders());
  var leadId = data.leadId;
  var newStatus = data.status;

  if (!leadId || !newStatus) {
    return createJsonResponse({ success: false, error: "leadId and status required" }, 400);
  }

  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] && values[i][0].toString().trim().toUpperCase() === leadId.toString().trim().toUpperCase()) {
      sheet.getRange(i + 1, 11).setValue(newStatus); // Column K is Status
      return createJsonResponse({ success: true, message: "Status updated to " + newStatus });
    }
  }

  return createJsonResponse({ success: false, error: "Lead ID not found in sheet: " + leadId }, 404);
}

/**
 * 4. Create Follow-up in 'Followups' tab
 */
function handleCreateFollowup(ss, data) {
  var sheet = getOrCreateSheet(ss, "Followups", getFollowupsHeaders());
  var timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");

  var row = [
    data.followupId || ("FUP-" + Utilities.getUuid().substring(0, 8)),
    data.leadId || "",
    timestamp,
    data.customerName || "",
    "'" + (data.phone || "").toString().replace(/\D/g, ""),
    data.followupDate || "",
    data.followupTime || "",
    data.status || "PENDING",
    data.notes || ""
  ];

  sheet.appendRow(row);
  return createJsonResponse({ success: true, message: "Followup logged in Google Sheet" });
}

/**
 * 5. Complete Follow-up
 */
function handleCompleteFollowup(ss, data) {
  var sheet = getOrCreateSheet(ss, "Followups", getFollowupsHeaders());
  var followupId = data.followupId;
  if (!followupId) return createJsonResponse({ success: false, error: "Missing followupId" }, 400);

  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] && values[i][0].toString().trim() === followupId.toString().trim()) {
      sheet.getRange(i + 1, 8).setValue("COMPLETED"); // Column H is status
      return createJsonResponse({ success: true, message: "Followup marked completed in Google Sheet" });
    }
  }

  return createJsonResponse({ success: false, error: "Followup not found: " + followupId }, 404);
}

/**
 * 6. Create Quotation in 'Quotations' tab
 */
function handleCreateQuotation(ss, data) {
  var sheet = getOrCreateSheet(ss, "Quotations", getQuotationsHeaders());
  var timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");

  var row = [
    data.quotationId || "",
    data.leadId || "",
    data.quotationDate || timestamp,
    data.validUntil || "",
    data.customerName || "",
    "'" + (data.phone || "").toString().replace(/\D/g, ""),
    data.email || "",
    data.fromLocation || "",
    data.toLocation || "",
    data.movingDate || "",
    data.movingType || "",
    data.taxableAmount || data.subtotal || 0,
    data.gstAmount || 0,
    data.grandTotal || 0,
    data.status || "SENT",
    data.notes || ""
  ];

  sheet.appendRow(row);
  return createJsonResponse({ success: true, message: "Quotation recorded in Google Sheet" });
}

/**
 * 7. Create Invoice in 'Invoices' tab
 */
function handleCreateInvoice(ss, data) {
  var sheet = getOrCreateSheet(ss, "Invoices", getInvoicesHeaders());
  var timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");

  var row = [
    data.invoiceId || "",
    data.quotationId || "",
    data.leadId || "",
    data.invoiceDate || timestamp,
    data.dueDate || "",
    data.customerName || "",
    "'" + (data.phone || "").toString().replace(/\D/g, ""),
    data.grandTotal || 0,
    data.amountPaid || 0,
    data.balanceDue || 0,
    data.paymentStatus || "UNPAID",
    data.paymentMethod || "",
    data.status || "ISSUED"
  ];

  sheet.appendRow(row);
  return createJsonResponse({ success: true, message: "Invoice recorded in Google Sheet" });
}

// ============================================================================
// EMAIL NOTIFICATION SERVICE
// ============================================================================

function sendNewLeadEmailNotification(targetEmail, lead, leadId, timestamp) {
  var cleanPhone = (lead.phone || "").toString().replace(/\D/g, "");
  var subject = "🚚 New Relocation Lead [" + leadId + "]: " + (lead.name || "Customer") + " (" + (lead.movingType || "House Shifting") + ")";

  var htmlBody = ""
    + "<div style='font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;'>"
    + "  <div style='background-color: #0f172a; padding: 20px 24px; border-radius: 10px; margin-bottom: 20px;'>"
    + "    <h2 style='color: #ea580c; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;'>🚚 Shiftify Packers & Movers</h2>"
    + "    <p style='color: #94a3b8; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;'>Direct Lead Notification Desk</p>"
    + "  </div>"
    + "  <table style='width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;'>"
    + "    <tr style='background-color: #f8fafc;'><td style='padding: 12px 14px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%; color: #475569;'>Lead ID</td><td style='padding: 12px 14px; border: 1px solid #e2e8f0; color: #ea580c; font-weight: bold; font-family: monospace; font-size: 15px;'>" + leadId + "</td></tr>"
    + "    <tr><td style='padding: 12px 14px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;'>Customer Name</td><td style='padding: 12px 14px; border: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;'>" + (lead.name || "N/A") + "</td></tr>"
    + "    <tr style='background-color: #f8fafc;'><td style='padding: 12px 14px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;'>Phone Number</td><td style='padding: 12px 14px; border: 1px solid #e2e8f0;'><a href='tel:" + cleanPhone + "' style='color: #2563eb; font-weight: bold; text-decoration: none; font-size: 15px;'>+91 " + cleanPhone + "</a></td></tr>"
    + "    <tr><td style='padding: 12px 14px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;'>Email</td><td style='padding: 12px 14px; border: 1px solid #e2e8f0; color: #334155;'>" + (lead.email || "Not provided") + "</td></tr>"
    + "    <tr style='background-color: #f8fafc;'><td style='padding: 12px 14px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;'>Service Type</td><td style='padding: 12px 14px; border: 1px solid #e2e8f0;'><span style='background-color: #dbeafe; color: #1e40af; font-weight: 700; padding: 3px 8px; border-radius: 4px; font-size: 12px;'>" + (lead.movingType || "House Shifting") + "</span></td></tr>"
    + "    <tr><td style='padding: 12px 14px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;'>Pickup Location</td><td style='padding: 12px 14px; border: 1px solid #e2e8f0; color: #0f172a;'>" + (lead.fromLocation || "N/A") + "</td></tr>"
    + "    <tr style='background-color: #f8fafc;'><td style='padding: 12px 14px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;'>Drop Location</td><td style='padding: 12px 14px; border: 1px solid #e2e8f0; color: #0f172a;'>" + (lead.toLocation || "N/A") + "</td></tr>"
    + "    <tr><td style='padding: 12px 14px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;'>Moving Date</td><td style='padding: 12px 14px; border: 1px solid #e2e8f0; font-weight: bold; color: #ea580c;'>" + (lead.movingDate || "Flexible") + "</td></tr>"
    + "    <tr style='background-color: #f8fafc;'><td style='padding: 12px 14px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;'>Lead Source</td><td style='padding: 12px 14px; border: 1px solid #e2e8f0; color: #64748b;'>" + (lead.source || "Website") + "</td></tr>"
    + "    <tr><td style='padding: 12px 14px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;'>Received At</td><td style='padding: 12px 14px; border: 1px solid #e2e8f0; color: #64748b; font-size: 13px;'>" + timestamp + "</td></tr>"
    + "  </table>"
    + "  <div style='text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9;'>"
    + "    <a href='tel:" + cleanPhone + "' style='display: inline-block; background-color: #ea580c; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; margin-right: 12px; box-shadow: 0 2px 4px rgba(234, 88, 12, 0.2);'>📞 Call Customer</a>"
    + "    <a href='https://wa.me/91" + cleanPhone + "' style='display: inline-block; background-color: #16a34a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; box-shadow: 0 2px 4px rgba(22, 163, 74, 0.2);'>💬 WhatsApp Customer</a>"
    + "  </div>"
    + "</div>";

  MailApp.sendEmail({
    to: targetEmail,
    subject: subject,
    htmlBody: htmlBody
  });
}

// ============================================================================
// AUTOMATIC SHEET CREATION & FORMATTING UTILITIES
// ============================================================================

function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    formatHeaderRow(sheet, headers.length);
  } else {
    // If sheet exists but is empty, add headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      formatHeaderRow(sheet, headers.length);
    }
  }
  return sheet;
}

function formatHeaderRow(sheet, numColumns) {
  var headerRange = sheet.getRange(1, 1, 1, numColumns);
  headerRange.setBackground("#0f172a");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  for (var c = 1; c <= numColumns; c++) {
    sheet.autoResizeColumn(c);
  }
}

// ============================================================================
// STANDARD SCHEMAS & HEADERS
// ============================================================================

function getLeadsHeaders() {
  return [
    "Lead ID",
    "Timestamp",
    "Customer Name",
    "Phone Number",
    "Email",
    "Pickup Location",
    "Drop Location",
    "Moving Date",
    "Service Type",
    "Source",
    "Status",
    "Notes",
    "Quotation ID",
    "Invoice ID"
  ];
}

function getFollowupsHeaders() {
  return [
    "Followup ID",
    "Lead ID",
    "Scheduled At",
    "Customer Name",
    "Phone",
    "Followup Date",
    "Followup Time",
    "Status",
    "Notes"
  ];
}

function getQuotationsHeaders() {
  return [
    "Quotation ID",
    "Lead ID",
    "Date",
    "Valid Until",
    "Customer Name",
    "Phone",
    "Email",
    "Pickup",
    "Drop",
    "Moving Date",
    "Service Type",
    "Taxable Subtotal",
    "GST Amount",
    "Grand Total",
    "Status",
    "Notes"
  ];
}

function getInvoicesHeaders() {
  return [
    "Invoice ID",
    "Quotation ID",
    "Lead ID",
    "Invoice Date",
    "Due Date",
    "Customer Name",
    "Phone",
    "Grand Total",
    "Amount Paid",
    "Balance Due",
    "Payment Status",
    "Payment Method",
    "Invoice Status"
  ];
}

function generateFallbackLeadId() {
  var d = new Date();
  var yy = d.getFullYear().toString().substring(2);
  var mm = ("0" + (d.getMonth() + 1)).slice(-2);
  var dd = ("0" + d.getDate()).slice(-2);
  var rand = ("000" + Math.floor(Math.random() * 1000)).slice(-3);
  return "SFY" + yy + mm + dd + rand;
}

function createJsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
