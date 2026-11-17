/**
 * SEO DATA – single source of truth for page titles & meta descriptions.
 *
 * IMPORTANT: keep this file free of imports. It is read both by the React app
 * (components/RouteSEO.jsx) and by the Node build script
 * (scripts/generate-static-seo.mjs).
 *
 * After keyword research (Day 2) the SEO team only needs to edit the text in
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
      "File your income tax return online with CA-reviewed ITR filing for salary, capital gains, F&O, crypto, business and NRI income. Simple, secure and accurate.",
  },
  "/services/individual": {
    title: "ITR Filing for Individuals – Salary, Gains & NRI",
    description:
      "Online ITR filing for salaried individuals, investors, traders and NRIs. Compare plans for ITR-1, ITR-2, capital gains, F&O, crypto and foreign income.",
  },
  "/services/business": {
    title: "Business ITR Filing – ITR-3, ITR-4 & Professionals",
    description:
      "Income tax return filing for business owners, freelancers and professionals. ITR-3 / ITR-4, presumptive taxation, F&O and crypto trading income handled by CAs.",
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
    title: "Capital Gains Tax Calculator – STCG & LTCG India",
    description:
      "Calculate short-term and long-term capital gains tax on shares, mutual funds and property in India. Free capital gains tax calculator.",
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
    description:
      "File ITR-1 (Sahaj) online for salary income up to ₹50 lakh. Form 16 verification, 80C/80D deductions and CA-reviewed filing with PowerFiling.",
  },
  "salary-premium": {
    title: "ITR-2 Filing Online – Salary, Property, Gains | PowerFiling",
    description:
      "ITR-2 filing for salaried professionals with house property, capital gains, dividends and interest income. Tax-saving review and expert consultation.",
  },
  "capital-gain": {
    title: "Capital Gains Tax Filing – Stocks, MF & Property",
    description:
      "File ITR with capital gains from shares, mutual funds and property. LTCG and STCG computation, loss set-off and AIS/TIS reconciliation by CAs.",
  },
  "nri-income": {
    title: "NRI Income Tax Return Filing in India | PowerFiling",
    description:
      "Income tax return filing for NRIs and foreign income. Residential status analysis, DTAA benefits, foreign tax credit and Schedule FA reporting.",
  },
  "business-profession": {
    title: "ITR-3 & ITR-4 Filing for Business & Professionals",
    description:
      "Income tax return filing for business owners, freelancers and professionals. Presumptive taxation (44AD / 44ADA), P&L review and GST reconciliation.",
  },
  "fo-trading": {
    title: "F&O Trading Income Tax Filing (ITR-3) | PowerFiling",
    description:
      "File ITR for futures & options trading income. Turnover calculation, speculative income treatment, loss carry-forward and audit applicability check.",
  },
  "house-property": {
    title: "ITR Filing for House Property & Rental Income | PowerFiling",
    description:
      "File your income tax return for rental income and house property. Home loan interest deduction, multiple properties and self-occupied or let-out support.",
  },
  "crypto-trading": {
    title: "Crypto Tax Filing India – VDA Income Tax Return",
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
    description:
      "Apply for GST registration online. Document preparation, business-type assessment, HSN/SAC guidance and GSTIN certificate support.",
  },
  "huf-registration": {
    title: "HUF Registration Online – Deed & PAN | PowerFiling",
    description:
      "Create a Hindu Undivided Family (HUF): HUF deed and declaration drafting, PAN application and bank account opening support.",
  },
  "company-registration": {
    title: "Private Limited Company Registration Online | PowerFiling",
    description:
      "Register a Private Limited Company online. SPICe+ filing, DIN, name approval, MOA/AOA drafting, PAN & TAN and Certificate of Incorporation.",
  },
  "llp-registration": {
    title: "LLP Registration Online India | PowerFiling",
    description:
      "Register an LLP online with MCA. Name approval, LLP agreement drafting, PAN & TAN application and Certificate of Incorporation.",
  },
  "gst-filing": {
    title: "GST Return Filing Online for Businesses | PowerFiling",
    description:
      "Online GST return filing and compliance support for businesses and professionals. Accurate, timely filing handled by experts.",
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
