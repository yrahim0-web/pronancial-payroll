import { supabase } from './supabase'

import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import {
  LayoutDashboard, Building2, Users, PlayCircle, History, FileText, BarChart2,
  Settings, ChevronDown, Bell, Plus, Search, LogOut, User, Menu, X,
  TrendingUp, Calendar, AlertCircle, CheckCircle2, Clock, Download,
  DollarSign, ArrowRight, Eye, Pencil, Trash2, ChevronRight, Mail,
  Phone, MapPin, CreditCard, Shield, RefreshCw, Send, Printer, Filter,
  ChevronLeft, MoreHorizontal, Home, Info, Briefcase, Building
} from "lucide-react";

const COMPANIES = [
  { id: 1, name: "Maple Ridge Consulting", bn: "123456789RP0001", province: "ON", employees: 12, nextPayroll: "2025-06-15", status: "active", remittance: "current", industry: "Consulting" },
  { id: 2, name: "Pacific Northwest Tech", bn: "987654321RP0001", province: "BC", employees: 28, nextPayroll: "2025-06-13", status: "active", remittance: "due", industry: "Technology" },
  { id: 3, name: "Prairie Builders Ltd.", bn: "456789123RP0001", province: "AB", employees: 7, nextPayroll: "2025-06-20", status: "active", remittance: "current", industry: "Construction" },
  { id: 4, name: "Atlantic Seafoods Inc.", bn: "321654987RP0001", province: "NS", employees: 19, nextPayroll: "2025-06-14", status: "pending", remittance: "overdue", industry: "Food & Beverage" },
];

const EMPLOYEES_BY_COMPANY = {
  1: [
    { id: 1, name: "Sarah Mitchell", position: "Senior Consultant", province: "ON", type: "Salary", rate: 95000, status: "active", lastPayroll: "2025-05-31", sin: "***-***-123" },
    { id: 2, name: "James Kowalski", position: "Project Manager", province: "ON", type: "Salary", rate: 82000, status: "active", lastPayroll: "2025-05-31", sin: "***-***-456" },
    { id: 3, name: "Priya Sharma", position: "Business Analyst", province: "ON", type: "Hourly", rate: 45.00, status: "active", lastPayroll: "2025-05-31", sin: "***-***-789" },
    { id: 4, name: "Tom Nguyen", position: "Junior Consultant", province: "ON", type: "Hourly", rate: 32.50, status: "active", lastPayroll: "2025-05-31", sin: "***-***-012" },
  ],
  2: [
    { id: 5, name: "Alex Chen", position: "Software Engineer", province: "BC", type: "Salary", rate: 115000, status: "active", lastPayroll: "2025-05-30", sin: "***-***-345" },
    { id: 6, name: "Megan Park", position: "UX Designer", province: "BC", type: "Salary", rate: 88000, status: "active", lastPayroll: "2025-05-30", sin: "***-***-678" },
    { id: 7, name: "Ryan Foster", position: "DevOps Engineer", province: "BC", type: "Salary", rate: 105000, status: "active", lastPayroll: "2025-05-30", sin: "***-***-901" },
  ],
  3: [
    { id: 8, name: "Dale Thompson", position: "Site Foreman", province: "AB", type: "Hourly", rate: 52.00, status: "active", lastPayroll: "2025-05-28", sin: "***-***-234" },
    { id: 9, name: "Linda Wu", position: "Office Manager", province: "AB", type: "Salary", rate: 62000, status: "active", lastPayroll: "2025-05-28", sin: "***-***-567" },
  ],
  4: [
    { id: 10, name: "Pierre Bouchard", position: "Plant Manager", province: "NS", type: "Salary", rate: 78000, status: "active", lastPayroll: "2025-05-25", sin: "***-***-890" },
    { id: 11, name: "Maria Santos", position: "Quality Control", province: "NS", type: "Hourly", rate: 28.50, status: "active", lastPayroll: "2025-05-25", sin: "***-***-111" },
  ],
};

const PAYROLL_HISTORY = [
  { id: 1, date: "2025-05-31", period: "May 16–31", employees: 4, gross: 18420.00, deductions: 4823.40, net: 13596.60, status: "completed" },
  { id: 2, date: "2025-05-15", period: "May 1–15", employees: 4, gross: 17980.00, deductions: 4708.32, net: 13271.68, status: "completed" },
  { id: 3, date: "2025-04-30", period: "Apr 16–30", employees: 4, gross: 18100.00, deductions: 4740.20, net: 13359.80, status: "completed" },
  { id: 4, date: "2025-04-15", period: "Apr 1–15", employees: 3, gross: 14500.00, deductions: 3798.50, net: 10701.50, status: "completed" },
];

const PAYROLL_TREND = [
  { month: "Jan", gross: 32400 }, { month: "Feb", gross: 33100 },
  { month: "Mar", gross: 34200 }, { month: "Apr", gross: 32600 },
  { month: "May", gross: 36400 }, { month: "Jun", gross: 35800 },
];

const DEDUCTION_DATA = [
  { name: "Federal Tax", value: 38, color: "#1e40af" },
  { name: "Provincial Tax", value: 22, color: "#3b82f6" },
  { name: "CPP", value: 24, color: "#60a5fa" },
  { name: "EI", value: 16, color: "#93c5fd" },
];

const VAC_RATES = { "4%": 0.04, "6%": 0.06, "8%": 0.08 };

// ─── CRA 2026 Constants ───────────────────────────────────────────────────────

// CPP 2026
const CPP_RATE        = 0.0595;
const CPP_MAX_CONTRIB = 4230.45;  // employee max annual 2026
const CPP_EXEMPTION   = 3500.00;  // basic annual exemption
const CPP2_RATE       = 0.04;
const CPP2_MAX        = 416.00;   // CPP2 max annual 2026
const CPP2_THRESHOLD  = 74600.00; // YMPE 2026

// EI 2026
const EI_RATE         = 0.0163;
const EI_MAX_CONTRIB  = 1123.07;  // employee max annual 2026

// Pay periods per year
const PAY_PERIODS = { "Weekly": 52, "Bi-weekly": 26, "Semi-monthly": 24, "Monthly": 12 };

// Federal 2026 tax brackets (T4032-ON Jan 2026)
const FED_BRACKETS = [
  { min: 0,       max: 58523,   rate: 0.14,   base: 0        },
  { min: 58523,   max: 117045,  rate: 0.205,  base: 8193.22  },
  { min: 117045,  max: 181440,  rate: 0.26,   base: 20189.50 },
  { min: 181440,  max: 258482,  rate: 0.29,   base: 36927.90 },
  { min: 258482,  max: Infinity,rate: 0.33,   base: 59249.28 },
];

// Federal non-refundable credits 2026
const FED_BASIC_PERSONAL  = 16452.00; // TD1 federal 2026
const FED_CPP_CREDIT_RATE = 0.14;
const FED_EI_CREDIT_RATE  = 0.14;

// Provincial 2025 brackets & BPA
const PROV_TAX = {
  ON: {
    brackets: [
      { min: 0,      max: 53891,   rate: 0.0505, base: 0        },
      { min: 53891,  max: 107785,  rate: 0.0915, base: 2721.50  },
      { min: 107785, max: 150000,  rate: 0.1116, base: 7652.80  },
      { min: 150000, max: 220000,  rate: 0.1216, base: 12363.99 },
      { min: 220000, max: Infinity,rate: 0.1316, base: 20875.99 },
    ],
    bpa: 12989,
    surtax: true,
  },
  BC: {
    brackets: [
      { min: 0,      max: 50363,   rate: 0.0506, base: 0       },
      { min: 50363,  max: 100728,  rate: 0.0770, base: 2548.37 },
      { min: 100728, max: 115648,  rate: 0.1050, base: 6426.48 },
      { min: 115648, max: 140430,  rate: 0.1229, base: 7993.08 },
      { min: 140430, max: 190405,  rate: 0.1470, base: 11039.47},
      { min: 190405, max: 265545,  rate: 0.1680, base: 18385.80},
      { min: 265545, max: Infinity,rate: 0.2050, base: 31009.32},
    ],
    bpa: 13216,
    surtax: false,
  },
  AB: {
    brackets: [
      { min: 0,      max: 61200,   rate: 0.08,   base: 0        },
      { min: 61200,  max: 154259,  rate: 0.10,   base: 4896.00  },
      { min: 154259, max: 185111,  rate: 0.12,   base: 14201.90 },
      { min: 185111, max: 246813,  rate: 0.13,   base: 17904.14 },
      { min: 246813, max: 370220,  rate: 0.14,   base: 25925.40 },
      { min: 370220, max: Infinity,rate: 0.15,   base: 43202.38 },
    ],
    bpa: 22769,
    surtax: false,
  },
  QC: {
    brackets: [
      { min: 0,      max: 54345,   rate: 0.14,   base: 0        },
      { min: 54345,  max: 108680,  rate: 0.19,   base: 7608.30  },
      { min: 108680, max: 132245,  rate: 0.24,   base: 17931.95 },
      { min: 132245, max: Infinity,rate: 0.2575, base: 23587.55 },
    ],
    bpa: 17183,
    surtax: false,
  },
  MB: {
    brackets: [
      { min: 0,      max: 47000,   rate: 0.108,  base: 0       },
      { min: 47000,  max: 100000,  rate: 0.1275, base: 5076.00 },
      { min: 100000, max: Infinity,rate: 0.174,  base: 11832.75},
    ],
    bpa: 15780,
    surtax: false,
  },
  SK: {
    brackets: [
      { min: 0,      max: 54532,   rate: 0.105,  base: 0       },
      { min: 54532,  max: 155805,  rate: 0.125,  base: 5725.86 },
      { min: 155805, max: Infinity,rate: 0.145,  base: 18384.99},
    ],
    bpa: 20381,
    surtax: false,
  },
  NS: {
    brackets: [
      { min: 0,      max: 30995,   rate: 0.0879, base: 0       },
      { min: 30995,  max: 61991,   rate: 0.1495, base: 2724.46 },
      { min: 61991,  max: 97417,   rate: 0.1667, base: 7358.36 },
      { min: 97417,  max: 157124,  rate: 0.175,  base: 13265.87},
      { min: 157124, max: Infinity,rate: 0.21,   base: 23714.60},
    ],
    bpa: 11932,
    surtax: false,
  },
  NB: {
    brackets: [
      { min: 0,      max: 52333,   rate: 0.094,  base: 0       },
      { min: 52333,  max: 104666,  rate: 0.14,   base: 4915.30 },
      { min: 104666, max: 193861,  rate: 0.16,   base: 12241.92},
      { min: 193861, max: Infinity,rate: 0.195,  base: 26513.12},
    ],
    bpa: 13664,
    surtax: false,
  },
  NL: {
    brackets: [
      { min: 0,       max: 44678,    rate: 0.087, base: 0        },
      { min: 44678,   max: 89354,    rate: 0.145, base: 3887.99  },
      { min: 89354,   max: 159528,   rate: 0.158, base: 10366.01 },
      { min: 159528,  max: 223340,   rate: 0.178, base: 21453.50 },
      { min: 223340,  max: 285319,   rate: 0.198, base: 32812.04 },
      { min: 285319,  max: 570638,   rate: 0.208, base: 45083.88 },
      { min: 570638,  max: 1141275,  rate: 0.213, base: 104430.23},
      { min: 1141275, max: Infinity, rate: 0.218, base: 225975.91},
    ],
    bpa: 11188,
    surtax: false,
  },
  PE: {
    brackets: [
      { min: 0,      max: 33928,   rate: 0.095,  base: 0       },
      { min: 33928,  max: 65820,   rate: 0.1347, base: 3223.16 },
      { min: 65820,  max: 106890,  rate: 0.166,  base: 7519.02 },
      { min: 106890, max: 142250,  rate: 0.1762, base: 14336.64},
      { min: 142250, max: Infinity,rate: 0.19,   base: 20567.10},
    ],
    bpa: 15000,
    surtax: false,
  },
};

// ─── CRA Tax Bracket Helper ───────────────────────────────────────────────────
function calcBracketTax(annualIncome, brackets) {
  for (const b of brackets) {
    if (annualIncome <= b.max) {
      return b.base + (annualIncome - b.min) * b.rate;
    }
  }
  return 0;
}

// ─── Ontario Surtax (2025) ────────────────────────────────────────────────────
function calcONSurtax(basicProvTax) {
  let surtax = 0;
  if (basicProvTax > 5818) surtax += (basicProvTax - 5818) * 0.20;
  if (basicProvTax > 7446) surtax += (basicProvTax - 7446) * 0.36;
  return surtax;
}

// ─── Main CRA-Compliant Calculation Engine ────────────────────────────────────
function calcPayroll(
  emp,
  regHrs,
  otHrs,
  bonus,
  statHrs   = 0,
  statMode  = "amount", // "amount" = flat dollars typed directly, "hours" = hours x rate (x1.5 for hourly)
  vacRate   = 0.04,
  payFreq   = "Semi-monthly",
  td1Fed    = 16452,   // employee's federal TD1 claim 2026
  td1Prov   = null     // employee's provincial TD1 (null = use province BPA)
) {
  const PP       = PAY_PERIODS[payFreq] || 24;
  const province = emp.province || "ON";
  const provData = PROV_TAX[province] || PROV_TAX["ON"];

  const reg  = parseFloat(regHrs)  || 0;
  const ot   = parseFloat(otHrs)   || 0;
  const bon  = parseFloat(bonus)   || 0;
  const stat = parseFloat(statHrs) || 0;

  // ── Step 1: Gross Earnings This Period ──────────────────────────────────────
  let regularPay = 0, otPay = 0, statPay = 0;

  if (emp.type === "Hourly") {
    regularPay = reg * emp.rate;
    otPay      = ot  * emp.rate * 1.5;
    statPay    = statMode === "hours" ? (stat * emp.rate * 1.5) : stat;
  } else {
    regularPay = emp.rate / PP;
    if (statMode === "hours") {
      const dailyRate = emp.rate / 261;
      statPay = stat * (dailyRate / 8) * 0.5;
    } else {
      statPay = stat;
    }
  }

  // Vacationable earnings = regular + OT only (excludes stat pay & bonus — matches CRA rules)
  const baseEarnings         = +regularPay.toFixed(2);                       // "Base Pay" = reg hrs × rate ONLY
  const vacationableEarnings = +(regularPay + otPay).toFixed(2);             // regular + OT — used only for vacation pay calc
  const employmentEarnings   = +(regularPay + otPay + statPay + bon).toFixed(2);
  const vacPay                = +(vacationableEarnings * vacRate).toFixed(2);
  const grossPeriod           = +(employmentEarnings + vacPay).toFixed(2);

  // ── Step 2: CPP (T4127 Section A) ───────────────────────────────────────────
  // Annual CPP-pensionable earnings (gross × PP − basic exemption)
  // CPP on gross including vacation pay (CRA includes vac pay in pensionable earnings)
  // T4127 Chapter 6: CPP per-period exemption method (exact match to PDOC)
  const annualPensionable = grossPeriod * PP;
  const periodExemption   = CPP_EXEMPTION / PP; // keep full precision, no rounding
  const periodPensionable = Math.max(grossPeriod - periodExemption, 0);
  const periodCPP         = +Math.min(periodPensionable * CPP_RATE, CPP_MAX_CONTRIB / PP).toFixed(2);
  const annualCPP         = periodCPP * PP;

  // CPP2 (on earnings above YMPE 2026 = $74,600)
  const annualCPP2 = annualPensionable > CPP2_THRESHOLD
    ? Math.min((annualPensionable - CPP2_THRESHOLD) * CPP2_RATE, CPP2_MAX)
    : 0;
  const periodCPP2 = +(annualCPP2 / PP).toFixed(2);

  const totalCPP = +(periodCPP + periodCPP2).toFixed(2);

  // ── Step 3: EI (T4127 Section B) ────────────────────────────────────────────
  // EI on gross including vacation pay (CRA includes vac pay in insurable earnings)
  const annualEI  = Math.min(grossPeriod * PP * EI_RATE, EI_MAX_CONTRIB);
  const periodEI  = +(annualEI / PP).toFixed(2);

  // ── Step 4: Federal Tax (T4127 Section C — Method 1) ────────────────────────
  // Annualize
  // CRA taxes on base earnings only (not including vacation pay)
  // CRA taxable income = annualized gross - CPP - EI (T4127 Method 1)
  const annualGross   = grossPeriod * PP;
  // T4127 Step 1: A = I × PP (no deductions — K2/K3 credits handle CPP/EI)
  const annualTaxable = annualGross;

  // T4127 Step 2: CEA 2026 = lesser of employment income or $1,433
  const CEA = Math.min(annualGross, 1433);
  // T4127 Step 3: T1 = T3 - K1 - K2 - K3 - K4
  const T1 = calcBracketTax(annualTaxable, FED_BRACKETS);
  // T4127 Step 3 — exact formula: T1 = T3 - K1 - K2 - K3 - K4
  // T4127 2026 BPAF formula — income tested
  let bpaf = td1Fed; // use employee's TD1 claim
  if (annualGross <= 181440) {
    bpaf = 16452;
  } else if (annualGross >= 258482) {
    bpaf = 14829;
  } else {
    bpaf = 16452 - (16452 - 14829) * (annualGross - 181440) / (258482 - 181440);
  }
  // Override with employee's TD1 if they claimed a specific amount
  if (td1Fed !== 16452) bpaf = td1Fed;

  const K1 = 0.14 * bpaf;
  const K2 = FED_CPP_CREDIT_RATE * annualCPP + FED_CPP_CREDIT_RATE * annualCPP2;
  const K3 = 0.14 * annualEI;
  // CEA applies to employment income only (base earnings × PP, not including vac pay)
  const annualBaseOnly = baseEarnings * PP;
  const K4 = 0.14 * Math.min(annualBaseOnly, 1501);
  const annualFedTaxRaw = Math.max(T1 - K1 - K2 - K3 - K4, 0);
  const annualFedTax    = Math.round(annualFedTaxRaw);
  const periodFedTax    = +(annualFedTax / PP).toFixed(2);
  
  // ── Step 5: Provincial Tax (T4127 Section D) ─────────────────────────────────
  const provBPA        = td1Prov ?? provData.bpa;
  const provLowestRate = provData.brackets[0]?.rate || 0.0505;
  // T4127 Step 5: KP = (provBPA + CPP + CPP2 + EI) × lowest prov rate
  const provCredits = (provBPA + annualCPP + annualCPP2 + annualEI) * provLowestRate;

  let annualProvTax = Math.max(calcBracketTax(annualTaxable, provData.brackets) - provCredits, 0);

  // Ontario surtax
  if (provData.surtax) {
    annualProvTax += calcONSurtax(annualProvTax);
  }

  // Ontario Health Premium 2026 — IS withheld via payroll per T4032
  if (province === "ON") {
    let ohp = 0;
    const ai = annualGross;
    if      (ai <= 20000)  ohp = 0;
    else if (ai <= 36000)  ohp = Math.min(300,  0.06 * (ai - 20000));
    else if (ai <= 48000)  ohp = Math.min(450,  300 + 0.06 * (ai - 36000));
    else if (ai <= 72000)  ohp = Math.min(600,  450 + 0.06 * (ai - 48000));
    else if (ai <= 200000) ohp = Math.min(750,  600 + 0.06 * (ai - 72000));
    else if (ai <= 200600) ohp = Math.min(900,  750 + 0.25 * (ai - 200000));
    else                   ohp = 900;
    annualProvTax += ohp;
  }

  // Ontario tax reduction 2026 — only applies if annual income under ~$21,000
  if (province === "ON" && annualTaxable < 21000) {
    const onTaxReduction = Math.max(0, Math.min(274, 274 - 0.05 * Math.max(0, annualTaxable - 16291)));
    annualProvTax = Math.max(0, annualProvTax - onTaxReduction);
  }

  const annualProvTaxRounded = Math.round(annualProvTax);
  const periodProvTax = +(annualProvTaxRounded / PP).toFixed(2);

  // ── Step 6: Net Pay ──────────────────────────────────────────────────────────
  const totalTax = +(periodFedTax + periodProvTax).toFixed(2);
  const net      = +(grossPeriod - totalCPP - periodEI - totalTax).toFixed(2);

  return {
    gross:       grossPeriod,
    cpp:         totalCPP,
    cpp1:        periodCPP,
    cpp2:        periodCPP2,
    ei:          periodEI,
    fedTax:      periodFedTax,
    provTax:     periodProvTax,
    tax:         totalTax,
    net:         Math.max(net, 0),
    baseEarnings,
    vacPay,
    regularPay:  +regularPay.toFixed(2),
    otPay:       +otPay.toFixed(2),
    statPay:     +statPay.toFixed(2),
    bon:         +bon.toFixed(2),
  };
}


// ─── CRA 2025 Constants ───────────────────────────────────────────────────────

// CPP

function calcPayrollOLD_DELETE(emp, regHrs, otHrs, bonus, statHrs = 0, vacRate = 0.04) {
  const reg  = parseFloat(regHrs)  || 0;
  const ot   = parseFloat(otHrs)   || 0;
  const bon  = parseFloat(bonus)   || 0;
  const stat = parseFloat(statHrs) || 0;

  let baseEarnings = 0;
  let statPay = 0;

  if (emp.type === "Hourly") {
    const regPay = reg  * emp.rate;
    const otPay  = ot   * emp.rate * 1.5;
    statPay      = stat * emp.rate * 1.5;       // stat holiday = 1.5×
    baseEarnings = regPay + otPay + statPay + bon;
  } else {
    const perPeriod = emp.rate / 26;
    const dailyRate = emp.rate / 261;
    statPay         = +(stat * (dailyRate / 8) * 0.5).toFixed(2);
    baseEarnings    = perPeriod + statPay + bon;
  }

  baseEarnings   = +baseEarnings.toFixed(2);
  const vacPay   = +(baseEarnings * vacRate).toFixed(2);  // always paid out
  const gross    = +(baseEarnings + vacPay).toFixed(2);   // vac pay always in gross

  const cpp      = +Math.min(gross * 0.0595, 3867.50 / 26).toFixed(2);
  const ei       = +Math.min(gross * 0.0166, 1049.12 / 26).toFixed(2);
  const taxable  = gross - cpp - ei;
  const tax      = +(taxable * (0.205 + 0.0505)).toFixed(2);
  const net      = +(gross - cpp - ei - tax).toFixed(2);

  return { gross, cpp, ei, tax, net, baseEarnings, vacPay, statPay: +statPay.toFixed(2) };
}

const Badge = ({ color, children }) => {
  const colors = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
    yellow: "bg-amber-50 text-amber-700 border-amber-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors[color] || colors.gray}`}>{children}</span>;
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>{children}</div>
);

const StatCard = ({ icon: Icon, label, value, sub, color = "blue" }) => {
  const colorMap = { blue: "bg-blue-50 text-blue-600", green: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", red: "bg-red-50 text-red-600" };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={18} />
        </div>
      </div>
    </Card>
  );
};

const Modal = ({ open, onClose, title, children, wide }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full mx-4 ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    {label && <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>}
    <input className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all" {...props} />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    {label && <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>}
    <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all" {...props}>{children}</select>
  </div>
);

// ─── Login ───────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass
    });
    if (error) {
      setError(error.message);
    } else {
      onLogin();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f8fafc" }}>
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)" }}>
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
              <DollarSign size={18} className="text-white" />
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">Pronancial Payroll</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">Canadian payroll,<br />simplified.</h1>
          <p className="text-blue-200 text-base leading-relaxed">Purpose-built for bookkeeping firms and accountants managing CRA-compliant payroll for multiple client companies.</p>
        </div>
        <div className="space-y-4">
          {["Automatic CPP & EI calculations","CRA-ready remittance reports","Multi-company management","Direct deposit & paystub generation"].map(f => (
            <div key={f} className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-blue-400 flex-shrink-0" />
              <span className="text-blue-100 text-sm">{f}</span>
            </div>
          ))}
          <div className="mt-8 p-4 rounded-2xl border border-blue-800 bg-blue-900/30">
            <p className="text-blue-200 text-sm italic">"Pronancial has cut our payroll processing time by 70%. It's the best tool our firm has ever used."</p>
            <p className="text-blue-400 text-xs mt-2 font-medium">— Jennifer Walsh, CPA · Walsh Accounting Services</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center"><DollarSign size={16} className="text-white" /></div>
            <span className="font-semibold text-gray-900">Pronancial Payroll</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-8">Sign in to your firm account</p>
          <div className="space-y-4">
            <Input label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@firm.ca" />
            <Input label="Password" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded" defaultChecked /> Remember me
              </label>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot password?</button>
            </div>
            {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
<button onClick={handleLogin} disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-medium transition-colors text-sm">
  {loading ? "Signing in..." : "Sign in to Pronancial"}
</button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">By signing in you agree to our Terms of Service & Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}

// ─── Global theme styles ─────────────────────────────────────────────────────
const DARK_STYLE = `
  [data-theme="dark"] { background:#0c1117!important; color:#e8f0fe!important; }
  [data-theme="dark"] .bg-white, [data-theme="dark"] .bg-gray-50 { background:#141b24!important; }
  [data-theme="dark"] .border-gray-100, [data-theme="dark"] .border-gray-200 { border-color:#1e2d40!important; }
  [data-theme="dark"] .text-gray-900, [data-theme="dark"] .text-gray-800, [data-theme="dark"] .text-gray-700 { color:#e8f0fe!important; }
  [data-theme="dark"] .text-gray-600, [data-theme="dark"] .text-gray-500, [data-theme="dark"] .text-gray-400 { color:#6b7fa3!important; }
  [data-theme="dark"] .bg-gray-100, [data-theme="dark"] .bg-gray-50 { background:#1a2332!important; }
  [data-theme="dark"] .hover\\:bg-gray-50:hover { background:#1a2332!important; }
  [data-theme="dark"] .divide-gray-50 > * { border-color:#1e2d40!important; }
  [data-theme="dark"] .border-b { border-color:#1e2d40!important; }
  [data-theme="dark"] .border-t { border-color:#1e2d40!important; }
  [data-theme="dark"] input, [data-theme="dark"] select { background:#1a2332!important; color:#e8f0fe!important; border-color:#1e2d40!important; }
  [data-theme="dark"] table thead tr { border-color:#1e2d40!important; }
  [data-theme="dark"] .shadow-sm { box-shadow:0 1px 3px rgba(0,0,0,0.4)!important; }
`;

// ─── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ company, companies, setPage, setSelectedCompany, theme = 'light', switchTheme }) {
  const [emps, setEmps] = useState([]);
  const [recentRuns, setRecentRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('both');
  const [activeBar, setActiveBar] = useState('gross');
  const trendRef = useRef(null);
  const donutRef = useRef(null);
  const barRef = useRef(null);
  const trendChart = useRef(null);
  const donutChart = useRef(null);
  const barChart = useRef(null);

  const isDark = theme === 'dark';

  const D = isDark ? {
    bg:'#0c1117', surface:'#141b24', surface2:'#1a2332', border:'#1e2d40',
    text:'#e8f0fe', muted:'#6b7fa3', faint:'#0f1620',
    grid:'rgba(255,255,255,0.04)', tick:'#6b7fa3',
    accent:'#3b82f6', green:'#10b981', amber:'#f59e0b', red:'#ef4444', cyan:'#06b6d4', purple:'#8b5cf6',
  } : {
    bg:'#f0f4f8', surface:'#ffffff', surface2:'#f4f7fb', border:'#e2e8f0',
    text:'#0f172a', muted:'#64748b', faint:'#eef2f7',
    grid:'rgba(0,0,0,0.04)', tick:'#94a3b8',
    accent:'#2563eb', green:'#059669', amber:'#d97706', red:'#dc2626', cyan:'#0891b2', purple:'#7c3aed',
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: empData }, { data: runData }] = await Promise.all([
        supabase.from('employees').select('*').eq('company_id', company.id).eq('status', 'active'),
        supabase.from('payroll_runs').select('*').eq('company_id', company.id).order('created_at', { ascending: false }).limit(12),
      ]);
      if (empData) setEmps(empData);
      if (runData) {
        setRecentRuns(runData);
        const byMonth = {};
        runData.forEach(r => {
          const d = new Date(r.pay_date || r.created_at);
          const key = d.toLocaleString('default', { month: 'short' });
          byMonth[key] = (byMonth[key] || 0) + (+r.gross || 0);
        });
        }
      setLoading(false);
    };
    load();
  }, [company.id]);

  const ytdGross = recentRuns.reduce((a, r) => a + (+r.gross || 0), 0);
  const ytdNet   = recentRuns.reduce((a, r) => a + (+r.net   || 0), 0);
  const ytdCPP   = recentRuns.reduce((a, r) => a + (r.details||[]).reduce((x,d)=>x+(+d.cpp||0),0), 0);
  const ytdEI    = recentRuns.reduce((a, r) => a + (r.details||[]).reduce((x,d)=>x+(+d.ei||0),0), 0);
  const ytdFed   = recentRuns.reduce((a, r) => a + (r.details||[]).reduce((x,d)=>x+(+d.fed_tax||0),0), 0);
  const ytdProv  = recentRuns.reduce((a, r) => a + (r.details||[]).reduce((x,d)=>x+(+d.prov_tax||0),0), 0);
  const remitTotal = (ytdCPP*2) + (ytdEI*2.4) + ytdFed + ytdProv;

  const freq = company.payroll_freq || 'Bi-weekly';
  const getNextPayDate = () => {
    const allPeriods = getPeriodList(freq);
    const today = new Date();
    const next = allPeriods.find(p => new Date(p.payDate) >= today);
    return next ? next.payDate : '—';
  };

  const byMonth = {};
  const byMonthNet = {};
  recentRuns.forEach(r => {
    const key = new Date(r.pay_date || r.created_at).toLocaleString('default', { month: 'short' });
    byMonth[key]    = (byMonth[key]    || 0) + (+r.gross || 0);
    byMonthNet[key] = (byMonthNet[key] || 0) + (+r.net   || 0);
  });
  const trendLabels = Object.keys(byMonth).reverse();
  const trendGross  = trendLabels.map(m => +byMonth[m].toFixed(2));
  const trendNet    = trendLabels.map(m => +(byMonthNet[m]||0).toFixed(2));
  const trendDed    = trendGross.map((g,i) => +(g - trendNet[i]).toFixed(2));

  const AV_BG = ['bg-blue-100','bg-emerald-100','bg-amber-100','bg-purple-100','bg-cyan-100'];
  const AV_TX = ['text-blue-700','text-emerald-700','text-amber-700','text-purple-700','text-cyan-700'];

  const cppPct  = Math.min(ytdCPP  / 4230.45 * 100, 100);
  const eiPct   = Math.min(ytdEI   / 1123.07 * 100, 100);
  const fedPct  = Math.min(ytdFed  / 30000   * 100, 100);
  const runsPct = Math.min(recentRuns.length / 26   * 100, 100);

  const lastTwo = recentRuns.length >= 2 ? [recentRuns[0], recentRuns[1]] : null;
  const delta = lastTwo && lastTwo[1].gross > 0
    ? (((lastTwo[0].gross - lastTwo[1].gross) / lastTwo[1].gross) * 100).toFixed(1)
    : null;

  const chartColors = {
    grid:   isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    tick:   isDark ? '#6b7fa3' : '#94a3b8',
    blue:   isDark ? '#3b82f6' : '#2563eb',
    green:  isDark ? '#10b981' : '#059669',
    amber:  '#f59e0b',
    cyan:   '#06b6d4',
    purple: '#8b5cf6',
  };

  useEffect(() => {
    const build = async () => {
      if (!trendRef.current) return;
      const ChartJS = (await import('chart.js/auto')).default;
      if (trendChart.current) trendChart.current.destroy();
      const ctx = trendRef.current.getContext('2d');
    const datasets = [];
    if (activeView === 'both' || activeView === 'gross')
      datasets.push({ label:'Gross', data: trendGross, borderColor: chartColors.blue, backgroundColor: isDark?'rgba(59,130,246,0.08)':'rgba(37,99,235,0.06)', borderWidth:2, pointRadius:3, pointBackgroundColor: chartColors.blue, tension:0.35, fill: activeView==='gross' });
    if (activeView === 'both' || activeView === 'net')
      datasets.push({ label:'Net', data: trendNet, borderColor: chartColors.green, backgroundColor: isDark?'rgba(16,185,129,0.05)':'rgba(5,150,105,0.04)', borderWidth:2, pointRadius:3, pointBackgroundColor: chartColors.green, tension:0.35, fill: false });
    if (activeView === 'ded')
      datasets.push({ label:'Deductions', data: trendDed, borderColor: chartColors.amber, backgroundColor:'rgba(245,158,11,0.06)', borderWidth:2, pointRadius:3, pointBackgroundColor: chartColors.amber, tension:0.35, fill:true, borderDash:[4,3] });
    trendChart.current = new ChartJS(ctx, {
      type:'line',
      data:{ labels: trendLabels.length ? trendLabels : ['No data'], datasets: datasets.length ? datasets : [{ label:'No data', data:[0], borderColor: chartColors.blue, borderWidth:1, pointRadius:0 }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label: c=>`${c.dataset.label}: $${Number(c.raw).toLocaleString()}` }}},
        scales:{ x:{ grid:{color:chartColors.grid}, ticks:{color:chartColors.tick,font:{size:10}}, border:{color:'transparent'} }, y:{ grid:{color:chartColors.grid}, ticks:{color:chartColors.tick,font:{size:10},callback:v=>'$'+(v>=1000?(v/1000).toFixed(0)+'k':v)}, border:{color:'transparent'} } } }
    });
    }; build();
  }, [trendLabels.join(), trendGross.join(), trendNet.join(), activeView, theme]);

  useEffect(() => {
    const build = async () => {
      if (!donutRef.current) return;
      const ChartJS = (await import('chart.js/auto')).default;
      if (donutChart.current) donutChart.current.destroy();
      const ctx = donutRef.current.getContext('2d');
      const vals = [ytdCPP, ytdEI, ytdFed, ytdProv];
      const total = vals.reduce((a,b)=>a+b,0) || 1;
      donutChart.current = new ChartJS(ctx, {
        type:'doughnut',
        data:{ labels:['CPP','EI','Fed Tax','Prov Tax'], datasets:[{ data:vals, backgroundColor:[chartColors.blue,chartColors.cyan,chartColors.amber,chartColors.purple], borderWidth:0, hoverOffset:3 }] },
        options:{ responsive:true, maintainAspectRatio:false, cutout:'65%', plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label: c=>`${c.label}: $${Number(c.raw).toFixed(2)} (${(c.raw/total*100).toFixed(1)}%)` }}}}
      });
    }; build();
  }, [ytdCPP, ytdEI, ytdFed, ytdProv, theme]);

  useEffect(() => {
    const build = async () => {
      if (!barRef.current || !emps.length) return;
      const ChartJS = (await import('chart.js/auto')).default;
      if (barChart.current) barChart.current.destroy();
      const ctx = barRef.current.getContext('2d');
      const labels = emps.map(e => e.name.split(' ')[0]);
      const dataMap = {
        gross: emps.map(e => +(e.ytd_gross||0)),
        net:   emps.map(e => +((e.ytd_gross||0)-(e.ytd_cpp||0)-(e.ytd_ei||0)-(e.ytd_fed_tax||0)-(e.ytd_prov_tax||0))),
        cpp:   emps.map(e => +(e.ytd_cpp||0)),
        ei:    emps.map(e => +(e.ytd_ei||0)),
      };
      const colorMap = { gross:chartColors.blue, net:chartColors.green, cpp:chartColors.amber, ei:chartColors.cyan };
      barChart.current = new ChartJS(ctx, {
        type:'bar',
        data:{ labels, datasets:[{ label: activeBar, data: dataMap[activeBar], backgroundColor: colorMap[activeBar], borderRadius:4, barThickness:16 }] },
        options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label: c=>`$${Number(c.raw).toLocaleString()}` }}},
          scales:{ x:{ grid:{color:chartColors.grid}, ticks:{color:chartColors.tick,font:{size:10},callback:v=>'$'+(v>=1000?(v/1000).toFixed(0)+'k':v)}, border:{color:'transparent'} }, y:{ grid:{display:false}, ticks:{color:chartColors.tick,font:{size:10}}, border:{color:'transparent'} } } }
      });
    }; build();
  }, [emps.map(e=>e.id).join(), activeBar, theme]);

  const segTotal = (ytdCPP+ytdEI+ytdFed+ytdProv) || 1;
  const segData = [
    { label:'CPP',      val:ytdCPP,  pct:(ytdCPP/segTotal*100).toFixed(1),  color:'#3b82f6' },
    { label:'EI',       val:ytdEI,   pct:(ytdEI/segTotal*100).toFixed(1),   color:'#06b6d4' },
    { label:'Federal',  val:ytdFed,  pct:(ytdFed/segTotal*100).toFixed(1),  color:'#f59e0b' },
    { label:'Prov',     val:ytdProv, pct:(ytdProv/segTotal*100).toFixed(1), color:'#8b5cf6' },
  ];

  const s = {
    surface:  {background:isDark?'#141b24':'#ffffff', border:`1px solid ${isDark?'#1e2d40':'#e2e8f0'}`},
    surface2: {background:isDark?'#1a2332':'#f4f7fb'},
    border:   `1px solid ${isDark?'#1e2d40':'#e2e8f0'}`,
    muted:    isDark?'#6b7fa3':'#64748b',
    faint:    {background:isDark?'#0f1620':'#eef2f7'},
    accent:   isDark?'#3b82f6':'#2563eb',
    accentBg: isDark?'#3b82f6':'#2563eb',
    text:     isDark?'#e8f0fe':'#0f172a',
  };

  return (
    <div data-theme={theme} style={{minHeight:'100%'}}>
      <div className="p-5 space-y-5">
        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label:'YTD Gross Payroll', value: loading?'…':`$${ytdGross.toLocaleString(undefined,{maximumFractionDigits:0})}`, sub: delta?<span className={+delta>=0?'text-emerald-500':'text-red-400'}>{+delta>=0?'↑':'↓'}{Math.abs(+delta)}% vs prev</span>:`${recentRuns.length} runs`, color:'#3b82f6' },
            { label:'Net Paid Out',      value: loading?'…':`$${ytdNet.toLocaleString(undefined,{maximumFractionDigits:0})}`,   sub:<span className={s.muted}>after all deductions</span>, color:'#10b981' },
            { label:'Active Employees',  value: loading?'…':emps.length, sub:<span className={s.muted}>{emps.filter(e=>e.type==='Salary').length} salary · {emps.filter(e=>e.type==='Hourly').length} hourly</span>, color:'#06b6d4' },
            { label:'Next Pay Date',     value: getNextPayDate(), sub:<span className={`text-xs px-2 py-0.5 rounded-full ${isDark?'bg-blue-900/40 text-blue-300':'bg-blue-50 text-blue-600'}`}>{freq}</span>, color:'#8b5cf6' },
          ].map(k=>(
            <div key={k.label} style={{...s.surface, position:'relative', overflow:'hidden', cursor:'pointer', borderRadius:'12px', padding:'16px'}} className="transition-colors hover:border-blue-500">
              <div style={{position:'absolute',bottom:0,left:0,right:0,height:'2px',background:k.color}}/>
              <div style={{fontSize:'10.5px',textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:500,marginBottom:'8px',color:s.muted}}>{k.label}</div>
              <div style={{fontSize:'22px',fontWeight:700,lineHeight:1,marginBottom:'6px',fontFamily:'Space Grotesk,system-ui',color:s.text}}>{k.value}</div>
              <div style={{fontSize:'11px'}}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Row 1: Trend + Donut ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div style={{...s.surface, borderRadius:'12px', padding:'16px', gridColumn:'span 2'}} className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold">Payroll trend</div>
                <div className={`text-xs ${s.muted}`}>Monthly gross & net · 2026</div>
              </div>
              <div className={`flex gap-1 p-1 rounded-lg border ${s.border} ${s.surface2}`}>
                {[['both','Both'],['gross','Gross'],['net','Net'],['ded','Deductions']].map(([v,l])=>(
                  <button key={v} onClick={()=>setActiveView(v)}
                    className={`px-2 py-1 rounded-md text-xs transition-all ${activeView===v?(isDark?'bg-[#1e2d40] text-white':'bg-white shadow text-gray-900 border border-gray-200'):s.muted}`}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{position:'relative',height:'180px'}}>
              <canvas ref={trendRef} role="img" aria-label="Payroll trend line chart showing monthly gross and net payroll"/>
            </div>
            <div className="flex gap-4 mt-2">
              {(activeView==='both'||activeView==='gross')&&<span className={`flex items-center gap-1.5 text-xs ${s.muted}`}><span className="w-2.5 h-0.5 bg-blue-500 inline-block rounded"/>Gross</span>}
              {(activeView==='both'||activeView==='net')&&<span className={`flex items-center gap-1.5 text-xs ${s.muted}`}><span className="w-2.5 h-0.5 bg-emerald-500 inline-block rounded"/>Net</span>}
              {activeView==='ded'&&<span className={`flex items-center gap-1.5 text-xs ${s.muted}`}><span className="w-2.5 h-0.5 bg-amber-500 inline-block rounded"/>Deductions</span>}
              <span className={`ml-auto text-xs ${s.muted}`}>Total: ${ytdGross.toLocaleString(undefined,{maximumFractionDigits:0})}</span>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${s.surface}`}>
            <div className="text-sm font-semibold mb-1">Deduction split</div>
            <div className={`text-xs ${s.muted} mb-3`}>YTD breakdown</div>
            <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-3">
              {segData.map(s=>(<div key={s.label} style={{flex:s.val||0.01,background:s.color}} title={`${s.label}: ${s.pct}%`}/>))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
              {segData.map(d=>(<div key={d.label} className={`flex items-center gap-1 text-xs ${s.muted}`}><span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{background:d.color}}/>{d.label}: {d.pct}%</div>))}
            </div>
            <div style={{position:'relative',height:'130px'}}>
              <canvas ref={donutRef} role="img" aria-label="Donut chart showing CPP EI federal and provincial tax deduction proportions"/>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
              {segData.map(d=>(<div key={d.label} className={`flex items-center gap-1 text-xs ${s.muted}`}><span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{background:d.color}}/>${d.val.toFixed(0)}</div>))}
            </div>
          </div>
        </div>

        {/* ── Row 2: Bar + YTD Progress ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`lg:col-span-2 rounded-xl border p-4 ${s.surface}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold">Pay distribution</div>
                <div className={`text-xs ${s.muted}`}>Per-employee YTD comparison</div>
              </div>
              <div className={`flex gap-1 p-1 rounded-lg border ${s.border} ${s.surface2}`}>
                {[['gross','Gross'],['net','Net'],['cpp','CPP'],['ei','EI']].map(([v,l])=>(
                  <button key={v} onClick={()=>setActiveBar(v)}
                    className={`px-2 py-1 rounded-md text-xs transition-all ${activeBar===v?(isDark?'bg-[#1e2d40] text-white':'bg-white shadow text-gray-900 border border-gray-200'):s.muted}`}>{l}</button>
                ))}
              </div>
            </div>
            {emps.length > 0 ? (
              <div style={{position:'relative',height:'150px'}}>
                <canvas ref={barRef} role="img" aria-label="Horizontal bar chart comparing per-employee payroll amounts"/>
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center h-36 text-center ${s.muted}`}>
                <Users size={28} className="mb-2 opacity-30"/>
                <p className="text-sm">No employee data yet</p>
              </div>
            )}
          </div>

          <div className={`rounded-xl border p-4 ${s.surface}`}>
            <div className="text-sm font-semibold mb-1">YTD limits</div>
            <div className={`text-xs ${s.muted} mb-4`}>CRA contribution progress</div>
            {[
              { label:'CPP contributions', val:`$${ytdCPP.toFixed(0)}`, pct:cppPct,  color:'#3b82f6', hint:'Max $4,230.45' },
              { label:'EI premiums',       val:`$${ytdEI.toFixed(0)}`,  pct:eiPct,   color:'#06b6d4', hint:'Max $1,123.07' },
              { label:'Federal tax',       val:`$${ytdFed.toFixed(0)}`, pct:fedPct,  color:'#f59e0b', hint:'YTD withheld' },
              { label:'Periods done',      val:`${recentRuns.length}/26`, pct:runsPct, color:'#10b981', hint:'Bi-weekly 2026' },
            ].map(p=>(
              <div key={p.label} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className={s.muted}>{p.label}</span>
                  <span className="font-medium">{p.val}</span>
                </div>
                <div className={`h-1.5 rounded-full overflow-hidden ${isDark?'bg-[#1a2332]':'bg-gray-100'}`}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{width:`${p.pct}%`,background:p.color}}/>
                </div>
                <div className={`text-xs mt-0.5 ${s.muted}`}>{p.hint}</div>
              </div>
            ))}
            <div className={`mt-3 p-3 rounded-xl border-l-2 border-blue-500 ${isDark?'bg-[#0f1620]':'bg-blue-50'}`}>
              <div className={`text-xs font-semibold ${s.accent} mb-1`}>CRA remittance owing</div>
              <div className="text-lg font-bold" style={{fontFamily:'Space Grotesk,system-ui'}}>${remitTotal.toFixed(2)}</div>
              <div className={`text-xs ${s.muted}`}>Employee + Employer CPP & EI + tax</div>
            </div>
          </div>
        </div>

        {/* ── Row 3: Runs + Employees + Companies ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`rounded-xl border p-4 ${s.surface}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">Recent runs</div>
              <button onClick={()=>setPage("history")} className={`text-xs ${s.accent} hover:underline`}>View all</button>
            </div>
            {recentRuns.length===0?(
              <div className={`flex flex-col items-center justify-center py-8 text-center ${s.muted}`}>
                <History size={28} className="mb-2 opacity-30"/>
                <p className="text-sm mb-3">No runs yet</p>
                <button onClick={()=>setPage("run")} className={`px-3 py-1.5 ${s.accentBg} text-white rounded-xl text-xs font-medium hover:opacity-90`}>Run Payroll</button>
              </div>
            ):(
              <div className="space-y-0">
                {recentRuns.slice(0,4).map(p=>(
                  <div key={p.id} className={`flex items-center justify-between py-2.5 border-b ${s.border} last:border-0`}>
                    <div>
                      <div className="text-xs font-medium leading-tight">{p.period}</div>
                      <div className={`text-xs ${s.muted}`}>{p.pay_date} · {p.employees} emp</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{fontFamily:'Space Grotesk,system-ui'}}>${Number(p.net).toLocaleString(undefined,{maximumFractionDigits:0})}</div>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${isDark?'bg-emerald-900/40 text-emerald-400':'bg-emerald-50 text-emerald-700'}`}>Done</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`rounded-xl border p-4 ${s.surface}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">Employees</div>
              <button onClick={()=>setPage("employees")} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border ${s.border} ${s.muted} hover:${s.accent} transition-colors`}><Plus size={11}/>Add</button>
            </div>
            {emps.length===0?(
              <div className={`flex flex-col items-center justify-center py-8 text-center ${s.muted}`}>
                <Users size={28} className="mb-2 opacity-30"/>
                <p className="text-sm">No employees</p>
              </div>
            ):(
              <div className="space-y-0">
                {emps.slice(0,5).map((e,i)=>(
                  <div key={e.id} className={`flex items-center gap-2.5 py-2 border-b ${s.border} last:border-0`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${AV_BG[i%5]} ${AV_TX[i%5]}`}>
                      {e.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{e.name}</div>
                      <div className={`text-xs ${s.muted}`}>{e.payroll_schedule||'Bi-weekly'}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-semibold">${Number(e.rate).toLocaleString()}</div>
                      <div className={`text-xs ${s.muted}`}>{e.type==='Salary'?'/yr':'/hr'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`rounded-xl border p-4 ${s.surface}`}>
            <div className="text-sm font-semibold mb-3">Quick actions</div>
            <div className="space-y-1 mb-4">
              {[
                {label:"Run Payroll",    icon:PlayCircle, page:"run",      color:"text-blue-500",   bg:isDark?"hover:bg-blue-900/20":"hover:bg-blue-50"},
                {label:"Add Employee",   icon:Users,      page:"employees",color:"text-emerald-500", bg:isDark?"hover:bg-emerald-900/20":"hover:bg-emerald-50"},
                {label:"View Paystubs",  icon:FileText,   page:"stubs",    color:"text-purple-500",  bg:isDark?"hover:bg-purple-900/20":"hover:bg-purple-50"},
                {label:"Payroll History",icon:History,    page:"history",  color:"text-amber-500",   bg:isDark?"hover:bg-amber-900/20":"hover:bg-amber-50"},
                {label:"Reports",        icon:BarChart2,  page:"reports",  color:"text-indigo-500",  bg:isDark?"hover:bg-indigo-900/20":"hover:bg-indigo-50"},
                {label:"Settings",       icon:Settings,   page:"settings", color:s.muted,            bg:isDark?"hover:bg-white/5":"hover:bg-gray-50"},
              ].map(a=>(
                <button key={a.label} onClick={()=>setPage(a.page)} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl ${a.bg} transition-colors text-left`}>
                  <a.icon size={14} className={a.color}/>
                  <span className="text-xs">{a.label}</span>
                  <ChevronRight size={12} className={`ml-auto ${s.muted}`}/>
                </button>
              ))}
            </div>
            <div className="text-sm font-semibold mb-2">All companies</div>
            {companies.map(c=>(
              <div key={c.id} onClick={()=>{setSelectedCompany(c);setPage("dashboard");}}
                className={`flex items-center gap-2 px-2 py-2 rounded-xl cursor-pointer transition-colors mb-1 ${c.id===company.id?(isDark?'bg-blue-900/30':'bg-blue-50'):(isDark?'hover:bg-white/5':'hover:bg-gray-50')}`}>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${c.id===company.id?`${s.accentBg} text-white`:(isDark?'bg-blue-900/40 text-blue-400':'bg-blue-50 text-blue-600')}`}>{c.name[0]}</div>
                <span className="text-xs font-medium truncate">{c.name}</span>
                {c.id===company.id&&<span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${isDark?'bg-blue-900/40 text-blue-400':'bg-blue-100 text-blue-700'}`}>Active</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      </div>
  );
}

// ─── Companies ───────────────────────────────────────────────────────────────
function CompaniesPage({ companies, setCompanies, setSelectedCompany, setPage }) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editCompany, setEditCompany] = useState(null);
  const [form, setForm] = useState({ name: "", opName: "", bn: "", province: "ON", freq: "Semi-monthly", email: "", phone: "" });
  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const addCompany = async () => {
    if (editCompany) {
      const { data } = await supabase.from('companies').update({
        name: form.name, bn: form.bn, province: form.province,
        email: form.email, phone: form.phone, payroll_freq: form.freq
      }).eq('id', editCompany.id).select().single();
      if (data) setCompanies(prev => prev.map(c => c.id === data.id ? data : c));
      setEditCompany(null);
    } else {
      const { data } = await supabase.from('companies').insert([{
        name: form.name || "New Company", bn: form.bn || "000000000RP0001",
        province: form.province, employees: 0, next_payroll: "2025-06-30",
        status: "active", remittance: "current", industry: "Other",
        email: form.email, phone: form.phone, payroll_freq: form.freq
      }]).select().single();
      if (data) setCompanies(prev => [...prev, data]);
    }
    setShowModal(false);
  };

  const deleteCompany = async (c) => {
    if (!window.confirm(`Delete ${c.name}? This will also delete all employees and payroll data.`)) return;
    await supabase.from('companies').delete().eq('id', c.id);
    setCompanies(prev => prev.filter(x => x.id !== c.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-gray-900">Companies</h1><p className="text-sm text-gray-400 mt-0.5">Manage payroll clients</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"><Plus size={15} /> Add Company</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Total Clients" value={companies.length} color="blue" />
        <StatCard icon={Users} label="Total Employees" value={companies.reduce((a,c)=>a+c.employees,0)} color="green" />
        <StatCard icon={CheckCircle2} label="Active Payrolls" value={companies.filter(c=>c.status==="active").length} color="green" />
        <StatCard icon={AlertCircle} label="Remittance Issues" value={companies.filter(c=>c.remittance!=="current").length} color="red" />
      </div>
      <Card>
        <div className="p-4 border-b border-gray-50 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-50">
              {["Company", "CRA Business #", "Province", "Employees", "Next Payroll", "Status", "Remittance", "Actions"].map(h => (
                <th key={h} className="text-left px-5 py-3">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600">{c.name[0]}</div>
                      <div><p className="text-sm font-medium text-gray-900">{c.name}</p><p className="text-xs text-gray-400">{c.industry}</p></div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 font-mono">{c.bn}</td>
                  <td className="px-5 py-4"><Badge color="blue">{c.province}</Badge></td>
                  <td className="px-5 py-4 text-sm text-gray-700">{c.employees}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{c.nextPayroll}</td>
                  <td className="px-5 py-4"><Badge color={c.status === "active" ? "green" : "yellow"}>{c.status}</Badge></td>
                  <td className="px-5 py-4"><Badge color={c.remittance === "overdue" ? "red" : c.remittance === "due" ? "yellow" : "green"}>{c.remittance === "current" ? "Current" : c.remittance === "due" ? "Due soon" : "Overdue"}</Badge></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setSelectedCompany(c); setPage("dashboard"); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Open dashboard"><Eye size={14} /></button>
                      <button onClick={() => { setEditCompany(c); setForm({ name: c.name, bn: c.bn||"", province: c.province||"ON", freq: c.payroll_freq||"Semi-monthly", email: c.email||"", phone: c.phone||"" }); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors" title="Edit"><Pencil size={14} /></button>
                      <button onClick={() => deleteCompany(c)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editCompany ? "Edit Company" : "Add New Company"} wide>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Legal Company Name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Maple Ridge Inc." />
          <Input label="Operating Name" value={form.opName} onChange={e=>setForm(p=>({...p,opName:e.target.value}))} placeholder="Maple Ridge" />
          <Input label="CRA Business Number" value={form.bn} onChange={e=>setForm(p=>({...p,bn:e.target.value}))} placeholder="123456789RP0001" />
          <Input label="Payroll Account Number" placeholder="123456789RP0001" />
          <Select label="Province" value={form.province} onChange={e=>setForm(p=>({...p,province:e.target.value}))}>
            {["ON","BC","AB","QC","MB","SK","NS","NB","NL","PE"].map(p=><option key={p}>{p}</option>)}
          </Select>
          <Select label="Payroll Frequency" value={form.freq} onChange={e=>setForm(p=>({...p,freq:e.target.value}))}>
            {["Weekly","Bi-weekly","Semi-monthly","Monthly"].map(f=><option key={f}>{f}</option>)}
          </Select>
          <Input label="Company Email" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="payroll@company.ca" />
          <Input label="Company Phone" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="(416) 555-0100" />
          <Input label="Street Address" placeholder="100 King St W, Suite 1" />
          <Input label="City / Postal Code" placeholder="Toronto, ON M5X 1A9" />
          <Select label="Remittance Frequency">
            <option>Regular (Monthly)</option><option>Quarterly</option><option>Accelerated</option>
          </Select>
          <Input label="Vacation Pay %" defaultValue="4" />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={addCompany} className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">Create Company</button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Employees ───────────────────────────────────────────────────────────────
function EmployeesPage({ company }) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);

useEffect(() => {
  const fetchEmployees = async () => {
    const { data } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: true });
    if (data) setEmployees(data);
  };
  fetchEmployees();
}, [company.id]);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", province: "ON", type: "Salary", salary: "", rate: "", hireDate: "", position: "", td1Fed: "16452", td1Prov: "", paySchedule: "Semi-monthly", vacRate: "4", ytd_gross: "", ytd_cpp: "", ytd_ei: "", ytd_fed_tax: "", ytd_prov_tax: "", ytd_vac: "", ytd_er_cpp: "", ytd_er_ei: "", ytd_base_earnings: "", ytd_tax: "", ytd_unlock: false, ytd_as_of_period: "" });
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");

  const handlePaystubImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportError("");
    try {
      let flat = [];

      if (file.name.endsWith('.pdf')) {
        // ── PDF extraction via pdf.js ──────────────────────────────────────
        const pdfjsLib = await import('pdfjs-dist/build/pdf');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map(item => item.str).join(" ") + " ";
        }
        // Tokenize into words/values
        flat = fullText.split(/\s+/).map(v => v.trim()).filter(Boolean);
      } else {
        // ── Excel extraction ───────────────────────────────────────────────
        const XLSX = await import('xlsx');
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        flat = rows.flat().map(v => String(v).trim());
      }

      // ── Shared fuzzy extraction logic ────────────────────────────────────
      const findAfterLabel = (labels) => {
        for (const label of labels) {
          const labelWords = label.toLowerCase().split(" ");
          for (let i = 0; i < flat.length - 1; i++) {
            const window = flat.slice(i, i + labelWords.length).join(" ").toLowerCase();
            if (window.includes(label.toLowerCase())) {
              // Scan ahead for first numeric value
              for (let j = i + 1; j < Math.min(i + 6, flat.length); j++) {
                const val = String(flat[j]).replace(/[$,()]/g, "").trim();
                if (val && !isNaN(parseFloat(val)) && parseFloat(val) > 0) return val;
              }
            }
          }
        }
        return "";
      };

      const findText = (labels) => {
        for (const label of labels) {
          for (let i = 0; i < flat.length - 1; i++) {
            if (flat[i].toLowerCase().includes(label.toLowerCase())) {
              const next = flat[i + 1];
              if (next && !/^\d/.test(next)) return next;
            }
          }
        }
        return "";
      };

      const findRate = () => {
        // Look for patterns like "$25.00/hr" or "95,000/yr" or "Rate: 45.00"
        for (let i = 0; i < flat.length; i++) {
          const v = flat[i].replace(/[$,]/g, "");
          if (/^\d+(\.\d+)?$/.test(v) && parseFloat(v) > 10) {
            const ctx = flat.slice(Math.max(0,i-2), i+2).join(" ").toLowerCase();
            if (ctx.includes("rate") || ctx.includes("/hr") || ctx.includes("hourly") || ctx.includes("salary") || ctx.includes("/yr")) {
              return v;
            }
          }
        }
        return "";
      };

      const fullName = findText(["employee", "name"]);
      const nameParts = fullName ? fullName.split(" ") : ["", ""];
      const extractedRate = findRate();

      // Try to find combined income tax (fed+prov together)
      const combinedTax = findAfterLabel(["income tax (federal", "total income tax", "income tax ytd"]);
      const fedTax  = findAfterLabel(["ytd federal", "federal tax", "fed tax", "federal income"]);
      const provTax = findAfterLabel(["ytd provincial", "provincial tax", "prov tax", "provincial income"]);

      // From screenshot: SALARY row has AMOUNT=1462.43, YTD=15915.16
      // CPP current=82.49 YTD=913.77, EI current=24.79 YTD=272.26
      // FED.TAX current=164.71 YTD=1915.96
      // Employer CPP current=82.49 YTD=913.77, Employer EI current=34.71 YTD=381.16
      // VAC.PAY YTD=636.61, GROSS YTD=16703.54, NET YTD=13601.55

      const ytdBaseEarnings = findAfterLabel(["salary", "base salary", "regular", "amount"]);
      const ytdGross        = findAfterLabel(["year to date", "ytd gross", "gross pay", "16703", "total gross"]);
      const ytdCPP          = findAfterLabel(["cpp"]);
      const ytdEI           = findAfterLabel(["ei"]);
      const ytdFedTax       = findAfterLabel(["fed.tax", "fed tax", "fedtax", "federal"]);
      const ytdVac          = findAfterLabel(["vac.pay", "vac pay", "vacation"]);
      const ytdErCPP        = findAfterLabel(["employer cpp", "er cpp"]);
      const ytdErEI         = findAfterLabel(["employer ei", "er ei"]);
      const ytdNet          = findAfterLabel(["net pay", "net"]);

      setForm(prev => ({
        ...prev,
        firstName:         nameParts[0] || prev.firstName,
        lastName:          nameParts.slice(1).join(" ") || prev.lastName,
        salary:            extractedRate && parseFloat(extractedRate) > 1000 ? extractedRate : prev.salary,
        rate:              extractedRate && parseFloat(extractedRate) <= 200  ? extractedRate : prev.rate,
        ytd_base_earnings: ytdBaseEarnings || prev.ytd_base_earnings,
        ytd_gross:         ytdGross || prev.ytd_gross,
        ytd_cpp:           ytdCPP   || prev.ytd_cpp,
        ytd_ei:            ytdEI    || prev.ytd_ei,
        ytd_tax:           ytdFedTax || prev.ytd_tax,
        ytd_fed_tax:       ytdFedTax ? (parseFloat(ytdFedTax)/2).toFixed(2) : prev.ytd_fed_tax,
        ytd_prov_tax:      ytdFedTax ? (parseFloat(ytdFedTax)/2).toFixed(2) : prev.ytd_prov_tax,
        ytd_vac:           ytdVac   || prev.ytd_vac,
        ytd_er_cpp:        ytdErCPP || prev.ytd_er_cpp,
        ytd_er_ei:         ytdErEI  || prev.ytd_er_ei,
      }));
    } catch (err) {
      setImportError("Could not read file. Please ensure it is a valid Excel (.xlsx) or PDF file.");
    }
    setImporting(false);
  };

  const filtered = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
  const addEmployee = async () => {
    if (editEmployee) {
      const updatePayload = {
        name: `${form.firstName} ${form.lastName}`,
        province: form.province,
        type: form.type,
        rate: form.type === "Salary" ? parseFloat(form.salary)||60000 : parseFloat(form.rate)||20,
        email: form.email,
        hire_date: form.hireDate,
        position: form.position || "Employee",
        td1_fed: parseFloat(form.td1Fed) || 16452,
        td1_prov: form.td1Prov ? parseFloat(form.td1Prov) : null,
        vac_rate: (form.vacRate || "4") + "%",
        payroll_schedule: form.paySchedule || "Semi-monthly",
      };
      // Only protect YTD fields on edit if employee already has YTD data and unlock is not checked
      const hasExistingYTD = (editEmployee.ytd_gross || 0) > 0;
      const shouldUpdateYTD = !hasExistingYTD || form.ytd_unlock === true;
      if (shouldUpdateYTD) {
        if (form.ytd_gross !== "") updatePayload.ytd_gross = parseFloat(form.ytd_gross) || 0;
        if (form.ytd_cpp !== "") updatePayload.ytd_cpp = parseFloat(form.ytd_cpp) || 0;
        if (form.ytd_ei !== "") updatePayload.ytd_ei = parseFloat(form.ytd_ei) || 0;
        if (form.ytd_fed_tax !== "") updatePayload.ytd_fed_tax = parseFloat(form.ytd_fed_tax) || 0;
        if (form.ytd_prov_tax !== "") updatePayload.ytd_prov_tax = parseFloat(form.ytd_prov_tax) || 0;
        if (form.ytd_vac !== "") updatePayload.ytd_vac = parseFloat(form.ytd_vac) || 0;
        if (form.ytd_er_cpp !== "") updatePayload.ytd_er_cpp = parseFloat(form.ytd_er_cpp) || 0;
        if (form.ytd_er_ei !== "") updatePayload.ytd_er_ei = parseFloat(form.ytd_er_ei) || 0;
        if (form.ytd_base_earnings !== "") updatePayload.ytd_base_earnings = parseFloat(form.ytd_base_earnings) || 0;
      }
      const { data } = await supabase
        .from('employees')
        .update(updatePayload)
        .eq('id', editEmployee.id)
        .select()
        .single();
      if (data) {
        setEmployees(prev => prev.map(emp => emp.id === data.id ? data : emp));
      }
      setEditEmployee(null);
    } else {
      const { data, error } = await supabase
        .from('employees')
        .insert([{
          company_id: company.id,
          name: `${form.firstName} ${form.lastName}`,
          position: form.position || "Employee",
          province: form.province,
          type: form.type,
          rate: form.type === "Salary" ? parseFloat(form.salary)||60000 : parseFloat(form.rate)||20,
          status: "active",
          last_payroll: null,
          sin: "***-***-000",
          td1_fed: parseFloat(form.td1Fed) || 16452,
          td1_prov: parseFloat(form.td1Prov) || null,
          email: form.email || null,
          hire_date: form.hireDate || null,
          vac_rate: (form.vacRate || "4") + "%",
          payroll_schedule: form.paySchedule || "Semi-monthly",
          ytd_gross: parseFloat(form.ytd_gross) || 0,
          ytd_cpp: parseFloat(form.ytd_cpp) || 0,
          ytd_ei: parseFloat(form.ytd_ei) || 0,
          ytd_fed_tax: parseFloat(form.ytd_fed_tax) || 0,
          ytd_prov_tax: parseFloat(form.ytd_prov_tax) || 0,
          ytd_vac: parseFloat(form.ytd_vac) || 0,
          ytd_er_cpp: parseFloat(form.ytd_er_cpp) || 0,
          ytd_er_ei: parseFloat(form.ytd_er_ei) || 0,
          ytd_base_earnings: parseFloat(form.ytd_base_earnings) || 0
        }])
        .select()
        .single();
      if (data) {
        setEmployees(prev => [...prev, data]);
      } else {
        console.error("Supabase insert error:", error);
        alert("Failed to save employee: " + (error?.message || "Unknown error"));
        return;
      }
    }
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-gray-900">Employees</h1><p className="text-sm text-gray-400 mt-0.5">{company.name}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"><Plus size={15} /> Add Employee</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Employees" value={employees.length} color="blue" />
        <StatCard icon={CheckCircle2} label="Active" value={employees.filter(e=>e.status==="active").length} color="green" />
        <StatCard icon={Briefcase} label="Salaried" value={employees.filter(e=>e.type==="Salary").length} color="blue" />
        <StatCard icon={Clock} label="Hourly" value={employees.filter(e=>e.type==="Hourly").length} color="amber" />
      </div>
      <Card>
        <div className="p-4 border-b border-gray-50 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users size={40} className="text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-500">No employees yet</p>
            <p className="text-xs text-gray-400 mt-1">Add your first employee to get started</p>
            <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors">Add Employee</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-50">
                {["Employee","Position","Province","Type","Rate / Salary","Status","Last Payroll","Actions"].map(h=>(
                  <th key={h} className="text-left px-5 py-3">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-xs font-bold text-emerald-600">{e.name.split(" ").map(n=>n[0]).join("")}</div>
                        <div><p className="text-sm font-medium text-gray-900">{e.name}</p><p className="text-xs text-gray-400">{e.sin}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{e.position}</td>
                    <td className="px-5 py-4"><Badge color="blue">{e.province}</Badge></td>
                    <td className="px-5 py-4 text-sm text-gray-600">{e.type}</td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-800">{e.type === "Salary" ? `$${e.rate.toLocaleString()}/yr` : `$${e.rate.toFixed(2)}/hr`}</td>
                    <td className="px-5 py-4"><Badge color="green">{e.status}</Badge></td>
                    <td className="px-5 py-4 text-sm text-gray-500">{e.lastPayroll}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400" onClick={() => { setEditEmployee(e); setForm({ firstName: e.name.split(" ")[0], lastName: e.name.split(" ").slice(1).join(" "), email: e.email||"", province: e.province||"ON", type: e.type||"Salary", salary: e.type==="Salary"?String(e.rate):"", rate: e.type==="Hourly"?String(e.rate):"", hireDate: e.hire_date||"", position: e.position||"", td1Fed: String(e.td1_fed||16452), td1Prov: String(e.td1_prov||""), paySchedule: e.payroll_schedule||"Semi-monthly", vacRate: (e.vac_rate||"4%").replace("%",""), ytd_gross: String(e.ytd_gross||""), ytd_cpp: String(e.ytd_cpp||""), ytd_ei: String(e.ytd_ei||""), ytd_fed_tax: String(e.ytd_fed_tax||""), ytd_prov_tax: String(e.ytd_prov_tax||""), ytd_vac: String(e.ytd_vac||""), ytd_er_cpp: String(e.ytd_er_cpp||""), ytd_er_ei: String(e.ytd_er_ei||""), ytd_base_earnings: String(e.ytd_base_earnings||""), ytd_tax: String(((e.ytd_fed_tax||0)+(e.ytd_prov_tax||0)).toFixed(2)), ytd_unlock: false, ytd_as_of_period: e.ytd_as_of_period||"" }); setShowModal(true); }}><Pencil size={14} /></button>
                        <button onClick={async () => {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', e.id);
  if (!error) setEmployees(prev => prev.filter(emp => emp.id !== e.id));
}} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditEmployee(null); }} title={editEmployee ? "Edit Employee" : "Add New Employee"} wide>
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" value={form.firstName} onChange={e=>setForm(p=>({...p,firstName:e.target.value}))} placeholder="Jane" />
          <Input label="Last Name" value={form.lastName} onChange={e=>setForm(p=>({...p,lastName:e.target.value}))} placeholder="Smith" />
          <Input label="Email Address" type="email" placeholder="jane@company.ca" />
          <Input label="SIN (Social Insurance Number)" placeholder="000-000-000" />
          <Select label="Province of Employment" value={form.province} onChange={e=>setForm(p=>({...p,province:e.target.value}))}>
            {["ON","BC","AB","QC","MB","SK","NS","NB","NL","PE"].map(p=><option key={p}>{p}</option>)}
          </Select>
          <Select label="Pay Type" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
            <option>Salary</option><option>Hourly</option>
          </Select>
          {form.type === "Salary"
            ? <Input label="Annual Salary ($)" value={form.salary} onChange={e=>setForm(p=>({...p,salary:e.target.value}))} placeholder="65000" />
            : <Input label="Hourly Rate ($)" value={form.rate} onChange={e=>setForm(p=>({...p,rate:e.target.value}))} placeholder="25.00" />
          }
          <Input label="Hire Date" type="date" value={form.hireDate} onChange={e=>setForm(p=>({...p,hireDate:e.target.value}))} />
          <Select label="Payroll Schedule" value={form.paySchedule} onChange={e=>setForm(p=>({...p,paySchedule:e.target.value}))}>
            <option>Semi-monthly</option><option>Bi-weekly</option><option>Weekly</option><option>Monthly</option>
          </Select>
          <Input label="Vacation Pay %" type="number" value={form.vacRate} onChange={e=>setForm(p=>({...p,vacRate:e.target.value}))} placeholder="4" />
          <Input label="Federal TD1 Claim ($)" type="number" value={form.td1Fed} onChange={e=>setForm(p=>({...p,td1Fed:e.target.value}))} placeholder="16452" />
<Input label="Provincial TD1 Claim ($)" type="number" value={form.td1Prov} onChange={e=>setForm(p=>({...p,td1Prov:e.target.value}))} placeholder="12989" />
          <Input label="Position / Job Title" placeholder="Software Developer" />
        </div>
        <div className="border border-dashed border-blue-200 bg-blue-50 rounded-xl p-4 mt-2">
          <p className="text-xs font-semibold text-blue-700 mb-1">📂 Import from Previous Paystub (Excel or PDF)</p>
          <p className="text-xs text-blue-500 mb-2">Upload a paystub from any payroll system to auto-fill name, rate, and YTD balances.</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">{importing ? "Reading..." : "Choose File"}</span>
            <input type="file" accept=".xlsx,.xls,.pdf" className="hidden" onChange={handlePaystubImport} disabled={importing} />
            <span className="text-xs text-blue-400">Supports .xlsx, .xls, .pdf</span>
          </label>
          {importError && <p className="text-xs text-red-500 mt-2">{importError}</p>}
        </div>
        <div className="border-t border-gray-100 pt-4 mt-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Opening YTD Balances</p>
            {editEmployee && (
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-amber-600 font-medium">🔒 Unlock to edit YTD</span>
                <input type="checkbox" checked={form.ytd_unlock === true} onChange={e => setForm(p => ({ ...p, ytd_unlock: e.target.checked }))} className="w-4 h-4 accent-amber-500" />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-1">Enter existing year-to-date balances if employee is mid-year transfer from another payroll system.</p>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">YTD balances are accurate as of pay period</label>
            <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" value={form.ytd_as_of_period || ""} onChange={e => setForm(p => ({ ...p, ytd_as_of_period: e.target.value }))} disabled={editEmployee && !form.ytd_unlock}>
              <option value="">-- Select period (optional) --</option>
              {BIWEEKLY_PERIODS.map(p => (<option key={p.period} value={p.period}>Period {p.period}: {p.start} – {p.end} (Pay: {p.payDate})</option>))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="YTD Base Earnings ($)" type="number" value={form.ytd_base_earnings||""} onChange={e=>setForm(p=>({...p,ytd_base_earnings:e.target.value}))} placeholder="0.00" />
          <Input label="YTD Gross ($)" type="number" value={form.ytd_gross||""} onChange={e=>setForm(p=>({...p,ytd_gross:e.target.value}))} placeholder="0.00" />
            <Input label="YTD CPP ($)" type="number" value={form.ytd_cpp||""} onChange={e=>setForm(p=>({...p,ytd_cpp:e.target.value}))} placeholder="0.00" />
            <Input label="YTD EI ($)" type="number" value={form.ytd_ei||""} onChange={e=>setForm(p=>({...p,ytd_ei:e.target.value}))} placeholder="0.00" />
            <Input label="YTD Total Income Tax ($)" type="number" value={form.ytd_tax||""} onChange={e=>{ const half = (parseFloat(e.target.value)||0)/2; setForm(p=>({...p,ytd_tax:e.target.value,ytd_fed_tax:half.toFixed(2),ytd_prov_tax:half.toFixed(2)})); }} placeholder="0.00" />
            <Input label="YTD Vacation Pay ($)" type="number" value={form.ytd_vac||""} onChange={e=>setForm(p=>({...p,ytd_vac:e.target.value}))} placeholder="0.00" />
          </div>
        </div>
        <div className="border-t border-gray-100 pt-4 mt-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Employer YTD Contributions</p>
          <p className="text-xs text-gray-400 mb-3">Enter employer year-to-date contributions if mid-year transfer.</p>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Employer YTD CPP ($)" type="number" value={form.ytd_er_cpp||""} onChange={e=>setForm(p=>({...p,ytd_er_cpp:e.target.value}))} placeholder="0.00" />
            <Input label="Employer YTD EI ($)" type="number" value={form.ytd_er_ei||""} onChange={e=>setForm(p=>({...p,ytd_er_ei:e.target.value}))} placeholder="0.00" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
          <button onClick={addEmployee} className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">Add Employee</button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Pay Period Calendars 2026 ────────────────────────────────────────────────
const WEEKLY_PERIODS = [
  {period:1,start:"Jan 1, 2026",end:"Jan 4, 2026",payDate:"Jan 5, 2026"},
  {period:2,start:"Jan 5, 2026",end:"Jan 11, 2026",payDate:"Jan 12, 2026"},
  {period:3,start:"Jan 12, 2026",end:"Jan 18, 2026",payDate:"Jan 19, 2026"},
  {period:4,start:"Jan 19, 2026",end:"Jan 25, 2026",payDate:"Jan 26, 2026"},
  {period:5,start:"Jan 26, 2026",end:"Feb 1, 2026",payDate:"Feb 2, 2026"},
  {period:6,start:"Feb 2, 2026",end:"Feb 8, 2026",payDate:"Feb 9, 2026"},
  {period:7,start:"Feb 9, 2026",end:"Feb 15, 2026",payDate:"Feb 16, 2026"},
  {period:8,start:"Feb 16, 2026",end:"Feb 22, 2026",payDate:"Feb 23, 2026"},
  {period:9,start:"Feb 23, 2026",end:"Mar 1, 2026",payDate:"Mar 2, 2026"},
  {period:10,start:"Mar 2, 2026",end:"Mar 8, 2026",payDate:"Mar 9, 2026"},
  {period:11,start:"Mar 9, 2026",end:"Mar 15, 2026",payDate:"Mar 16, 2026"},
  {period:12,start:"Mar 16, 2026",end:"Mar 22, 2026",payDate:"Mar 23, 2026"},
  {period:13,start:"Mar 23, 2026",end:"Mar 29, 2026",payDate:"Mar 30, 2026"},
  {period:14,start:"Mar 30, 2026",end:"Apr 5, 2026",payDate:"Apr 6, 2026"},
  {period:15,start:"Apr 6, 2026",end:"Apr 12, 2026",payDate:"Apr 13, 2026"},
  {period:16,start:"Apr 13, 2026",end:"Apr 19, 2026",payDate:"Apr 20, 2026"},
  {period:17,start:"Apr 20, 2026",end:"Apr 26, 2026",payDate:"Apr 27, 2026"},
  {period:18,start:"Apr 27, 2026",end:"May 3, 2026",payDate:"May 4, 2026"},
  {period:19,start:"May 4, 2026",end:"May 10, 2026",payDate:"May 11, 2026"},
  {period:20,start:"May 11, 2026",end:"May 17, 2026",payDate:"May 18, 2026"},
  {period:21,start:"May 18, 2026",end:"May 24, 2026",payDate:"May 25, 2026"},
  {period:22,start:"May 25, 2026",end:"May 31, 2026",payDate:"Jun 1, 2026"},
  {period:23,start:"Jun 1, 2026",end:"Jun 7, 2026",payDate:"Jun 8, 2026"},
  {period:24,start:"Jun 8, 2026",end:"Jun 14, 2026",payDate:"Jun 15, 2026"},
  {period:25,start:"Jun 15, 2026",end:"Jun 21, 2026",payDate:"Jun 22, 2026"},
  {period:26,start:"Jun 22, 2026",end:"Jun 28, 2026",payDate:"Jun 29, 2026"},
  {period:27,start:"Jun 29, 2026",end:"Jul 5, 2026",payDate:"Jul 6, 2026"},
  {period:28,start:"Jul 6, 2026",end:"Jul 12, 2026",payDate:"Jul 13, 2026"},
  {period:29,start:"Jul 13, 2026",end:"Jul 19, 2026",payDate:"Jul 20, 2026"},
  {period:30,start:"Jul 20, 2026",end:"Jul 26, 2026",payDate:"Jul 27, 2026"},
  {period:31,start:"Jul 27, 2026",end:"Aug 2, 2026",payDate:"Aug 3, 2026"},
  {period:32,start:"Aug 3, 2026",end:"Aug 9, 2026",payDate:"Aug 10, 2026"},
  {period:33,start:"Aug 10, 2026",end:"Aug 16, 2026",payDate:"Aug 17, 2026"},
  {period:34,start:"Aug 17, 2026",end:"Aug 23, 2026",payDate:"Aug 24, 2026"},
  {period:35,start:"Aug 24, 2026",end:"Aug 30, 2026",payDate:"Aug 31, 2026"},
  {period:36,start:"Aug 31, 2026",end:"Sep 6, 2026",payDate:"Sep 7, 2026"},
  {period:37,start:"Sep 7, 2026",end:"Sep 13, 2026",payDate:"Sep 14, 2026"},
  {period:38,start:"Sep 14, 2026",end:"Sep 20, 2026",payDate:"Sep 21, 2026"},
  {period:39,start:"Sep 21, 2026",end:"Sep 27, 2026",payDate:"Sep 28, 2026"},
  {period:40,start:"Sep 28, 2026",end:"Oct 4, 2026",payDate:"Oct 5, 2026"},
  {period:41,start:"Oct 5, 2026",end:"Oct 11, 2026",payDate:"Oct 12, 2026"},
  {period:42,start:"Oct 12, 2026",end:"Oct 18, 2026",payDate:"Oct 19, 2026"},
  {period:43,start:"Oct 19, 2026",end:"Oct 25, 2026",payDate:"Oct 26, 2026"},
  {period:44,start:"Oct 26, 2026",end:"Nov 1, 2026",payDate:"Nov 2, 2026"},
  {period:45,start:"Nov 2, 2026",end:"Nov 8, 2026",payDate:"Nov 9, 2026"},
  {period:46,start:"Nov 9, 2026",end:"Nov 15, 2026",payDate:"Nov 16, 2026"},
  {period:47,start:"Nov 16, 2026",end:"Nov 22, 2026",payDate:"Nov 23, 2026"},
  {period:48,start:"Nov 23, 2026",end:"Nov 29, 2026",payDate:"Nov 30, 2026"},
  {period:49,start:"Nov 30, 2026",end:"Dec 6, 2026",payDate:"Dec 7, 2026"},
  {period:50,start:"Dec 7, 2026",end:"Dec 13, 2026",payDate:"Dec 14, 2026"},
  {period:51,start:"Dec 14, 2026",end:"Dec 20, 2026",payDate:"Dec 21, 2026"},
  {period:52,start:"Dec 21, 2026",end:"Dec 27, 2026",payDate:"Dec 28, 2026"},
];

const SEMIMONTHLY_PERIODS = [
  {period:1,start:"Jan 1, 2026",end:"Jan 15, 2026",payDate:"Jan 16, 2026"},
  {period:2,start:"Jan 16, 2026",end:"Jan 31, 2026",payDate:"Feb 1, 2026"},
  {period:3,start:"Feb 1, 2026",end:"Feb 15, 2026",payDate:"Feb 16, 2026"},
  {period:4,start:"Feb 16, 2026",end:"Feb 28, 2026",payDate:"Mar 1, 2026"},
  {period:5,start:"Mar 1, 2026",end:"Mar 15, 2026",payDate:"Mar 16, 2026"},
  {period:6,start:"Mar 16, 2026",end:"Mar 31, 2026",payDate:"Apr 1, 2026"},
  {period:7,start:"Apr 1, 2026",end:"Apr 15, 2026",payDate:"Apr 16, 2026"},
  {period:8,start:"Apr 16, 2026",end:"Apr 30, 2026",payDate:"May 1, 2026"},
  {period:9,start:"May 1, 2026",end:"May 15, 2026",payDate:"May 16, 2026"},
  {period:10,start:"May 16, 2026",end:"May 31, 2026",payDate:"Jun 1, 2026"},
  {period:11,start:"Jun 1, 2026",end:"Jun 15, 2026",payDate:"Jun 16, 2026"},
  {period:12,start:"Jun 16, 2026",end:"Jun 30, 2026",payDate:"Jul 1, 2026"},
  {period:13,start:"Jul 1, 2026",end:"Jul 15, 2026",payDate:"Jul 16, 2026"},
  {period:14,start:"Jul 16, 2026",end:"Jul 31, 2026",payDate:"Aug 1, 2026"},
  {period:15,start:"Aug 1, 2026",end:"Aug 15, 2026",payDate:"Aug 16, 2026"},
  {period:16,start:"Aug 16, 2026",end:"Aug 31, 2026",payDate:"Sep 1, 2026"},
  {period:17,start:"Sep 1, 2026",end:"Sep 15, 2026",payDate:"Sep 16, 2026"},
  {period:18,start:"Sep 16, 2026",end:"Sep 30, 2026",payDate:"Oct 1, 2026"},
  {period:19,start:"Oct 1, 2026",end:"Oct 15, 2026",payDate:"Oct 16, 2026"},
  {period:20,start:"Oct 16, 2026",end:"Oct 31, 2026",payDate:"Nov 1, 2026"},
  {period:21,start:"Nov 1, 2026",end:"Nov 15, 2026",payDate:"Nov 16, 2026"},
  {period:22,start:"Nov 16, 2026",end:"Nov 30, 2026",payDate:"Dec 1, 2026"},
  {period:23,start:"Dec 1, 2026",end:"Dec 15, 2026",payDate:"Dec 16, 2026"},
  {period:24,start:"Dec 16, 2026",end:"Dec 31, 2026",payDate:"Jan 1, 2027"},
];

const MONTHLY_PERIODS = [
  {period:1,start:"Jan 1, 2026",end:"Jan 31, 2026",payDate:"Feb 1, 2026"},
  {period:2,start:"Feb 1, 2026",end:"Feb 28, 2026",payDate:"Mar 1, 2026"},
  {period:3,start:"Mar 1, 2026",end:"Mar 31, 2026",payDate:"Apr 1, 2026"},
  {period:4,start:"Apr 1, 2026",end:"Apr 30, 2026",payDate:"May 1, 2026"},
  {period:5,start:"May 1, 2026",end:"May 31, 2026",payDate:"Jun 1, 2026"},
  {period:6,start:"Jun 1, 2026",end:"Jun 30, 2026",payDate:"Jul 1, 2026"},
  {period:7,start:"Jul 1, 2026",end:"Jul 31, 2026",payDate:"Aug 1, 2026"},
  {period:8,start:"Aug 1, 2026",end:"Aug 31, 2026",payDate:"Sep 1, 2026"},
  {period:9,start:"Sep 1, 2026",end:"Sep 30, 2026",payDate:"Oct 1, 2026"},
  {period:10,start:"Oct 1, 2026",end:"Oct 31, 2026",payDate:"Nov 1, 2026"},
  {period:11,start:"Nov 1, 2026",end:"Nov 30, 2026",payDate:"Dec 1, 2026"},
  {period:12,start:"Dec 1, 2026",end:"Dec 31, 2026",payDate:"Jan 1, 2027"},
];

const getPeriodList = (schedule) => {
  if (schedule === "Weekly") return WEEKLY_PERIODS;
  if (schedule === "Semi-monthly") return SEMIMONTHLY_PERIODS;
  if (schedule === "Monthly") return MONTHLY_PERIODS;
  return BIWEEKLY_PERIODS;
};

// ─── Run Payroll ──────────────────────────────────────────────────────────────
const BIWEEKLY_PERIODS = [
  { period: 1,  start: "Dec 29, 2025", end: "Jan 11, 2026", payDate: "Jan 12, 2026" },
  { period: 2,  start: "Jan 12, 2026", end: "Jan 25, 2026", payDate: "Jan 26, 2026" },
  { period: 3,  start: "Jan 26, 2026", end: "Feb 8, 2026",  payDate: "Feb 9, 2026" },
  { period: 4,  start: "Feb 9, 2026",  end: "Feb 22, 2026", payDate: "Feb 23, 2026" },
  { period: 5,  start: "Feb 23, 2026", end: "Mar 8, 2026",  payDate: "Mar 9, 2026" },
  { period: 6,  start: "Mar 9, 2026",  end: "Mar 22, 2026", payDate: "Mar 23, 2026" },
  { period: 7,  start: "Mar 23, 2026", end: "Apr 5, 2026",  payDate: "Apr 6, 2026" },
  { period: 8,  start: "Apr 6, 2026",  end: "Apr 19, 2026", payDate: "Apr 20, 2026" },
  { period: 9,  start: "Apr 20, 2026", end: "May 3, 2026",  payDate: "May 4, 2026" },
  { period: 10, start: "May 4, 2026",  end: "May 17, 2026", payDate: "May 18, 2026" },
  { period: 11, start: "May 18, 2026", end: "May 31, 2026", payDate: "Jun 1, 2026" },
  { period: 12, start: "Jun 1, 2026",  end: "Jun 14, 2026",  payDate: "Jun 15, 2026" },
  { period: 13, start: "Jun 15, 2026", end: "Jun 28, 2026",  payDate: "Jun 29, 2026" },
  { period: 14, start: "Jun 29, 2026", end: "Jul 12, 2026",  payDate: "Jul 13, 2026" },
  { period: 15, start: "Jul 13, 2026", end: "Jul 26, 2026",  payDate: "Jul 27, 2026" },
  { period: 16, start: "Jul 27, 2026", end: "Aug 9, 2026",   payDate: "Aug 10, 2026" },
  { period: 17, start: "Aug 10, 2026", end: "Aug 23, 2026",  payDate: "Aug 24, 2026" },
  { period: 18, start: "Aug 24, 2026", end: "Sep 6, 2026",   payDate: "Sep 7, 2026" },
  { period: 19, start: "Sep 7, 2026",  end: "Sep 20, 2026",  payDate: "Sep 21, 2026" },
  { period: 20, start: "Sep 21, 2026", end: "Oct 4, 2026",   payDate: "Oct 5, 2026" },
  { period: 21, start: "Oct 5, 2026",  end: "Oct 18, 2026",  payDate: "Oct 19, 2026" },
  { period: 22, start: "Oct 19, 2026", end: "Nov 1, 2026",   payDate: "Nov 2, 2026" },
  { period: 23, start: "Nov 2, 2026",  end: "Nov 15, 2026",  payDate: "Nov 16, 2026" },
  { period: 24, start: "Nov 16, 2026", end: "Nov 29, 2026",  payDate: "Nov 30, 2026" },
  { period: 25, start: "Nov 30, 2026", end: "Dec 13, 2026",  payDate: "Dec 14, 2026" },
  { period: 26, start: "Dec 14, 2026", end: "Dec 27, 2026",  payDate: "Dec 28, 2026" },
  { period: 27, start: "Dec 28, 2026", end: "Jan 10, 2027",  payDate: "Jan 11, 2027" },
];

function RunPayrollPage({ company, setPage }) {
  const [emps, setEmps] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [selectedFreq, setSelectedFreq] = useState("Bi-weekly");

  useEffect(() => {
    const fetchEmps = async () => {
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', company.id)
        .eq('status', 'active');
      if (data) {
        setEmps(data);
        const initHours = {};
        data.forEach(e => {
          initHours[e.id] = {
            reg: e.type === "Salary" ? "80" : "0",
            ot: "0", stat: "0", statMode: "amount", bonus: "0",
            vacRate: e.vac_rate || "4%"
          };
        });
        setHours(initHours);
        const initSelected = {};
        data.forEach(e => { initSelected[e.id] = true; });
        setSelectedEmps(initSelected);
      }
    };
    fetchEmps();
  }, [company.id]);
  const [hours, setHours] = useState({});
  const [processed, setProcessed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [overwriteMode, setOverwriteMode] = useState(false);
  const [selectedEmps, setSelectedEmps] = useState({});
  const [period] = useState("Jun 1–15, 2025");

  const filteredEmps = emps.filter(e => (e.payroll_schedule || "Bi-weekly") === selectedFreq);

  const rows = filteredEmps.filter(e => selectedEmps[e.id] !== false).map(e => {
    const defaultReg = e.type === "Salary" ? "80" : "0";
    const defaultVac = (e.vac_rate || "4%").replace("%","");
    const h = hours[e.id] || { reg: defaultReg, ot:"0", stat:"0", statMode:"amount", bonus:"0", vacRate: defaultVac + "%" };
    const fedTD1 = e.td1_fed || 16452;
    const provTD1 = e.td1_prov || null;
    return { ...e, ...calcPayroll(e, h.reg, h.ot, h.bonus, h.stat, h.statMode || "amount", VAC_RATES[h.vacRate] ?? 0.04, selectedFreq, fedTD1, provTD1), ...h };
  });

  const totals = rows.reduce((a, r) => ({
    gross: a.gross + r.gross, cpp: a.cpp + r.cpp, ei: a.ei + r.ei, tax: a.tax + r.tax, net: a.net + r.net
  }), { gross:0, cpp:0, ei:0, tax:0, net:0 });

  const empCPP = totals.cpp;
  const empEI = totals.ei;
  const erCPP = empCPP;
  const erEI = empEI * 1.4;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-gray-900">Run Payroll</h1><p className="text-sm text-gray-400 mt-0.5">{company.name} · {period}</p></div>
        {processed && <Badge color="green">Payroll Processed</Badge>}
      </div>
      {processed && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <div><p className="text-sm font-medium text-emerald-800">Payroll processed successfully</p><p className="text-xs text-emerald-600">Direct deposits scheduled. CRA remittance: ${(empCPP+erCPP+empEI+erEI).toFixed(2)}</p></div>
          <button onClick={()=>setPage("stubs")} className="ml-auto px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">View Paystubs</button>
        </div>
      )}
      <Card>
        <div className="p-4 border-b border-gray-50 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700"><Calendar size={14} className="text-gray-400" />Frequency:</div>
          <select
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 text-blue-600 font-medium focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={selectedFreq}
            onChange={e => { setSelectedFreq(e.target.value); setSelectedPeriod(null); setProcessed(false); setDuplicateWarning(false); }}
          >
            <option value="Weekly">Weekly</option>
            <option value="Bi-weekly">Bi-weekly</option>
            <option value="Semi-monthly">Semi-monthly</option>
            <option value="Monthly">Monthly</option>
          </select>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700"><Calendar size={14} className="text-gray-400" />Pay Period:</div>
          <select
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 text-blue-600 font-medium focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={selectedPeriod || ""}
            onChange={e => { setSelectedPeriod(e.target.value); setProcessed(false); setDuplicateWarning(false); }}
          >
            <option value="">-- Select Period --</option>
            {getPeriodList(selectedFreq).map(p => (
              <option key={p.period} value={p.period}>
                Period {p.period}: {p.start} – {p.end}
              </option>
            ))}
          </select>
          {selectedPeriod && (
            <span className="text-xs text-gray-500">Pay Date: <span className="text-blue-600 font-medium">{getPeriodList(selectedFreq)[+selectedPeriod-1]?.payDate}</span></span>
          )}
          {selectedPeriod && (
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => setSelectedEmps(p => Object.fromEntries(Object.keys(p).map(k => [k, true])))} className="px-2 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">Select All</button>
              <button onClick={() => setSelectedEmps(p => Object.fromEntries(Object.keys(p).map(k => [k, false])))} className="px-2 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">Select None</button>
              <button onClick={async () => {
                if (!window.confirm("Clear all payroll data for this period? This will reverse YTD values.")) return;
                const periodLabel = (() => { const pl = getPeriodList(selectedFreq); const p = pl[+selectedPeriod-1]; return p ? `Period ${p.period}: ${p.start} – ${p.end}` : ''; })();
                const { data: existingRun } = await supabase.from('payroll_runs').select('*').eq('company_id', company.id).eq('period', periodLabel).maybeSingle();
                if (existingRun?.details) {
                  for (const oldDetail of existingRun.details) {
                    const { data: freshEmp } = await supabase.from('employees').select('ytd_gross,ytd_cpp,ytd_ei,ytd_fed_tax,ytd_prov_tax,ytd_vac,ytd_er_cpp,ytd_er_ei,ytd_base_earnings').eq('id', oldDetail.employee_id).single();
                    if (freshEmp) {
                      await supabase.from('employees').update({
                        ytd_gross:         +Math.max((freshEmp.ytd_gross||0)-(oldDetail.gross||0),0).toFixed(2),
                        ytd_cpp:           +Math.max((freshEmp.ytd_cpp||0)-(oldDetail.cpp||0),0).toFixed(2),
                        ytd_ei:            +Math.max((freshEmp.ytd_ei||0)-(oldDetail.ei||0),0).toFixed(2),
                        ytd_fed_tax:       +Math.max((freshEmp.ytd_fed_tax||0)-(oldDetail.fed_tax||0),0).toFixed(2),
                        ytd_prov_tax:      +Math.max((freshEmp.ytd_prov_tax||0)-(oldDetail.prov_tax||0),0).toFixed(2),
                        ytd_vac:           +Math.max((freshEmp.ytd_vac||0)-(oldDetail.vac_pay||0),0).toFixed(2),
                        ytd_er_cpp:        +Math.max((freshEmp.ytd_er_cpp||0)-(oldDetail.er_cpp||0),0).toFixed(2),
                        ytd_er_ei:         +Math.max((freshEmp.ytd_er_ei||0)-(oldDetail.er_ei||0),0).toFixed(2),
                        ytd_base_earnings: +Math.max((freshEmp.ytd_base_earnings||0)-(oldDetail.base_earnings||0),0).toFixed(2),
                      }).eq('id', oldDetail.employee_id);
                    }
                  }
                  await supabase.from('payroll_runs').delete().eq('company_id', company.id).eq('period', periodLabel);
                  setProcessed(false);
                  alert("Period cleared. You can now re-enter hours and process fresh.");
                } else {
                  alert("No existing payroll found for this period.");
                }
              }} className="px-2 py-1 text-xs border border-red-200 rounded-lg hover:bg-red-50 text-red-600">🗑 Clear Period</button>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-50">
              {["","Employee","Reg Hrs","OT Hrs (1.5×)","Stat Pay ($)","Bonus","Vac %","Base Pay","OT Pay","Vac Pay","Gross","CPP","EI","Tax","Net Pay"].map(h=>(
                <th key={h} className="text-left px-3 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {!selectedPeriod && (
                <tr><td colSpan={13} className="text-center py-6 text-yellow-700 bg-yellow-50 text-sm font-medium">⚠️ Please select a pay period above to enter hours and process payroll.</td></tr>
              )}
              {selectedPeriod && rows.map(e => (
                <tr key={e.id} className={`hover:bg-gray-50 ${selectedEmps[e.id]===false?'opacity-40':''}`}>
                  <td className="px-3 py-3">
                    <input type="checkbox" checked={selectedEmps[e.id] !== false} onChange={ev => setSelectedEmps(p => ({...p, [e.id]: ev.target.checked}))} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">{e.name.split(" ").map(n=>n[0]).join("")}</div>
                      <div><p className="font-medium text-gray-900 whitespace-nowrap">{e.name}</p><p className="text-xs text-gray-400">{e.type==="Salary"?`${e.rate.toLocaleString()}/yr`:`${e.rate}/hr`}</p></div>
                    </div>
                  </td>
                 {e.type === "Salary" ? (
                    <>
                      <td className="px-3 py-3 text-xs text-gray-400 italic">—</td>
                      <td className="px-3 py-3 text-xs text-gray-400 italic">—</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <input type="number" min="0" value={hours[e.id]?.stat||"0"} onChange={ev => setHours(p => ({...p, [e.id]:{...(p[e.id]||{}), stat:ev.target.value}}))}
                            className="w-16 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50 text-center" disabled={processed} />
                          <select value={hours[e.id]?.statMode||"amount"} onChange={ev => setHours(p => ({...p, [e.id]:{...(p[e.id]||{}), statMode:ev.target.value}}))}
                            disabled={processed} className="w-16 px-1 py-0.5 text-[10px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400">
                            <option value="amount">$ Amount</option>
                            <option value="hours">Hours</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <input type="number" min="0" value={hours[e.id]?.bonus||"0"} onChange={ev => setHours(p => ({...p, [e.id]:{...(p[e.id]||{}), bonus:ev.target.value}}))}
                          className="w-14 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50 text-center" disabled={processed} />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-3">
                        <input type="number" min="0" value={hours[e.id]?.reg||"0"} onChange={ev => setHours(p => ({...p, [e.id]:{...(p[e.id]||{}), reg:ev.target.value}}))}
                          className="w-14 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50 text-center" disabled={processed} />
                      </td>
                      <td className="px-3 py-3">
                        <input type="number" min="0" value={hours[e.id]?.ot||"0"} onChange={ev => setHours(p => ({...p, [e.id]:{...(p[e.id]||{}), ot:ev.target.value}}))}
                          className="w-14 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50 text-center" disabled={processed} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <input type="number" min="0" value={hours[e.id]?.stat||"0"} onChange={ev => setHours(p => ({...p, [e.id]:{...(p[e.id]||{}), stat:ev.target.value}}))}
                            className="w-16 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50 text-center" disabled={processed} />
                          <select value={hours[e.id]?.statMode||"amount"} onChange={ev => setHours(p => ({...p, [e.id]:{...(p[e.id]||{}), statMode:ev.target.value}}))}
                            disabled={processed} className="w-16 px-1 py-0.5 text-[10px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400">
                            <option value="amount">$ Amount</option>
                            <option value="hours">Hours</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <input type="number" min="0" value={hours[e.id]?.bonus||"0"} onChange={ev => setHours(p => ({...p, [e.id]:{...(p[e.id]||{}), bonus:ev.target.value}}))}
                          className="w-14 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50 text-center" disabled={processed} />
                      </td>
                    </>
                  )}
                  <td className="px-3 py-3">
                    <select value={hours[e.id]?.vacRate||"4%"} onChange={ev=>setHours(p=>({...p,[e.id]:{...(p[e.id]||{}),vacRate:ev.target.value}}))}
                      disabled={processed} className="w-16 px-1 py-1 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400">
                      {Object.keys(VAC_RATES).map(r=><option key={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-3 text-gray-700">${e.baseEarnings.toFixed(2)}</td>
                  <td className="px-3 py-3 text-indigo-600 font-medium">${e.otPay.toFixed(2)}</td>
                  <td className="px-3 py-3 text-purple-600 font-medium">${e.vacPay.toFixed(2)}</td>
                  <td className="px-3 py-3 font-semibold text-gray-900">${e.gross.toFixed(2)}</td>
                  <td className="px-3 py-3 text-red-500">${e.cpp.toFixed(2)}</td>
                  <td className="px-3 py-3 text-red-500">${e.ei.toFixed(2)}</td>
                  <td className="px-3 py-3 text-red-500">${e.tax.toFixed(2)}</td>
                  <td className="px-3 py-3 font-semibold text-emerald-700">${e.net.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="bg-gray-50 font-semibold text-sm">
              <td className="px-3 py-3 text-gray-700" colSpan={7}>Totals</td>
              <td className="px-3 py-3 text-gray-700">${rows.reduce((a,r)=>a+r.baseEarnings,0).toFixed(2)}</td>
              <td className="px-3 py-3 text-indigo-600">${rows.reduce((a,r)=>a+r.otPay,0).toFixed(2)}</td>
              <td className="px-3 py-3 text-purple-600">${rows.reduce((a,r)=>a+r.vacPay,0).toFixed(2)}</td>
              <td className="px-3 py-3 text-gray-900">${totals.gross.toFixed(2)}</td>
              <td className="px-3 py-3 text-red-500">${totals.cpp.toFixed(2)}</td>
              <td className="px-3 py-3 text-red-500">${totals.ei.toFixed(2)}</td>
              <td className="px-3 py-3 text-red-500">${totals.tax.toFixed(2)}</td>
              <td className="px-3 py-3 text-emerald-700">${totals.net.toFixed(2)}</td>
            </tr></tfoot>
          </table> 
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Payroll Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              {label:"Gross Payroll",v:`$${totals.gross.toFixed(2)}`,color:"text-gray-900"},
              {label:"Total Employee Deductions",v:`-$${(totals.cpp+totals.ei+totals.tax).toFixed(2)}`,color:"text-red-600"},
              {label:"Employer CPP (matched)",v:`$${erCPP.toFixed(2)}`,color:"text-amber-600"},
              {label:"Employer EI (×1.4)",v:`$${erEI.toFixed(2)}`,color:"text-amber-600"},
              {label:"CRA Remittance Total",v:`$${(totals.cpp+erCPP+totals.ei+erEI+totals.tax).toFixed(2)}`,color:"text-blue-700"},
              {label:"Total Net Pay (Direct Deposit)",v:`$${totals.net.toFixed(2)}`,color:"text-emerald-700"},
            ].map(r=>(
              <div key={r.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-xs text-gray-500">{r.label}</span>
                <span className={`text-sm font-semibold ${r.color}`}>{r.v}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Validation</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl"><CheckCircle2 size={14}/> All SINs verified</div>
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl"><CheckCircle2 size={14}/> Bank accounts on file</div>
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl"><CheckCircle2 size={14}/> TD1 forms completed</div>
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-xl"><AlertCircle size={14}/> Review CPP exemptions</div>
          </div>
          <div className="mt-4 space-y-2">
            <button className="w-full py-2 border border-blue-600 text-blue-600 rounded-xl text-sm hover:bg-blue-50 transition-colors"onClick={() => setShowPreview(true)}>Preview Payroll</button>
            <button onClick={async () => {
  setSaving(true);
  // Check for existing run in this period
  const periodLabel = (() => { const pl = getPeriodList(selectedFreq); const p = pl[+selectedPeriod-1]; return p ? `Period ${p.period}: ${p.start} – ${p.end}` : ''; })();
  if (!overwriteMode) {
    const { data: existing } = await supabase
      .from('payroll_runs')
      .select('id')
      .eq('company_id', company.id)
      .eq('period', periodLabel)
      .maybeSingle();
    if (existing) {
      setSaving(false);
      setDuplicateWarning(true);
      return;
    }
  }
  if (overwriteMode) {
    // Fetch the existing run to reverse its YTD contributions before deleting
    const { data: existingRun } = await supabase
      .from('payroll_runs')
      .select('*')
      .eq('company_id', company.id)
      .eq('period', periodLabel)
      .maybeSingle();

    if (existingRun?.details) {
      for (const oldDetail of existingRun.details) {
        const { data: freshEmp } = await supabase
          .from('employees')
          .select('ytd_gross,ytd_cpp,ytd_ei,ytd_fed_tax,ytd_prov_tax,ytd_vac,ytd_er_cpp,ytd_er_ei,ytd_base_earnings')
          .eq('id', oldDetail.employee_id)
          .single();
        if (freshEmp) {
          await supabase.from('employees').update({
            ytd_gross:         +Math.max((freshEmp.ytd_gross         || 0) - (oldDetail.gross       || 0), 0).toFixed(2),
            ytd_cpp:           +Math.max((freshEmp.ytd_cpp           || 0) - (oldDetail.cpp         || 0), 0).toFixed(2),
            ytd_ei:            +Math.max((freshEmp.ytd_ei            || 0) - (oldDetail.ei          || 0), 0).toFixed(2),
            ytd_fed_tax:       +Math.max((freshEmp.ytd_fed_tax       || 0) - (oldDetail.fed_tax     || 0), 0).toFixed(2),
            ytd_prov_tax:      +Math.max((freshEmp.ytd_prov_tax      || 0) - (oldDetail.prov_tax    || 0), 0).toFixed(2),
            ytd_vac:           +Math.max((freshEmp.ytd_vac           || 0) - (oldDetail.vac_pay     || 0), 0).toFixed(2),
            ytd_er_cpp:        +Math.max((freshEmp.ytd_er_cpp        || 0) - (oldDetail.er_cpp      || 0), 0).toFixed(2),
            ytd_er_ei:         +Math.max((freshEmp.ytd_er_ei         || 0) - (oldDetail.er_ei       || 0), 0).toFixed(2),
            ytd_base_earnings: +Math.max((freshEmp.ytd_base_earnings || 0) - (oldDetail.base_earnings || 0), 0).toFixed(2),
          }).eq('id', oldDetail.employee_id);
        }
      }
    }

    await supabase.from('payroll_runs').delete().eq('company_id', company.id).eq('period', periodLabel);
    setOverwriteMode(false);
  }
  const isRerun = overwriteMode;
  const { data } = await supabase
    .from('payroll_runs')
    .insert([{
      company_id: company.id,
      period: (() => { const pl = getPeriodList(selectedFreq); const p = pl[+selectedPeriod-1]; return p ? `Period ${p.period}: ${p.start} – ${p.end}` : ''; })(),
      pay_date: getPeriodList(selectedFreq)[+selectedPeriod-1]?.payDate || new Date().toISOString().split('T')[0],
      employees: rows.length,
      gross: totals.gross,
      deductions: +(totals.cpp + totals.ei + totals.tax).toFixed(2),
      net: totals.net,
      status: 'completed',
      details: rows.map(r => ({
        employee_id: r.id,
        name: r.name,
        province: r.province,
        emp_type: r.type,
        rate: r.rate,
        reg_hrs: r.reg || "0",
        ot_hrs: r.ot || "0",
        stat_hrs: r.stat || "0",
        gross: r.gross,
        base_earnings: r.baseEarnings,
        vac_pay: r.vacPay,
        cpp: r.cpp,
        ei: r.ei,
        fed_tax: +(r.fedTax || 0).toFixed(2),
        prov_tax: +(r.provTax || 0).toFixed(2),
        tax: r.tax,
        net: r.net,
        er_cpp: +(r.cpp || 0).toFixed(2),
        er_ei: +((r.ei || 0) * 1.4).toFixed(2),
        ytd_gross:    +((r.ytd_gross    || 0) + r.gross).toFixed(2),
        ytd_cpp:      +((r.ytd_cpp      || 0) + r.cpp).toFixed(2),
        ytd_ei:       +((r.ytd_ei       || 0) + r.ei).toFixed(2),
        ytd_fed_tax:  +((r.ytd_fed_tax  || 0) + (r.fedTax || 0)).toFixed(2),
        ytd_prov_tax: +((r.ytd_prov_tax || 0) + (r.provTax || 0)).toFixed(2),
        ytd_vac:           +((r.ytd_vac           || 0) + r.vacPay).toFixed(2),
        ytd_base_earnings: +((r.ytd_base_earnings || 0) + (r.baseEarnings || 0)).toFixed(2),
        ytd_er_cpp:        +((r.ytd_er_cpp        || 0) + (r.cpp || 0)).toFixed(2),
        ytd_er_ei:         +((r.ytd_er_ei         || 0) + ((r.ei || 0) * 1.4)).toFixed(2),
      }))
    }])
    .select()
    .single();
  if (data) {
    setProcessed(true);
    if (isRerun) { setSaving(false); return; }
    for (const r of rows) {
      const { data: freshEmp } = await supabase
        .from('employees')
        .select('ytd_gross,ytd_cpp,ytd_ei,ytd_fed_tax,ytd_prov_tax,ytd_vac,ytd_er_cpp,ytd_er_ei')
        .eq('id', r.id)
        .single();
      const base = freshEmp || {};
      await supabase.from('employees').update({
        ytd_gross:    +((base.ytd_gross    || 0) + r.gross).toFixed(2),
        ytd_cpp:      +((base.ytd_cpp      || 0) + r.cpp).toFixed(2),
        ytd_ei:       +((base.ytd_ei       || 0) + r.ei).toFixed(2),
        ytd_fed_tax:  +((base.ytd_fed_tax  || 0) + (r.fedTax || 0)).toFixed(2),
        ytd_prov_tax: +((base.ytd_prov_tax || 0) + (r.provTax || 0)).toFixed(2),
        ytd_base_earnings: +((base.ytd_base_earnings || 0) + (r.baseEarnings || 0)).toFixed(2),
        ytd_vac:      +((base.ytd_vac      || 0) + r.vacPay).toFixed(2),
        ytd_er_cpp:   +((base.ytd_er_cpp   || 0) + (r.cpp || 0)).toFixed(2),
        ytd_er_ei:    +((base.ytd_er_ei    || 0) + ((r.ei || 0) * 1.4)).toFixed(2),
        last_payroll: new Date().toISOString().split('T')[0]
      }).eq('id', r.id);
    }
  }
  setSaving(false);
}} disabled={processed || saving || !selectedPeriod} className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl text-sm font-medium transition-colors">
              {processed ? "Payroll Processed ✓" : saving ? "Saving..." : !selectedPeriod ? "Select Pay Period First" : "Process Payroll"}
            </button>
            {duplicateWarning && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <p className="font-semibold mb-1">⚠️ Duplicate Period Detected</p>
                <p className="mb-2">Payroll records already exist for this pay period. Would you like to update the existing paystubs instead of creating new ones?</p>
                <div className="flex gap-2">
                  <button onClick={() => { setDuplicateWarning(false); setOverwriteMode(true); }} className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700">Update Existing</button>
                  <button onClick={() => setDuplicateWarning(false)} className="px-3 py-1 border border-amber-300 rounded-lg text-xs text-amber-700 hover:bg-amber-100">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Paystub ─────────────────────────────────────────────────────────────────
function PaystubsPage({ company }) {
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const paystubRef = useRef(null);

  const downloadPDF = async () => {
    if (!selectedEmp || !selectedRun) return;
    try {
      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const W = 297; const H = 210;

      // ── Colors ──
      const DARK_GRAY = [64, 64, 64];
      const MID_GRAY  = [128, 128, 128];
      const LIGHT_GRAY= [192, 192, 192];
      const WHITE     = [255, 255, 255];
      const BLACK     = [0, 0, 0];
      const GREEN     = [0, 128, 0];
      const TEAL      = [0, 128, 128];
      const BLUE      = [0, 0, 255];

      // ── Data ──
      const empName   = (selectedEmp.name||'').toUpperCase();
      const sinMasked = '9' + '*'.repeat(7) + '2';
      const periodStart = (selectedRun.period||'').split('–')[0]?.replace(/.*: /,'').trim() || '';
      const periodEnd   = (selectedRun.period||'').split('–')[1]?.trim() || '';
      const payDay      = selectedRun.pay_date || '';

      const regHrs   = +(selectedEmp.reg_hrs||0);
      const rate     = +(selectedEmp.rate||0);
      const basePay  = +(selectedEmp.base_earnings||0);
      const ytdBase  = +(selectedEmp.ytd_base_earnings||0);
      const vacPay   = +(selectedEmp.vac_pay||0);
      const ytdVac   = +(selectedEmp.ytd_vac||0);
      const cpp      = +(selectedEmp.cpp||0);
      const ytdCpp   = +(selectedEmp.ytd_cpp||0);
      const ei       = +(selectedEmp.ei||0);
      const ytdEi    = +(selectedEmp.ytd_ei||0);
      const fedTax   = +(selectedEmp.fed_tax||0);
      const ytdFed   = +(selectedEmp.ytd_fed_tax||0);
      const erCpp    = +(selectedEmp.er_cpp||0);
      const ytdErCpp = +(selectedEmp.ytd_er_cpp||0);
      const erEi     = +(selectedEmp.er_ei||0);
      const ytdErEi  = +(selectedEmp.ytd_er_ei||0);
      const gross    = +(selectedEmp.gross||0);
      const ytdGross = +(selectedEmp.ytd_gross||0);
      const net      = +(selectedEmp.net||0);
      const ytdNet   = ytdGross - ytdCpp - ytdEi - ytdFed - (+(selectedEmp.ytd_prov_tax||0));
      const deductions    = cpp + ei + fedTax;
      const ytdDeductions = ytdCpp + ytdEi + ytdFed + (+(selectedEmp.ytd_prov_tax||0));

      // ── Helper: draw cell with background ──
      const cell = (x, y, w, h, bg, text, textColor, fontSize, bold, align='left') => {
        if (bg) { pdf.setFillColor(...bg); pdf.rect(x, y, w, h, 'F'); }
        pdf.setDrawColor(...LIGHT_GRAY);
        pdf.rect(x, y, w, h, 'S');
        if (text !== undefined && text !== null) {
          pdf.setFontSize(fontSize||8);
          pdf.setFont('helvetica', bold?'bold':'normal');
          pdf.setTextColor(...(textColor||BLACK));
          const textStr = String(text);
          if (align === 'right') {
            const tw = pdf.getStringUnitWidth(textStr) * (fontSize||8) / pdf.internal.scaleFactor;
            pdf.text(textStr, x + w - tw - 1, y + h/2 + (fontSize||8)*0.18);
          } else if (align === 'center') {
            const tw = pdf.getStringUnitWidth(textStr) * (fontSize||8) / pdf.internal.scaleFactor;
            pdf.text(textStr, x + (w - tw)/2, y + h/2 + (fontSize||8)*0.18);
          } else {
            pdf.text(textStr, x + 1.5, y + h/2 + (fontSize||8)*0.18);
          }
        }
      };

      const fmt = (v) => Number(v).toFixed(2);

      // ── ROW HEIGHTS & X POSITIONS ──
      const ROW_H = 7;
      const LEFT  = 5;

      // Column x positions (matching screenshot layout)
      const C = {
        A: LEFT,       // label (SALARY, SICK HRS etc)
        B: LEFT+22,    // HOURS
        C: LEFT+34,    // RATE
        D: LEFT+46,    // AMOUNT
        E: LEFT+60,    // Y.T.D
        F: LEFT+76,    // TYPE (deductions)
        G: LEFT+98,    // CURRENT (emp deductions)
        H: LEFT+116,   // Y.T.D (emp deductions)
        I: LEFT+132,   // TYPE (employer)
        J: LEFT+150,   // CURRENT (employer)
        K: LEFT+168,   // Y.T.D (employer)
      };
      const CW = { // column widths
        A:22, B:12, C:12, D:14, E:16,
        F:22, G:18, H:18,
        I:18, J:18, K:18,
      };

      // ── ROW 1: Employee name + header info ──
      let y = 5;
      // Name cell (spans A-E)
      cell(C.A, y, CW.A+CW.B+CW.C+CW.D+CW.E, ROW_H, null, empName, BLACK, 9, true);
      cell(C.F, y, CW.F, ROW_H, null, 'Employee #', BLACK, 7, false);
      cell(C.G, y, CW.G, ROW_H, null, '0001', BLACK, 7, false);
      cell(C.H, y, CW.H+CW.I, ROW_H, null, 'Period Start', BLACK, 7, false);
      cell(C.J, y, CW.J, ROW_H, null, periodStart, BLACK, 7, false);
      cell(C.K, y, CW.K, ROW_H, null, 'Pay Day', BLACK, 7, false);
      // pay day value — extend right
      cell(C.K+CW.K, y, 30, ROW_H, null, payDay, BLACK, 7, false);

      // ── ROW 2: SIN + Period End ──
      y += ROW_H;
      cell(C.A, y, CW.A, ROW_H, null, 'SIN', BLACK, 7, false);
      cell(C.B, y, CW.B+CW.C+CW.D+CW.E, ROW_H, null, sinMasked, BLACK, 7, false);
      cell(C.F, y, CW.F+CW.G+CW.H, ROW_H, null, '', null, 7, false);
      cell(C.I, y, CW.I, ROW_H, null, 'Period End', BLACK, 7, false);
      cell(C.J, y, CW.J, ROW_H, null, periodEnd, BLACK, 7, false);

      // ── ROW 3: Section headers ──
      y += ROW_H;
      cell(C.A, y, CW.A+CW.B+CW.C+CW.D+CW.E, ROW_H, LIGHT_GRAY, 'Statement of Earnings', BLACK, 8, true, 'center');
      cell(C.F, y, CW.F+CW.G+CW.H+CW.I+CW.J+CW.K+18, ROW_H, LIGHT_GRAY, 'Employee Deductions and Employer Contributions', BLACK, 8, true, 'center');

      // ── ROW 4: Column headers ──
      y += ROW_H;
      cell(C.A, y, CW.A, ROW_H, MID_GRAY, '', WHITE, 7, true);
      cell(C.B, y, CW.B, ROW_H, MID_GRAY, 'HOURS', WHITE, 7, true, 'center');
      cell(C.C, y, CW.C, ROW_H, MID_GRAY, 'RATE', WHITE, 7, true, 'center');
      cell(C.D, y, CW.D, ROW_H, MID_GRAY, 'AMOUNT', WHITE, 7, true, 'center');
      cell(C.E, y, CW.E, ROW_H, MID_GRAY, 'Y.T.D', WHITE, 7, true, 'center');
      cell(C.F, y, CW.F, ROW_H, MID_GRAY, 'TYPE', WHITE, 7, true, 'center');
      cell(C.G, y, CW.G, ROW_H, MID_GRAY, 'CURRENT', WHITE, 7, true, 'center');
      cell(C.H, y, CW.H, ROW_H, MID_GRAY, 'Y.T.D', WHITE, 7, true, 'center');
      cell(C.I, y, CW.I, ROW_H, MID_GRAY, 'TYPE', WHITE, 7, true, 'center');
      cell(C.J, y, CW.J, ROW_H, MID_GRAY, 'CURRENT', WHITE, 7, true, 'center');
      cell(C.K, y, CW.K+18, ROW_H, MID_GRAY, 'Y.T.D', WHITE, 7, true, 'center');

      // ── ROW 5: SALARY ──
      y += ROW_H;
      cell(C.A, y, CW.A, ROW_H, null, selectedEmp.emp_type==='Salary'?'SALARY':'REGULAR', BLACK, 7, false);
      cell(C.B, y, CW.B, ROW_H, null, fmt(regHrs), BLACK, 7, false, 'right');
      cell(C.C, y, CW.C, ROW_H, null, '$'+fmt(rate), BLACK, 7, false, 'right');
      cell(C.D, y, CW.D, ROW_H, null, fmt(basePay), BLACK, 7, false, 'right');
      cell(C.E, y, CW.E, ROW_H, null, fmt(ytdBase), BLACK, 7, false, 'right');
      cell(C.F, y, CW.F, ROW_H, null, 'FED.TAX', BLACK, 7, false);
      cell(C.G, y, CW.G, ROW_H, null, fmt(fedTax), BLACK, 7, false, 'right');
      cell(C.H, y, CW.H, ROW_H, null, fmt(ytdFed), BLACK, 7, false, 'right');
      cell(C.I, y, CW.I, ROW_H, null, '', null, 7, false);
      cell(C.J, y, CW.J, ROW_H, null, '0', BLACK, 7, false, 'right');
      cell(C.K, y, CW.K+18, ROW_H, null, '0', BLACK, 7, false, 'right');

      // ── ROW 6: SICK HRS ──
      y += ROW_H;
      cell(C.A, y, CW.A, ROW_H, null, 'SICK HRS', BLACK, 7, false);
      cell(C.B, y, CW.B, ROW_H, null, '', null, 7, false);
      cell(C.C, y, CW.C, ROW_H, null, '', null, 7, false);
      cell(C.D, y, CW.D, ROW_H, null, '0.00', BLACK, 7, false, 'right');
      cell(C.E, y, CW.E, ROW_H, null, '0.00', BLACK, 7, false, 'right');
      cell(C.F, y, CW.F, ROW_H, null, 'CPP', BLACK, 7, false);
      cell(C.G, y, CW.G, ROW_H, null, fmt(cpp), BLACK, 7, false, 'right');
      cell(C.H, y, CW.H, ROW_H, null, fmt(ytdCpp), BLACK, 7, false, 'right');
      cell(C.I, y, CW.I, ROW_H, null, 'CPP', BLACK, 7, false);
      cell(C.J, y, CW.J, ROW_H, null, fmt(erCpp), BLACK, 7, false, 'right');
      cell(C.K, y, CW.K+18, ROW_H, null, fmt(ytdErCpp), BLACK, 7, false, 'right');

      // ── ROW 7: STAT ──
      y += ROW_H;
      cell(C.A, y, CW.A, ROW_H, null, 'STAT', TEAL, 7, false);
      cell(C.B, y, CW.B, ROW_H, null, '', null, 7, false);
      cell(C.C, y, CW.C, ROW_H, null, '', null, 7, false);
      cell(C.D, y, CW.D, ROW_H, null, fmt(+(selectedEmp.stat_pay||0)), BLACK, 7, false, 'right');
      cell(C.E, y, CW.E, ROW_H, null, '0.00', BLACK, 7, false, 'right');
      cell(C.F, y, CW.F, ROW_H, null, 'EI', BLACK, 7, false);
      cell(C.G, y, CW.G, ROW_H, null, fmt(ei), BLACK, 7, false, 'right');
      cell(C.H, y, CW.H, ROW_H, null, fmt(ytdEi), BLACK, 7, false, 'right');
      cell(C.I, y, CW.I, ROW_H, null, 'EI', BLACK, 7, false);
      cell(C.J, y, CW.J, ROW_H, null, fmt(erEi), BLACK, 7, false, 'right');
      cell(C.K, y, CW.K+18, ROW_H, null, fmt(ytdErEi), BLACK, 7, false, 'right');

      // ── ROW 8: VAC.PAY ──
      y += ROW_H;
      cell(C.A, y, CW.A, ROW_H, null, 'VAC.PAY', BLACK, 7, false);
      cell(C.B, y, CW.B, ROW_H, null, '0.0', BLACK, 7, false, 'right');
      cell(C.C, y, CW.C, ROW_H, null, '4%', BLACK, 7, false, 'right');
      cell(C.D, y, CW.D, ROW_H, null, fmt(vacPay), BLACK, 7, false, 'right');
      cell(C.E, y, CW.E, ROW_H, null, fmt(ytdVac), BLACK, 7, false, 'right');
      cell(C.F, y, CW.F, ROW_H, null, '', null, 7, false);
      cell(C.G, y, CW.G, ROW_H, null, '', null, 7, false);
      cell(C.H, y, CW.H, ROW_H, null, '', null, 7, false);
      cell(C.I, y, CW.I, ROW_H, null, '', null, 7, false);
      cell(C.J, y, CW.J, ROW_H, null, '', null, 7, false);
      cell(C.K, y, CW.K+18, ROW_H, null, '', null, 7, false);

      // ── Empty rows (9-19 in screenshot) ──
      for (let i = 0; i < 8; i++) {
        y += ROW_H;
        cell(C.A, y, CW.A+CW.B+CW.C+CW.D+CW.E, ROW_H, null, '', null, 7, false);
        cell(C.F, y, CW.F+CW.G+CW.H+CW.I+CW.J+CW.K+18, ROW_H, null, '', null, 7, false);
      }

      // ── SUMMARY SECTION ──
      y += ROW_H * 2;

      // Summary header row
      const S = { A: LEFT, B: LEFT+22, C: LEFT+44, D: LEFT+66, E: LEFT+88 };
      const SW = { A:22, B:22, C:22, D:22, E:100 };

      cell(S.A, y, SW.A, ROW_H*2, DARK_GRAY, 'SUMMARY', WHITE, 8, true, 'center');
      cell(S.B, y, SW.B, ROW_H, DARK_GRAY, 'GROSS', WHITE, 7, true, 'center');
      cell(S.B, y+ROW_H, SW.B, ROW_H, DARK_GRAY, 'PAY', WHITE, 7, true, 'center');
      cell(S.C, y, SW.C, ROW_H*2, DARK_GRAY, 'DEDUCTIONS', WHITE, 7, true, 'center');
      cell(S.D, y, SW.D, ROW_H*2, [100,149,237], 'NET PAY', WHITE, 8, true, 'center');
      cell(S.E, y, SW.E, ROW_H*2, DARK_GRAY, 'NET PAY ALLOCATION', WHITE, 8, true, 'center');

      // CURRENT row
      y += ROW_H * 2;
      cell(S.A, y, SW.A, ROW_H*2, LIGHT_GRAY, 'CURRENT', BLACK, 8, true, 'center');
      cell(S.B, y, SW.B, ROW_H*2, null, fmt(gross), BLACK, 8, false, 'right');
      cell(S.C, y, SW.C, ROW_H*2, null, fmt(deductions), BLACK, 8, false, 'right');
      cell(S.D, y, SW.D, ROW_H*2, null, fmt(net), BLACK, 9, true, 'right');
      cell(S.E, y, SW.E, ROW_H*2, null, '', null, 8, false);

      // YEAR TO DATE row
      y += ROW_H * 2;
      cell(S.A, y, SW.A, ROW_H*2, LIGHT_GRAY, 'YEAR TO DATE', BLACK, 7, true, 'center');
      cell(S.B, y, SW.B, ROW_H*2, null, fmt(ytdGross), BLACK, 8, false, 'right');
      cell(S.C, y, SW.C, ROW_H*2, null, fmt(ytdDeductions), BLACK, 8, false, 'right');
      cell(S.D, y, SW.D, ROW_H*2, null, fmt(ytdNet), BLACK, 9, true, 'right');

      // Net pay allocation detail
      pdf.setFontSize(8); pdf.setFont('helvetica','normal'); pdf.setTextColor(...BLACK);
      pdf.text('$', S.E + 2, y + ROW_H);
      pdf.setFontSize(10); pdf.setFont('helvetica','bold');
      pdf.text(fmt(net), S.E + 8, y + ROW_H);
      pdf.setFontSize(7); pdf.setFont('helvetica','normal');
      pdf.text('Manual Check was issued - Check Number XXXX', S.E + 30, y + ROW_H);

      // ── FOOTER ──
      y += ROW_H * 3;
      pdf.setFillColor(...LIGHT_GRAY);
      pdf.rect(LEFT, y, 262, ROW_H, 'F');
      pdf.setDrawColor(...LIGHT_GRAY);
      pdf.rect(LEFT, y, 262, ROW_H, 'S');
      pdf.setFontSize(7); pdf.setFont('helvetica','normal'); pdf.setTextColor(...BLACK);
      pdf.text('Employer: ' + (company.bn||'') + ' ' + (company.name||'') + ' - ' + (company.address||''), LEFT + 2, y + ROW_H*0.65);

      pdf.save('paystub-'+(selectedEmp.name||'emp').replace(/ /g,'-')+'-'+(selectedRun.pay_date||'')+'.pdf');
    } catch(err) { console.error('PDF error:',err); alert('PDF failed: '+err.message); }
  };
      pdf.setTextColor(255,255,255); pdf.setFontSize(11); pdf.setFont('helvetica','bold');
      pdf.text((selectedEmp.name||'').toUpperCase(), 8, 8);
      pdf.setFontSize(7); pdf.setFont('helvetica','normal');
      pdf.text('Employee # 0001', 8, 14);
      pdf.text('SIN: ' + (selectedEmp.sin||'***-***-000'), 60, 14);
      pdf.text('Department # 02', 110, 8);
      pdf.text('Employer # 0001', 110, 14);
      pdf.text('Period Start: ' + (selectedRun.period?.split('–')[0]?.replace(/.*: /,'').trim()||''), 160, 8);
      pdf.text('Period End: ' + (selectedRun.period?.split('–')[1]?.trim()||''), 160, 14);
      pdf.text('Pay Day: ' + (selectedRun.pay_date||''), 240, 8);
      // Subheader
      pdf.setFillColor(243,244,246); pdf.rect(0,18,W,8,'F');
      pdf.setTextColor(55,65,81); pdf.setFontSize(7); pdf.setFont('helvetica','bold');
      pdf.text('Statement of Earnings', 8, 24);
      pdf.text('Employee Deductions and Employer Contributions', 148, 24);
      // Column headers
      pdf.setFillColor(55,65,81); pdf.rect(0,26,145,7,'F'); pdf.rect(146,26,W-146,7,'F');
      pdf.setTextColor(255,255,255); pdf.setFont('helvetica','bold'); pdf.setFontSize(6.5);
      pdf.text('HOURS',10,31); pdf.text('RATE',32,31); pdf.text('AMOUNT',55,31); pdf.text('Y.T.D',85,31);
      pdf.text('TYPE',150,31); pdf.text('CURRENT',170,31); pdf.text('Y.T.D',197,31);
      pdf.text('TYPE',222,31); pdf.text('CURRENT',242,31); pdf.text('Y.T.D',270,31);
      // Data
      const hrs=+(selectedEmp.reg_hrs||0), rate=+(selectedEmp.rate||0);
      const base=+(selectedEmp.base_earnings||0), ytdBase=+(selectedEmp.ytd_base_earnings||0);
      const vacPay=+(selectedEmp.vac_pay||0), ytdVac=+(selectedEmp.ytd_vac||0);
      const cpp=+(selectedEmp.cpp||0), ytdCpp=+(selectedEmp.ytd_cpp||0);
      const ei=+(selectedEmp.ei||0), ytdEi=+(selectedEmp.ytd_ei||0);
      const fedTax=+(selectedEmp.fed_tax||0), ytdFed=+(selectedEmp.ytd_fed_tax||0);
      const provTax=+(selectedEmp.prov_tax||0), ytdProv=+(selectedEmp.ytd_prov_tax||0);
      const erCpp=+(selectedEmp.er_cpp||0), ytdErCpp=+(selectedEmp.ytd_er_cpp||0);
      const erEi=+(selectedEmp.er_ei||0), ytdErEi=+(selectedEmp.ytd_er_ei||0);
      const gross=+(selectedEmp.gross||0), ytdGross=+(selectedEmp.ytd_gross||0);
      const net=+(selectedEmp.net||0);
      const earningsRows=[
        {label:selectedEmp.emp_type==='Salary'?'SALARY':'REGULAR',hrs:hrs.toFixed(2),rate:'$'+rate.toFixed(2),amt:base.toFixed(2),ytd:ytdBase.toFixed(2)},
        {label:'SICK HRS',hrs:'0.00',rate:'',amt:'0.00',ytd:'0.00'},
        {label:'STAT',hrs:String(+(selectedEmp.stat_hrs||0)),rate:'',amt:(+(selectedEmp.stat_pay||0)).toFixed(2),ytd:'0.00'},
        {label:'VAC.PAY',hrs:'0.0',rate:'4%',amt:vacPay.toFixed(2),ytd:ytdVac.toFixed(2)},
      ];
      const dedRows=[{l:'FED.TAX',c:fedTax.toFixed(2),y:ytdFed.toFixed(2)},{l:'CPP',c:cpp.toFixed(2),y:ytdCpp.toFixed(2)},{l:'EI',c:ei.toFixed(2),y:ytdEi.toFixed(2)}];
      const erRows=[{l:'CPP',c:erCpp.toFixed(2),y:ytdErCpp.toFixed(2)},{l:'EI',c:erEi.toFixed(2),y:ytdErEi.toFixed(2)}];
      let ry=40;
      pdf.setTextColor(31,41,55); pdf.setFontSize(7);
      earningsRows.forEach((r,i)=>{
        if(i%2===0){pdf.setFillColor(249,250,251);pdf.rect(0,ry-4,145,7,'F');}
        pdf.setFont('helvetica','bold'); pdf.text(r.label,8,ry);
        pdf.setFont('helvetica','normal'); pdf.text(r.hrs,22,ry); pdf.text(r.rate,38,ry);
        rText(r.amt,80,ry); rText(r.ytd,110,ry);
        if(dedRows[i]){if(i%2===0){pdf.setFillColor(249,250,251);pdf.rect(146,ry-4,76,7,'F');} pdf.setFont('helvetica','bold');pdf.text(dedRows[i].l,150,ry);pdf.setFont('helvetica','normal');rText(dedRows[i].c,193,ry);rText(dedRows[i].y,218,ry);}
        if(erRows[i]){if(i%2===0){pdf.setFillColor(249,250,251);pdf.rect(223,ry-4,W-223,7,'F');}pdf.setFont('helvetica','bold');pdf.text(erRows[i].l,226,ry);pdf.setFont('helvetica','normal');rText(erRows[i].c,260,ry);rText(erRows[i].y,290,ry);}
        ry+=8;
      });
      // Summary
      ry+=4;
      pdf.setFillColor(55,65,81);pdf.rect(0,ry-5,W,8,'F');
      pdf.setTextColor(255,255,255);pdf.setFont('helvetica','bold');pdf.setFontSize(7);
      pdf.text('SUMMARY',8,ry);pdf.text('GROSS PAY',45,ry);pdf.text('DEDUCTIONS',85,ry);pdf.text('NET PAY',128,ry);pdf.text('NET PAY ALLOCATION',165,ry);
      pdf.setTextColor(31,41,55);ry+=8;
      const ded=cpp+ei+fedTax+provTax;
      const ytdDed=ytdCpp+ytdEi+ytdFed+ytdProv;
      const ytdNet=ytdGross-ytdCpp-ytdEi-ytdFed-ytdProv;
      pdf.setFillColor(249,250,251);pdf.rect(0,ry-4,160,7,'F');
      pdf.setFont('helvetica','bold');pdf.text('CURRENT',8,ry);pdf.setFont('helvetica','normal');
      rText(gross.toFixed(2),70,ry);rText(ded.toFixed(2),112,ry);rText(net.toFixed(2),148,ry);
      pdf.text('$ '+net.toFixed(2),165,ry);
      pdf.setTextColor(107,114,128);pdf.setFontSize(6.5);pdf.text('Direct Deposit',210,ry);
      pdf.setTextColor(31,41,55);ry+=8;
      pdf.setFont('helvetica','bold');pdf.text('YEAR TO DATE',8,ry);pdf.setFont('helvetica','normal');
      rText(ytdGross.toFixed(2),70,ry);rText(ytdDed.toFixed(2),112,ry);rText(ytdNet.toFixed(2),148,ry);ry+=10;
      // Footer
      pdf.setFillColor(243,244,246);pdf.rect(0,H-12,W,12,'F');
      pdf.setFontSize(6.5);pdf.setTextColor(107,114,128);
      pdf.text('Employer: '+(company.bn||'')+' '+(company.name||''), 8, H-6);
      pdf.text('Pronancial Payroll System', W-45, H-6);
      pdf.save('paystub-'+(selectedEmp.name||'emp').replace(/ /g,'-')+'-'+(selectedRun.pay_date||'')+'.pdf');
    } catch(err) { console.error('PDF error:',err); alert('PDF failed: '+err.message); }
  };

  useEffect(() => {
    supabase
      .from('payroll_runs')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setRuns(data);
          setSelectedRun(data[0]);
          if (data[0].details?.length > 0) {
            setSelectedEmp(data[0].details[0]);
          }
        }
      });
  }, [company.id]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-gray-900">Paystubs</h1><p className="text-sm text-gray-400 mt-0.5">{company.name}</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Select Employee</h3>
          <div className="space-y-1 mb-3">
            {runs.map(r => (
              <div key={r.id} className={`flex items-center gap-1 rounded-xl transition-colors ${selectedRun?.id===r.id ? "bg-blue-600" : "hover:bg-gray-50"}`}>
                <button onClick={() => { setSelectedRun(r); setSelectedEmp(r.details?.[0]||null); }} className="flex-1 text-left px-3 py-2 text-xs">
                  <p className={`font-medium ${selectedRun?.id===r.id?"text-white":"text-gray-700"}`}>{r.period}</p>
                  <p className={`text-xs ${selectedRun?.id===r.id?"text-blue-200":"text-gray-400"}`}>{r.pay_date}</p>
                </button>
                <button onClick={async () => {
                  if (!window.confirm(`Delete payroll run for ${r.period}? This will reverse YTD values for all employees in this run.`)) return;
                  // Reverse YTD for each employee in this run
                  for (const detail of (r.details || [])) {
                    const { data: freshEmp } = await supabase
                      .from('employees')
                      .select('ytd_gross,ytd_cpp,ytd_ei,ytd_fed_tax,ytd_prov_tax,ytd_vac,ytd_er_cpp,ytd_er_ei,ytd_base_earnings')
                      .eq('id', detail.employee_id)
                      .single();
                    if (freshEmp) {
                      await supabase.from('employees').update({
                        ytd_gross:         +Math.max((freshEmp.ytd_gross||0)-(detail.gross||0),0).toFixed(2),
                        ytd_cpp:           +Math.max((freshEmp.ytd_cpp||0)-(detail.cpp||0),0).toFixed(2),
                        ytd_ei:            +Math.max((freshEmp.ytd_ei||0)-(detail.ei||0),0).toFixed(2),
                        ytd_fed_tax:       +Math.max((freshEmp.ytd_fed_tax||0)-(detail.fed_tax||0),0).toFixed(2),
                        ytd_prov_tax:      +Math.max((freshEmp.ytd_prov_tax||0)-(detail.prov_tax||0),0).toFixed(2),
                        ytd_vac:           +Math.max((freshEmp.ytd_vac||0)-(detail.vac_pay||0),0).toFixed(2),
                        ytd_er_cpp:        +Math.max((freshEmp.ytd_er_cpp||0)-(detail.er_cpp||0),0).toFixed(2),
                        ytd_er_ei:         +Math.max((freshEmp.ytd_er_ei||0)-(detail.er_ei||0),0).toFixed(2),
                        ytd_base_earnings: +Math.max((freshEmp.ytd_base_earnings||0)-(detail.base_earnings||0),0).toFixed(2),
                      }).eq('id', detail.employee_id);
                    }
                  }
                  await supabase.from('payroll_runs').delete().eq('id', r.id);
                  setRuns(prev => prev.filter(x => x.id !== r.id));
                  if (selectedRun?.id === r.id) { setSelectedRun(null); setSelectedEmp(null); }
                }} className={`p-1.5 mr-1 rounded-lg transition-colors flex-shrink-0 ${selectedRun?.id===r.id?"text-blue-200 hover:text-white hover:bg-blue-700":"text-gray-300 hover:text-red-500 hover:bg-red-50"}`} title="Delete this run">
                  <Trash2 size={12}/>
                </button>
              </div>
            ))}
          </div>
          {selectedRun?.details?.length > 0 && <>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Employees</h3>
            <div className="space-y-1">
              {selectedRun.details.map((e,i) => (
                <button key={i} onClick={() => setSelectedEmp(e)} className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${selectedEmp?.employee_id===e.employee_id ? "bg-blue-600 text-white" : "hover:bg-gray-50 text-gray-700"}`}>
                  <p className="font-medium">{e.name}</p>
                </button>
              ))}
            </div>
          </>}
        </Card>
        {selectedEmp && selectedRun ? (
          <Card className="lg:col-span-3 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{company.name}</h2>
                <p className="text-xs text-gray-400">BN: {company.bn} · {company.province}</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 transition-colors"><Printer size={13}/> Print</button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 transition-colors"><Send size={13}/> Email</button>
                <button onClick={downloadPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition-colors"><Download size={13}/> PDF</button>
              </div>
            </div>
              <div ref={paystubRef} className="border border-gray-200 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Statement of Earnings</p>
                  <p className="text-xs text-gray-400">Pay Period: {selectedRun?.period}</p>
                </div>
                <div className="p-5 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Employee</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedEmp.name}</p>
                    <p className="text-xs text-gray-500">Employee</p>
                    <p className="text-xs text-gray-500">{selectedEmp.province || company.province}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Pay Details</p>
                  <p className="text-xs text-gray-600">Payment: {selectedRun.pay_date}</p>
                  <p className="text-xs text-gray-600">Frequency: {selectedEmp?.payroll_schedule || company?.payroll_schedule || "Biweekly"}</p>
                  <p className="text-xs text-gray-600">Pay Period: {selectedRun.period}</p>
                  <p className="text-xs text-gray-600">Direct Deposit</p>
                </div>
              </div>
              <div className="border-t border-gray-100">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="text-left px-5 py-2">Description</th>
                    <th className="text-right px-5 py-2">Current ($)</th>
                    <th className="text-right px-5 py-2">YTD ($)</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    <tr className="bg-green-50"><td className="px-5 py-1.5 text-xs font-semibold text-green-700" colSpan={3}>Earnings</td></tr>
                    {selectedEmp.emp_type === "Hourly" && <tr><td className="px-5 py-2.5 text-gray-600 pl-8">Hours Worked</td><td className="px-5 py-2.5 text-right text-gray-700">{+selectedEmp.reg_hrs||0} hrs @ ${+selectedEmp.rate||0}/hr</td><td className="px-5 py-2.5 text-right text-gray-500">—</td></tr>}
                    <tr><td className="px-5 py-2.5 text-gray-600 pl-8">Base Earnings</td><td className="px-5 py-2.5 text-right text-gray-700">{(+selectedEmp.base_earnings||0).toFixed(2)}</td><td className="px-5 py-2.5 text-right text-gray-500">{(+selectedEmp.ytd_base_earnings||0).toFixed(2)}</td></tr>
                    <tr><td className="px-5 py-2.5 text-gray-600 pl-8">Vacation Pay</td><td className="px-5 py-2.5 text-right text-purple-600">{(+selectedEmp.vac_pay||0).toFixed(2)}</td><td className="px-5 py-2.5 text-right text-gray-500">{(+selectedEmp.ytd_vac||0).toFixed(2)}</td></tr>
                    <tr className="bg-gray-50"><td className="px-5 py-2.5 font-semibold text-gray-800">Gross Earnings</td><td className="px-5 py-2.5 text-right font-semibold text-gray-900">{(+selectedEmp.gross||0).toFixed(2)}</td><td className="px-5 py-2.5 text-right font-semibold text-gray-700">{(+selectedEmp.ytd_gross||0).toFixed(2)}</td></tr>
                    <tr className="bg-red-50"><td className="px-5 py-1.5 text-xs font-semibold text-red-700" colSpan={3}>Employee Deductions</td></tr>
                    <tr><td className="px-5 py-2.5 text-gray-600 pl-8">CPP Contributions</td><td className="px-5 py-2.5 text-right text-red-500">({(+selectedEmp.cpp||0).toFixed(2)})</td><td className="px-5 py-2.5 text-right text-gray-500">({(+selectedEmp.ytd_cpp||0).toFixed(2)})</td></tr>
                    <tr><td className="px-5 py-2.5 text-gray-600 pl-8">EI Premiums</td><td className="px-5 py-2.5 text-right text-red-500">({(+selectedEmp.ei||0).toFixed(2)})</td><td className="px-5 py-2.5 text-right text-gray-500">({(+selectedEmp.ytd_ei||0).toFixed(2)})</td></tr>
                    <tr><td className="px-5 py-2.5 text-gray-600 pl-8">Income Tax (Federal + Provincial)</td><td className="px-5 py-2.5 text-right text-red-500">({((+selectedEmp.fed_tax||0)+(+selectedEmp.prov_tax||0)).toFixed(2)})</td><td className="px-5 py-2.5 text-right text-gray-500">({((+selectedEmp.ytd_fed_tax||0)+(+selectedEmp.ytd_prov_tax||0)).toFixed(2)})</td></tr>
                    <tr className="bg-blue-50"><td className="px-5 py-3 font-bold text-gray-900">Net Pay</td><td className="px-5 py-3 text-right font-bold text-emerald-700 text-base">${(+selectedEmp.net||0).toFixed(2)}</td><td className="px-5 py-3 text-right font-semibold text-gray-700">${((+selectedEmp.ytd_gross||0)-(+selectedEmp.ytd_cpp||0)-(+selectedEmp.ytd_ei||0)-(+selectedEmp.ytd_fed_tax||0)-(+selectedEmp.ytd_prov_tax||0)).toFixed(2)}</td></tr>
                    <tr className="bg-amber-50"><td className="px-5 py-1.5 text-xs font-semibold text-amber-700" colSpan={3}>Employer Contributions</td></tr>
                    <tr><td className="px-5 py-2.5 text-gray-600 pl-8">Employer CPP (matched)</td><td className="px-5 py-2.5 text-right text-amber-600">{(+selectedEmp.er_cpp||0).toFixed(2)}</td><td className="px-5 py-2.5 text-right text-gray-500">{(+selectedEmp.ytd_er_cpp||0).toFixed(2)}</td></tr>
                    <tr><td className="px-5 py-2.5 text-gray-600 pl-8">Employer EI (×1.4)</td><td className="px-5 py-2.5 text-right text-amber-600">{(+selectedEmp.er_ei||0).toFixed(2)}</td><td className="px-5 py-2.5 text-right text-gray-500">{(+selectedEmp.ytd_er_ei||0).toFixed(2)}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between">
                <p className="text-xs text-gray-400">Vacation Pay paid each period per CRA guidelines</p>
                <p className="text-xs text-gray-400">This is a computer-generated statement</p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="lg:col-span-3 flex items-center justify-center py-20">
            <div className="text-center"><FileText size={40} className="text-gray-200 mx-auto mb-3"/><p className="text-sm text-gray-400">Select an employee to view their paystub</p></div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── History ─────────────────────────────────────────────────────────────────
function HistoryPage({ company }) {
  const [history, setHistory] = useState([]);
  const [deleteRun, setDeleteRun] = useState(null);
  const [deleteSelected, setDeleteSelected] = useState({});
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('payroll_runs')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });
      if (data) setHistory(data);
    };
    fetchHistory();
  }, [company.id]);

  const openDeleteModal = (run) => {
    setDeleteRun(run);
    const init = {};
    (run.details || []).forEach(d => { init[d.employee_id] = true; });
    setDeleteSelected(init);
  };

  const confirmDelete = async () => {
    if (!deleteRun) return;
    setDeleting(true);
    const toDelete = (deleteRun.details || []).filter(d => deleteSelected[d.employee_id]);
    const toKeep   = (deleteRun.details || []).filter(d => !deleteSelected[d.employee_id]);

    // Reverse YTD for deleted employees
    for (const detail of toDelete) {
      const { data: freshEmp } = await supabase
        .from('employees')
        .select('ytd_gross,ytd_cpp,ytd_ei,ytd_fed_tax,ytd_prov_tax,ytd_vac,ytd_er_cpp,ytd_er_ei,ytd_base_earnings')
        .eq('id', detail.employee_id).single();
      if (freshEmp) {
        await supabase.from('employees').update({
          ytd_gross:         +Math.max((freshEmp.ytd_gross||0)-(detail.gross||0),0).toFixed(2),
          ytd_cpp:           +Math.max((freshEmp.ytd_cpp||0)-(detail.cpp||0),0).toFixed(2),
          ytd_ei:            +Math.max((freshEmp.ytd_ei||0)-(detail.ei||0),0).toFixed(2),
          ytd_fed_tax:       +Math.max((freshEmp.ytd_fed_tax||0)-(detail.fed_tax||0),0).toFixed(2),
          ytd_prov_tax:      +Math.max((freshEmp.ytd_prov_tax||0)-(detail.prov_tax||0),0).toFixed(2),
          ytd_vac:           +Math.max((freshEmp.ytd_vac||0)-(detail.vac_pay||0),0).toFixed(2),
          ytd_er_cpp:        +Math.max((freshEmp.ytd_er_cpp||0)-(detail.er_cpp||0),0).toFixed(2),
          ytd_er_ei:         +Math.max((freshEmp.ytd_er_ei||0)-(detail.er_ei||0),0).toFixed(2),
          ytd_base_earnings: +Math.max((freshEmp.ytd_base_earnings||0)-(detail.base_earnings||0),0).toFixed(2),
        }).eq('id', detail.employee_id);
      }
    }

    if (toKeep.length === 0) {
      // Delete entire run
      await supabase.from('payroll_runs').delete().eq('id', deleteRun.id);
      setHistory(prev => prev.filter(r => r.id !== deleteRun.id));
    } else {
      // Update run keeping only remaining employees
      const newGross = toKeep.reduce((a,d) => a + (+d.gross||0), 0);
      const newNet   = toKeep.reduce((a,d) => a + (+d.net||0), 0);
      const newDed   = toKeep.reduce((a,d) => a + (+d.cpp||0) + (+d.ei||0) + (+d.tax||0), 0);
      const { data: updated } = await supabase.from('payroll_runs').update({
        details: toKeep,
        employees: toKeep.length,
        gross: +newGross.toFixed(2),
        net: +newNet.toFixed(2),
        deductions: +newDed.toFixed(2),
      }).eq('id', deleteRun.id).select().single();
      if (updated) setHistory(prev => prev.map(r => r.id === updated.id ? updated : r));
    }
    setDeleting(false);
    setDeleteRun(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-gray-900">Payroll History</h1><p className="text-sm text-gray-400 mt-0.5">{company.name}</p></div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"><Download size={15}/> Export CSV</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Payroll YTD" value="$218,400" color="blue"/>
        <StatCard icon={PlayCircle} label="Payroll Runs" value="11" color="green"/>
        <StatCard icon={Users} label="Avg Employees" value="4" color="blue"/>
        <StatCard icon={CheckCircle2} label="On-time Rate" value="100%" color="green"/>
      </div>
      <Card>
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" placeholder="Search..." />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"><Filter size={13}/> Filter</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-50">
              {["Pay Date","Period","Employees","Gross Payroll","Deductions","Net Payroll","Status","Actions"].map(h=>(
                <th key={h} className="text-left px-5 py-3">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {history.map(p=>(
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-gray-900">{p.pay_date}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{p.period}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{p.employees}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900">${Number(p.gross).toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm text-red-500">${Number(p.deductions).toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-emerald-700">${Number(p.net).toLocaleString()}</td>
                  <td className="px-5 py-4"><Badge color="green">Completed</Badge></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 text-xs text-blue-600 hover:underline"><Eye size={13}/> View</button>
                      <button onClick={() => openDeleteModal(p)} className="flex items-center gap-1 text-xs text-red-500 hover:underline"><Trash2 size={13}/> Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    {deleteRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(0,0,0,0.4)"}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Delete Payroll Entries</h2>
              <button onClick={() => setDeleteRun(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"><X size={16}/></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-1">Period: <span className="font-medium">{deleteRun.period}</span></p>
              <p className="text-xs text-gray-400 mb-4">Select employees whose payroll entries you want to delete. YTD will be reversed for selected employees.</p>
              <div className="space-y-2 mb-5">
                {(deleteRun.details || []).map((d, i) => (
                  <label key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={deleteSelected[d.employee_id] === true} onChange={e => setDeleteSelected(p => ({...p, [d.employee_id]: e.target.checked}))} className="w-4 h-4 accent-red-500"/>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{d.name}</p>
                      <p className="text-xs text-gray-400">Gross: ${(+d.gross||0).toFixed(2)} · Net: ${(+d.net||0).toFixed(2)}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteRun(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                <button onClick={confirmDelete} disabled={deleting || !Object.values(deleteSelected).some(Boolean)} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl font-medium">
                  {deleting ? "Deleting..." : "Delete Selected"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reports ─────────────────────────────────────────────────────────────────
function ReportsPage({ company }) {
  const monthlyData = [
    {m:"Jan",gross:32400,net:23800},{m:"Feb",gross:33100,net:24300},{m:"Mar",gross:34200,net:25100},
    {m:"Apr",gross:32600,net:23900},{m:"May",gross:36400,net:26700},{m:"Jun",gross:35800,net:26200},
  ];
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-gray-900">Reports</h1><p className="text-sm text-gray-400 mt-0.5">{company.name} · Fiscal 2025</p></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Payroll Summary", desc: "Complete payroll run summary", icon: FileText },
          { title: "CRA Deduction Report", desc: "CPP, EI & tax remittances", icon: Shield },
          { title: "Employee YTD Report", desc: "Year-to-date per employee", icon: Users },
          { title: "Payroll Expense Report", desc: "Accounting expense breakdown", icon: DollarSign },
          { title: "Vacation Liability", desc: "Accrued vacation balances", icon: Calendar },
          { title: "T4 Summary", desc: "Annual T4 slip preparation", icon: FileText },
        ].map(r=>(
          <Card key={r.title} className="p-5 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <r.icon size={18}/>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{r.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
              </div>
            </div>
            <button className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"><Download size={12}/> Download PDF</button>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Monthly Payroll Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="m" tick={{fontSize:11,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:"#94a3b8"}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1000}k`}/>
              <Tooltip formatter={v=>[`$${v.toLocaleString()}`]} contentStyle={{borderRadius:10,border:"none",fontSize:12,boxShadow:"0 4px 20px rgba(0,0,0,.08)"}}/>
              <Bar dataKey="gross" name="Gross" fill="#dbeafe" radius={[4,4,0,0]}/>
              <Bar dataKey="net" name="Net" fill="#2563eb" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded bg-blue-200"></span>Gross</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded bg-blue-600"></span>Net</span>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Deduction Breakdown</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={DEDUCTION_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {DEDUCTION_DATA.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Pie>
              <Tooltip formatter={v=>[`${v}%`]} contentStyle={{borderRadius:10,border:"none",fontSize:12}}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {DEDUCTION_DATA.map(d=>(
              <div key={d.name} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{background:d.color}}></span>
                {d.name}: <span className="font-medium">{d.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Settings ────────────────────────────────────────────────────────────────
function SettingsPage({ company, setSelectedCompany }) {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: company.name || "",
    bn: company.bn || "",
    province: company.province || "ON",
    phone: company.phone || "",
    email: company.email || "",
    payroll_freq: company.payroll_freq || "Semi-monthly",
    vac_rate: company.vac_rate || "4%",
  });

  const saveSettings = async () => {
    const { error } = await supabase
      .from('companies')
      .update({
        name: form.name,
        bn: form.bn,
        province: form.province,
        phone: form.phone,
        email: form.email,
        payroll_freq: form.payroll_freq,
        vac_rate: form.vac_rate,
      })
      .eq('id', company.id);
    if (!error) {
      const updatedCompany = { ...company, ...form };
      setSelectedCompany(updatedCompany);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-gray-900">Company Settings</h1><p className="text-sm text-gray-400 mt-0.5">{company.name}</p></div>
        {saved && <Badge color="green">Changes saved</Badge>}
      </div>
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Legal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Legal Company Name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} />
          <Input label="CRA Business Number" value={form.bn} onChange={e=>setForm(p=>({...p,bn:e.target.value}))} />
          <Input label="Payroll Account Number" defaultValue={company.bn} />
          <Select label="Province" defaultValue={company.province}>
            {["ON","BC","AB","QC","MB","SK","NS","NB","NL","PE"].map(p=><option key={p}>{p}</option>)}
          </Select>
          <Input label="Company Phone" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} />
          <Input label="Payroll Contact Email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} />
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Payroll Defaults</h3>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Payroll Frequency"><option>Semi-monthly</option><option>Bi-weekly</option><option>Monthly</option></Select>
          <Select label="Remittance Frequency"><option>Regular (Monthly)</option><option>Quarterly</option><option>Accelerated</option></Select>
          <Input label="Default Vacation Pay %" defaultValue="4" />
          <Input label="Standard Work Hours / Period" defaultValue="80" />
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Notifications & Reminders</h3>
        <div className="space-y-3">
          {[
            "Email reminder 3 days before payroll due",
            "CRA remittance due date alerts",
            "New employee onboarding notifications",
            "Direct deposit confirmation emails",
            "Year-end T4 preparation reminders",
          ].map(n=>(
            <label key={n} className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-700">{n}</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
            </label>
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Audit Log</h3>
        <div className="space-y-2">
          {[
            {action:"Payroll processed",user:"admin@firm.ca",time:"2025-05-31 14:22"},
            {action:"Employee added: Tom Nguyen",user:"admin@firm.ca",time:"2025-05-15 09:11"},
            {action:"Company settings updated",user:"admin@firm.ca",time:"2025-04-01 10:45"},
          ].map((l,i)=>(
            <div key={i} className="flex items-center justify-between py-2 text-xs border-b border-gray-50">
              <span className="text-gray-700">{l.action}</span>
              <span className="text-gray-400">{l.user} · {l.time}</span>
            </div>
          ))}
        </div>
      </Card>
      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Discard Changes</button>
        <button onClick={saveSettings} className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">Save Settings</button>
      </div>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) setLoggedIn(true);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setLoggedIn(!!session);
  });

  return () => subscription.unsubscribe();
}, []);
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('pron_theme') || 'light');
  const isDark = theme === 'dark';
  const switchTheme = (t) => { setTheme(t); localStorage.setItem('pron_theme', t); };
  const [companies, setCompanies] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) {
      setCompanies(data);
      setSelectedCompany(data[0]);
    }
    setLoading(false);
  };
  fetchCompanies();
}, []);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyDropdown, setCompanyDropdown] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  if (!loggedIn) return <LoginPage onLogin={() => setLoggedIn(true)} />;
  if (!selectedCompany) return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
          <div className="w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center"><DollarSign size={14} className="text-white" /></div>
          <span className="font-semibold text-sm text-gray-900">Pronancial</span>
        </div>
        <div className="flex-1 p-3">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm bg-blue-600 text-white"><Building2 size={16} />Companies</button>
        </div>
        <div className="p-3 border-t border-gray-100">
          <button onClick={async () => { await supabase.auth.signOut(); setLoggedIn(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-red-500 hover:bg-red-50"><LogOut size={15} />Sign out</button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <CompaniesPage companies={companies} setCompanies={setCompanies} setSelectedCompany={setSelectedCompany} setPage={setPage} />
      </main>
    </div>
  );

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "companies", label: "Companies", icon: Building2 },
    { id: "employees", label: "Employees", icon: Users },
    { id: "run", label: "Run Payroll", icon: PlayCircle },
    { id: "history", label: "Payroll History", icon: History },
    { id: "stubs", label: "Paystubs", icon: FileText },
    { id: "reports", label: "Reports", icon: BarChart2 },
    { id: "settings", label: "Company Settings", icon: Settings },
  ];

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard company={selectedCompany} companies={companies} setPage={setPage} setSelectedCompany={setSelectedCompany} theme={theme} switchTheme={switchTheme} />;
      case "companies": return <CompaniesPage companies={companies} setCompanies={setCompanies} setSelectedCompany={setSelectedCompany} setPage={setPage} />;
      case "employees": return <EmployeesPage company={selectedCompany} />;
      case "run": return <RunPayrollPage company={selectedCompany} setPage={setPage} />;
      case "history": return <HistoryPage company={selectedCompany} />;
      case "stubs": return <PaystubsPage company={selectedCompany} />;
      case "reports": return <ReportsPage company={selectedCompany} />;
      case "settings": return <SettingsPage company={selectedCompany} setSelectedCompany={setSelectedCompany} />;
      default: return null;
    }
  };

  return (
    <div style={{background:isDark?'#0c1117':'#f0f4f8',fontFamily:'Inter,system-ui,sans-serif'}} className="flex h-screen overflow-hidden transition-all duration-200">
      {/* Sidebar */}
      <aside style={{width:sidebarOpen?'224px':'64px',background:isDark?'#141b24':'#ffffff',borderRight:`1px solid ${isDark?'#1e2d40':'#f1f5f9'}`}} className="flex-shrink-0 flex flex-col transition-all duration-200 h-full">
        <div style={{borderBottom:`1px solid ${isDark?'#1e2d40':'#f1f5f9'}`}} className="flex items-center gap-3 px-4 py-4 h-14">
          <div className="w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <DollarSign size={14} className="text-white" />
          </div>
          {sidebarOpen && <span style={{color:isDark?'#e8f0fe':'#0f172a'}} className="font-semibold text-sm leading-tight whitespace-nowrap">Pronancial<br/><span style={{color:isDark?'#6b7fa3':'#94a3b8'}} className="text-xs font-normal">Payroll</span></span>}
        </div>
        <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} title={!sidebarOpen ? item.label : ""}
              style={{color: page===item.id?'#ffffff':isDark?'#6b7fa3':'#64748b', background: page===item.id?'#2563eb':'transparent'}}
              onMouseEnter={e=>{if(page!==item.id)e.currentTarget.style.background=isDark?'#1a2332':'#f8fafc'}}
              onMouseLeave={e=>{if(page!==item.id)e.currentTarget.style.background='transparent'}}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all">
              <item.icon size={16} className="flex-shrink-0" />
              {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div style={{borderTop:`1px solid ${isDark?'#1e2d40':'#f1f5f9'}`}} className="p-3">
          <button onClick={async () => { await supabase.auth.signOut(); setLoggedIn(false); }} style={{color:isDark?'#6b7fa3':'#94a3b8'}} onMouseEnter={e=>{e.currentTarget.style.color='#ef4444';e.currentTarget.style.background=isDark?'rgba(239,68,68,0.1)':'#fef2f2'}} onMouseLeave={e=>{e.currentTarget.style.color=isDark?'#6b7fa3':'#94a3b8';e.currentTarget.style.background='transparent'}} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all">
            <LogOut size={15} className="flex-shrink-0"/>
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header style={{background:isDark?'#141b24':'#ffffff',borderBottom:`1px solid ${isDark?'#1e2d40':'#f1f5f9'}`}} className="h-14 flex items-center gap-3 px-4 flex-shrink-0 transition-all duration-200">
          <button onClick={() => setSidebarOpen(o => !o)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <Menu size={16} />
          </button>
          {/* Company selector */}
          <div className="relative">
            <button onClick={() => setCompanyDropdown(o=>!o)} style={{border:`1px solid ${isDark?'#1e2d40':'#e2e8f0'}`,background:'transparent',color:isDark?'#e8f0fe':'#1e293b'}} className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all">
              <div className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center text-xs font-bold text-blue-600">{selectedCompany?.name?.[0] || "?"}</div>
              <span className={`text-sm font-medium max-w-32 truncate ${isDark?'text-[#e8f0fe]':'text-gray-800'}`} style={{color: isDark?'#e8f0fe':'#1e293b'}}>{selectedCompany.name}</span>
              <ChevronDown size={13} className="text-gray-400" />
            </button>
            {companyDropdown && (
              <div style={{background:isDark?'#141b24':'#ffffff',border:`1px solid ${isDark?'#1e2d40':'#f1f5f9'}`}} className="absolute top-full left-0 mt-1 w-56 rounded-2xl shadow-lg z-50 py-1.5">
                {companies.map(c=>(
                  <button key={c.id} onClick={() => { setSelectedCompany(c); setCompanyDropdown(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${isDark?'hover:bg-[#1a2332]':'hover:bg-gray-50'}`}>
                    <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600">{c.name[0]}</div>
                    <div className="text-left"><p className={`text-xs font-medium ${isDark?'text-[#e8f0fe]':'text-gray-800'}`}>{c.name}</p><p className={`text-xs ${isDark?'text-[#6b7fa3]':'text-gray-400'}`}>{c.province} · {c.employees} emp.</p></div>
                    {c.id === selectedCompany.id && <CheckCircle2 size={12} className="ml-auto text-blue-600"/>}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Search */}
          <div className="relative flex-1 max-w-xs hidden md:block">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input className={`w-full pl-9 pr-3 py-1.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDark?'border-[#1e2d40] bg-[#1a2332] text-[#e8f0fe] placeholder-[#6b7fa3]':'border-gray-200 bg-gray-50 text-gray-900 focus:bg-white'}`} placeholder="Search…"/>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div style={{background:isDark?'#1a2332':'#f1f5f9',border:`1px solid ${isDark?'#1e2d40':'#e2e8f0'}`,borderRadius:'10px',padding:'3px',display:'flex',gap:'2px'}}>
              {[['light','☀️ Light'],['dark','🌙 Dark']].map(([t,label])=>(
                <button key={t} onClick={()=>switchTheme(t)}
                  style={{background:theme===t?(isDark?'#2d3f55':'#ffffff'):'transparent',color:theme===t?(isDark?'#e8f0fe':'#0f172a'):(isDark?'#6b7fa3':'#94a3b8'),borderRadius:'7px',padding:'4px 10px',fontSize:'11.5px',fontWeight:500,border:'none',cursor:'pointer',transition:'all 0.15s'}}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={() => setPage("run")} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors">
              <Plus size={13}/> Run Payroll
            </button>
            {/* Notifications */}
            <div className="relative">
              <button onClick={()=>setNotifOpen(o=>!o)} className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
                <Bell size={16}/>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {notifOpen && (
                <div className={`absolute right-0 top-full mt-1 w-72 border rounded-2xl shadow-lg z-50 py-2 ${isDark?'bg-[#141b24] border-[#1e2d40]':'bg-white border-gray-100'}`}>
                  <div className={`px-4 py-2 border-b ${isDark?'border-[#1e2d40]':'border-gray-50'}`}><p className={`text-xs font-semibold ${isDark?'text-[#e8f0fe]':'text-gray-700'}`}>Notifications</p></div>
                  {[
                    {msg:"Atlantic Seafoods CRA remittance overdue",time:"2h ago",color:"red"},
                    {msg:"Pacific NW Tech payroll due Jun 13",time:"5h ago",color:"amber"},
                    {msg:"Maple Ridge payroll completed",time:"1d ago",color:"green"},
                  ].map((n,i)=>(
                    <div key={i} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50">
                      <div className="flex gap-2"><div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${n.color==="red"?"bg-red-500":n.color==="amber"?"bg-amber-500":"bg-emerald-500"}`}></div><div><p className="text-xs text-gray-700">{n.msg}</p><p className="text-xs text-gray-400 mt-0.5">{n.time}</p></div></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Profile */}
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">JW</div>
              <span className={`text-xs font-medium hidden md:block ${isDark?'text-[#e8f0fe]':'text-gray-700'}`}>Walsh Accounting</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{background:isDark?'#0c1117':'#f0f4f8'}} className="flex-1 overflow-y-auto transition-all duration-200">
          <div key={selectedCompany.id}>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}