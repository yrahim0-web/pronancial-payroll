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
      { min: 0,      max: 52886,   rate: 0.0505, base: 0        },
      { min: 52886,  max: 105775,  rate: 0.0915, base: 2670.74  },
      { min: 105775, max: 150000,  rate: 0.1116, base: 7514.86  },
      { min: 150000, max: 220000,  rate: 0.1216, base: 12447.72 },
      { min: 220000, max: Infinity,rate: 0.1316, base: 23967.72 },
    ],
    bpa: 12989,
    surtax: true,
  },
  BC: {
    brackets: [
      { min: 0,      max: 45654,   rate: 0.0506, base: 0       },
      { min: 45654,  max: 91310,   rate: 0.077,  base: 2310.09 },
      { min: 91310,  max: 104835,  rate: 0.105,  base: 5822.41 },
      { min: 104835, max: 127299,  rate: 0.1229, base: 7244.63 },
      { min: 127299, max: 172602,  rate: 0.147,  base: 10010.69},
      { min: 172602, max: 240716,  rate: 0.168,  base: 16673.18},
      { min: 240716, max: Infinity,rate: 0.205,  base: 28115.58},
    ],
    bpa: 11981,
    surtax: false,
  },
  AB: {
    brackets: [
      { min: 0,      max: 148269,  rate: 0.10,   base: 0        },
      { min: 148269, max: 177922,  rate: 0.12,   base: 14826.90 },
      { min: 177922, max: 237230,  rate: 0.13,   base: 18385.26 },
      { min: 237230, max: 355845,  rate: 0.14,   base: 26096.16 },
      { min: 355845, max: Infinity,rate: 0.15,   base: 42706.46 },
    ],
    bpa: 21003,
    surtax: false,
  },
  QC: {
    brackets: [
      { min: 0,      max: 51780,   rate: 0.14,   base: 0        },
      { min: 51780,  max: 103545,  rate: 0.19,   base: 7249.20  },
      { min: 103545, max: 126000,  rate: 0.24,   base: 17084.75 },
      { min: 126000, max: Infinity,rate: 0.2575, base: 22473.95 },
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
      { min: 0,      max: 49720,   rate: 0.105,  base: 0       },
      { min: 49720,  max: 142058,  rate: 0.125,  base: 5220.60 },
      { min: 142058, max: Infinity,rate: 0.145,  base: 16762.85},
    ],
    bpa: 17661,
    surtax: false,
  },
  NS: {
    brackets: [
      { min: 0,      max: 29590,   rate: 0.0879, base: 0       },
      { min: 29590,  max: 59180,   rate: 0.1495, base: 2601.95 },
      { min: 59180,  max: 93000,   rate: 0.1667, base: 7028.34 },
      { min: 93000,  max: 150000,  rate: 0.175,  base: 13669.40},
      { min: 150000, max: Infinity,rate: 0.21,   base: 23644.40},
    ],
    bpa: 8481,
    surtax: false,
  },
  NB: {
    brackets: [
      { min: 0,      max: 47715,   rate: 0.094,  base: 0       },
      { min: 47715,  max: 95431,   rate: 0.14,   base: 4485.21 },
      { min: 95431,  max: 176756,  rate: 0.16,   base: 11165.65},
      { min: 176756, max: Infinity,rate: 0.195,  base: 24177.65},
    ],
    bpa: 12458,
    surtax: false,
  },
  NL: {
    brackets: [
      { min: 0,      max: 43198,   rate: 0.087,  base: 0       },
      { min: 43198,  max: 86395,   rate: 0.145,  base: 3758.23 },
      { min: 86395,  max: 154244,  rate: 0.158,  base: 10022.52},
      { min: 154244, max: 215943,  rate: 0.178,  base: 20743.30},
      { min: 215943, max: 275870,  rate: 0.198,  base: 31726.90},
      { min: 275870, max: Infinity,rate: 0.213,  base: 43585.35},
    ],
    bpa: 10818,
    surtax: false,
  },
  PE: {
    brackets: [
      { min: 0,      max: 32656,   rate: 0.096,  base: 0       },
      { min: 32656,  max: 64313,   rate: 0.1337, base: 3135.98 },
      { min: 64313,  max: 105000,  rate: 0.167,  base: 7367.59 },
      { min: 105000, max: 140000,  rate: 0.18,   base: 14152.06},
      { min: 140000, max: Infinity,rate: 0.1865, base: 20452.06},
    ],
    bpa: 12000,
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
  if (basicProvTax > 5765) surtax += (basicProvTax - 5765) * 0.20;
  if (basicProvTax > 7387) surtax += (basicProvTax - 7387) * 0.36;
  return surtax;
}

// ─── Main CRA-Compliant Calculation Engine ────────────────────────────────────
function calcPayroll(
  emp,
  regHrs,
  otHrs,
  bonus,
  statHrs   = 0,
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
    statPay    = stat * emp.rate * 1.5;
  } else {
    regularPay = emp.rate / PP;
    const dailyRate = emp.rate / 261;
    statPay    = stat * (dailyRate / 8) * 0.5;
  }

  const baseEarnings = +(regularPay + otPay + statPay + bon).toFixed(2);
  const vacPay       = +(baseEarnings * vacRate).toFixed(2);
  const grossPeriod  = +(baseEarnings + vacPay).toFixed(2);

  // ── Step 2: CPP (T4127 Section A) ───────────────────────────────────────────
  // Annual CPP-pensionable earnings (gross × PP − basic exemption)
  // CPP on gross including vacation pay (CRA includes vac pay in pensionable earnings)
  const annualPensionable = grossPeriod * PP;
  const pensionableNet    = Math.max(annualPensionable - CPP_EXEMPTION, 0);
  const annualCPP         = Math.min(pensionableNet * CPP_RATE, CPP_MAX_CONTRIB);
  const periodCPP         = +(annualCPP / PP).toFixed(2);

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
  // CRA taxable = gross - CPP only (EI is a credit, not deducted from taxable income)
  const annualTaxable = annualGross - annualCPP - annualCPP2;

  // Canada Employment Amount (CEA) 2026 = $1,433
  // CRA T4127 Method 1 — credits against gross tax
  // CEA 2026 = $1,433 (lesser of employment income or max)
  const CEA = Math.min(annualGross, 1433);
  // T1 = gross tax on annualized taxable income
  const T1 = calcBracketTax(annualTaxable, FED_BRACKETS);
  // Credits: TD1 claim + CPP + EI + CEA all at lowest federal rate 14%
  const K1 = 0.14 * td1Fed;   // personal TD1 credit
  const K4 = 0.14 * CEA;      // Canada Employment Amount credit
  const annualFedTaxRaw = Math.max(T1 - K1 - K4, 0);
  const annualFedTax    = Math.round(annualFedTaxRaw);
  const periodFedTax    = +(annualFedTax / PP).toFixed(2);

  // ── Step 5: Provincial Tax (T4127 Section D) ─────────────────────────────────
  const provBPA        = td1Prov ?? provData.bpa;
  const provLowestRate = provData.brackets[0]?.rate || 0.0505;
  // Provincial credits: TD1 claim × provincial lowest rate
  // Provincial credits: only personal TD1 amount at provincial lowest rate
  const provCredits = provBPA * provLowestRate;

  let annualProvTax = Math.max(calcBracketTax(annualTaxable, provData.brackets) - provCredits, 0);

  // Ontario surtax
  if (provData.surtax) {
    annualProvTax += calcONSurtax(annualProvTax);
  }

  // Ontario health premium 2026 (included in provincial tax per CRA T4032)
  if (province === "ON") {
    let ohp = 0;
    const ai = annualTaxable;
    if      (ai <= 20000)  ohp = 0;
    else if (ai <= 36000)  ohp = Math.min(300,  0.06  * (ai - 20000));
    else if (ai <= 48000)  ohp = Math.min(450,  300 + 0.06 * (ai - 36000));
    else if (ai <= 72000)  ohp = Math.min(600,  450 + 0.25 * (ai - 48000));
    else if (ai <= 200000) ohp = Math.min(750,  600 + 0.25 * (ai - 72000));
    else                   ohp = Math.min(900,  750 + 0.25 * (ai - 200000));
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

// ─── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ company, companies, setPage, setSelectedCompany }) {
  const emps = EMPLOYEES_BY_COMPANY[company.id] || [];
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{company.name}</h1>
          <p className="text-sm text-gray-400 mt-0.5">Payroll dashboard · Fiscal 2025</p>
        </div>
        <button onClick={() => setPage("run")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
          <PlayCircle size={15} /> Run Payroll
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Payroll (May)" value="$36,400" sub="+5.2% vs last month" color="blue" />
        <StatCard icon={Users} label="Active Employees" value={emps.filter(e=>e.status==="active").length} sub={`${company.name}`} color="green" />
        <StatCard icon={Calendar} label="Next Payroll" value="Jun 15" sub="Semi-monthly" color="amber" />
        <StatCard icon={AlertCircle} label="CRA Remittance" value={company.remittance === "overdue" ? "Overdue" : company.remittance === "due" ? "Due Jun 15" : "Up to date"} sub="Payroll source deductions" color={company.remittance === "overdue" ? "red" : company.remittance === "due" ? "amber" : "green"} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Payroll Trend</h3>
            <Badge color="blue">2025</Badge>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={PAYROLL_TREND}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
              <Tooltip formatter={v => [`$${v.toLocaleString()}`, "Gross Payroll"]} contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.08)", fontSize: 12 }} />
              <Area type="monotone" dataKey="gross" stroke="#2563eb" strokeWidth={2} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "Run Payroll", icon: PlayCircle, page: "run", color: "text-blue-600" },
              { label: "Add Employee", icon: Users, page: "employees", color: "text-emerald-600" },
              { label: "View Reports", icon: BarChart2, page: "reports", color: "text-purple-600" },
              { label: "Payroll History", icon: History, page: "history", color: "text-amber-600" },
              { label: "Company Settings", icon: Settings, page: "settings", color: "text-gray-600" },
            ].map(a => (
              <button key={a.label} onClick={() => setPage(a.page)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left">
                <a.icon size={16} className={a.color} />
                <span className="text-sm text-gray-700">{a.label}</span>
                <ChevronRight size={14} className="ml-auto text-gray-300" />
              </button>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Recent Payroll Runs</h3>
            <button onClick={()=>setPage("history")} className="text-xs text-blue-600 hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {PAYROLL_HISTORY.slice(0,3).map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.period}</p>
                  <p className="text-xs text-gray-400">{p.date} · {p.employees} employees</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${p.net.toLocaleString()}</p>
                  <Badge color="green">Completed</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">All Clients Overview</h3>
          <div className="space-y-3">
            {companies.map(c => (
              <div key={c.id} onClick={() => { setSelectedCompany(c); setPage("dashboard"); }} className="flex items-center justify-between py-2 border-b border-gray-50 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600">{c.name[0]}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.employees} employees · {c.province}</p>
                  </div>
                </div>
                <Badge color={c.remittance === "overdue" ? "red" : c.remittance === "due" ? "yellow" : "green"}>
                  {c.remittance === "overdue" ? "Overdue" : c.remittance === "due" ? "Due soon" : "Current"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
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
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", province: "ON", type: "Salary", salary: "", rate: "", hireDate: "", position: "", td1Fed: "16452", td1Prov: "", paySchedule: "Semi-monthly", vacRate: "4", ytd_gross: "", ytd_cpp: "", ytd_ei: "", ytd_fed_tax: "", ytd_prov_tax: "", ytd_vac: "", ytd_er_cpp: "", ytd_er_ei: "" });

  const filtered = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
  const addEmployee = async () => {
    if (editEmployee) {
      const { data } = await supabase
        .from('employees')
        .update({
          name: `${form.firstName} ${form.lastName}`,
          province: form.province,
          type: form.type,
          rate: form.type === "Salary" ? parseFloat(form.salary)||60000 : parseFloat(form.rate)||20,
          email: form.email,
          hire_date: form.hireDate,
          position: form.position || "Employee",
          td1_fed: parseFloat(form.td1Fed) || 16452,
          td1_prov: parseFloat(form.td1Prov) || 12989,
          vac_rate: (form.vacRate || "4") + "%",
          payroll_schedule: form.paySchedule || "Semi-monthly",
        })
        .eq('id', editEmployee.id)
        .select()
        .single();
      if (data) {
        setEmployees(prev => prev.map(emp => emp.id === data.id ? data : emp));
      }
      setEditEmployee(null);
    } else {
      const { data } = await supabase
        .from('employees')
        .insert([{
          company_id: company.id,
          name: `${form.firstName} ${form.lastName}`,
          position: form.position || "Employee",
          province: form.province,
          type: form.type,
          rate: form.type === "Salary" ? parseFloat(form.salary)||60000 : parseFloat(form.rate)||20,
          status: "active",
          last_payroll: "—",
          sin: "***-***-000",
          email: form.email,
          hire_date: form.hireDate,
          vac_rate: (form.vacRate || "4") + "%",
          payroll_schedule: form.paySchedule || "Semi-monthly",
          ytd_gross: parseFloat(form.ytd_gross) || 0,
          ytd_cpp: parseFloat(form.ytd_cpp) || 0,
          ytd_ei: parseFloat(form.ytd_ei) || 0,
          ytd_fed_tax: parseFloat(form.ytd_fed_tax) || 0,
          ytd_prov_tax: parseFloat(form.ytd_prov_tax) || 0,
          ytd_vac: parseFloat(form.ytd_vac) || 0,
          ytd_er_cpp: parseFloat(form.ytd_er_cpp) || 0,
          ytd_er_ei: parseFloat(form.ytd_er_ei) || 0
        }])
        .select()
        .single();
      if (data) {
        setEmployees(prev => [...prev, data]);
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
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400" onClick={() => { setEditEmployee(e); setForm({ firstName: e.name.split(" ")[0], lastName: e.name.split(" ").slice(1).join(" "), email: e.email||"", province: e.province||"ON", type: e.type||"Salary", salary: e.type==="Salary"?e.rate:"", rate: e.type==="Hourly"?e.rate:"", hireDate: e.hire_date||"", position: e.position||"", td1Fed: String(e.td1_fed||16452), td1Prov: String(e.td1_prov||12989), paySchedule: e.payroll_schedule||"Semi-monthly", vacRate: (e.vac_rate||"4%").replace("%","") }); setShowModal(true); }}><Pencil size={14} /></button>
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
        <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Opening YTD Balances</p>
          <p className="text-xs text-gray-400 mb-3">Enter existing year-to-date balances if employee is mid-year transfer from another payroll system.</p>
          <div className="grid grid-cols-3 gap-4">
            <Input label="YTD Gross ($)" type="number" value={form.ytd_gross||""} onChange={e=>setForm(p=>({...p,ytd_gross:e.target.value}))} placeholder="0.00" />
            <Input label="YTD CPP ($)" type="number" value={form.ytd_cpp||""} onChange={e=>setForm(p=>({...p,ytd_cpp:e.target.value}))} placeholder="0.00" />
            <Input label="YTD EI ($)" type="number" value={form.ytd_ei||""} onChange={e=>setForm(p=>({...p,ytd_ei:e.target.value}))} placeholder="0.00" />
            <Input label="YTD Federal Tax ($)" type="number" value={form.ytd_fed_tax||""} onChange={e=>setForm(p=>({...p,ytd_fed_tax:e.target.value}))} placeholder="0.00" />
            <Input label="YTD Provincial Tax ($)" type="number" value={form.ytd_prov_tax||""} onChange={e=>setForm(p=>({...p,ytd_prov_tax:e.target.value}))} placeholder="0.00" />
            <Input label="YTD Vacation Pay ($)" type="number" value={form.ytd_vac||""} onChange={e=>setForm(p=>({...p,ytd_vac:e.target.value}))} placeholder="0.00" />
          </div>
        </div>
        <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
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

// ─── Run Payroll ──────────────────────────────────────────────────────────────
const BIWEEKLY_PERIODS = [
  { period: 1,  start: "Jan 5, 2026",  end: "Jan 18, 2026",  payDate: "Jan 19, 2026" },
  { period: 2,  start: "Jan 19, 2026", end: "Feb 1, 2026",   payDate: "Feb 2, 2026" },
  { period: 3,  start: "Feb 2, 2026",  end: "Feb 15, 2026",  payDate: "Feb 16, 2026" },
  { period: 4,  start: "Feb 16, 2026", end: "Mar 1, 2026",   payDate: "Mar 2, 2026" },
  { period: 5,  start: "Mar 2, 2026",  end: "Mar 15, 2026",  payDate: "Mar 16, 2026" },
  { period: 6,  start: "Mar 16, 2026", end: "Mar 29, 2026",  payDate: "Mar 30, 2026" },
  { period: 7,  start: "Mar 30, 2026", end: "Apr 12, 2026",  payDate: "Apr 13, 2026" },
  { period: 8,  start: "Apr 13, 2026", end: "Apr 26, 2026",  payDate: "Apr 27, 2026" },
  { period: 9,  start: "Apr 27, 2026", end: "May 10, 2026",  payDate: "May 11, 2026" },
  { period: 10, start: "May 11, 2026", end: "May 24, 2026",  payDate: "May 25, 2026" },
  { period: 11, start: "May 25, 2026", end: "Jun 7, 2026",   payDate: "Jun 8, 2026" },
  { period: 12, start: "Jun 8, 2026",  end: "Jun 21, 2026",  payDate: "Jun 22, 2026" },
  { period: 13, start: "Jun 22, 2026", end: "Jul 5, 2026",   payDate: "Jul 6, 2026" },
  { period: 14, start: "Jul 6, 2026",  end: "Jul 19, 2026",  payDate: "Jul 20, 2026" },
  { period: 15, start: "Jul 20, 2026", end: "Aug 2, 2026",   payDate: "Aug 3, 2026" },
  { period: 16, start: "Aug 3, 2026",  end: "Aug 16, 2026",  payDate: "Aug 17, 2026" },
  { period: 17, start: "Aug 17, 2026", end: "Aug 30, 2026",  payDate: "Aug 31, 2026" },
  { period: 18, start: "Aug 31, 2026", end: "Sep 13, 2026",  payDate: "Sep 14, 2026" },
  { period: 19, start: "Sep 14, 2026", end: "Sep 27, 2026",  payDate: "Sep 28, 2026" },
  { period: 20, start: "Sep 28, 2026", end: "Oct 11, 2026",  payDate: "Oct 12, 2026" },
  { period: 21, start: "Oct 12, 2026", end: "Oct 25, 2026",  payDate: "Oct 26, 2026" },
  { period: 22, start: "Oct 26, 2026", end: "Nov 8, 2026",   payDate: "Nov 9, 2026" },
  { period: 23, start: "Nov 9, 2026",  end: "Nov 22, 2026",  payDate: "Nov 23, 2026" },
  { period: 24, start: "Nov 23, 2026", end: "Dec 6, 2026",   payDate: "Dec 7, 2026" },
  { period: 25, start: "Dec 7, 2026",  end: "Dec 20, 2026",  payDate: "Dec 21, 2026" },
  { period: 26, start: "Dec 21, 2026", end: "Jan 3, 2027",   payDate: "Jan 4, 2027" },
];

function RunPayrollPage({ company, setPage }) {
  const [emps, setEmps] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);

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
            ot: "0", stat: "0", bonus: "0",
            vacRate: e.vac_rate || "4%"
          };
        });
        setHours(initHours);
      }
    };
    fetchEmps();
  }, [company.id]);
  const [hours, setHours] = useState({});
  const [processed, setProcessed] = useState(false);
const [saving, setSaving] = useState(false);
const [showPreview, setShowPreview] = useState(false); 
  const [period] = useState("Jun 1–15, 2025");

  const rows = emps.map(e => {
    const defaultReg = e.type === "Salary" ? "80" : "0";
    const defaultVac = (e.vac_rate || "4%").replace("%","");
    const h = hours[e.id] || { reg: defaultReg, ot:"0", stat:"0", bonus:"0", vacRate: defaultVac + "%" };
    const fedTD1 = (!e.td1_fed || e.td1_fed === 15705) ? 16452 : e.td1_fed;
const provTD1 = (!e.td1_prov || e.td1_prov === 0) ? 12989 : e.td1_prov;
const empFreq = e.payroll_schedule || "Bi-weekly";
return { ...e, ...calcPayroll(e, h.reg, h.ot, h.bonus, h.stat, VAC_RATES[h.vacRate] ?? 0.04, empFreq, fedTD1, provTD1), ...h };
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
        <div className="p-4 border-b border-gray-50 flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700"><Calendar size={14} className="text-gray-400" />Pay Period:</div>
          <select
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 text-blue-600 font-medium focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={selectedPeriod || ""}
            onChange={e => setSelectedPeriod(e.target.value)}
          >
            <option value="">-- Select Period --</option>
            {BIWEEKLY_PERIODS.map(p => (
              <option key={p.period} value={p.period}>
                Period {p.period}: {p.start} – {p.end}
              </option>
            ))}
          </select>
          {selectedPeriod && (
            <span className="text-xs text-gray-500">Pay Date: <span className="text-green-600 font-medium">{BIWEEKLY_PERIODS[+selectedPeriod-1]?.payDate}</span></span>
          )}
          <Badge color="blue">Biweekly</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-50">
              {["Employee","Reg Hrs","OT Hrs (1.5×)","Stat Hrs (1.5×)","Bonus","Vac %","Base Pay","Vac Pay","Gross","CPP","EI","Tax","Net Pay"].map(h=>(
                <th key={h} className="text-left px-3 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">{e.name.split(" ").map(n=>n[0]).join("")}</div>
                      <div><p className="font-medium text-gray-900 whitespace-nowrap">{e.name}</p><p className="text-xs text-gray-400">{e.type==="Salary"?`${e.rate.toLocaleString()}/yr`:`${e.rate}/hr`}</p></div>
                    </div>
                  </td>
                  {["reg","ot","stat","bonus"].map(field => (
                    <td key={field} className="px-3 py-3">
                      <input type="number" min="0" value={hours[e.id]?.[field]||"0"} onChange={ev => setHours(p => ({...p, [e.id]:{...(p[e.id]||{}), [field]:ev.target.value}}))}
                        className="w-14 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50 text-center" disabled={processed} />
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    <select value={hours[e.id]?.vacRate||"4%"} onChange={ev=>setHours(p=>({...p,[e.id]:{...(p[e.id]||{}),vacRate:ev.target.value}}))}
                      disabled={processed} className="w-16 px-1 py-1 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400">
                      {Object.keys(VAC_RATES).map(r=><option key={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-3 text-gray-700">${e.baseEarnings.toFixed(2)}</td>
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
              <td className="px-3 py-3 text-gray-700" colSpan={6}>Totals</td>
              <td className="px-3 py-3 text-gray-700">${rows.reduce((a,r)=>a+r.baseEarnings,0).toFixed(2)}</td>
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
  const { data } = await supabase
    .from('payroll_runs')
    .insert([{
      company_id: company.id,
      period: period,
      pay_date: new Date().toISOString().split('T')[0],
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
        ytd_vac:      +((r.ytd_vac      || 0) + r.vacPay).toFixed(2),
      }))
    }])
    .select()
    .single();
  if (data) {
    setProcessed(true);
    // Update each employee's YTD in database
    for (const r of rows) {
      await supabase.from('employees').update({
        ytd_gross:    +((r.ytd_gross    || 0) + r.gross).toFixed(2),
        ytd_cpp:      +((r.ytd_cpp      || 0) + r.cpp).toFixed(2),
        ytd_ei:       +((r.ytd_ei       || 0) + r.ei).toFixed(2),
        ytd_fed_tax:  +((r.ytd_fed_tax  || 0) + (r.fedTax || 0)).toFixed(2),
        ytd_prov_tax: +((r.ytd_prov_tax || 0) + (r.provTax || 0)).toFixed(2),
        ytd_vac:      +((r.ytd_vac      || 0) + r.vacPay).toFixed(2),
        last_payroll: new Date().toISOString().split('T')[0]
      }).eq('id', r.id);
    }
  }
  setSaving(false);
}} disabled={processed || saving} className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl text-sm font-medium transition-colors">
              {processed ? "Payroll Processed ✓" : saving ? "Saving..." : "Process Payroll"}
            </button>
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
    const { default: jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let y = 20;
    pdf.setFontSize(16); pdf.setFont('helvetica', 'bold');
    pdf.text(company.name || 'Company', 15, y); y += 7;
    pdf.setFontSize(9); pdf.setFont('helvetica', 'normal');
    pdf.text('Pay Period: ' + selectedRun.period + '   Date: ' + selectedRun.pay_date, 15, y); y += 10;
    pdf.setFontSize(10); pdf.setFont('helvetica', 'bold');
    pdf.text('Employee: ' + (selectedEmp.name || ''), 15, y); y += 6;
    pdf.text('Province: ' + (selectedEmp.province || ''), 15, y); y += 10;
    pdf.setFillColor(240,240,240);
    pdf.rect(15, y-4, 180, 7, 'F');
    pdf.setFontSize(9);
    pdf.text('Description', 17, y);
    pdf.text('Current', 130, y);
    pdf.text('YTD', 168, y); y += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.text('Base Earnings', 17, y); pdf.text(String((+selectedEmp.base_earnings||0).toFixed(2)), 130, y); pdf.text('--', 168, y); y += 6;
    pdf.text('Vacation Pay', 17, y); pdf.text(String((+selectedEmp.vac_pay||0).toFixed(2)), 130, y); pdf.text(String((+selectedEmp.ytd_vac||0).toFixed(2)), 168, y); y += 6;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Gross Earnings', 17, y); pdf.text(String((+selectedEmp.gross||0).toFixed(2)), 130, y); pdf.text(String((+selectedEmp.ytd_gross||0).toFixed(2)), 168, y); y += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.text('CPP', 17, y); pdf.text(String((+selectedEmp.cpp||0).toFixed(2)), 130, y); pdf.text(String((+selectedEmp.ytd_cpp||0).toFixed(2)), 168, y); y += 6;
    pdf.text('EI', 17, y); pdf.text(String((+selectedEmp.ei||0).toFixed(2)), 130, y); pdf.text(String((+selectedEmp.ytd_ei||0).toFixed(2)), 168, y); y += 6;
    pdf.text('Federal Tax', 17, y); pdf.text(String((+selectedEmp.fed_tax||0).toFixed(2)), 130, y); pdf.text(String((+selectedEmp.ytd_fed_tax||0).toFixed(2)), 168, y); y += 6;
    pdf.text('Provincial Tax', 17, y); pdf.text(String((+selectedEmp.prov_tax||0).toFixed(2)), 130, y); pdf.text(String((+selectedEmp.ytd_prov_tax||0).toFixed(2)), 168, y); y += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Net Pay', 17, y); pdf.text('$' + String((+selectedEmp.net||0).toFixed(2)), 130, y); y += 10;
    pdf.setFont('helvetica', 'italic'); pdf.setFontSize(8);
    pdf.text('This is a computer-generated pay statement.', 15, y);
    pdf.save('paystub-' + (selectedEmp.name||'emp').replace(/ /g,'-') + '-' + selectedRun.pay_date + '.pdf');
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
              <button key={r.id} onClick={() => { setSelectedRun(r); setSelectedEmp(r.details?.[0]||null); }} className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${selectedRun?.id===r.id ? "bg-blue-600 text-white" : "hover:bg-gray-50 text-gray-700"}`}>
                <p className="font-medium">{r.period}</p>
                <p className={`text-xs ${selectedRun?.id===r.id?"text-blue-200":"text-gray-400"}`}>{r.pay_date}</p>
              </button>
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
                <p className="text-xs text-gray-400">Pay Period: Jun 1–15, 2025</p>
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
                    <tr><td className="px-5 py-2.5 text-gray-600 pl-8">Base Earnings</td><td className="px-5 py-2.5 text-right text-gray-700">{(+selectedEmp.base_earnings||0).toFixed(2)}</td><td className="px-5 py-2.5 text-right text-gray-500">—</td></tr>
                    <tr><td className="px-5 py-2.5 text-gray-600 pl-8">Vacation Pay</td><td className="px-5 py-2.5 text-right text-purple-600">{(+selectedEmp.vac_pay||0).toFixed(2)}</td><td className="px-5 py-2.5 text-right text-gray-500">{(+selectedEmp.ytd_vac||0).toFixed(2)}</td></tr>
                    <tr className="bg-gray-50"><td className="px-5 py-2.5 font-semibold text-gray-800">Gross Earnings</td><td className="px-5 py-2.5 text-right font-semibold text-gray-900">{(+selectedEmp.gross||0).toFixed(2)}</td><td className="px-5 py-2.5 text-right font-semibold text-gray-700">{(+selectedEmp.ytd_gross||0).toFixed(2)}</td></tr>
                    <tr className="bg-red-50"><td className="px-5 py-1.5 text-xs font-semibold text-red-700" colSpan={3}>Employee Deductions</td></tr>
                    <tr><td className="px-5 py-2.5 text-gray-600 pl-8">CPP Contributions</td><td className="px-5 py-2.5 text-right text-red-500">({(+selectedEmp.cpp||0).toFixed(2)})</td><td className="px-5 py-2.5 text-right text-gray-500">({(+selectedEmp.ytd_cpp||0).toFixed(2)})</td></tr>
                    <tr><td className="px-5 py-2.5 text-gray-600 pl-8">EI Premiums</td><td className="px-5 py-2.5 text-right text-red-500">({(+selectedEmp.ei||0).toFixed(2)})</td><td className="px-5 py-2.5 text-right text-gray-500">({(+selectedEmp.ytd_ei||0).toFixed(2)})</td></tr>
                    <tr><td className="px-5 py-2.5 text-gray-600 pl-8">Federal Income Tax</td><td className="px-5 py-2.5 text-right text-red-500">({(+selectedEmp.fed_tax||0).toFixed(2)})</td><td className="px-5 py-2.5 text-right text-gray-500">({(+selectedEmp.ytd_fed_tax||0).toFixed(2)})</td></tr>
                    <tr><td className="px-5 py-2.5 text-gray-600 pl-8">Provincial Income Tax</td><td className="px-5 py-2.5 text-right text-red-500">({(+selectedEmp.prov_tax||0).toFixed(2)})</td><td className="px-5 py-2.5 text-right text-gray-500">({(+selectedEmp.ytd_prov_tax||0).toFixed(2)})</td></tr>
                    <tr className="bg-blue-50"><td className="px-5 py-3 font-bold text-gray-900">Net Pay</td><td className="px-5 py-3 text-right font-bold text-emerald-700 text-base">${(+selectedEmp.net||0).toFixed(2)}</td><td className="px-5 py-3 text-right font-semibold text-gray-700">${((+selectedEmp.ytd_gross||0)-(+selectedEmp.ytd_cpp||0)-(+selectedEmp.ytd_ei||0)-(+selectedEmp.ytd_fed_tax||0)-(+selectedEmp.ytd_prov_tax||0)).toFixed(2)}</td></tr>
                    <tr className="bg-amber-50"><td className="px-5 py-1.5 text-xs font-semibold text-amber-700" colSpan={3}>Employer Contributions</td></tr>
                    <tr><td className="px-5 py-2.5 text-gray-600 pl-8">Employer CPP (matched)</td><td className="px-5 py-2.5 text-right text-amber-600">{(+selectedEmp.er_cpp||0).toFixed(2)}</td><td className="px-5 py-2.5 text-right text-gray-500">—</td></tr>
                    <tr><td className="px-5 py-2.5 text-gray-600 pl-8">Employer EI (×1.4)</td><td className="px-5 py-2.5 text-right text-amber-600">{(+selectedEmp.er_ei||0).toFixed(2)}</td><td className="px-5 py-2.5 text-right text-gray-500">—</td></tr>
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
                    <button className="flex items-center gap-1 text-xs text-blue-600 hover:underline"><Eye size={13}/> View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
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
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
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
      case "dashboard": return <Dashboard company={selectedCompany} companies={companies} setPage={setPage} setSelectedCompany={setSelectedCompany} />;
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
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-56" : "w-16"} flex-shrink-0 bg-white border-r border-gray-100 flex flex-col transition-all duration-200 h-full`}>
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 h-14">
          <div className="w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <DollarSign size={14} className="text-white" />
          </div>
          {sidebarOpen && <span className="font-semibold text-sm text-gray-900 leading-tight whitespace-nowrap">Pronancial<br/><span className="text-xs font-normal text-gray-400">Payroll</span></span>}
        </div>
        <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} title={!sidebarOpen ? item.label : ""}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${page === item.id ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
              <item.icon size={16} className="flex-shrink-0" />
              {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={async () => { await supabase.auth.signOut(); setLoggedIn(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors`}>
            <LogOut size={15} className="flex-shrink-0"/>
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center gap-3 px-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(o => !o)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <Menu size={16} />
          </button>
          {/* Company selector */}
          <div className="relative">
            <button onClick={() => setCompanyDropdown(o=>!o)} className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center text-xs font-bold text-blue-600">{selectedCompany?.name?.[0] || "?"}</div>
              <span className="text-sm font-medium text-gray-800 max-w-32 truncate">{selectedCompany.name}</span>
              <ChevronDown size={13} className="text-gray-400" />
            </button>
            {companyDropdown && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 py-1.5">
                {companies.map(c=>(
                  <button key={c.id} onClick={() => { setSelectedCompany(c); setCompanyDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                    <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600">{c.name[0]}</div>
                    <div className="text-left"><p className="text-xs font-medium text-gray-800">{c.name}</p><p className="text-xs text-gray-400">{c.province} · {c.employees} emp.</p></div>
                    {c.id === selectedCompany.id && <CheckCircle2 size={12} className="ml-auto text-blue-600"/>}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Search */}
          <div className="relative flex-1 max-w-xs hidden md:block">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="Search…"/>
          </div>
          <div className="ml-auto flex items-center gap-2">
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
                <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 py-2">
                  <div className="px-4 py-2 border-b border-gray-50"><p className="text-xs font-semibold text-gray-700">Notifications</p></div>
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
              <span className="text-xs font-medium text-gray-700 hidden md:block">Walsh Accounting</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div key={selectedCompany.id}>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}