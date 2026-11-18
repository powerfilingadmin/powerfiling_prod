/**
 * SEO DATA – single source of truth for page titles & meta descriptions.
 *
 * IMPORTANT: keep this file free of imports. It is read both by the React app
 * (components/RouteSEO.jsx) and by the Node build script
 * (scripts/generate-static-seo.mjs).
 *
 * Day 2: titles / descriptions / `h1` were aligned to the keyword research. To tune them, edit the text in
 * this file – no component changes required.
 *
 * Guidelines: title <= 60 chars, description 120-160 chars, one unique
 * title/description per URL.
 */

export const SITE_URL = "https://powerfiling.com";
export const SITE_NAME = "PowerFiling";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og_img.jpeg`;

/* ------------------------------------------------------------------ */
/* Static / top-level pages                                            */
/* ------------------------------------------------------------------ */
export const pageSeo = {
  "/": {
    title: "Income Tax Return Filing Online | ITR Filing – PowerFiling",
    description:
      "File your ITR online with CA-reviewed ITR filing services for salary, capital gains, F&O, crypto, business and NRI income. Simple, secure and accurate.",
  },
  "/services/individual": {
    title: "ITR Filing Services for Individuals – Salary, Gains, NRI",
    description:
      "Online ITR filing services for salaried individuals, investors, traders and NRIs. Compare plans for ITR-1, ITR-2, capital gains, F&O, crypto and foreign income.",
  },
  "/services/business": {
    title: "Business ITR Filing Services – ITR-3, ITR-4 & Professionals",
    description:
      "Income tax return filing services for business owners, freelancers and professionals. ITR-3 / ITR-4, presumptive taxation, F&O and crypto income handled by CAs.",
  },
  "/calculators": {
    title: "Free Income Tax & EMI Calculators India | PowerFiling",
    description:
      "Free online tax calculators: income tax, old vs new regime, salary tax, capital gains, HRA, TDS plus home, car and personal loan EMI calculators.",
  },
  "/calculators/income-tax": {
    title: "Income Tax Calculator India – Old & New Regime | PowerFiling",
    description:
      "Calculate your income tax online under the old and new tax regimes. Includes standard deduction, Section 87A rebate and cess. Free and instant.",
  },
  "/calculators/old-new-regime": {
    title: "Old vs New Tax Regime Calculator | PowerFiling",
    description:
      "Compare the old and new income tax regimes side by side and see which one saves you more tax based on your salary, deductions and investments.",
  },
  "/calculators/salary-tax": {
    title: "Salary Tax & Take-Home Pay Calculator | PowerFiling",
    description:
      "Estimate the income tax on your salary and your monthly take-home pay. Includes standard deduction and both tax regimes. Free online calculator.",
  },
  "/calculators/capital-gain-tax": {
    title: "Capital Gains Tax Calculator India – STCG & LTCG",
    description:
      "Free capital gains tax calculator for India. Do your capital gain tax calculation for shares, mutual funds and property with short-term and long-term gains.",
  },
  "/calculators/hra-calculator": {
    title: "HRA Exemption Calculator – Section 10(13A) | PowerFiling",
    description:
      "Calculate your House Rent Allowance (HRA) exemption under Section 10(13A) using basic salary, HRA received and rent paid. Free and instant.",
  },
  "/calculators/tds-calculator": {
    title: "TDS Calculator – Tax Deducted at Source India | PowerFiling",
    description:
      "Calculate TDS on salary, interest, rent, professional fees and more with our free TDS calculator. Know the section, rate and amount to deduct.",
  },
  "/calculators/home-loan-emi": {
    title: "Home Loan EMI Calculator – Monthly EMI | PowerFiling",
    description:
      "Calculate your home loan EMI, total interest and repayment amount instantly. Free home loan EMI calculator for India.",
  },
  "/calculators/car-loan-emi": {
    title: "Car Loan EMI Calculator – Monthly EMI | PowerFiling",
    description:
      "Work out your monthly car loan EMI and total interest payable before you borrow. Free car loan EMI calculator.",
  },
  "/calculators/personal-loan-emi": {
    title: "Personal Loan EMI Calculator – Monthly EMI | PowerFiling",
    description:
      "Calculate your personal loan EMI and total interest payable instantly. Free personal loan EMI calculator for India.",
  },
  "/blog": {
    title: "Tax & Compliance Blog – Guides by PowerFiling",
    description:
      "Practical guides on income tax, PAN card, ITR filing and business compliance in India, written by the PowerFiling tax compliance team.",
  },
  "/contact": {
    title: "Contact PowerFiling – Tax Filing Support & Queries",
    description:
      "Get in touch with the PowerFiling team for ITR filing, GST, company registration and compliance support. Reach us by email or phone.",
  },
  "/privacy-policy": {
    title: "Privacy Policy | PowerFiling",
    description:
      "Read how PowerFiling collects, uses and protects your personal and financial information when you use our tax filing services.",
  },
  "/disclaimer": {
    title: "Disclaimer | PowerFiling",
    description:
      "Disclaimer for PowerFiling tax filing services, calculators and content. Information is for general guidance and not professional advice.",
  },
  "/refund": {
    title: "Refund & Cancellation Policy | PowerFiling",
    description:
      "Understand PowerFiling's refund and cancellation policy for ITR filing, GST, registration and other paid tax services.",
  },
  "/terms": {
    title: "Terms & Conditions | PowerFiling",
    description:
      "Terms and conditions for using PowerFiling's online tax filing, registration and compliance services.",
  },
  "/security": {
    title: "Data Security & Privacy at PowerFiling",
    description:
      "Learn how PowerFiling protects your tax documents and personal data with SSL and encryption while you file your returns online.",
  },
};

/* ------------------------------------------------------------------ */
/* Service pages  (/services/:serviceId)                               */
/* Keys MUST match the `id` values in servicesData.js                  */
/* ------------------------------------------------------------------ */
export const serviceSeo = {
  "salary-basic-itr": {
    title: "ITR-1 Filing Online for Salaried Employees | PowerFiling",
    h1: "Salary ITR Filing Online – ITR-1 for Salaried Employees",
    description:
      "File ITR-1 (Sahaj) online for salary income up to ₹50 lakh. Form 16 verification, 80C/80D deductions and CA-reviewed filing with PowerFiling.",
  },
  "salary-premium": {
    title: "ITR-2 Filing Online – Salary, Property, Gains | PowerFiling",
    h1: "ITR-2 Filing Online – Salary with Investments & Capital Gains",
    description:
      "ITR-2 filing for salaried professionals with house property, capital gains, dividends and interest income. Tax-saving review and expert consultation.",
  },
  "capital-gain": {
    title: "Capital Gains Tax Filing Online | Capital Gains ITR",
    h1: "Capital Gains Tax Filing Online – Capital Gains ITR Filing",
    description:
      "Capital gains tax filing online for shares, mutual funds and property. Capital gain tax calculation, LTCG/STCG, loss set-off and AIS reconciliation by CAs.",
  },
  "nri-income": {
    title: "NRI ITR Filing Online – NRI Tax Filing in India",
    h1: "NRI ITR Filing Online – Income Tax Return for NRIs",
    description:
      "NRI income tax return filing online. Residential status check, DTAA benefits, foreign tax credit, Schedule FA and foreign income ITR filing in India.",
  },
  "business-profession": {
    title: "ITR-3 & ITR-4 Filing for Business & Professionals",
    h1: "Business & Professional ITR Filing – ITR-3 & ITR-4",
    description:
      "Income tax return filing for business owners, freelancers and professionals. Presumptive taxation (44AD / 44ADA), P&L review and GST reconciliation.",
  },
  "fo-trading": {
    title: "F&O Tax Filing Online – ITR-3 for Futures & Options",
    h1: "F&O Tax Filing Online – Futures & Options ITR-3",
    description:
      "F&O tax filing and tax return filing for futures and options traders. Turnover calculation, loss carry-forward and tax audit applicability check by CAs.",
  },
  "house-property": {
    title: "ITR Filing for House Property & Rental Income | PowerFiling",
    h1: "ITR Filing for House Property & Rental Income",
    description:
      "File your income tax return for rental income and house property. Home loan interest deduction, multiple properties and self-occupied or let-out support.",
  },
  "crypto-trading": {
    title: "Crypto Tax Filing India – VDA Income Tax Return",
    h1: "Crypto Tax Filing in India – VDA Income Tax Return",
    description:
      "File ITR for cryptocurrency gains. Virtual digital asset (VDA) reporting, exchange statement reconciliation and 30% tax computation by experts.",
  },
  "huf-filing": {
    title: "HUF Income Tax Return Filing Online | PowerFiling",
    description:
      "Hindu Undivided Family (HUF) income tax return filing online. Property, investment and family business income reported accurately by CAs.",
  },
  "gst-registration": {
    title: "GST Registration Online India – Get GSTIN Fast | PowerFiling",
    h1: "GST Registration Online in India",
    description:
      "Apply for GST registration online. Document preparation, business-type assessment, HSN/SAC guidance and GSTIN certificate support.",
  },
  "huf-registration": {
    title: "HUF Registration Online – Deed & PAN | PowerFiling",
    description:
      "Create a Hindu Undivided Family (HUF): HUF deed and declaration drafting, PAN application and bank account opening support.",
  },
  "company-registration": {
    title: "Private Limited Company Registration Online in India",
    h1: "Private Limited Company Registration Online in India",
    description:
      "Private limited company registration online in India: SPICe+ filing, DIN, name approval, MOA/AOA drafting, PAN & TAN and Certificate of Incorporation.",
  },
  "llp-registration": {
    title: "LLP Registration Online India | PowerFiling",
    description:
      "Register an LLP online with MCA. Name approval, LLP agreement drafting, PAN & TAN application and Certificate of Incorporation.",
  },
  "gst-filing": {
    title: "GST Return Filing Online – GST Filing Services",
    h1: "GST Return Filing Online – GST Filing Services",
    description:
      "GST return filing online: GSTR-1, GSTR-3B and NIL returns, input tax credit review and sales-purchase reconciliation, with GST filing consultant support.",
  },
  "tds-filing": {
    title: "Form 26QB Filing – TDS on Property (194IA) | PowerFiling",
    description:
      "File Form 26QB online for TDS on property purchase under Section 194IA. Challan payment support and Form 16B generation.",
  },
  "pf-esic": {
    title: "PF & ESIC Registration Online for Employers | PowerFiling",
    description:
      "Employer registration with EPFO (PF) and ESIC. Document preparation, establishment registration and employee code generation support.",
  },
  "roc-filing": {
    title: "ROC Filing for Companies & LLPs – Annual Returns",
    description:
      "Annual ROC filing for Private Limited Companies and LLPs: AOC-4, MGT-7/7A, Form 8 and Form 11 filed on the MCA portal.",
  },
  "annual-compliance-filing": {
    title: "Annual Compliance Filing for Companies & LLPs | PowerFiling",
    description:
      "End-to-end annual ROC compliance for Private Limited Companies, OPCs and LLPs, including AOC-4, MGT-7, Form 8, Form 11 and DIR-3 KYC.",
  },
  dsc: {
    title: "Class 3 Digital Signature Certificate (DSC) Online",
    description:
      "Apply for a Class 3 Digital Signature Certificate online for directors, partners, professionals and individuals, with document and video verification support.",
  },
  "startup-india-registration": {
    title: "Startup India Registration – DPIIT Recognition | PowerFiling",
    description:
      "Get DPIIT startup recognition through Startup India. Eligibility review, portal registration and application filing support.",
  },
};

/* ------------------------------------------------------------------ */
/* Paths that must never be indexed (private / transactional)          */
/* ------------------------------------------------------------------ */
export const NOINDEX_PREFIXES = [
  "/login",
  "/sign_up",
  "/verification",
  "/verify-otp",
  "/verify-mobile",
  "/dashboard",
  "/admin",
  "/payment",
  "/order",
  "/orderdetails",
  "/services/userform",
];

/** Redirects handled in AppRoutes (duplicate URLs → one canonical URL) */
export const DUPLICATE_PATHS = {
  "/terms-and-conditions": "/terms",
};

/* ------------------------------------------------------------------ */
/* Sitemap helpers (used by scripts/generate-static-seo.mjs)           */
/* ------------------------------------------------------------------ */
export const SITEMAP_PRIORITY = {
  "/": ["weekly", "1.0"],
  "/services/individual": ["weekly", "0.9"],
  "/services/business": ["weekly", "0.9"],
  "/calculators": ["weekly", "0.8"],
  "/blog": ["weekly", "0.7"],
};
