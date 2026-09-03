// server/app.ts
import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

// server/adminService.ts
import crypto from "crypto";
var storedLeads = /* @__PURE__ */ new Map();
var storedFollowups = /* @__PURE__ */ new Map();
var storedQuotations = /* @__PURE__ */ new Map();
var storedInvoices = /* @__PURE__ */ new Map();
function generateQuotationNumber() {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const prefix = `Q-${year}-`;
  let maxSeq = 0;
  for (const qId of storedQuotations.keys()) {
    if (qId.startsWith(prefix)) {
      const seqStr = qId.replace(prefix, "");
      const num = parseInt(seqStr, 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }
  const nextSeq = maxSeq + 1;
  const padded = String(nextSeq).padStart(4, "0");
  const candidate = `${prefix}${padded}`;
  if (storedQuotations.has(candidate)) {
    return `${prefix}${String(maxSeq + 2).padStart(4, "0")}`;
  }
  return candidate;
}
function generateInvoiceNumber() {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const prefix = `INV-${year}-`;
  let maxSeq = 0;
  for (const invId of storedInvoices.keys()) {
    if (invId.startsWith(prefix)) {
      const seqStr = invId.replace(prefix, "");
      const num = parseInt(seqStr, 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }
  const nextSeq = maxSeq + 1;
  const padded = String(nextSeq).padStart(4, "0");
  const candidate = `${prefix}${padded}`;
  if (storedInvoices.has(candidate)) {
    return `${prefix}${String(maxSeq + 2).padStart(4, "0")}`;
  }
  return candidate;
}
function calculateFinancialTotals(rawItems, rawDiscount, rawGstPercentage) {
  const items = (Array.isArray(rawItems) ? rawItems : []).map((item, idx) => {
    const desc = String(item.description || `Charge Item ${idx + 1}`).trim();
    const qty = Math.max(1, Math.round(Number(item.quantity) || 1));
    const unitPrice = Math.max(0, Math.round((Number(item.unitPrice) || 0) * 100) / 100);
    const amount = Math.round(qty * unitPrice * 100) / 100;
    return {
      id: item.id || `item_${idx + 1}_${Date.now()}`,
      description: desc || "Packing & Moving Service",
      quantity: qty,
      unitPrice,
      amount,
      total: amount
    };
  });
  const subtotal = items.reduce((sum, it) => sum + it.amount, 0);
  const discountInput = Math.max(0, Math.round((Number(rawDiscount) || 0) * 100) / 100);
  const discount = Math.min(discountInput, subtotal);
  const taxableAmount = Math.max(0, Math.round((subtotal - discount) * 100) / 100);
  const gstPercentage = Math.max(0, Math.min(100, Math.round((Number(rawGstPercentage) ?? 18) * 100) / 100));
  const gstAmount = Math.round(taxableAmount * (gstPercentage / 100) * 100) / 100;
  const grandTotal = Math.round((taxableAmount + gstAmount) * 100) / 100;
  return {
    items,
    subtotal,
    discount,
    taxableAmount,
    gstPercentage,
    gstAmount,
    grandTotal
  };
}
function calculateInvoiceFinancialTotals(rawItems, rawDiscount, rawGstPercentage, rawAmountPaid) {
  const baseTotals = calculateFinancialTotals(rawItems, rawDiscount, rawGstPercentage);
  const amountPaid = Math.max(0, Math.round((Number(rawAmountPaid) || 0) * 100) / 100);
  const balanceDue = Math.max(0, Math.round((baseTotals.grandTotal - amountPaid) * 100) / 100);
  let paymentStatus = "UNPAID";
  if (amountPaid >= baseTotals.grandTotal && baseTotals.grandTotal > 0) {
    paymentStatus = "PAID";
  } else if (amountPaid > 0) {
    paymentStatus = "PARTIALLY_PAID";
  }
  return {
    ...baseTotals,
    amountPaid,
    balanceDue,
    paymentStatus
  };
}
function generateLeadId() {
  const now = /* @__PURE__ */ new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const randomSuffix = Math.floor(1e3 + Math.random() * 9e3).toString();
  return `SFY${year}${month}${day}${randomSuffix}`;
}
function getTodayDateString() {
  const now = /* @__PURE__ */ new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function seedInitialAdminData() {
  if (storedLeads.size > 0) return;
  const today = getTodayDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1e3).toISOString().split("T")[0];
  const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1e3).toISOString().split("T")[0];
  const fiveDaysAgo = new Date(Date.now() - 120 * 60 * 60 * 1e3).toISOString().split("T")[0];
  const sampleLeads = [
    {
      leadId: "SFY2609011024",
      createdAt: `${today}T09:30:00.000Z`,
      name: "Aditya Narayanan",
      phone: "9845123456",
      email: "aditya.n@gmail.com",
      fromLocation: "HSR Layout Sector 2, Bangalore",
      toLocation: "Whitefield Prestige Palms, Bangalore",
      movingDate: "2026-09-12",
      movingType: "House Shifting",
      source: "Website",
      status: "NEW",
      nextFollowup: `${today} 04:00 PM`,
      notes: "Customer requested 3BHK premium packing and double-layered bubble wrap for glass dining table."
    },
    {
      leadId: "SFY2609010915",
      createdAt: `${today}T08:15:00.000Z`,
      name: "Priyanka Sen",
      phone: "9731234567",
      email: "priyanka.sen@outlook.com",
      fromLocation: "Indiranagar 100ft Road, Bangalore",
      toLocation: "Bellandur Green Glen, Bangalore",
      movingDate: "2026-09-15",
      movingType: "House Shifting",
      source: "Google",
      status: "CONTACTED",
      nextFollowup: `${today} 02:30 PM`,
      notes: "Quotation shared for 2BHK relocation. Follow up regarding elevator booking at society."
    },
    {
      leadId: "SFY2608311542",
      createdAt: `${yesterday}T15:42:00.000Z`,
      name: "Dr. Suresh Kulkarni",
      phone: "9880123987",
      fromLocation: "Koramangala 4th Block, Bangalore",
      toLocation: "Banjara Hills, Hyderabad",
      movingDate: "2026-09-20",
      movingType: "Intercity Shifting",
      source: "Direct Website",
      status: "QUOTATION_SENT",
      nextFollowup: `${today} 05:30 PM`
    },
    {
      leadId: "SFY2608311120",
      createdAt: `${yesterday}T11:20:00.000Z`,
      name: "Vikram Joshi (InnoTech Labs)",
      phone: "9611234890",
      fromLocation: "Embassy Tech Village, Outer Ring Road",
      toLocation: "Bagmane Tech Park, CV Raman Nagar",
      movingDate: "2026-09-25",
      movingType: "Office Shifting",
      source: "Corporate Relocation",
      status: "FOLLOW_UP",
      nextFollowup: `${today} 11:30 AM`
    },
    {
      leadId: "SFY2608301410",
      createdAt: `${twoDaysAgo}T14:10:00.000Z`,
      name: "Ananya Raghavan",
      phone: "9900123456",
      fromLocation: "Jayanagar 4th T Block, Bangalore",
      toLocation: "Sarjapur Road Rainbow Drive, Bangalore",
      movingDate: "2026-09-10",
      movingType: "House Shifting",
      source: "Website Header CTA",
      status: "CONFIRMED",
      nextFollowup: "2026-09-09 10:00 AM"
    },
    {
      leadId: "SFY2608291620",
      createdAt: `${threeDaysAgo}T16:20:00.000Z`,
      name: "Rohan Mehta",
      phone: "9844567890",
      fromLocation: "Malleshwaram 15th Cross, Bangalore",
      toLocation: "Andheri West, Mumbai",
      movingDate: "2026-09-08",
      movingType: "Vehicle Transport",
      source: "Website Calculator",
      status: "SCHEDULED",
      nextFollowup: "2026-09-07 11:00 AM"
    },
    {
      leadId: "SFY2608271030",
      createdAt: `${fiveDaysAgo}T10:30:00.000Z`,
      name: "Meera Deshmukh",
      phone: "9740123456",
      fromLocation: "JP Nagar Phase 7, Bangalore",
      toLocation: "Koramangala 6th Block, Bangalore",
      movingDate: "2026-09-01",
      movingType: "Local Shifting",
      source: "WhatsApp Referral",
      status: "COMPLETED"
    },
    {
      leadId: "SFY2608261200",
      createdAt: `${fiveDaysAgo}T12:00:00.000Z`,
      name: "Karthik Raja",
      phone: "9620123789",
      fromLocation: "Marathahalli Bridge, Bangalore",
      toLocation: "Kalyan Nagar, Bangalore",
      movingDate: "2026-08-30",
      movingType: "House Shifting",
      source: "Website Lead Form",
      status: "LOST",
      notes: "Customer postponed relocation to next quarter"
    }
  ];
  sampleLeads.forEach((l) => storedLeads.set(l.leadId, l));
  const sampleFollowups = [
    {
      followupId: "FLP260902001",
      leadId: "SFY2609011024",
      createdAt: `${today}T09:35:00.000Z`,
      customerName: "Aditya Narayanan",
      phone: "9845123456",
      followupDate: today,
      followupTime: "04:00 PM",
      status: "PENDING",
      notes: "Call to confirm 3BHK inventory and send shifting checklist."
    },
    {
      followupId: "FLP260902002",
      leadId: "SFY2608311120",
      createdAt: `${today}T08:30:00.000Z`,
      customerName: "Vikram Joshi (InnoTech Labs)",
      phone: "9611234890",
      followupDate: today,
      followupTime: "11:30 AM",
      status: "PENDING",
      notes: "Corporate site inspection discussion for server rack moving."
    },
    {
      followupId: "FLP260901003",
      leadId: "SFY2608301410",
      createdAt: `${twoDaysAgo}T14:15:00.000Z`,
      customerName: "Ananya Raghavan",
      phone: "9900123456",
      followupDate: yesterday,
      followupTime: "03:00 PM",
      status: "COMPLETED",
      notes: "Advance token confirmed via UPI. Move scheduled for Sept 10th.",
      completedAt: `${yesterday}T15:05:00.000Z`
    }
  ];
  sampleFollowups.forEach((f) => storedFollowups.set(f.followupId, f));
  const q1Items = [
    { id: "item_1", description: "3BHK Complete Household Multi-layer Packing (Cartons, Bubble, Corrugated sheets)", quantity: 1, unitPrice: 12500, amount: 12500 },
    { id: "item_2", description: "Dedicated Closed Container Transit (Bangalore to Hyderabad 575km)", quantity: 1, unitPrice: 7500, amount: 7500 },
    { id: "item_3", description: "Loading & Unloading with Skilled Crew (Both Locations)", quantity: 1, unitPrice: 3e3, amount: 3e3 }
  ];
  const q1Totals = calculateFinancialTotals(q1Items, 1e3, 18);
  const sampleQuotation1 = {
    quotationId: "Q-2026-0001",
    leadId: "SFY2608311542",
    createdAt: `${yesterday}T16:00:00.000Z`,
    quotationDate: yesterday,
    validUntil: new Date(Date.now() + 7 * 864e5).toISOString().split("T")[0],
    customerName: "Dr. Suresh Kulkarni",
    phone: "9448123456",
    email: "dr.suresh@gmail.com",
    fromLocation: "Basavanagudi, Bangalore",
    toLocation: "Banjara Hills, Hyderabad",
    movingDate: "2026-09-15",
    movingType: "House Shifting",
    items: q1Totals.items,
    subtotal: q1Totals.subtotal,
    discount: q1Totals.discount,
    taxableAmount: q1Totals.taxableAmount,
    gstPercentage: q1Totals.gstPercentage,
    gstAmount: q1Totals.gstAmount,
    grandTotal: q1Totals.grandTotal,
    status: "SENT",
    notes: "Fragile antique wooden furniture and glassware to be packed with extra bubble protection.",
    terms: "1. Quotation valid for 7 days from the date of issue.\n2. 50% advance on packing commencement, balance upon safe delivery.\n3. Octroi / State green tax if applicable charged at actual receipt.\n4. Flammable items, jewelry, and currency will not be transported."
  };
  storedQuotations.set(sampleQuotation1.quotationId, sampleQuotation1);
  const lead1 = storedLeads.get("SFY2608311542");
  if (lead1) lead1.quotationId = sampleQuotation1.quotationId;
  const q2Items = [
    { id: "item_1", description: "2BHK Apartment Shifting & Professional Furniture Dismantling", quantity: 1, unitPrice: 9500, amount: 9500 },
    { id: "item_2", description: "Local 14ft Container Transit (Jayanagar to Sarjapur Road)", quantity: 1, unitPrice: 4500, amount: 4500 },
    { id: "item_3", description: "Unpacking and Placement at New Residence", quantity: 1, unitPrice: 2e3, amount: 2e3 }
  ];
  const q2Totals = calculateFinancialTotals(q2Items, 500, 18);
  const sampleQuotation2 = {
    quotationId: "Q-2026-0002",
    leadId: "SFY2608301410",
    invoiceId: "INV-2026-0001",
    createdAt: `${twoDaysAgo}T15:00:00.000Z`,
    quotationDate: twoDaysAgo,
    validUntil: new Date(Date.now() + 5 * 864e5).toISOString().split("T")[0],
    customerName: "Ananya Raghavan",
    phone: "9900123456",
    email: "ananya.raghavan@gmail.com",
    fromLocation: "Jayanagar 4th T Block, Bangalore",
    toLocation: "Sarjapur Road Rainbow Drive, Bangalore",
    movingDate: "2026-09-10",
    movingType: "House Shifting",
    items: q2Totals.items,
    subtotal: q2Totals.subtotal,
    discount: q2Totals.discount,
    taxableAmount: q2Totals.taxableAmount,
    gstPercentage: q2Totals.gstPercentage,
    gstAmount: q2Totals.gstAmount,
    grandTotal: q2Totals.grandTotal,
    status: "ACCEPTED",
    notes: "Advance token received. Full house setup required on destination floor.",
    terms: "1. Quotation valid for 7 days.\n2. Balance payable on completion of shifting."
  };
  storedQuotations.set(sampleQuotation2.quotationId, sampleQuotation2);
  const inv1Totals = calculateInvoiceFinancialTotals(q2Items, 500, 18, 1e4);
  const sampleInvoice1 = {
    invoiceId: "INV-2026-0001",
    quotationId: "Q-2026-0002",
    leadId: "SFY2608301410",
    createdAt: `${yesterday}T10:00:00.000Z`,
    invoiceDate: yesterday,
    dueDate: "2026-09-10",
    customerName: "Ananya Raghavan",
    phone: "9900123456",
    email: "ananya.raghavan@gmail.com",
    fromLocation: "Jayanagar 4th T Block, Bangalore",
    toLocation: "Sarjapur Road Rainbow Drive, Bangalore",
    movingDate: "2026-09-10",
    movingType: "House Shifting",
    items: inv1Totals.items,
    subtotal: inv1Totals.subtotal,
    discount: inv1Totals.discount,
    taxableAmount: inv1Totals.taxableAmount,
    gstPercentage: inv1Totals.gstPercentage,
    gstAmount: inv1Totals.gstAmount,
    grandTotal: inv1Totals.grandTotal,
    amountPaid: inv1Totals.amountPaid,
    balanceDue: inv1Totals.balanceDue,
    paymentStatus: inv1Totals.paymentStatus,
    paymentDate: yesterday,
    paymentMethod: "UPI",
    paymentNotes: "UPI advance token confirmation received (Txn: UPI893478921).",
    status: "ISSUED",
    notes: "Partially paid advance token of \u20B910,000. Balance \u20B98,290 payable upon unloading.",
    terms: "1. All payments subject to realization.\n2. Balance amount due on final delivery and room placement.\n3. Goods transported under carrier risk terms."
  };
  storedInvoices.set(sampleInvoice1.invoiceId, sampleInvoice1);
  const lead2 = storedLeads.get("SFY2608301410");
  if (lead2) {
    lead2.quotationId = sampleQuotation2.quotationId;
    lead2.invoiceId = sampleInvoice1.invoiceId;
  }
}
var ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "shiftify_secret_key_admin_auth_2026";
function createAdminToken(email) {
  const payload = JSON.stringify({
    email,
    role: "admin",
    exp: Date.now() + 7 * 24 * 60 * 60 * 1e3
    // 7 days expiration
  });
  const encodedPayload = Buffer.from(payload).toString("base64url");
  const signature = crypto.createHmac("sha256", ADMIN_JWT_SECRET).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}
function verifyAdminToken(token) {
  try {
    if (!token || !token.includes(".")) return { valid: false };
    const [encodedPayload, signature] = token.split(".");
    const expectedSig = crypto.createHmac("sha256", ADMIN_JWT_SECRET).update(encodedPayload).digest("base64url");
    if (signature !== expectedSig) return { valid: false };
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (Date.now() > payload.exp) return { valid: false };
    return { valid: true, email: payload.email };
  } catch {
    return { valid: false };
  }
}
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (req.headers["x-admin-token"]) {
    token = String(req.headers["x-admin-token"]).trim();
  }
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Admin authentication required. Please login."
    });
  }
  const { valid, email } = verifyAdminToken(token);
  if (!valid) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired admin session. Please login again."
    });
  }
  req.adminEmail = email;
  next();
}
async function forwardToGoogleAppsScript(payload) {
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!scriptUrl || !scriptUrl.startsWith("http")) return false;
  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return response.ok;
  } catch (err) {
    console.error("[Google Apps Script Sync Error]:", err);
    return false;
  }
}

// server/adminRoutes.ts
import { Router } from "express";
var adminRouter = Router();
var VALID_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUOTATION_SENT",
  "FOLLOW_UP",
  "CONFIRMED",
  "SCHEDULED",
  "COMPLETED",
  "LOST",
  "CANCELLED"
];
var VALID_QUOTATION_STATUSES = [
  "DRAFT",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED"
];
var VALID_INVOICE_STATUSES = [
  "DRAFT",
  "ISSUED",
  "PARTIALLY_PAID",
  "PAID",
  "CANCELLED"
];
var VALID_PAYMENT_STATUSES = [
  "UNPAID",
  "PARTIALLY_PAID",
  "PAID"
];
var VALID_MOVING_TYPES = [
  "House Shifting",
  "Office Shifting",
  "Vehicle Transport",
  "Warehouse / Storage",
  "Local Shifting",
  "Intercity Shifting",
  "Corporate Relocation",
  "Other"
];
var VALID_LEAD_SOURCES = [
  "Website",
  "Phone",
  "WhatsApp",
  "Walk-in",
  "Referral",
  "Facebook",
  "Instagram",
  "Google",
  "Other"
];
adminRouter.post("/login", (req, res) => {
  try {
    const { username, email, identifier, password } = req.body || {};
    const inputIdentifier = (identifier || username || email || "").trim().toLowerCase();
    const inputPassword = (password || "").trim();
    const expectedEmail = (process.env.ADMIN_EMAIL || "admin@shiftify.in").toLowerCase();
    const expectedUsername = (process.env.ADMIN_USERNAME || "admin").toLowerCase();
    const expectedPassword = process.env.ADMIN_PASSWORD || "shiftify2026!";
    if (!inputIdentifier || !inputPassword) {
      return res.status(400).json({
        success: false,
        error: "Please enter both username/email and password"
      });
    }
    const matchesUser = inputIdentifier === expectedEmail || inputIdentifier === expectedUsername;
    const matchesPass = inputPassword === expectedPassword;
    if (!matchesUser || !matchesPass) {
      return res.status(401).json({
        success: false,
        error: "Invalid admin credentials. Please verify username and password."
      });
    }
    const token = createAdminToken(expectedEmail);
    return res.json({
      success: true,
      token,
      user: {
        email: expectedEmail,
        name: "Shiftify Operations Admin",
        role: "Administrator"
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Authentication failed due to an unexpected error."
    });
  }
});
adminRouter.get("/me", requireAdminAuth, (req, res) => {
  res.json({
    success: true,
    user: {
      email: req.adminEmail || process.env.ADMIN_EMAIL || "admin@shiftify.in",
      name: "Shiftify Operations Admin",
      role: "Administrator"
    }
  });
});
adminRouter.get("/stats", requireAdminAuth, (req, res) => {
  try {
    const allLeads = Array.from(storedLeads.values());
    const allFollowups = Array.from(storedFollowups.values());
    const today = getTodayDateString();
    const currentMonth = today.slice(0, 7);
    const statusCounts = {
      NEW: 0,
      CONTACTED: 0,
      QUOTATION_SENT: 0,
      FOLLOW_UP: 0,
      CONFIRMED: 0,
      SCHEDULED: 0,
      COMPLETED: 0,
      LOST: 0,
      CANCELLED: 0
    };
    let leadsToday = 0;
    let leadsThisMonth = 0;
    allLeads.forEach((lead) => {
      if (statusCounts[lead.status] !== void 0) {
        statusCounts[lead.status]++;
      }
      const leadDate = (lead.createdAt || "").slice(0, 10);
      if (leadDate === today) {
        leadsToday++;
      }
      if (leadDate.startsWith(currentMonth)) {
        leadsThisMonth++;
      }
    });
    const recentLeads = [...allLeads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
    const todayFollowups = allFollowups.filter((f) => f.status === "PENDING" && f.followupDate <= today).sort((a, b) => (a.followupDate + a.followupTime).localeCompare(b.followupDate + b.followupTime));
    const totalQuotations = storedQuotations.size;
    const totalInvoices = storedInvoices.size;
    let totalRevenue = 0;
    storedInvoices.forEach((inv) => {
      if (inv.status !== "CANCELLED") {
        totalRevenue += inv.amountPaid || 0;
      }
    });
    res.json({
      success: true,
      stats: {
        totalLeads: allLeads.length,
        statusCounts,
        leadsToday,
        leadsThisMonth,
        recentLeads,
        todayFollowups,
        totalQuotations,
        totalInvoices,
        totalRevenue
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to calculate dashboard statistics" });
  }
});
adminRouter.get("/leads", requireAdminAuth, (req, res) => {
  try {
    const { search, status, movingType, source, leadSource, movingDate, dateFilter, sort } = req.query;
    let leads = Array.from(storedLeads.values());
    const today = getTodayDateString();
    const now = /* @__PURE__ */ new Date();
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      leads = leads.filter(
        (l) => l.leadId.toLowerCase().includes(q) || l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.fromLocation.toLowerCase().includes(q) || l.toLocation.toLowerCase().includes(q) || l.email && l.email.toLowerCase().includes(q)
      );
    }
    if (status && status !== "ALL" && VALID_STATUSES.includes(status)) {
      leads = leads.filter((l) => l.status === status);
    }
    if (movingType && movingType !== "ALL") {
      leads = leads.filter((l) => l.movingType.toLowerCase() === movingType.toLowerCase());
    }
    const activeSource = source || leadSource;
    if (activeSource && activeSource !== "ALL") {
      leads = leads.filter((l) => l.source.toLowerCase() === activeSource.toLowerCase());
    }
    if (movingDate && movingDate.trim()) {
      leads = leads.filter((l) => (l.movingDate || "").startsWith(movingDate.trim()));
    }
    if (dateFilter && dateFilter !== "all") {
      leads = leads.filter((l) => {
        const leadDate = (l.createdAt || "").slice(0, 10);
        if (dateFilter === "today") {
          return leadDate === today;
        }
        if (dateFilter === "this_week") {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
          return leadDate >= sevenDaysAgo;
        }
        if (dateFilter === "this_month") {
          return leadDate.startsWith(today.slice(0, 7));
        }
        return true;
      });
    }
    leads.sort((a, b) => {
      if (sort === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sort === "moving_date" || sort === "moving_date_asc") {
        return (a.movingDate || "").localeCompare(b.movingDate || "");
      }
      if (sort === "moving_date_desc") {
        return (b.movingDate || "").localeCompare(a.movingDate || "");
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    res.json({
      success: true,
      count: leads.length,
      leads
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve leads" });
  }
});
adminRouter.post("/leads", requireAdminAuth, async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      fromLocation,
      toLocation,
      movingDate,
      movingType,
      source,
      notes
    } = req.body || {};
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "Customer Name is required (minimum 2 characters)."
      });
    }
    const cleanPhone = (phone || "").toString().replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: "A valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 is required."
      });
    }
    let cleanEmail = void 0;
    if (email && typeof email === "string" && email.trim().length > 0) {
      const trimmedEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        return res.status(400).json({
          success: false,
          error: "Please enter a valid email address."
        });
      }
      cleanEmail = trimmedEmail;
    }
    if (!fromLocation || typeof fromLocation !== "string" || fromLocation.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "From Location (pickup address) is required."
      });
    }
    if (!toLocation || typeof toLocation !== "string" || toLocation.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "To Location (drop address) is required."
      });
    }
    if (!movingDate || typeof movingDate !== "string" || movingDate.trim().length < 4) {
      return res.status(400).json({
        success: false,
        error: "Moving Date is required."
      });
    }
    const cleanMovingType = VALID_MOVING_TYPES.includes(movingType) ? movingType : "House Shifting";
    const cleanSource = VALID_LEAD_SOURCES.includes(source) ? source : "Phone";
    const leadId = generateLeadId();
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const status = "NEW";
    const newLead = {
      leadId,
      createdAt,
      name: name.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      fromLocation: fromLocation.trim(),
      toLocation: toLocation.trim(),
      movingDate: movingDate.trim(),
      movingType: cleanMovingType,
      source: cleanSource,
      status,
      notes: notes && typeof notes === "string" && notes.trim() ? notes.trim() : void 0
    };
    storedLeads.set(leadId, newLead);
    forwardToGoogleAppsScript({
      action: "createLead",
      ...newLead
    });
    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      lead: newLead
    });
  } catch (err) {
    console.error("Failed to create manual lead:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to create lead due to internal server error."
    });
  }
});
adminRouter.put("/leads/:leadId", requireAdminAuth, async (req, res) => {
  try {
    const queryId = (req.params.leadId || "").toUpperCase().trim();
    const existing = storedLeads.get(queryId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Lead ${queryId} was not found.`
      });
    }
    const {
      name,
      phone,
      email,
      fromLocation,
      toLocation,
      movingDate,
      movingType,
      source,
      notes
    } = req.body || {};
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "Customer Name must be at least 2 characters."
      });
    }
    const cleanPhone = (phone || "").toString().replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: "A valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 is required."
      });
    }
    let cleanEmail = void 0;
    if (email && typeof email === "string" && email.trim().length > 0) {
      const trimmedEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        return res.status(400).json({
          success: false,
          error: "Please enter a valid email address."
        });
      }
      cleanEmail = trimmedEmail;
    }
    if (!fromLocation || typeof fromLocation !== "string" || fromLocation.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "From Location is required."
      });
    }
    if (!toLocation || typeof toLocation !== "string" || toLocation.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "To Location is required."
      });
    }
    if (!movingDate || typeof movingDate !== "string" || movingDate.trim().length < 4) {
      return res.status(400).json({
        success: false,
        error: "Moving Date is required."
      });
    }
    const cleanMovingType = VALID_MOVING_TYPES.includes(movingType) ? movingType : existing.movingType;
    const cleanSource = VALID_LEAD_SOURCES.includes(source) ? source : existing.source;
    existing.name = name.trim();
    existing.phone = cleanPhone;
    existing.email = cleanEmail;
    existing.fromLocation = fromLocation.trim();
    existing.toLocation = toLocation.trim();
    existing.movingDate = movingDate.trim();
    existing.movingType = cleanMovingType;
    existing.source = cleanSource;
    if (notes !== void 0) {
      existing.notes = typeof notes === "string" && notes.trim() ? notes.trim() : void 0;
    }
    storedLeads.set(queryId, existing);
    forwardToGoogleAppsScript({
      action: "updateLead",
      ...existing
    });
    return res.json({
      success: true,
      message: "Lead updated successfully",
      lead: existing
    });
  } catch (err) {
    console.error("Failed to update lead:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to update lead due to internal server error"
    });
  }
});
adminRouter.get("/leads/:leadId", requireAdminAuth, (req, res) => {
  const queryId = (req.params.leadId || "").toUpperCase().trim();
  const lead = storedLeads.get(queryId);
  if (!lead) {
    return res.status(404).json({
      success: false,
      error: `Lead ${queryId} was not found in the database.`
    });
  }
  const leadFollowups = Array.from(storedFollowups.values()).filter((f) => f.leadId.toUpperCase() === queryId).sort((a, b) => (b.followupDate + b.followupTime).localeCompare(a.followupDate + a.followupTime));
  res.json({
    success: true,
    lead,
    followups: leadFollowups
  });
});
adminRouter.patch("/leads/:leadId/status", requireAdminAuth, async (req, res) => {
  try {
    const queryId = (req.params.leadId || "").toUpperCase().trim();
    const { status, notes } = req.body || {};
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`
      });
    }
    const lead = storedLeads.get(queryId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: `Lead ${queryId} was not found.`
      });
    }
    lead.status = status;
    if (notes) {
      lead.notes = (lead.notes ? lead.notes + "\n" : "") + `[${(/* @__PURE__ */ new Date()).toLocaleDateString()}] ${notes}`;
    }
    storedLeads.set(queryId, lead);
    forwardToGoogleAppsScript({
      action: "updateLeadStatus",
      leadId: queryId,
      status
    });
    res.json({
      success: true,
      message: `Lead status updated to ${status}`,
      lead
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update lead status" });
  }
});
adminRouter.get("/followups", requireAdminAuth, (req, res) => {
  try {
    const all = Array.from(storedFollowups.values());
    const today = getTodayDateString();
    const todayFollowups = all.filter((f) => f.status === "PENDING" && f.followupDate <= today).sort((a, b) => (a.followupDate + a.followupTime).localeCompare(b.followupDate + b.followupTime));
    const upcomingFollowups = all.filter((f) => f.status === "PENDING" && f.followupDate > today).sort((a, b) => (a.followupDate + a.followupTime).localeCompare(b.followupDate + b.followupTime));
    const completedFollowups = all.filter((f) => f.status === "COMPLETED").sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""));
    res.json({
      success: true,
      today: todayFollowups,
      upcoming: upcomingFollowups,
      completed: completedFollowups
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve followups" });
  }
});
adminRouter.post("/followups", requireAdminAuth, async (req, res) => {
  try {
    const { leadId, followupDate, followupTime, notes } = req.body || {};
    if (!leadId || !followupDate || !followupTime) {
      return res.status(400).json({
        success: false,
        error: "Lead ID, follow-up date, and follow-up time are required."
      });
    }
    const lead = storedLeads.get(leadId.toUpperCase().trim());
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: `Associated lead ${leadId} not found.`
      });
    }
    const now = /* @__PURE__ */ new Date();
    const dateStr = now.getFullYear().toString().slice(-2) + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0");
    const followupId = `FLP${dateStr}${Math.floor(100 + Math.random() * 900)}`;
    const newFollowup = {
      followupId,
      leadId: lead.leadId,
      createdAt: now.toISOString(),
      customerName: lead.name,
      phone: lead.phone,
      followupDate,
      followupTime,
      status: "PENDING",
      notes: notes || "Scheduled follow-up call."
    };
    storedFollowups.set(followupId, newFollowup);
    lead.nextFollowup = `${followupDate} ${followupTime}`;
    storedLeads.set(lead.leadId, lead);
    forwardToGoogleAppsScript({
      action: "createFollowup",
      ...newFollowup
    });
    res.status(201).json({
      success: true,
      message: "Follow-up scheduled successfully",
      followup: newFollowup
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to schedule follow-up" });
  }
});
adminRouter.patch("/followups/:id/complete", requireAdminAuth, async (req, res) => {
  try {
    const followupId = req.params.id;
    const followup = storedFollowups.get(followupId);
    if (!followup) {
      return res.status(404).json({
        success: false,
        error: `Follow-up ${followupId} not found.`
      });
    }
    followup.status = "COMPLETED";
    followup.completedAt = (/* @__PURE__ */ new Date()).toISOString();
    storedFollowups.set(followupId, followup);
    forwardToGoogleAppsScript({
      action: "completeFollowup",
      followupId,
      completedAt: followup.completedAt
    });
    res.json({
      success: true,
      message: "Follow-up marked as completed",
      followup
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to complete follow-up" });
  }
});
adminRouter.get("/quotations", requireAdminAuth, (req, res) => {
  try {
    const { search, status, sort, leadId } = req.query;
    let list = Array.from(storedQuotations.values());
    if (leadId && typeof leadId === "string") {
      list = list.filter((q) => q.leadId === leadId);
    }
    if (status && typeof status === "string" && status !== "ALL") {
      list = list.filter((q) => q.status === status);
    }
    if (search && typeof search === "string" && search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (item) => item.quotationId.toLowerCase().includes(q) || item.customerName.toLowerCase().includes(q) || item.phone.includes(q) || item.fromLocation.toLowerCase().includes(q) || item.toLocation.toLowerCase().includes(q) || item.leadId && item.leadId.toLowerCase().includes(q)
      );
    }
    if (sort === "oldest") {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    res.json({
      success: true,
      count: list.length,
      quotations: list
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch quotations" });
  }
});
adminRouter.get("/quotations/:id", requireAdminAuth, (req, res) => {
  try {
    const quotationId = req.params.id;
    const quotation = storedQuotations.get(quotationId);
    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: `Quotation ${quotationId} was not found.`
      });
    }
    res.json({
      success: true,
      quotation
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch quotation details" });
  }
});
adminRouter.post("/quotations", requireAdminAuth, (req, res) => {
  try {
    const body = req.body || {};
    const {
      leadId,
      quotationDate,
      validUntil,
      customerName,
      phone,
      email,
      fromLocation,
      toLocation,
      movingDate,
      movingType,
      items,
      discount,
      gstPercentage,
      status,
      notes,
      terms
    } = body;
    if (!customerName || !String(customerName).trim()) {
      return res.status(400).json({ success: false, error: "Customer name is required." });
    }
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: "A valid 10-digit phone number is required." });
    }
    if (!fromLocation || !String(fromLocation).trim()) {
      return res.status(400).json({ success: false, error: "From location is required." });
    }
    if (!toLocation || !String(toLocation).trim()) {
      return res.status(400).json({ success: false, error: "To location is required." });
    }
    if (!movingDate || !String(movingDate).trim()) {
      return res.status(400).json({ success: false, error: "Moving date is required." });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "At least one charge item is required in the quotation." });
    }
    const financialTotals = calculateFinancialTotals(items, discount, gstPercentage);
    const quotationId = generateQuotationNumber();
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const qDate = quotationDate || getTodayDateString();
    const vUntil = validUntil || new Date(Date.now() + 7 * 864e5).toISOString().split("T")[0];
    const finalStatus = VALID_QUOTATION_STATUSES.includes(status) ? status : "DRAFT";
    const quotationRecord = {
      quotationId,
      leadId: leadId ? String(leadId).trim() : void 0,
      createdAt,
      quotationDate: qDate,
      validUntil: vUntil,
      customerName: String(customerName).trim(),
      phone: cleanPhone,
      email: email && String(email).trim().length > 0 ? String(email).trim() : void 0,
      fromLocation: String(fromLocation).trim(),
      toLocation: String(toLocation).trim(),
      movingDate: String(movingDate).trim(),
      movingType: String(movingType || "House Shifting").trim(),
      items: financialTotals.items,
      subtotal: financialTotals.subtotal,
      discount: financialTotals.discount,
      taxableAmount: financialTotals.taxableAmount,
      gstPercentage: financialTotals.gstPercentage,
      gstAmount: financialTotals.gstAmount,
      grandTotal: financialTotals.grandTotal,
      status: finalStatus,
      notes: notes && String(notes).trim().length > 0 ? String(notes).trim() : void 0,
      terms: terms && String(terms).trim().length > 0 ? String(terms).trim() : void 0
    };
    storedQuotations.set(quotationId, quotationRecord);
    if (quotationRecord.leadId && storedLeads.has(quotationRecord.leadId)) {
      const lead = storedLeads.get(quotationRecord.leadId);
      lead.quotationId = quotationId;
      if (finalStatus === "SENT" && lead.status === "NEW") {
        lead.status = "QUOTATION_SENT";
      }
      storedLeads.set(quotationRecord.leadId, lead);
    }
    forwardToGoogleAppsScript({
      action: "createQuotation",
      ...quotationRecord,
      items: JSON.stringify(quotationRecord.items)
    });
    res.status(201).json({
      success: true,
      message: `Quotation ${quotationId} generated successfully.`,
      quotation: quotationRecord
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to create quotation: " + err.message });
  }
});
adminRouter.put("/quotations/:id", requireAdminAuth, (req, res) => {
  try {
    const quotationId = req.params.id;
    const existing = storedQuotations.get(quotationId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Quotation ${quotationId} does not exist.`
      });
    }
    const body = req.body || {};
    const {
      quotationDate,
      validUntil,
      customerName,
      phone,
      email,
      fromLocation,
      toLocation,
      movingDate,
      movingType,
      items,
      discount,
      gstPercentage,
      status,
      notes,
      terms
    } = body;
    if (!customerName || !String(customerName).trim()) {
      return res.status(400).json({ success: false, error: "Customer name is required." });
    }
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: "A valid 10-digit phone number is required." });
    }
    if (!fromLocation || !String(fromLocation).trim()) {
      return res.status(400).json({ success: false, error: "From location is required." });
    }
    if (!toLocation || !String(toLocation).trim()) {
      return res.status(400).json({ success: false, error: "To location is required." });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "At least one charge item is required." });
    }
    const financialTotals = calculateFinancialTotals(items, discount, gstPercentage);
    const finalStatus = VALID_QUOTATION_STATUSES.includes(status) ? status : existing.status;
    existing.quotationDate = quotationDate || existing.quotationDate;
    existing.validUntil = validUntil || existing.validUntil;
    existing.customerName = String(customerName).trim();
    existing.phone = cleanPhone;
    existing.email = email && String(email).trim().length > 0 ? String(email).trim() : void 0;
    existing.fromLocation = String(fromLocation).trim();
    existing.toLocation = String(toLocation).trim();
    existing.movingDate = String(movingDate || existing.movingDate).trim();
    existing.movingType = String(movingType || existing.movingType).trim();
    existing.items = financialTotals.items;
    existing.subtotal = financialTotals.subtotal;
    existing.discount = financialTotals.discount;
    existing.taxableAmount = financialTotals.taxableAmount;
    existing.gstPercentage = financialTotals.gstPercentage;
    existing.gstAmount = financialTotals.gstAmount;
    existing.grandTotal = financialTotals.grandTotal;
    existing.status = finalStatus;
    existing.notes = notes && String(notes).trim().length > 0 ? String(notes).trim() : void 0;
    existing.terms = terms && String(terms).trim().length > 0 ? String(terms).trim() : void 0;
    storedQuotations.set(quotationId, existing);
    forwardToGoogleAppsScript({
      action: "updateQuotation",
      ...existing,
      items: JSON.stringify(existing.items)
    });
    res.json({
      success: true,
      message: `Quotation ${quotationId} updated successfully.`,
      quotation: existing
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update quotation: " + err.message });
  }
});
adminRouter.patch("/quotations/:id/status", requireAdminAuth, (req, res) => {
  try {
    const quotationId = req.params.id;
    const { status } = req.body || {};
    if (!VALID_QUOTATION_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid quotation status. Allowed: ${VALID_QUOTATION_STATUSES.join(", ")}`
      });
    }
    const quotation = storedQuotations.get(quotationId);
    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: `Quotation ${quotationId} not found.`
      });
    }
    quotation.status = status;
    storedQuotations.set(quotationId, quotation);
    forwardToGoogleAppsScript({
      action: "updateQuotationStatus",
      quotationId,
      status
    });
    res.json({
      success: true,
      message: `Quotation status updated to ${status}`,
      quotation
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update quotation status" });
  }
});
adminRouter.get("/invoices", requireAdminAuth, (req, res) => {
  try {
    const { search, status, paymentStatus, sort, leadId, quotationId } = req.query;
    let list = Array.from(storedInvoices.values());
    if (leadId && typeof leadId === "string") {
      list = list.filter((inv) => inv.leadId === leadId);
    }
    if (quotationId && typeof quotationId === "string") {
      list = list.filter((inv) => inv.quotationId === quotationId);
    }
    if (status && typeof status === "string" && status !== "ALL") {
      list = list.filter((inv) => inv.status === status);
    }
    if (paymentStatus && typeof paymentStatus === "string" && paymentStatus !== "ALL") {
      list = list.filter((inv) => inv.paymentStatus === paymentStatus);
    }
    if (search && typeof search === "string" && search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (item) => item.invoiceId.toLowerCase().includes(q) || item.customerName.toLowerCase().includes(q) || item.phone.includes(q) || item.fromLocation.toLowerCase().includes(q) || item.toLocation.toLowerCase().includes(q) || item.quotationId && item.quotationId.toLowerCase().includes(q) || item.leadId && item.leadId.toLowerCase().includes(q)
      );
    }
    if (sort === "oldest") {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    res.json({
      success: true,
      count: list.length,
      invoices: list
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch invoices" });
  }
});
adminRouter.get("/invoices/:id", requireAdminAuth, (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = storedInvoices.get(invoiceId);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: `Invoice ${invoiceId} was not found.`
      });
    }
    res.json({
      success: true,
      invoice
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch invoice details" });
  }
});
adminRouter.post("/invoices", requireAdminAuth, (req, res) => {
  try {
    const body = req.body || {};
    const {
      quotationId,
      leadId,
      invoiceDate,
      dueDate,
      customerName,
      phone,
      email,
      fromLocation,
      toLocation,
      movingDate,
      movingType,
      items,
      discount,
      gstPercentage,
      amountPaid,
      paymentDate,
      paymentMethod,
      paymentNotes,
      status,
      notes,
      terms
    } = body;
    if (!customerName || !String(customerName).trim()) {
      return res.status(400).json({ success: false, error: "Customer name is required." });
    }
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: "A valid 10-digit phone number is required." });
    }
    if (!fromLocation || !String(fromLocation).trim()) {
      return res.status(400).json({ success: false, error: "From location is required." });
    }
    if (!toLocation || !String(toLocation).trim()) {
      return res.status(400).json({ success: false, error: "To location is required." });
    }
    if (!movingDate || !String(movingDate).trim()) {
      return res.status(400).json({ success: false, error: "Moving date is required." });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "At least one charge item is required in the invoice." });
    }
    const financialTotals = calculateInvoiceFinancialTotals(items, discount, gstPercentage, amountPaid);
    const invoiceId = generateInvoiceNumber();
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const invDate = invoiceDate || getTodayDateString();
    const finalStatus = VALID_INVOICE_STATUSES.includes(status) ? status : "DRAFT";
    const invoiceRecord = {
      invoiceId,
      quotationId: quotationId ? String(quotationId).trim() : void 0,
      leadId: leadId ? String(leadId).trim() : void 0,
      createdAt,
      invoiceDate: invDate,
      dueDate: dueDate || void 0,
      customerName: String(customerName).trim(),
      phone: cleanPhone,
      email: email && String(email).trim().length > 0 ? String(email).trim() : void 0,
      fromLocation: String(fromLocation).trim(),
      toLocation: String(toLocation).trim(),
      movingDate: String(movingDate).trim(),
      movingType: String(movingType || "House Shifting").trim(),
      items: financialTotals.items,
      subtotal: financialTotals.subtotal,
      discount: financialTotals.discount,
      taxableAmount: financialTotals.taxableAmount,
      gstPercentage: financialTotals.gstPercentage,
      gstAmount: financialTotals.gstAmount,
      grandTotal: financialTotals.grandTotal,
      amountPaid: financialTotals.amountPaid,
      balanceDue: financialTotals.balanceDue,
      paymentStatus: financialTotals.paymentStatus,
      paymentDate: financialTotals.amountPaid > 0 ? paymentDate || invDate : void 0,
      paymentMethod: financialTotals.amountPaid > 0 ? paymentMethod || "Bank Transfer" : void 0,
      paymentNotes: paymentNotes && String(paymentNotes).trim().length > 0 ? String(paymentNotes).trim() : void 0,
      status: finalStatus,
      notes: notes && String(notes).trim().length > 0 ? String(notes).trim() : void 0,
      terms: terms && String(terms).trim().length > 0 ? String(terms).trim() : void 0
    };
    storedInvoices.set(invoiceId, invoiceRecord);
    if (invoiceRecord.quotationId && storedQuotations.has(invoiceRecord.quotationId)) {
      const q = storedQuotations.get(invoiceRecord.quotationId);
      q.invoiceId = invoiceId;
      storedQuotations.set(invoiceRecord.quotationId, q);
    }
    if (invoiceRecord.leadId && storedLeads.has(invoiceRecord.leadId)) {
      const lead = storedLeads.get(invoiceRecord.leadId);
      lead.invoiceId = invoiceId;
      storedLeads.set(invoiceRecord.leadId, lead);
    }
    forwardToGoogleAppsScript({
      action: "createInvoice",
      ...invoiceRecord,
      items: JSON.stringify(invoiceRecord.items)
    });
    res.status(201).json({
      success: true,
      message: `Invoice ${invoiceId} created successfully.`,
      invoice: invoiceRecord
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to create invoice: " + err.message });
  }
});
adminRouter.put("/invoices/:id", requireAdminAuth, (req, res) => {
  try {
    const invoiceId = req.params.id;
    const existing = storedInvoices.get(invoiceId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Invoice ${invoiceId} does not exist.`
      });
    }
    const body = req.body || {};
    const {
      invoiceDate,
      dueDate,
      customerName,
      phone,
      email,
      fromLocation,
      toLocation,
      movingDate,
      movingType,
      items,
      discount,
      gstPercentage,
      amountPaid,
      paymentDate,
      paymentMethod,
      paymentNotes,
      status,
      notes,
      terms
    } = body;
    if (!customerName || !String(customerName).trim()) {
      return res.status(400).json({ success: false, error: "Customer name is required." });
    }
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: "A valid 10-digit phone number is required." });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "At least one charge item is required." });
    }
    const financialTotals = calculateInvoiceFinancialTotals(
      items,
      discount,
      gstPercentage,
      amountPaid !== void 0 ? amountPaid : existing.amountPaid
    );
    const finalStatus = VALID_INVOICE_STATUSES.includes(status) ? status : existing.status;
    existing.invoiceDate = invoiceDate || existing.invoiceDate;
    existing.dueDate = dueDate || existing.dueDate;
    existing.customerName = String(customerName).trim();
    existing.phone = cleanPhone;
    existing.email = email && String(email).trim().length > 0 ? String(email).trim() : void 0;
    existing.fromLocation = String(fromLocation || existing.fromLocation).trim();
    existing.toLocation = String(toLocation || existing.toLocation).trim();
    existing.movingDate = String(movingDate || existing.movingDate).trim();
    existing.movingType = String(movingType || existing.movingType).trim();
    existing.items = financialTotals.items;
    existing.subtotal = financialTotals.subtotal;
    existing.discount = financialTotals.discount;
    existing.taxableAmount = financialTotals.taxableAmount;
    existing.gstPercentage = financialTotals.gstPercentage;
    existing.gstAmount = financialTotals.gstAmount;
    existing.grandTotal = financialTotals.grandTotal;
    existing.amountPaid = financialTotals.amountPaid;
    existing.balanceDue = financialTotals.balanceDue;
    existing.paymentStatus = financialTotals.paymentStatus;
    if (paymentDate) existing.paymentDate = paymentDate;
    if (paymentMethod) existing.paymentMethod = paymentMethod;
    if (paymentNotes !== void 0) existing.paymentNotes = paymentNotes;
    existing.status = finalStatus;
    existing.notes = notes && String(notes).trim().length > 0 ? String(notes).trim() : void 0;
    existing.terms = terms && String(terms).trim().length > 0 ? String(terms).trim() : void 0;
    storedInvoices.set(invoiceId, existing);
    forwardToGoogleAppsScript({
      action: "updateInvoice",
      ...existing,
      items: JSON.stringify(existing.items)
    });
    res.json({
      success: true,
      message: `Invoice ${invoiceId} updated successfully.`,
      invoice: existing
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update invoice: " + err.message });
  }
});
adminRouter.patch("/invoices/:id/payment", requireAdminAuth, (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = storedInvoices.get(invoiceId);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: `Invoice ${invoiceId} not found.`
      });
    }
    const { amountPaid, paymentDate, paymentMethod, paymentNotes } = req.body || {};
    const newAmountPaid = Math.max(0, Math.round((Number(amountPaid) || 0) * 100) / 100);
    const balanceDue = Math.max(0, Math.round((invoice.grandTotal - newAmountPaid) * 100) / 100);
    let paymentStatus = "UNPAID";
    if (newAmountPaid >= invoice.grandTotal && invoice.grandTotal > 0) {
      paymentStatus = "PAID";
    } else if (newAmountPaid > 0) {
      paymentStatus = "PARTIALLY_PAID";
    }
    invoice.amountPaid = newAmountPaid;
    invoice.balanceDue = balanceDue;
    invoice.paymentStatus = paymentStatus;
    invoice.paymentDate = paymentDate || getTodayDateString();
    if (paymentMethod) invoice.paymentMethod = paymentMethod;
    if (paymentNotes !== void 0) invoice.paymentNotes = paymentNotes;
    if (paymentStatus === "PAID" && invoice.status === "ISSUED") {
      invoice.status = "PAID";
    }
    storedInvoices.set(invoiceId, invoice);
    forwardToGoogleAppsScript({
      action: "updateInvoicePayment",
      invoiceId,
      amountPaid: invoice.amountPaid,
      balanceDue: invoice.balanceDue,
      paymentStatus: invoice.paymentStatus,
      paymentDate: invoice.paymentDate,
      paymentMethod: invoice.paymentMethod,
      paymentNotes: invoice.paymentNotes
    });
    res.json({
      success: true,
      message: "Payment information updated successfully.",
      invoice
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to record invoice payment" });
  }
});
adminRouter.patch("/invoices/:id/status", requireAdminAuth, (req, res) => {
  try {
    const invoiceId = req.params.id;
    const { status } = req.body || {};
    if (!VALID_INVOICE_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid invoice status. Allowed: ${VALID_INVOICE_STATUSES.join(", ")}`
      });
    }
    const invoice = storedInvoices.get(invoiceId);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: `Invoice ${invoiceId} not found.`
      });
    }
    invoice.status = status;
    storedInvoices.set(invoiceId, invoice);
    forwardToGoogleAppsScript({
      action: "updateInvoiceStatus",
      invoiceId,
      status
    });
    res.json({
      success: true,
      message: `Invoice status updated to ${status}`,
      invoice
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update invoice status" });
  }
});
adminRouter.post("/sync", requireAdminAuth, async (req, res) => {
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!scriptUrl || !scriptUrl.startsWith("http")) {
    return res.json({
      success: true,
      source: "local_memory",
      message: "Google Apps Script URL is not configured. Using high-speed local memory storage.",
      leadsCount: storedLeads.size,
      followupsCount: storedFollowups.size
    });
  }
  try {
    const response = await fetch(`${scriptUrl}?action=getAll`);
    if (!response.ok) {
      return res.status(502).json({
        success: false,
        error: `Google Apps Script returned status ${response.status}`
      });
    }
    const data = await response.json();
    if (data && Array.isArray(data.leads)) {
      data.leads.forEach((l) => {
        if (l.leadId) {
          storedLeads.set(l.leadId, {
            leadId: l.leadId,
            createdAt: l.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
            name: l.name || "",
            phone: l.phone || "",
            fromLocation: l.fromLocation || "",
            toLocation: l.toLocation || "",
            movingDate: l.movingDate || "",
            movingType: l.movingType || "House Shifting",
            source: l.source || "website",
            status: VALID_STATUSES.includes(l.status) ? l.status : "NEW",
            nextFollowup: l.nextFollowup || ""
          });
        }
      });
    }
    if (data && Array.isArray(data.followups)) {
      data.followups.forEach((f) => {
        if (f.followupId) {
          storedFollowups.set(f.followupId, {
            followupId: f.followupId,
            leadId: f.leadId || "",
            createdAt: f.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
            customerName: f.customerName || "",
            phone: f.phone || "",
            followupDate: f.followupDate || "",
            followupTime: f.followupTime || "",
            status: f.status === "COMPLETED" ? "COMPLETED" : "PENDING",
            notes: f.notes || "",
            completedAt: f.completedAt
          });
        }
      });
    }
    if (data && Array.isArray(data.quotations)) {
      data.quotations.forEach((q) => {
        if (q.quotationId) {
          storedQuotations.set(q.quotationId, {
            quotationId: q.quotationId,
            leadId: q.leadId || void 0,
            invoiceId: q.invoiceId || void 0,
            createdAt: q.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
            quotationDate: q.quotationDate || "",
            validUntil: q.validUntil || "",
            customerName: q.customerName || "",
            phone: q.phone || "",
            email: q.email || void 0,
            fromLocation: q.fromLocation || "",
            toLocation: q.toLocation || "",
            movingDate: q.movingDate || "",
            movingType: q.movingType || "House Shifting",
            items: Array.isArray(q.items) ? q.items : typeof q.items === "string" && q.items.trim().startsWith("[") ? (() => {
              try {
                return JSON.parse(q.items);
              } catch (e) {
                return [];
              }
            })() : [],
            subtotal: Number(q.subtotal) || 0,
            discount: Number(q.discount) || 0,
            taxableAmount: Number(q.taxableAmount) || Math.max(0, (Number(q.subtotal) || 0) - (Number(q.discount) || 0)),
            gstPercentage: Number(q.gstPercentage) || 0,
            gstAmount: Number(q.gstAmount) || 0,
            grandTotal: Number(q.grandTotal) || 0,
            status: VALID_QUOTATION_STATUSES.includes(q.status) ? q.status : "DRAFT",
            notes: q.notes || void 0,
            terms: q.terms || void 0
          });
        }
      });
    }
    if (data && Array.isArray(data.invoices)) {
      data.invoices.forEach((inv) => {
        if (inv.invoiceId) {
          storedInvoices.set(inv.invoiceId, {
            invoiceId: inv.invoiceId,
            quotationId: inv.quotationId || void 0,
            leadId: inv.leadId || void 0,
            createdAt: inv.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
            invoiceDate: inv.invoiceDate || "",
            dueDate: inv.dueDate || void 0,
            customerName: inv.customerName || "",
            phone: inv.phone || "",
            email: inv.email || void 0,
            fromLocation: inv.fromLocation || "",
            toLocation: inv.toLocation || "",
            movingDate: inv.movingDate || "",
            movingType: inv.movingType || "House Shifting",
            items: Array.isArray(inv.items) ? inv.items : typeof inv.items === "string" && inv.items.trim().startsWith("[") ? (() => {
              try {
                return JSON.parse(inv.items);
              } catch (e) {
                return [];
              }
            })() : [],
            subtotal: Number(inv.subtotal) || 0,
            discount: Number(inv.discount) || 0,
            taxableAmount: Number(inv.taxableAmount) || Math.max(0, (Number(inv.subtotal) || 0) - (Number(inv.discount) || 0)),
            gstPercentage: Number(inv.gstPercentage) || 0,
            gstAmount: Number(inv.gstAmount) || 0,
            grandTotal: Number(inv.grandTotal) || 0,
            amountPaid: Number(inv.amountPaid) || 0,
            balanceDue: Number(inv.balanceDue) || 0,
            paymentStatus: VALID_PAYMENT_STATUSES.includes(inv.paymentStatus) ? inv.paymentStatus : "UNPAID",
            paymentDate: inv.paymentDate || void 0,
            paymentMethod: inv.paymentMethod || void 0,
            paymentNotes: inv.paymentNotes || void 0,
            status: VALID_INVOICE_STATUSES.includes(inv.status) ? inv.status : "DRAFT",
            notes: inv.notes || void 0,
            terms: inv.terms || void 0
          });
        }
      });
    }
    return res.json({
      success: true,
      source: "google_sheets",
      message: "Successfully synchronized data with Google Sheet",
      leadsCount: storedLeads.size,
      followupsCount: storedFollowups.size,
      quotationsCount: storedQuotations.size,
      invoicesCount: storedInvoices.size
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Failed to sync with Google Sheet: " + err.message
    });
  }
});

// server/app.ts
dotenv.config();
var TARGET_NOTIFICATION_EMAIL = process.env.LEAD_NOTIFICATION_EMAIL || "shiftify.leads@gmail.com";
async function sendDirectEmailNotification(lead) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const fromAddress = process.env.SMTP_FROM || `"Shiftify Leads Desk" <${TARGET_NOTIFICATION_EMAIL}>`;
  if (!smtpUser || !smtpPass) {
    console.log(`[Lead Email Desk] Lead ${lead.leadId} ready for email to ${TARGET_NOTIFICATION_EMAIL}. Forwarding through Google Apps Script.`);
    return { sent: false, error: "SMTP credentials not configured in environment (handled by Google Apps Script)" };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost || "smtp.gmail.com",
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
    const mailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="background-color: #0f172a; padding: 18px 24px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #ea580c; margin: 0; font-size: 22px; font-weight: 800;">\u{1F69A} Shiftify Packers & Movers</h2>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">New Relocation Lead Received</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
          <tr style="background-color: #f8fafc;"><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Lead ID</td><td style="padding: 12px; border: 1px solid #e2e8f0; color: #ea580c; font-weight: bold;">${lead.leadId}</td></tr>
          <tr><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Customer Name</td><td style="padding: 12px; border: 1px solid #e2e8f0;">${lead.name}</td></tr>
          <tr style="background-color: #f8fafc;"><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Phone Number</td><td style="padding: 12px; border: 1px solid #e2e8f0;"><a href="tel:${lead.phone}" style="color: #2563eb; font-weight: bold; text-decoration: none;">${lead.phone}</a> &nbsp;|&nbsp; <a href="https://wa.me/91${lead.phone}" style="color: #16a34a; font-weight: bold; text-decoration: none;">Chat on WhatsApp</a></td></tr>
          <tr><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Moving Type</td><td style="padding: 12px; border: 1px solid #e2e8f0;">${lead.movingType}</td></tr>
          <tr style="background-color: #f8fafc;"><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Pickup Location</td><td style="padding: 12px; border: 1px solid #e2e8f0;">${lead.fromLocation}</td></tr>
          <tr><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Drop Location</td><td style="padding: 12px; border: 1px solid #e2e8f0;">${lead.toLocation}</td></tr>
          <tr style="background-color: #f8fafc;"><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Moving Date</td><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">${lead.movingDate}</td></tr>
          <tr><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Received At</td><td style="padding: 12px; border: 1px solid #e2e8f0; color: #64748b;">${lead.createdAt}</td></tr>
        </table>
        <div style="text-align: center; margin-top: 24px;">
          <a href="tel:${lead.phone}" style="display: inline-block; background-color: #ea580c; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-right: 12px;">Call Customer</a>
          <a href="https://wa.me/91${lead.phone}" style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">WhatsApp Customer</a>
        </div>
      </div>
    `;
    await transporter.sendMail({
      from: fromAddress,
      to: TARGET_NOTIFICATION_EMAIL,
      subject: `\u{1F69A} New Moving Lead [${lead.leadId}]: ${lead.name} (${lead.movingType})`,
      html: mailHtml
    });
    console.log(`[Lead Email Desk] Successfully sent email for lead ${lead.leadId} to ${TARGET_NOTIFICATION_EMAIL}`);
    return { sent: true };
  } catch (err) {
    console.error(`[Lead Email Desk] Failed to send email via SMTP:`, err);
    return { sent: false, error: err.message };
  }
}
seedInitialAdminData();
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});
var apiRouter = express.Router();
apiRouter.use("/admin", adminRouter);
apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Shiftify Packers & Movers API",
    uptime: process.uptime(),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    googleAppsScriptConfigured: Boolean(process.env.GOOGLE_APPS_SCRIPT_URL)
  });
});
apiRouter.post("/leads", async (req, res) => {
  try {
    const {
      name,
      phone,
      fromLocation,
      toLocation,
      movingDate,
      movingType
    } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "Name is required and must be at least 2 characters"
      });
    }
    const cleanPhone = (phone || "").replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: "A valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 is required"
      });
    }
    if (!fromLocation || fromLocation.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "From location is required"
      });
    }
    if (!toLocation || toLocation.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "To location is required"
      });
    }
    if (!movingDate) {
      return res.status(400).json({
        success: false,
        error: "Moving date is required"
      });
    }
    const { email } = req.body;
    const cleanEmail = email && typeof email === "string" && email.trim().length > 0 ? email.trim() : void 0;
    const leadId = generateLeadId();
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const source = "Website";
    const status = "NEW";
    const leadObject = {
      leadId,
      createdAt,
      name: name.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      fromLocation: fromLocation.trim(),
      toLocation: toLocation.trim(),
      movingDate,
      movingType: movingType || "House Shifting",
      source,
      status
    };
    storedLeads.set(leadId, leadObject);
    const emailResult = await sendDirectEmailNotification(leadObject);
    const googleScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    let sheetForwarded = false;
    let sheetError = null;
    if (googleScriptUrl && googleScriptUrl.trim().startsWith("http")) {
      try {
        const response = await fetch(googleScriptUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...leadObject,
            targetEmail: TARGET_NOTIFICATION_EMAIL
          })
        });
        if (response.ok) {
          sheetForwarded = true;
        } else {
          sheetError = `Google Sheet HTTP status: ${response.status}`;
        }
      } catch (err) {
        console.error("Error forwarding to Google Apps Script:", err);
        sheetError = err.message || "Failed to connect to Google Apps Script";
      }
    }
    return res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
      lead: leadObject,
      leadId: leadObject.leadId,
      notificationEmail: TARGET_NOTIFICATION_EMAIL,
      emailNotificationSent: emailResult.sent,
      sheetForwarded,
      sheetError: sheetError || void 0
    });
  } catch (error) {
    console.error("Lead submission server error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error processing moving quote enquiry. Please try again."
    });
  }
});
apiRouter.get("/leads/track/:id", (req, res) => {
  const queryId = (req.params.id || "").toUpperCase().trim();
  const lead = storedLeads.get(queryId);
  if (lead) {
    return res.json({
      success: true,
      lead
    });
  }
  return res.status(404).json({
    success: false,
    error: `Enquiry ${queryId} not found in current session. Please verify your ID or contact support.`
  });
});
apiRouter.get("/leads/recent", (req, res) => {
  const list = Array.from(storedLeads.values()).reverse().slice(0, 20);
  return res.json({
    success: true,
    count: list.length,
    googleAppsScriptConfigured: Boolean(process.env.GOOGLE_APPS_SCRIPT_URL),
    notificationEmail: TARGET_NOTIFICATION_EMAIL,
    leads: list
  });
});
app.use("/api", apiRouter);
app.use("/api/index", apiRouter);
app.use("/", apiRouter);
var getBaseUrl = (req) => {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  return `${proto}://${req.headers.host}`;
};
var handleRobotsTxt = (req, res) => {
  const baseUrl = getBaseUrl(req);
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header("Content-Type", "text/plain");
  res.send(robotsTxt);
};
app.get("/robots.txt", handleRobotsTxt);
app.get("/api/robots.txt", handleRobotsTxt);
var handleSitemapXml = (req, res) => {
  const baseUrl = getBaseUrl(req);
  const now = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const pages = [
    "",
    "/services/house-shifting",
    "/services/office-shifting",
    "/services/vehicle-transport",
    "/services/warehouse-storage",
    "/services/local-shifting",
    "/services/intercity-shifting",
    "/services/corporate-relocation",
    "/locations",
    "/routes",
    "/about",
    "/contact",
    "/quote",
    "/track"
  ];
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(
    (page) => `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page === "" ? "daily" : "weekly"}</changefreq>
    <priority>${page === "" ? "1.0" : page.startsWith("/services/") ? "0.8" : "0.6"}</priority>
  </url>`
  ).join("\n")}
</urlset>`;
  res.header("Content-Type", "application/xml");
  res.send(sitemapXml);
};
app.get("/sitemap.xml", handleSitemapXml);
app.get("/api/sitemap.xml", handleSitemapXml);
var app_default = app;
export {
  app,
  app_default as default,
  getBaseUrl,
  sendDirectEmailNotification
};
