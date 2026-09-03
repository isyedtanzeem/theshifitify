/**
 * Shiftify Packers & Movers - Google Apps Script Web App
 * Two-Sheet Architecture:
 * 1. Sheet "Leads":
 *    Lead ID | Created At | Name | Phone | Email | From Location | To Location | Moving Date | Moving Type | Source | Status | Notes | Next Follow-up
 * 2. Sheet "Followups":
 *    Follow-up ID | Lead ID | Created At | Customer Name | Phone | Follow-up Date | Follow-up Time | Status | Notes | Completed At
 *
 * Automatically emails new leads to: shiftify.leads@gmail.com
 * Supports Admin Dashboard synchronization for Leads, Manual Lead Creation, Lead Editing, and Follow-ups
 */

// Helper to get or safely initialize column mapping
function getLeadHeaderMap(sheet) {
  var standardHeaders = [
    "Lead ID", "Created At", "Name", "Phone", "Email", "From Location",
    "To Location", "Moving Date", "Moving Type", "Source", "Status", "Notes", "Next Follow-up"
  ];

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, standardHeaders.length).setValues([standardHeaders]).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  var lastCol = Math.max(1, sheet.getLastColumn());
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i]).trim().toLowerCase();
    if (h) map[h] = i + 1; // 1-indexed column
  }

  // Ensure Email exists in header without moving existing data
  if (!map["email"]) {
    var emailCol = lastCol + 1;
    sheet.getRange(1, emailCol).setValue("Email").setFontWeight("bold");
    map["email"] = emailCol;
    lastCol = emailCol;
  }

  // Ensure Notes exists in header
  if (!map["notes"]) {
    var notesCol = lastCol + 1;
    sheet.getRange(1, notesCol).setValue("Notes").setFontWeight("bold");
    map["notes"] = notesCol;
    lastCol = notesCol;
  }

  // Ensure Quotation ID exists in header
  if (!map["quotation id"]) {
    var qCol = lastCol + 1;
    sheet.getRange(1, qCol).setValue("Quotation ID").setFontWeight("bold");
    map["quotation id"] = qCol;
    lastCol = qCol;
  }

  // Ensure Invoice ID exists in header
  if (!map["invoice id"]) {
    var invCol = lastCol + 1;
    sheet.getRange(1, invCol).setValue("Invoice ID").setFontWeight("bold");
    map["invoice id"] = invCol;
    lastCol = invCol;
  }

  return map;
}

function getOrCreateSheet(doc, sheetName, headers) {
  var sheet = doc.getSheetByName(sheetName);
  if (!sheet) {
    var sheets = doc.getSheets();
    if (sheets.length === 1 && sheetName === "Leads" && sheets[0].getLastRow() <= 1) {
      sheet = sheets[0];
      sheet.setName("Leads");
    } else {
      sheet = doc.insertSheet(sheetName);
    }
  }

  if (sheet.getLastRow() === 0 && headers && headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();

    var leadsSheet = doc.getSheetByName("Leads") || doc.getActiveSheet();
    if (leadsSheet.getName() !== "Leads" && leadsSheet.getName() !== "Followups" && leadsSheet.getName() !== "Quotations" && leadsSheet.getName() !== "Invoices") {
      leadsSheet.setName("Leads");
    }

    var leadMap = getLeadHeaderMap(leadsSheet);

    var followupsHeaders = [
      "Follow-up ID", "Lead ID", "Created At", "Customer Name", "Phone",
      "Follow-up Date", "Follow-up Time", "Status", "Notes", "Completed At"
    ];
    var followupsSheet = getOrCreateSheet(doc, "Followups", followupsHeaders);

    var quotationsHeaders = [
      "Quotation ID", "Lead ID", "Invoice ID", "Created At", "Quotation Date", "Valid Until",
      "Customer Name", "Phone", "Email", "From Location", "To Location", "Moving Date", "Moving Type",
      "Subtotal", "Discount", "Tax Percentage", "Tax Amount", "Grand Total", "Status", "Notes", "Terms", "Items"
    ];
    var quotationsSheet = getOrCreateSheet(doc, "Quotations", quotationsHeaders);

    var invoicesHeaders = [
      "Invoice ID", "Quotation ID", "Lead ID", "Created At", "Invoice Date", "Due Date",
      "Customer Name", "Phone", "Email", "From Location", "To Location", "Moving Date", "Moving Type",
      "Subtotal", "Discount", "Tax Percentage", "Tax Amount", "Grand Total",
      "Amount Paid", "Balance Due", "Payment Status", "Payment Date", "Payment Method", "Payment Notes",
      "Status", "Notes", "Terms", "Items"
    ];
    var invoicesSheet = getOrCreateSheet(doc, "Invoices", invoicesHeaders);

    // Parse JSON payload or URL parameters
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var action = data.action || "createLead";

    // ----------------------------------------------------
    // ACTION: UPDATE LEAD STATUS
    // ----------------------------------------------------
    if (action === "updateLeadStatus") {
      var targetLeadId = data.leadId;
      var newStatus = data.status;
      var lastRow = leadsSheet.getLastRow();
      var found = false;

      var leadIdCol = leadMap["lead id"] || 1;
      var statusCol = leadMap["status"] || 11;

      if (lastRow > 1) {
        var leadIds = leadsSheet.getRange(2, leadIdCol, lastRow - 1, 1).getValues();
        for (var i = 0; i < leadIds.length; i++) {
          if (String(leadIds[i][0]).trim().toUpperCase() === String(targetLeadId).trim().toUpperCase()) {
            leadsSheet.getRange(i + 2, statusCol).setValue(newStatus);
            found = true;
            break;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: found,
        message: found ? "Status updated to " + newStatus : "Lead ID not found",
        leadId: targetLeadId,
        status: newStatus
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // ACTION: UPDATE LEAD (FULL EDIT)
    // ----------------------------------------------------
    if (action === "updateLead") {
      var editLeadId = data.leadId;
      var lRow = leadsSheet.getLastRow();
      var updated = false;

      var leadColIdx = leadMap["lead id"] || 1;

      if (lRow > 1) {
        var allIds = leadsSheet.getRange(2, leadColIdx, lRow - 1, 1).getValues();
        for (var idx = 0; idx < allIds.length; idx++) {
          if (String(allIds[idx][0]).trim().toUpperCase() === String(editLeadId).trim().toUpperCase()) {
            var rowNum = idx + 2;
            if (leadMap["name"] && data.name !== undefined) leadsSheet.getRange(rowNum, leadMap["name"]).setValue(data.name);
            if (leadMap["phone"] && data.phone !== undefined) leadsSheet.getRange(rowNum, leadMap["phone"]).setValue(data.phone);
            if (leadMap["email"] && data.email !== undefined) leadsSheet.getRange(rowNum, leadMap["email"]).setValue(data.email || "");
            if (leadMap["from location"] && data.fromLocation !== undefined) leadsSheet.getRange(rowNum, leadMap["from location"]).setValue(data.fromLocation);
            if (leadMap["to location"] && data.toLocation !== undefined) leadsSheet.getRange(rowNum, leadMap["to location"]).setValue(data.toLocation);
            if (leadMap["moving date"] && data.movingDate !== undefined) leadsSheet.getRange(rowNum, leadMap["moving date"]).setValue(data.movingDate);
            if (leadMap["moving type"] && data.movingType !== undefined) leadsSheet.getRange(rowNum, leadMap["moving type"]).setValue(data.movingType);
            if (leadMap["source"] && data.source !== undefined) leadsSheet.getRange(rowNum, leadMap["source"]).setValue(data.source);
            if (leadMap["notes"] && data.notes !== undefined) leadsSheet.getRange(rowNum, leadMap["notes"]).setValue(data.notes || "");
            updated = true;
            break;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: updated,
        message: updated ? "Lead details updated successfully" : "Lead ID not found",
        leadId: editLeadId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // ACTION: CREATE FOLLOW-UP
    // ----------------------------------------------------
    if (action === "createFollowup") {
      var followupId = data.followupId || ("FLP" + Utilities.formatDate(new Date(), "Asia/Kolkata", "yyMMddHHmmss"));
      var followupRow = [
        followupId,
        data.leadId || "",
        data.createdAt || new Date().toISOString(),
        data.customerName || "",
        data.phone || "",
        data.followupDate || "",
        data.followupTime || "",
        data.status || "PENDING",
        data.notes || "",
        data.completedAt || ""
      ];

      var fNextRow = followupsSheet.getLastRow() + 1;
      followupsSheet.getRange(fNextRow, 1, 1, followupRow.length).setValues([followupRow]);

      // Also update Next Follow-up in Leads sheet
      var lastLeadRow = leadsSheet.getLastRow();
      if (lastLeadRow > 1 && data.leadId && leadMap["next follow-up"]) {
        var leadIdsCol = leadsSheet.getRange(2, leadMap["lead id"] || 1, lastLeadRow - 1, 1).getValues();
        for (var j = 0; j < leadIdsCol.length; j++) {
          if (String(leadIdsCol[j][0]).trim().toUpperCase() === String(data.leadId).trim().toUpperCase()) {
            leadsSheet.getRange(j + 2, leadMap["next follow-up"]).setValue((data.followupDate || "") + " " + (data.followupTime || ""));
            break;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Follow-up created successfully",
        followupId: followupId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // ACTION: COMPLETE FOLLOW-UP
    // ----------------------------------------------------
    if (action === "completeFollowup") {
      var targetFId = data.followupId;
      var fLastRow = followupsSheet.getLastRow();
      var fFound = false;

      if (fLastRow > 1) {
        var fIds = followupsSheet.getRange(2, 1, fLastRow - 1, 1).getValues();
        for (var k = 0; k < fIds.length; k++) {
          if (String(fIds[k][0]).trim() === String(targetFId).trim()) {
            followupsSheet.getRange(k + 2, 8).setValue("COMPLETED");
            followupsSheet.getRange(k + 2, 10).setValue(data.completedAt || new Date().toISOString());
            fFound = true;
            break;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: fFound,
        message: fFound ? "Follow-up marked completed" : "Follow-up ID not found",
        followupId: targetFId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // ACTION: CREATE QUOTATION
    // ----------------------------------------------------
    if (action === "createQuotation") {
      var qRow = [
        data.quotationId || "",
        data.leadId || "",
        data.invoiceId || "",
        data.createdAt || new Date().toISOString(),
        data.quotationDate || "",
        data.validUntil || "",
        data.customerName || "",
        data.phone || "",
        data.email || "",
        data.fromLocation || "",
        data.toLocation || "",
        data.movingDate || "",
        data.movingType || "",
        data.subtotal || 0,
        data.discount || 0,
        data.taxPercentage || data.gstPercentage || 0,
        data.taxAmount || data.gstAmount || 0,
        data.grandTotal || 0,
        data.status || "DRAFT",
        data.notes || "",
        data.terms || "",
        typeof data.items === "string" ? data.items : JSON.stringify(data.items || [])
      ];

      var qNextRow = quotationsSheet.getLastRow() + 1;
      quotationsSheet.getRange(qNextRow, 1, 1, qRow.length).setValues([qRow]);

      // If leadId exists, update Quotation ID in Leads sheet
      var lastLeadRow = leadsSheet.getLastRow();
      if (lastLeadRow > 1 && data.leadId && leadMap["quotation id"]) {
        var lIdsCol = leadsSheet.getRange(2, leadMap["lead id"] || 1, lastLeadRow - 1, 1).getValues();
        for (var ql = 0; ql < lIdsCol.length; ql++) {
          if (String(lIdsCol[ql][0]).trim().toUpperCase() === String(data.leadId).trim().toUpperCase()) {
            leadsSheet.getRange(ql + 2, leadMap["quotation id"]).setValue(data.quotationId || "");
            break;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Quotation created successfully in Google Sheet",
        quotationId: data.quotationId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // ACTION: UPDATE QUOTATION
    // ----------------------------------------------------
    if (action === "updateQuotation") {
      var targetQId = data.quotationId;
      var qLastRow = quotationsSheet.getLastRow();
      var qFound = false;

      if (qLastRow > 1) {
        var qIds = quotationsSheet.getRange(2, 1, qLastRow - 1, 1).getValues();
        for (var qi = 0; qi < qIds.length; qi++) {
          if (String(qIds[qi][0]).trim() === String(targetQId).trim()) {
            var updatedQRow = [
              targetQId,
              data.leadId || "",
              data.invoiceId || "",
              data.createdAt || "",
              data.quotationDate || "",
              data.validUntil || "",
              data.customerName || "",
              data.phone || "",
              data.email || "",
              data.fromLocation || "",
              data.toLocation || "",
              data.movingDate || "",
              data.movingType || "",
              data.subtotal || 0,
              data.discount || 0,
              data.taxPercentage || data.gstPercentage || 0,
              data.taxAmount || data.gstAmount || 0,
              data.grandTotal || 0,
              data.status || "DRAFT",
              data.notes || "",
              data.terms || "",
              typeof data.items === "string" ? data.items : JSON.stringify(data.items || [])
            ];
            quotationsSheet.getRange(qi + 2, 1, 1, updatedQRow.length).setValues([updatedQRow]);
            qFound = true;
            break;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: qFound,
        message: qFound ? "Quotation updated successfully" : "Quotation ID not found",
        quotationId: targetQId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // ACTION: UPDATE QUOTATION STATUS
    // ----------------------------------------------------
    if (action === "updateQuotationStatus") {
      var statQId = data.quotationId;
      var qLastRow = quotationsSheet.getLastRow();
      var qStatFound = false;

      if (qLastRow > 1) {
        var qIds = quotationsSheet.getRange(2, 1, qLastRow - 1, 1).getValues();
        for (var qs = 0; qs < qIds.length; qs++) {
          if (String(qIds[qs][0]).trim() === String(statQId).trim()) {
            quotationsSheet.getRange(qs + 2, 19).setValue(data.status || "DRAFT");
            qStatFound = true;
            break;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: qStatFound,
        message: qStatFound ? "Quotation status updated" : "Quotation ID not found",
        quotationId: statQId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // ACTION: CREATE INVOICE
    // ----------------------------------------------------
    if (action === "createInvoice") {
      var invRow = [
        data.invoiceId || "",
        data.quotationId || "",
        data.leadId || "",
        data.createdAt || new Date().toISOString(),
        data.invoiceDate || "",
        data.dueDate || "",
        data.customerName || "",
        data.phone || "",
        data.email || "",
        data.fromLocation || "",
        data.toLocation || "",
        data.movingDate || "",
        data.movingType || "",
        data.subtotal || 0,
        data.discount || 0,
        data.taxPercentage || data.gstPercentage || 0,
        data.taxAmount || data.gstAmount || 0,
        data.grandTotal || 0,
        data.amountPaid || 0,
        data.balanceDue || 0,
        data.paymentStatus || "UNPAID",
        data.paymentDate || "",
        data.paymentMethod || "",
        data.paymentNotes || "",
        data.status || "DRAFT",
        data.notes || "",
        data.terms || "",
        typeof data.items === "string" ? data.items : JSON.stringify(data.items || [])
      ];

      var invNextRow = invoicesSheet.getLastRow() + 1;
      invoicesSheet.getRange(invNextRow, 1, 1, invRow.length).setValues([invRow]);

      // If leadId exists, update Invoice ID in Leads sheet
      var lastLeadRow = leadsSheet.getLastRow();
      if (lastLeadRow > 1 && data.leadId && leadMap["invoice id"]) {
        var lIdsCol = leadsSheet.getRange(2, leadMap["lead id"] || 1, lastLeadRow - 1, 1).getValues();
        for (var il = 0; il < lIdsCol.length; il++) {
          if (String(lIdsCol[il][0]).trim().toUpperCase() === String(data.leadId).trim().toUpperCase()) {
            leadsSheet.getRange(il + 2, leadMap["invoice id"]).setValue(data.invoiceId || "");
            break;
          }
        }
      }

      // If quotationId exists, link Invoice ID in Quotations sheet
      if (data.quotationId) {
        var qLast = quotationsSheet.getLastRow();
        if (qLast > 1) {
          var qList = quotationsSheet.getRange(2, 1, qLast - 1, 1).getValues();
          for (var iq = 0; iq < qList.length; iq++) {
            if (String(qList[iq][0]).trim() === String(data.quotationId).trim()) {
              quotationsSheet.getRange(iq + 2, 3).setValue(data.invoiceId || "");
              break;
            }
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Invoice created successfully in Google Sheet",
        invoiceId: data.invoiceId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // ACTION: UPDATE INVOICE
    // ----------------------------------------------------
    if (action === "updateInvoice") {
      var targetInvId = data.invoiceId;
      var invLastRow = invoicesSheet.getLastRow();
      var invFound = false;

      if (invLastRow > 1) {
        var invIds = invoicesSheet.getRange(2, 1, invLastRow - 1, 1).getValues();
        for (var invI = 0; invI < invIds.length; invI++) {
          if (String(invIds[invI][0]).trim() === String(targetInvId).trim()) {
            var updatedInvRow = [
              targetInvId,
              data.quotationId || "",
              data.leadId || "",
              data.createdAt || "",
              data.invoiceDate || "",
              data.dueDate || "",
              data.customerName || "",
              data.phone || "",
              data.email || "",
              data.fromLocation || "",
              data.toLocation || "",
              data.movingDate || "",
              data.movingType || "",
              data.subtotal || 0,
              data.discount || 0,
              data.taxPercentage || data.gstPercentage || 0,
              data.taxAmount || data.gstAmount || 0,
              data.grandTotal || 0,
              data.amountPaid || 0,
              data.balanceDue || 0,
              data.paymentStatus || "UNPAID",
              data.paymentDate || "",
              data.paymentMethod || "",
              data.paymentNotes || "",
              data.status || "DRAFT",
              data.notes || "",
              data.terms || "",
              typeof data.items === "string" ? data.items : JSON.stringify(data.items || [])
            ];
            invoicesSheet.getRange(invI + 2, 1, 1, updatedInvRow.length).setValues([updatedInvRow]);
            invFound = true;
            break;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: invFound,
        message: invFound ? "Invoice updated successfully" : "Invoice ID not found",
        invoiceId: targetInvId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // ACTION: UPDATE INVOICE PAYMENT
    // ----------------------------------------------------
    if (action === "updateInvoicePayment") {
      var payInvId = data.invoiceId;
      var invLastRow = invoicesSheet.getLastRow();
      var payFound = false;

      if (invLastRow > 1) {
        var invIds = invoicesSheet.getRange(2, 1, invLastRow - 1, 1).getValues();
        for (var pi = 0; pi < invIds.length; pi++) {
          if (String(invIds[pi][0]).trim() === String(payInvId).trim()) {
            invoicesSheet.getRange(pi + 2, 19).setValue(data.amountPaid || 0);
            invoicesSheet.getRange(pi + 2, 20).setValue(data.balanceDue || 0);
            invoicesSheet.getRange(pi + 2, 21).setValue(data.paymentStatus || "UNPAID");
            if (data.paymentDate) invoicesSheet.getRange(pi + 2, 22).setValue(data.paymentDate);
            if (data.paymentMethod) invoicesSheet.getRange(pi + 2, 23).setValue(data.paymentMethod);
            if (data.paymentNotes) invoicesSheet.getRange(pi + 2, 24).setValue(data.paymentNotes);
            payFound = true;
            break;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: payFound,
        message: payFound ? "Payment details recorded" : "Invoice ID not found",
        invoiceId: payInvId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // ACTION: UPDATE INVOICE STATUS
    // ----------------------------------------------------
    if (action === "updateInvoiceStatus") {
      var statInvId = data.invoiceId;
      var invLastRow = invoicesSheet.getLastRow();
      var invStatFound = false;

      if (invLastRow > 1) {
        var invIds = invoicesSheet.getRange(2, 1, invLastRow - 1, 1).getValues();
        for (var si = 0; si < invIds.length; si++) {
          if (String(invIds[si][0]).trim() === String(statInvId).trim()) {
            invoicesSheet.getRange(si + 2, 25).setValue(data.status || "DRAFT");
            invStatFound = true;
            break;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: invStatFound,
        message: invStatFound ? "Invoice status updated" : "Invoice ID not found",
        invoiceId: statInvId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // DEFAULT ACTION: CREATE LEAD (Manual or Website)
    // ----------------------------------------------------
    var leadId = data.leadId || ("SFY" + Utilities.formatDate(new Date(), "Asia/Kolkata", "yyMMddHHmmss"));
    var createdAt = data.createdAt || new Date().toISOString();
    var name = data.name || "";
    var phone = data.phone || "";
    var email = data.email || "";
    var fromLocation = data.fromLocation || "";
    var toLocation = data.toLocation || "";
    var movingDate = data.movingDate || "";
    var movingType = data.movingType || "House Shifting";
    var source = data.source || "Website";
    var status = data.status || "NEW";
    var notes = data.notes || "";
    var nextFollowup = data.nextFollowup || "";

    var nextRow = leadsSheet.getLastRow() + 1;
    var maxCol = leadsSheet.getLastColumn();
    var rowValues = new Array(maxCol);
    for (var c = 0; c < maxCol; c++) {
      rowValues[c] = "";
    }

    if (leadMap["lead id"]) rowValues[leadMap["lead id"] - 1] = leadId;
    if (leadMap["created at"]) rowValues[leadMap["created at"] - 1] = createdAt;
    if (leadMap["name"]) rowValues[leadMap["name"] - 1] = name;
    if (leadMap["phone"]) rowValues[leadMap["phone"] - 1] = phone;
    if (leadMap["email"]) rowValues[leadMap["email"] - 1] = email;
    if (leadMap["from location"]) rowValues[leadMap["from location"] - 1] = fromLocation;
    if (leadMap["to location"]) rowValues[leadMap["to location"] - 1] = toLocation;
    if (leadMap["moving date"]) rowValues[leadMap["moving date"] - 1] = movingDate;
    if (leadMap["moving type"]) rowValues[leadMap["moving type"] - 1] = movingType;
    if (leadMap["source"]) rowValues[leadMap["source"] - 1] = source;
    if (leadMap["status"]) rowValues[leadMap["status"] - 1] = status;
    if (leadMap["notes"]) rowValues[leadMap["notes"] - 1] = notes;
    if (leadMap["next follow-up"]) rowValues[leadMap["next follow-up"] - 1] = nextFollowup;

    leadsSheet.getRange(nextRow, 1, 1, rowValues.length).setValues([rowValues]);

    // Send instant email notification to shiftify.leads@gmail.com
    var targetEmail = "shiftify.leads@gmail.com";
    try {
      var subject = "🚚 New Move Lead [" + leadId + "]: " + name + " (" + movingType + ")";
      var htmlBody = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">'
        + '<div style="background-color: #0f172a; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">'
        + '<h2 style="color: #ea580c; margin: 0; font-size: 20px;">🚚 Shiftify Packers & Movers</h2>'
        + '<p style="color: #cbd5e1; margin: 4px 0 0 0; font-size: 13px;">New Relocation Enquiry Received (' + source + ')</p>'
        + '</div>'
        + '<table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">'
        + '<tr style="background-color: #f8fafc;"><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Lead ID</td><td style="padding: 10px; border: 1px solid #e2e8f0; color: #ea580c; font-weight: bold;">' + leadId + '</td></tr>'
        + '<tr><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Customer Name</td><td style="padding: 10px; border: 1px solid #e2e8f0;">' + name + '</td></tr>'
        + '<tr style="background-color: #f8fafc;"><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Phone Number</td><td style="padding: 10px; border: 1px solid #e2e8f0;"><a href="tel:' + phone + '" style="color: #2563eb; font-weight: bold; text-decoration: none;">' + phone + '</a> &nbsp; | &nbsp; <a href="https://wa.me/91' + phone + '" style="color: #16a34a; font-weight: bold; text-decoration: none;">WhatsApp</a></td></tr>'
        + (email ? ('<tr><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Email</td><td style="padding: 10px; border: 1px solid #e2e8f0;">' + email + '</td></tr>') : '')
        + '<tr style="background-color: #f8fafc;"><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Moving Type</td><td style="padding: 10px; border: 1px solid #e2e8f0;">' + movingType + '</td></tr>'
        + '<tr><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Pickup Location</td><td style="padding: 10px; border: 1px solid #e2e8f0;">' + fromLocation + '</td></tr>'
        + '<tr style="background-color: #f8fafc;"><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Drop Location</td><td style="padding: 10px; border: 1px solid #e2e8f0;">' + toLocation + '</td></tr>'
        + '<tr><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Moving Date</td><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">' + movingDate + '</td></tr>'
        + '<tr style="background-color: #f8fafc;"><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Lead Source</td><td style="padding: 10px; border: 1px solid #e2e8f0;">' + source + '</td></tr>'
        + (notes ? ('<tr><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Notes</td><td style="padding: 10px; border: 1px solid #e2e8f0; white-space: pre-wrap;">' + notes + '</td></tr>') : '')
        + '<tr style="background-color: #f8fafc;"><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Received At</td><td style="padding: 10px; border: 1px solid #e2e8f0; color: #64748b;">' + createdAt + '</td></tr>'
        + '</table>'
        + '<div style="text-align: center; margin-top: 20px;">'
        + '<a href="tel:' + phone + '" style="display: inline-block; background-color: #ea580c; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-right: 10px;">Call Customer</a>'
        + '<a href="https://wa.me/91' + phone + '" style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">Chat on WhatsApp</a>'
        + '</div>'
        + '</div>';

      MailApp.sendEmail({
        to: targetEmail,
        subject: subject,
        htmlBody: htmlBody
      });
    } catch (mailErr) {
      Logger.log("Email dispatch error: " + mailErr.toString());
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Lead recorded in Google Sheet and emailed to shiftify.leads@gmail.com",
      leadId: leadId,
      emailedTo: targetEmail
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getAll";

    // Read Leads
    var leads = [];
    var leadsSheet = doc.getSheetByName("Leads") || doc.getActiveSheet();
    var leadMap = getLeadHeaderMap(leadsSheet);
    var lastLeadRow = leadsSheet.getLastRow();

    if (lastLeadRow > 1) {
      var numCols = leadsSheet.getLastColumn();
      var leadValues = leadsSheet.getRange(2, 1, lastLeadRow - 1, numCols).getValues();
      for (var i = 0; i < leadValues.length; i++) {
        var row = leadValues[i];
        var lId = leadMap["lead id"] ? String(row[leadMap["lead id"] - 1]) : String(row[0]);
        if (lId) {
          leads.push({
            leadId: lId,
            createdAt: leadMap["created at"] ? String(row[leadMap["created at"] - 1] || "") : String(row[1] || ""),
            name: leadMap["name"] ? String(row[leadMap["name"] - 1] || "") : String(row[2] || ""),
            phone: leadMap["phone"] ? String(row[leadMap["phone"] - 1] || "") : String(row[3] || ""),
            email: leadMap["email"] ? String(row[leadMap["email"] - 1] || "") : "",
            fromLocation: leadMap["from location"] ? String(row[leadMap["from location"] - 1] || "") : String(row[4] || ""),
            toLocation: leadMap["to location"] ? String(row[leadMap["to location"] - 1] || "") : String(row[5] || ""),
            movingDate: leadMap["moving date"] ? String(row[leadMap["moving date"] - 1] || "") : String(row[6] || ""),
            movingType: leadMap["moving type"] ? String(row[leadMap["moving type"] - 1] || "") : String(row[7] || ""),
            source: leadMap["source"] ? String(row[leadMap["source"] - 1] || "Website") : String(row[8] || "Website"),
            status: leadMap["status"] ? String(row[leadMap["status"] - 1] || "NEW") : String(row[9] || "NEW"),
            notes: leadMap["notes"] ? String(row[leadMap["notes"] - 1] || "") : "",
            nextFollowup: leadMap["next follow-up"] ? String(row[leadMap["next follow-up"] - 1] || "") : String(row[10] || "")
          });
        }
      }
    }

    // Read Followups
    var followups = [];
    var followupsSheet = doc.getSheetByName("Followups");
    if (followupsSheet) {
      var lastFRow = followupsSheet.getLastRow();
      if (lastFRow > 1) {
        var fVals = followupsSheet.getRange(2, 1, lastFRow - 1, 10).getValues();
        for (var j = 0; j < fVals.length; j++) {
          var fRow = fVals[j];
          if (fRow[0]) {
            followups.push({
              followupId: String(fRow[0]),
              leadId: String(fRow[1] || ""),
              createdAt: String(fRow[2] || ""),
              customerName: String(fRow[3] || ""),
              phone: String(fRow[4] || ""),
              followupDate: String(fRow[5] || ""),
              followupTime: String(fRow[6] || ""),
              status: String(fRow[7] || "PENDING"),
              notes: String(fRow[8] || ""),
              completedAt: String(fRow[9] || "")
            });
          }
        }
      }
    }

    // Read Quotations
    var quotations = [];
    var quotationsSheet = doc.getSheetByName("Quotations");
    if (quotationsSheet) {
      var lastQRow = quotationsSheet.getLastRow();
      if (lastQRow > 1) {
        var qVals = quotationsSheet.getRange(2, 1, lastQRow - 1, 22).getValues();
        for (var qk = 0; qk < qVals.length; qk++) {
          var qr = qVals[qk];
          if (qr[0]) {
            var parsedItems = [];
            try {
              parsedItems = JSON.parse(qr[21] || "[]");
            } catch (e) {
              parsedItems = [];
            }
            quotations.push({
              quotationId: String(qr[0]),
              leadId: String(qr[1] || ""),
              invoiceId: String(qr[2] || ""),
              createdAt: String(qr[3] || ""),
              quotationDate: String(qr[4] || ""),
              validUntil: String(qr[5] || ""),
              customerName: String(qr[6] || ""),
              phone: String(qr[7] || ""),
              email: String(qr[8] || ""),
              fromLocation: String(qr[9] || ""),
              toLocation: String(qr[10] || ""),
              movingDate: String(qr[11] || ""),
              movingType: String(qr[12] || ""),
              subtotal: Number(qr[13]) || 0,
              discount: Number(qr[14]) || 0,
              gstPercentage: Number(qr[15]) || 0,
              gstAmount: Number(qr[16]) || 0,
              grandTotal: Number(qr[17]) || 0,
              status: String(qr[18] || "DRAFT"),
              notes: String(qr[19] || ""),
              terms: String(qr[20] || ""),
              items: parsedItems
            });
          }
        }
      }
    }

    // Read Invoices
    var invoices = [];
    var invoicesSheet = doc.getSheetByName("Invoices");
    if (invoicesSheet) {
      var lastInvRow = invoicesSheet.getLastRow();
      if (lastInvRow > 1) {
        var invVals = invoicesSheet.getRange(2, 1, lastInvRow - 1, 28).getValues();
        for (var ivk = 0; ivk < invVals.length; ivk++) {
          var ir = invVals[ivk];
          if (ir[0]) {
            var parsedInvItems = [];
            try {
              parsedInvItems = JSON.parse(ir[27] || "[]");
            } catch (e) {
              parsedInvItems = [];
            }
            invoices.push({
              invoiceId: String(ir[0]),
              quotationId: String(ir[1] || ""),
              leadId: String(ir[2] || ""),
              createdAt: String(ir[3] || ""),
              invoiceDate: String(ir[4] || ""),
              dueDate: String(ir[5] || ""),
              customerName: String(ir[6] || ""),
              phone: String(ir[7] || ""),
              email: String(ir[8] || ""),
              fromLocation: String(ir[9] || ""),
              toLocation: String(ir[10] || ""),
              movingDate: String(ir[11] || ""),
              movingType: String(ir[12] || ""),
              subtotal: Number(ir[13]) || 0,
              discount: Number(ir[14]) || 0,
              gstPercentage: Number(ir[15]) || 0,
              gstAmount: Number(ir[16]) || 0,
              grandTotal: Number(ir[17]) || 0,
              amountPaid: Number(ir[18]) || 0,
              balanceDue: Number(ir[19]) || 0,
              paymentStatus: String(ir[20] || "UNPAID"),
              paymentDate: String(ir[21] || ""),
              paymentMethod: String(ir[22] || ""),
              paymentNotes: String(ir[23] || ""),
              status: String(ir[24] || "DRAFT"),
              notes: String(ir[25] || ""),
              terms: String(ir[26] || ""),
              items: parsedInvItems
            });
          }
        }
      }
    }

    if (action === "getLeads") {
      return ContentService.createTextOutput(JSON.stringify({ success: true, leads: leads })).setMimeType(ContentService.MimeType.JSON);
    }
    if (action === "getFollowups") {
      return ContentService.createTextOutput(JSON.stringify({ success: true, followups: followups })).setMimeType(ContentService.MimeType.JSON);
    }
    if (action === "getQuotations") {
      return ContentService.createTextOutput(JSON.stringify({ success: true, quotations: quotations })).setMimeType(ContentService.MimeType.JSON);
    }
    if (action === "getInvoices") {
      return ContentService.createTextOutput(JSON.stringify({ success: true, invoices: invoices })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "online",
      success: true,
      service: "Shiftify Packers & Movers Lead Receiver & Admin API",
      leadsCount: leads.length,
      followupsCount: followups.length,
      quotationsCount: quotations.length,
      invoicesCount: invoices.length,
      leads: leads,
      followups: followups,
      quotations: quotations,
      invoices: invoices
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
