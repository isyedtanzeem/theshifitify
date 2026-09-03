import React, { useState } from 'react';
import { X, Copy, Check, Table, Cloud, ShieldCheck, Terminal, ExternalLink } from 'lucide-react';

interface IntegrationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegrationGuideModal: React.FC<IntegrationGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const scriptCode = `/**
 * Shiftify Packers & Movers - Enterprise Google Apps Script Web App
 * Four-Sheet Architecture:
 * 1. Sheet "Leads":
 *    A: Lead ID | B: Created At | C: Name | D: Phone | E: From Location | F: To Location | G: Moving Date | H: Moving Type | I: Source | J: Status | K: Next Follow-up | L: Quotation ID | M: Invoice ID | N: Notes
 * 2. Sheet "Followups":
 *    A: Follow-up ID | B: Lead ID | C: Created At | D: Customer Name | E: Phone | F: Follow-up Date | G: Follow-up Time | H: Status | I: Notes | J: Completed At
 * 3. Sheet "Quotations":
 *    A: Quotation ID | B: Lead ID | C: Invoice ID | D: Created At | E: Quotation Date | F: Valid Until | G: Customer Name | H: Phone | I: Email | J: From Location | K: To Location | L: Moving Date | M: Moving Type | N: Items | O: Subtotal | P: Discount | Q: Taxable Amount | R: GST % | S: GST Amount | T: Grand Total | U: Status | V: Notes | W: Terms
 * 4. Sheet "Invoices":
 *    A: Invoice ID | B: Quotation ID | C: Lead ID | D: Created At | E: Invoice Date | F: Due Date | G: Customer Name | H: Phone | I: Email | J: From Location | K: To Location | L: Moving Date | M: Moving Type | N: Items | O: Subtotal | P: Discount | Q: Taxable Amount | R: GST % | S: GST Amount | T: Grand Total | U: Amount Paid | V: Balance Due | W: Payment Status | X: Payment Date | Y: Payment Method | Z: Payment Notes | AA: Status | AB: Notes | AC: Terms
 *
 * Automatically emails every new lead to: shiftify.leads@gmail.com
 * Automatically provisions missing sheets & columns
 * Powers real-time bidirectional sync with Shiftify Admin Dashboard
 */

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
  } else if (headers && headers.length > sheet.getLastColumn()) {
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
    var leadsHeaders = ["Lead ID", "Created At", "Name", "Phone", "From Location", "To Location", "Moving Date", "Moving Type", "Source", "Status", "Next Follow-up", "Quotation ID", "Invoice ID", "Notes"];
    var followupsHeaders = ["Follow-up ID", "Lead ID", "Created At", "Customer Name", "Phone", "Follow-up Date", "Follow-up Time", "Status", "Notes", "Completed At"];
    var quotationsHeaders = ["Quotation ID", "Lead ID", "Invoice ID", "Created At", "Quotation Date", "Valid Until", "Customer Name", "Phone", "Email", "From Location", "To Location", "Moving Date", "Moving Type", "Items", "Subtotal", "Discount", "Taxable Amount", "GST %", "GST Amount", "Grand Total", "Status", "Notes", "Terms"];
    var invoicesHeaders = ["Invoice ID", "Quotation ID", "Lead ID", "Created At", "Invoice Date", "Due Date", "Customer Name", "Phone", "Email", "From Location", "To Location", "Moving Date", "Moving Type", "Items", "Subtotal", "Discount", "Taxable Amount", "GST %", "GST Amount", "Grand Total", "Amount Paid", "Balance Due", "Payment Status", "Payment Date", "Payment Method", "Payment Notes", "Status", "Notes", "Terms"];

    var leadsSheet = getOrCreateSheet(doc, "Leads", leadsHeaders);
    var followupsSheet = getOrCreateSheet(doc, "Followups", followupsHeaders);
    var quotationsSheet = getOrCreateSheet(doc, "Quotations", quotationsHeaders);
    var invoicesSheet = getOrCreateSheet(doc, "Invoices", invoicesHeaders);

    var data = {};
    if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); }
      catch (err) { data = e.parameter || {}; }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var action = data.action || "createLead";

    // 1. UPDATE LEAD
    if (action === "updateLead") {
      var targetLeadId = data.leadId;
      var lastRow = leadsSheet.getLastRow();
      var found = false;
      if (lastRow > 1) {
        var leadIds = leadsSheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i = 0; i < leadIds.length; i++) {
          if (String(leadIds[i][0]).trim() === String(targetLeadId).trim()) {
            var rowIdx = i + 2;
            if (data.name !== undefined) leadsSheet.getRange(rowIdx, 3).setValue(data.name);
            if (data.phone !== undefined) leadsSheet.getRange(rowIdx, 4).setValue(data.phone);
            if (data.fromLocation !== undefined) leadsSheet.getRange(rowIdx, 5).setValue(data.fromLocation);
            if (data.toLocation !== undefined) leadsSheet.getRange(rowIdx, 6).setValue(data.toLocation);
            if (data.movingDate !== undefined) leadsSheet.getRange(rowIdx, 7).setValue(data.movingDate);
            if (data.movingType !== undefined) leadsSheet.getRange(rowIdx, 8).setValue(data.movingType);
            if (data.status !== undefined) leadsSheet.getRange(rowIdx, 10).setValue(data.status);
            if (data.nextFollowup !== undefined) leadsSheet.getRange(rowIdx, 11).setValue(data.nextFollowup);
            if (data.quotationId !== undefined) leadsSheet.getRange(rowIdx, 12).setValue(data.quotationId);
            if (data.invoiceId !== undefined) leadsSheet.getRange(rowIdx, 13).setValue(data.invoiceId);
            if (data.notes !== undefined) leadsSheet.getRange(rowIdx, 14).setValue(data.notes);
            found = true;
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: found, leadId: targetLeadId })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. UPDATE LEAD STATUS
    if (action === "updateLeadStatus") {
      var targetLeadId = data.leadId;
      var newStatus = data.status;
      var lastRow = leadsSheet.getLastRow();
      var found = false;
      if (lastRow > 1) {
        var leadIds = leadsSheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i = 0; i < leadIds.length; i++) {
          if (String(leadIds[i][0]).trim() === String(targetLeadId).trim()) {
            leadsSheet.getRange(i + 2, 10).setValue(newStatus);
            found = true;
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: found, leadId: targetLeadId, status: newStatus })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. CREATE FOLLOWUP
    if (action === "createFollowup") {
      var followupId = data.followupId || ("FLP" + Utilities.formatDate(new Date(), "Asia/Kolkata", "yyMMddHHmmss"));
      var fRow = [followupId, data.leadId || "", data.createdAt || new Date().toISOString(), data.customerName || "", data.phone || "", data.followupDate || "", data.followupTime || "", data.status || "PENDING", data.notes || "", data.completedAt || ""];
      followupsSheet.getRange(followupsSheet.getLastRow() + 1, 1, 1, fRow.length).setValues([fRow]);
      return ContentService.createTextOutput(JSON.stringify({ success: true, followupId: followupId })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. COMPLETE FOLLOWUP
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
      return ContentService.createTextOutput(JSON.stringify({ success: fFound, followupId: targetFId })).setMimeType(ContentService.MimeType.JSON);
    }

    // 5. CREATE QUOTATION
    if (action === "createQuotation") {
      var qId = data.quotationId;
      var qRow = [
        qId, data.leadId || "", data.invoiceId || "", data.createdAt || new Date().toISOString(),
        data.quotationDate || "", data.validUntil || "", data.customerName || "", data.phone || "", data.email || "",
        data.fromLocation || "", data.toLocation || "", data.movingDate || "", data.movingType || "House Shifting",
        typeof data.items === 'string' ? data.items : JSON.stringify(data.items || []),
        Number(data.subtotal) || 0, Number(data.discount) || 0, Number(data.taxableAmount) || 0,
        Number(data.gstPercentage) || 0, Number(data.gstAmount) || 0, Number(data.grandTotal) || 0,
        data.status || "DRAFT", data.notes || "", data.terms || ""
      ];
      quotationsSheet.getRange(quotationsSheet.getLastRow() + 1, 1, 1, qRow.length).setValues([qRow]);
      return ContentService.createTextOutput(JSON.stringify({ success: true, quotationId: qId })).setMimeType(ContentService.MimeType.JSON);
    }

    // 6. UPDATE QUOTATION
    if (action === "updateQuotation") {
      var qId = data.quotationId;
      var lastRow = quotationsSheet.getLastRow();
      var found = false;
      if (lastRow > 1) {
        var ids = quotationsSheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i = 0; i < ids.length; i++) {
          if (String(ids[i][0]).trim() === String(qId).trim()) {
            var qRow = [
              qId, data.leadId || "", data.invoiceId || "", data.createdAt || new Date().toISOString(),
              data.quotationDate || "", data.validUntil || "", data.customerName || "", data.phone || "", data.email || "",
              data.fromLocation || "", data.toLocation || "", data.movingDate || "", data.movingType || "House Shifting",
              typeof data.items === 'string' ? data.items : JSON.stringify(data.items || []),
              Number(data.subtotal) || 0, Number(data.discount) || 0, Number(data.taxableAmount) || 0,
              Number(data.gstPercentage) || 0, Number(data.gstAmount) || 0, Number(data.grandTotal) || 0,
              data.status || "DRAFT", data.notes || "", data.terms || ""
            ];
            quotationsSheet.getRange(i + 2, 1, 1, qRow.length).setValues([qRow]);
            found = true;
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: found, quotationId: qId })).setMimeType(ContentService.MimeType.JSON);
    }

    // 7. UPDATE QUOTATION STATUS
    if (action === "updateQuotationStatus") {
      var qId = data.quotationId;
      var newStatus = data.status;
      var lastRow = quotationsSheet.getLastRow();
      var found = false;
      if (lastRow > 1) {
        var ids = quotationsSheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i = 0; i < ids.length; i++) {
          if (String(ids[i][0]).trim() === String(qId).trim()) {
            quotationsSheet.getRange(i + 2, 21).setValue(newStatus);
            found = true;
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: found, quotationId: qId, status: newStatus })).setMimeType(ContentService.MimeType.JSON);
    }

    // 8. CREATE INVOICE
    if (action === "createInvoice") {
      var invId = data.invoiceId;
      var invRow = [
        invId, data.quotationId || "", data.leadId || "", data.createdAt || new Date().toISOString(),
        data.invoiceDate || "", data.dueDate || "", data.customerName || "", data.phone || "", data.email || "",
        data.fromLocation || "", data.toLocation || "", data.movingDate || "", data.movingType || "House Shifting",
        typeof data.items === 'string' ? data.items : JSON.stringify(data.items || []),
        Number(data.subtotal) || 0, Number(data.discount) || 0, Number(data.taxableAmount) || 0,
        Number(data.gstPercentage) || 0, Number(data.gstAmount) || 0, Number(data.grandTotal) || 0,
        Number(data.amountPaid) || 0, Number(data.balanceDue) || 0, data.paymentStatus || "UNPAID",
        data.paymentDate || "", data.paymentMethod || "", data.paymentNotes || "",
        data.status || "DRAFT", data.notes || "", data.terms || ""
      ];
      invoicesSheet.getRange(invoicesSheet.getLastRow() + 1, 1, 1, invRow.length).setValues([invRow]);
      return ContentService.createTextOutput(JSON.stringify({ success: true, invoiceId: invId })).setMimeType(ContentService.MimeType.JSON);
    }

    // 9. UPDATE INVOICE
    if (action === "updateInvoice") {
      var invId = data.invoiceId;
      var lastRow = invoicesSheet.getLastRow();
      var found = false;
      if (lastRow > 1) {
        var ids = invoicesSheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i = 0; i < ids.length; i++) {
          if (String(ids[i][0]).trim() === String(invId).trim()) {
            var invRow = [
              invId, data.quotationId || "", data.leadId || "", data.createdAt || new Date().toISOString(),
              data.invoiceDate || "", data.dueDate || "", data.customerName || "", data.phone || "", data.email || "",
              data.fromLocation || "", data.toLocation || "", data.movingDate || "", data.movingType || "House Shifting",
              typeof data.items === 'string' ? data.items : JSON.stringify(data.items || []),
              Number(data.subtotal) || 0, Number(data.discount) || 0, Number(data.taxableAmount) || 0,
              Number(data.gstPercentage) || 0, Number(data.gstAmount) || 0, Number(data.grandTotal) || 0,
              Number(data.amountPaid) || 0, Number(data.balanceDue) || 0, data.paymentStatus || "UNPAID",
              data.paymentDate || "", data.paymentMethod || "", data.paymentNotes || "",
              data.status || "DRAFT", data.notes || "", data.terms || ""
            ];
            invoicesSheet.getRange(i + 2, 1, 1, invRow.length).setValues([invRow]);
            found = true;
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: found, invoiceId: invId })).setMimeType(ContentService.MimeType.JSON);
    }

    // 10. UPDATE INVOICE PAYMENT
    if (action === "updateInvoicePayment") {
      var invId = data.invoiceId;
      var lastRow = invoicesSheet.getLastRow();
      var found = false;
      if (lastRow > 1) {
        var ids = invoicesSheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i = 0; i < ids.length; i++) {
          if (String(ids[i][0]).trim() === String(invId).trim()) {
            var rowIdx = i + 2;
            invoicesSheet.getRange(rowIdx, 21).setValue(Number(data.amountPaid) || 0);
            invoicesSheet.getRange(rowIdx, 22).setValue(Number(data.balanceDue) || 0);
            invoicesSheet.getRange(rowIdx, 23).setValue(data.paymentStatus || "UNPAID");
            if (data.paymentDate !== undefined) invoicesSheet.getRange(rowIdx, 24).setValue(data.paymentDate);
            if (data.paymentMethod !== undefined) invoicesSheet.getRange(rowIdx, 25).setValue(data.paymentMethod);
            if (data.paymentNotes !== undefined) invoicesSheet.getRange(rowIdx, 26).setValue(data.paymentNotes);
            found = true;
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: found, invoiceId: invId })).setMimeType(ContentService.MimeType.JSON);
    }

    // 11. UPDATE INVOICE STATUS
    if (action === "updateInvoiceStatus") {
      var invId = data.invoiceId;
      var newStatus = data.status;
      var lastRow = invoicesSheet.getLastRow();
      var found = false;
      if (lastRow > 1) {
        var ids = invoicesSheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i = 0; i < ids.length; i++) {
          if (String(ids[i][0]).trim() === String(invId).trim()) {
            invoicesSheet.getRange(i + 2, 27).setValue(newStatus);
            found = true;
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: found, invoiceId: invId, status: newStatus })).setMimeType(ContentService.MimeType.JSON);
    }

    // 12. DEFAULT ACTION: CREATE LEAD & EMAIL ALERT
    var leadId = data.leadId || ("SFY" + Utilities.formatDate(new Date(), "Asia/Kolkata", "yyMMddHHmmss"));
    var createdAt = data.createdAt || new Date().toISOString();
    var name = data.name || "";
    var phone = data.phone || "";
    var fromLocation = data.fromLocation || "";
    var toLocation = data.toLocation || "";
    var movingDate = data.movingDate || "";
    var movingType = data.movingType || "House Shifting";
    var source = data.source || "website";
    var status = data.status || "NEW";
    var nextFollowup = data.nextFollowup || "";
    var quotationId = data.quotationId || "";
    var invoiceId = data.invoiceId || "";
    var notes = data.notes || "";

    var rowData = [leadId, createdAt, name, phone, fromLocation, toLocation, movingDate, movingType, source, status, nextFollowup, quotationId, invoiceId, notes];
    leadsSheet.getRange(leadsSheet.getLastRow() + 1, 1, 1, rowData.length).setValues([rowData]);

    // Email dispatch to shiftify.leads@gmail.com
    var targetEmail = "shiftify.leads@gmail.com";
    try {
      var subject = "🚚 New Move Lead [" + leadId + "]: " + name + " (" + movingType + ")";
      var htmlBody = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">'
        + '<div style="background-color: #0f172a; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">'
        + '<h2 style="color: #ea580c; margin: 0; font-size: 20px;">🚚 Shiftify Packers & Movers</h2>'
        + '<p style="color: #cbd5e1; margin: 4px 0 0 0; font-size: 13px;">New Relocation Enquiry Received</p>'
        + '</div>'
        + '<table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">'
        + '<tr style="background-color: #f8fafc;"><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Lead ID</td><td style="padding: 10px; border: 1px solid #e2e8f0; color: #ea580c; font-weight: bold;">' + leadId + '</td></tr>'
        + '<tr><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Customer Name</td><td style="padding: 10px; border: 1px solid #e2e8f0;">' + name + '</td></tr>'
        + '<tr style="background-color: #f8fafc;"><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Phone Number</td><td style="padding: 10px; border: 1px solid #e2e8f0;"><a href="tel:' + phone + '" style="color: #2563eb; font-weight: bold; text-decoration: none;">' + phone + '</a> &nbsp; | &nbsp; <a href="https://wa.me/91' + phone + '" style="color: #16a34a; font-weight: bold; text-decoration: none;">WhatsApp</a></td></tr>'
        + '<tr><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Moving Type</td><td style="padding: 10px; border: 1px solid #e2e8f0;">' + movingType + '</td></tr>'
        + '<tr style="background-color: #f8fafc;"><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Pickup Location</td><td style="padding: 10px; border: 1px solid #e2e8f0;">' + fromLocation + '</td></tr>'
        + '<tr><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Drop Location</td><td style="padding: 10px; border: 1px solid #e2e8f0;">' + toLocation + '</td></tr>'
        + '<tr style="background-color: #f8fafc;"><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Moving Date</td><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">' + movingDate + '</td></tr>'
        + '<tr><td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Received At</td><td style="padding: 10px; border: 1px solid #e2e8f0; color: #64748b;">' + createdAt + '</td></tr>'
        + '</table>'
        + '<div style="text-align: center; margin-top: 20px;">'
        + '<a href="tel:' + phone + '" style="display: inline-block; background-color: #ea580c; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-right: 10px;">Call Customer</a>'
        + '<a href="https://wa.me/91' + phone + '" style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">Chat on WhatsApp</a>'
        + '</div>'
        + '</div>';

      MailApp.sendEmail({ to: targetEmail, subject: subject, htmlBody: htmlBody });
    } catch (mailErr) {
      Logger.log("Email dispatch error: " + mailErr.toString());
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Lead recorded in Google Sheet and emailed to shiftify.leads@gmail.com",
      leadId: leadId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getAll";

    // 1. LEADS
    var leads = [];
    var leadsSheet = doc.getSheetByName("Leads");
    if (leadsSheet) {
      var lastLeadRow = leadsSheet.getLastRow();
      if (lastLeadRow > 1) {
        var cols = Math.max(14, leadsSheet.getLastColumn());
        var leadVals = leadsSheet.getRange(2, 1, lastLeadRow - 1, cols).getValues();
        for (var i = 0; i < leadVals.length; i++) {
          var r = leadVals[i];
          if (r[0]) {
            leads.push({
              leadId: String(r[0]), createdAt: String(r[1]||""), name: String(r[2]||""),
              phone: String(r[3]||""), fromLocation: String(r[4]||""), toLocation: String(r[5]||""),
              movingDate: String(r[6]||""), movingType: String(r[7]||""), source: String(r[8]||"website"),
              status: String(r[9]||"NEW"), nextFollowup: String(r[10]||""),
              quotationId: String(r[11]||""), invoiceId: String(r[12]||""), notes: String(r[13]||"")
            });
          }
        }
      }
    }

    // 2. FOLLOWUPS
    var followups = [];
    var fSheet = doc.getSheetByName("Followups");
    if (fSheet) {
      var lastFRow = fSheet.getLastRow();
      if (lastFRow > 1) {
        var fVals = fSheet.getRange(2, 1, lastFRow - 1, 10).getValues();
        for (var j = 0; j < fVals.length; j++) {
          var fr = fVals[j];
          if (fr[0]) {
            followups.push({
              followupId: String(fr[0]), leadId: String(fr[1]||""), createdAt: String(fr[2]||""),
              customerName: String(fr[3]||""), phone: String(fr[4]||""), followupDate: String(fr[5]||""),
              followupTime: String(fr[6]||""), status: String(fr[7]||"PENDING"), notes: String(fr[8]||""),
              completedAt: String(fr[9]||"")
            });
          }
        }
      }
    }

    // 3. QUOTATIONS
    var quotations = [];
    var qSheet = doc.getSheetByName("Quotations");
    if (qSheet) {
      var lastQRow = qSheet.getLastRow();
      if (lastQRow > 1) {
        var qVals = qSheet.getRange(2, 1, lastQRow - 1, 23).getValues();
        for (var q = 0; q < qVals.length; q++) {
          var qr = qVals[q];
          if (qr[0]) {
            var parsedItems = [];
            try { parsedItems = typeof qr[13] === "string" ? JSON.parse(qr[13]) : qr[13]; } catch(e) { parsedItems = []; }
            quotations.push({
              quotationId: String(qr[0]), leadId: String(qr[1]||""), invoiceId: String(qr[2]||""),
              createdAt: String(qr[3]||""), quotationDate: String(qr[4]||""), validUntil: String(qr[5]||""),
              customerName: String(qr[6]||""), phone: String(qr[7]||""), email: String(qr[8]||""),
              fromLocation: String(qr[9]||""), toLocation: String(qr[10]||""), movingDate: String(qr[11]||""),
              movingType: String(qr[12]||"House Shifting"), items: parsedItems,
              subtotal: Number(qr[14]) || 0, discount: Number(qr[15]) || 0, taxableAmount: Number(qr[16]) || 0,
              gstPercentage: Number(qr[17]) || 0, gstAmount: Number(qr[18]) || 0, grandTotal: Number(qr[19]) || 0,
              status: String(qr[20]||"DRAFT"), notes: String(qr[21]||""), terms: String(qr[22]||"")
            });
          }
        }
      }
    }

    // 4. INVOICES
    var invoices = [];
    var invSheet = doc.getSheetByName("Invoices");
    if (invSheet) {
      var lastInvRow = invSheet.getLastRow();
      if (lastInvRow > 1) {
        var invVals = invSheet.getRange(2, 1, lastInvRow - 1, 29).getValues();
        for (var k = 0; k < invVals.length; k++) {
          var ir = invVals[k];
          if (ir[0]) {
            var parsedItems = [];
            try { parsedItems = typeof ir[13] === "string" ? JSON.parse(ir[13]) : ir[13]; } catch(e) { parsedItems = []; }
            invoices.push({
              invoiceId: String(ir[0]), quotationId: String(ir[1]||""), leadId: String(ir[2]||""),
              createdAt: String(ir[3]||""), invoiceDate: String(ir[4]||""), dueDate: String(ir[5]||""),
              customerName: String(ir[6]||""), phone: String(ir[7]||""), email: String(ir[8]||""),
              fromLocation: String(ir[9]||""), toLocation: String(ir[10]||""), movingDate: String(ir[11]||""),
              movingType: String(ir[12]||"House Shifting"), items: parsedItems,
              subtotal: Number(ir[14]) || 0, discount: Number(ir[15]) || 0, taxableAmount: Number(ir[16]) || 0,
              gstPercentage: Number(ir[17]) || 0, gstAmount: Number(ir[18]) || 0, grandTotal: Number(ir[19]) || 0,
              amountPaid: Number(ir[20]) || 0, balanceDue: Number(ir[21]) || 0, paymentStatus: String(ir[22]||"UNPAID"),
              paymentDate: String(ir[23]||""), paymentMethod: String(ir[24]||""), paymentNotes: String(ir[25]||""),
              status: String(ir[26]||"DRAFT"), notes: String(ir[27]||""), terms: String(ir[28]||"")
            });
          }
        }
      }
    }

    if (action === "getLeads") return ContentService.createTextOutput(JSON.stringify({ success: true, leads: leads })).setMimeType(ContentService.MimeType.JSON);
    if (action === "getFollowups") return ContentService.createTextOutput(JSON.stringify({ success: true, followups: followups })).setMimeType(ContentService.MimeType.JSON);
    if (action === "getQuotations") return ContentService.createTextOutput(JSON.stringify({ success: true, quotations: quotations })).setMimeType(ContentService.MimeType.JSON);
    if (action === "getInvoices") return ContentService.createTextOutput(JSON.stringify({ success: true, invoices: invoices })).setMimeType(ContentService.MimeType.JSON);

    return ContentService.createTextOutput(JSON.stringify({
      status: "online", success: true,
      leadsCount: leads.length, followupsCount: followups.length,
      quotationsCount: quotations.length, invoicesCount: invoices.length,
      leads: leads, followups: followups, quotations: quotations, invoices: invoices
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyScript = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Table className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 font-display">
              Google Sheets Architecture & Setup
            </h3>
            <p className="text-xs text-slate-500">
              Zero client-credential exposure: Form ➡️ /api/leads ➡️ Google Apps Script ➡️ Sheet + Instant Email Notification
            </p>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">Lead Notification Target:</span>
            <span className="font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded text-emerald-800">shiftify.leads@gmail.com</span>
          </div>
          <span className="text-[11px] text-emerald-700 hidden sm:inline">Emails sent automatically upon submission</span>
        </div>

        {/* 3 Step Deployment Guide */}
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] flex items-center justify-center">1</span>
              <span>Create or Use Any Google Sheet (Auto-Provisioned)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Open your existing Google Sheet or create a new one on <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-orange-600 underline font-semibold">sheets.new</a>. <strong>You don't need to manually create tabs or columns!</strong> The script will automatically create and format all 4 sheets with bold headers and frozen rows:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 bg-slate-900 text-emerald-400 rounded-lg">
                <strong className="text-white block font-sans">Sheet 1: Leads</strong>
                14 columns (Lead ID, Name, Phone, Routes, Status...)
              </div>
              <div className="p-2 bg-slate-900 text-cyan-400 rounded-lg">
                <strong className="text-white block font-sans">Sheet 2: Followups</strong>
                10 columns (Follow-up ID, Date, Time, Status, Notes...)
              </div>
              <div className="p-2 bg-slate-900 text-amber-400 rounded-lg">
                <strong className="text-white block font-sans">Sheet 3: Quotations</strong>
                23 columns (Quotation ID, Items, Totals, GST, Terms...)
              </div>
              <div className="p-2 bg-slate-900 text-indigo-400 rounded-lg">
                <strong className="text-white block font-sans">Sheet 4: Invoices</strong>
                29 columns (Invoice ID, Due Date, Payments, Status...)
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] flex items-center justify-center">2</span>
              <span>Deploy Google Apps Script (Auto-sync to Sheet & Email to shiftify.leads@gmail.com)</span>
            </div>
            <p className="text-slate-600">
              In Google Sheet, click <strong>Extensions ➡️ Apps Script</strong>, paste the script below. It saves each lead into your sheet and automatically delivers a formatted alert email to <strong>shiftify.leads@gmail.com</strong>. Click <strong>Deploy ➡️ New deployment ➡️ Web App</strong> (Execute as: Me, Who has access: Anyone), and copy your Web App URL.
            </p>
            <div className="relative">
              <pre className="p-3 bg-slate-900 text-slate-200 font-mono text-[10px] rounded-xl overflow-x-auto max-h-48 leading-tight">
                {scriptCode}
              </pre>
              <button
                onClick={copyScript}
                className="absolute top-2 right-2 px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Script'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] flex items-center justify-center">3</span>
              <span>Configure Environment Variable</span>
            </div>
            <p className="text-slate-600">
              Add your Web App URL in <code className="bg-slate-200 px-1 rounded text-slate-800">.env</code>:
            </p>
            <div className="p-2 bg-slate-900 text-orange-400 font-mono text-[11px] rounded-lg select-all">
              GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/.../exec"
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
