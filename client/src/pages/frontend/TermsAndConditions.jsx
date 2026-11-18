import Navbar from './Navbar'
import Footer from './Footer'

const TermsAndConditions = () => {
  const sections = [
    {
      title: "Privacy & Our Relationship",
      content: `We place the highest importance on respecting and protecting your privacy. Our relationship with you is our most important asset. We want you to feel comfortable and confident when using our platform and the services.`,
    },
    {
      title: "Introduction",
      content: `The objectives of these Terms and Conditions of Use ("Terms") are to inform you of the terms which apply to your access to the Platform and Services, what we expect from you, and what you can expect from us as you use and interact with our Platform and the Services provided by us, our strategic partners and third party service providers.`,
    },
    {
      title: "About Powerfiling",
      content: `The Platform is provided by POWERFILING PRIVATE LIMITED (hereinafter, "Company" "Powerfiling" or "Our" or "We" or "Us"), a company incorporated under the Companies Act, 2013 having its registered office and corporate office at FF25, JAIPUR TEXTILE MARKET, Jagatpura, Jaipur, Rajasthan, India, 302017. These Terms are published in accordance with the provisions of Rule 3(1)(a) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.`,
    },
    {
      title: "Acceptance of Terms",
      content: `By registering on or using the Platform or availing the Services, you agree to be bound by these Terms. If you do not agree to be bound by these Terms, you must not use the Platform. Subject to applicable laws, these Terms (and any changes thereto) will become applicable to you retrospectively on and from the date of your first use of the Platform.`,
    },
  ];

  const detailedSections = [
    {
      title: "1. Changes to These Terms",
      points: [
        "These Terms may change from time to time. We reserve the right to modify or amend these Terms.",
        "While we will make reasonable efforts to keep you posted on any updates, we encourage you to periodically review them whenever accessing or using the Platform.",
        "The 'Last Updated' date indicates when the most recent modifications were made to the Terms.",
        "In the event we modify these Terms, by continuing to access and use the Platform, you will have confirmed your acceptance to any such modifications.",
      ],
    },
    {
      title: "2. Sign-Up and Consent Requirements",
      points: [
        "To avail the Services, you may have to provide necessary details including but not limited to: Name, Mother's Name, Father's Name, Date of Birth, Gender, Permanent Account Number (PAN), Signature, Marital Status, Nominee Details, Cancelled Cheque, Photograph and Video Recording, Email ID, Phone Number, Educational or Professional Qualification, Business Name, Business Address, Nature of Business, Goods and Service Tax Identification Number (GSTN), Tax Deduction and Collection Account Number (TAN), Bank Account Details, Unified Payment Interface (UPI) ID, and/or Other Payment Related Details.",
        "You warrant to provide true, accurate, current and complete information about yourself and you agree to not misrepresent your identity or your account information.",
        "The act of providing your Aadhaar ID is voluntary in nature unless mandated under applicable law. You may choose to provide an alternative KYC Proof.",
        "If you provide any information that is false, inaccurate or outdated, we will be entitled to suspend or terminate your account.",
        "You are responsible for maintaining the confidentiality of the account and are fully responsible for all activities that occur under your account.",
      ],
    },
    {
      title: "3. Use of and Access to the Platform",
      points: [
        "3.1 You agree to use the Platform only for lawful purposes and you are responsible for all activities that take place through your use of the Platform.",
        "3.2 The Payment facility provided is merely an electronic payment option using existing authorized banking infrastructure and payment gateway networks. We are neither acting as Trustees nor acting in a fiduciary capacity with respect to the transaction.",
        "3.3 We will use commercially reasonable efforts to provide you with the Platform. We do not make any commitment that the Platform will be available at all times or during any downtime caused by various factors beyond our control.",
        "3.4 From time to time, we may provide upgrades, patches, enhancements, or fixes for the Platform. We have no obligation to provide any such updates.",
      ],
    },
    {
      title: "3.5 Prohibited Activities - You Agree Not To:",
      points: [
        "Host, display, upload, modify, publish, transmit any information that belongs to another person without right or that is defamatory, obscene, pornographic, or invasive of privacy",
        "Violate the Terms or any law for the time being in force",
        "Conduct or forward surveys, contests, pyramid schemes or chain letters",
        "Impersonate any person or entity or falsely claim affiliation",
        "Infringe our or any third party's intellectual property rights",
        "Use the Services if you are under 18 years of age",
        "Remove, circumvent, disable, damage or otherwise interfere with security-related features",
        "Reverse engineer, decompile, disassemble or otherwise attempt to discover the source code",
        "Use the Services in any manner that could damage, disable, overburden, or impair the Platform",
        "Modify, adapt, translate or create derivative works based upon the Services and Platform",
        "Intentionally interfere with or damage operation of the Services or Platform",
        "Use any robot, spider, or automated device to monitor or copy the Platform",
        "Take any action that imposes an unreasonably large load on our infrastructure",
        "Use the Platform to collect or obtain personal information about other users",
      ],
    },
    {
      title: "4. Information and Disclaimers",
      points: [
        "While we use commercially reasonable efforts to provide information on compliance deadlines, investment status, and regulatory news, we are not responsible for any errors or omissions.",
        "The information provided through the Platform is for general guidance only and does not constitute professional advice.",
        "It should not be used as a substitute for consultation with professional accounting, tax, legal or other competent advisers.",
        "All information made available through the Platform is provided 'AS IS', with no guarantee of completeness, accuracy, timeliness or of the results obtained from the use of this information.",
        "We do not make any representations as to the accuracy of information contained in other websites.",
      ],
    },
    {
      title: "5. Intellectual Property Rights and Ownership",
      points: [
        "We own the rights in the design, compilation, and look and feel of our Platform including all copyrighted works, trademarks, designs, inventions, and other intellectual property.",
        "Subject to compliance with these Terms, we grant you a non-exclusive, non-transferable, non-sublicensable, royalty-free, revocable, and limited access to use the Platform.",
        "You agree not to copy, distribute, modify or make derivative works of any of our content.",
        "When you enter or upload your Data onto the Platform, you expressly agree to grant us, our Strategic Partners, our Third Party Service Providers and our Group Companies all rights, licences and consents to host, use, copy, transmit, process, store, share, analyse, display and back up all Data.",
        "Data Loss is an unavoidable risk when using any technology. You are responsible for maintaining copies of your data.",
      ],
    },
    {
      title: "6. Know Your Customer (KYC) Requirements",
      points: [
        "You agree to provide certain information and documents necessary to ascertain your eligibility to use the Platform or avail the Services including KYC Documents.",
        "Your personal information and KYC Documents may be processed by, transferred to, or disclosed by Third Parties including AMCs, RTAs, KRA, Payment Gateways, Statutory Bodies or Agencies.",
        "You agree and warrant to provide valid, true, complete, and up-to-date KYC Documents.",
        "Any incorrect or misleading information provided shall constitute a material breach of these Terms.",
      ],
    },
    {
      title: "7. Communication Policy",
      points: [
        "You agree to receive communications from the Company regarding information relating to use of the Platform, promotional offers, and other matters related to the Services.",
        "We may send alerts to your mobile phone numbers via E-mail, SMS, WhatsApp Messages or Push Notifications.",
        "If your mobile number is registered in the Do Not Disturb (DND) list, you may not receive SMS from us. You will be responsible for deregistering from the DND list.",
        "We shall not be under any obligation to confirm the authenticity of the person receiving the alert.",
        "The SMS/Email Alert/Push Notification Service may be susceptible to error, omission and/or inaccuracy.",
      ],
    },
    {
      title: "8. Third Party Services on the Platform",
      points: [
        "Our Platform includes products and services made available by Third Party Service Providers which may have additional terms that apply to you.",
        "We make no representations and hereby expressly exclude all warranties and liabilities arising out of or pertaining to such Third-Party Services.",
        "All intellectual property rights in and to Third Party Services are the property of the respective Third Parties.",
        "The Providers are solely responsible for any representations contained in descriptions of their services.",
      ],
    },
    {
      title: "9. Termination of Access to the Platform",
      points: [
        "We may terminate or suspend your access to the Platform or access to all or any of the data at our discretion.",
        "Termination may occur if you fail to comply with these Terms or the Privacy Policy.",
        "We may terminate in case of inactivity for long periods or in case of any fraud, insolvency or bankruptcy.",
        "You agree that our right to terminate does not depend on whether you breach these Terms or not.",
      ],
    },
    {
      title: "10. Warranties and Disclaimers",
      points: [
        "We are a Technology Platform Service Provider and are not responsible for any claim or damages suffered by you, third parties, or other users.",
        "We are not responsible for any payments made by you or by any third parties using the payment link generated through the Platform.",
        "We exclude any and all liability arising out of or related to the use of the Platform.",
      ],
    },
    {
      title: "10.2 Limitations of Warranties",
      points: [
        "Your use of the Platform and the Services is at your sole risk. The Platform and Services are provided on an 'AS IS' and 'AS AVAILABLE' basis.",
        "Except as otherwise expressly provided in these Terms, we expressly disclaim all warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose and non-infringement.",
        "We make no warranty that the Platform or Services will meet your requirements, be uninterrupted, timely, secure, or error-free.",
        "We make no warranty that information obtained via the Platform will be accurate or reliable.",
        "We make no warranty that the quality of products, services, information or material obtained through the Platform will meet your expectations or needs.",
        "We make no warranty that any errors in the Platform will be corrected.",
      ],
    },
    {
      title: "10.3 Third Party Service Dependencies",
      points: [
        "Certain Services provided on the Platform are dependent on the functioning of technology infrastructure of various Third Parties including Government Agencies and Statutory Authorities.",
        "We shall not be liable or responsible for any discrepancy in the Services owing to delay or failure of any activity by such Third Parties.",
        "This includes delays or failures by Government Agencies, Statutory Authorities such as GST Network, National Informatics Centre, network or connectivity failures, device or application failures, or any other technical or non-technical errors.",
      ],
    },
    {
      title: "11. Exclusion of Damages",
      points: [
        "We shall not under any circumstances be liable for any damages of any kind arising out of, in connection with or relating to the use of or inability to use the Platform.",
        "This includes liability as a publisher of information, for incorrect or inaccurate information, unauthorized access or disclosure of your transmissions or data, statements or conduct of any third party on the Platform.",
        "We are not liable for any disputes between users of the Platform or between a user and a third party.",
        "This is a comprehensive limitation of liability that applies to all damages of any kind, including direct, indirect, special, incidental or consequential damages, whether based on breach of contract, breach of warranty, tort (including negligence), product liability or otherwise.",
        "These limitations apply even if we have been advised of the possibility of such damages.",
      ],
    },
    {
      title: "12. Indemnification",
      points: [
        "You agree to defend, indemnify and hold harmless the Company and its Affiliates, Officers, Directors and Employees from any damages, actions, proceedings, claims, demands, costs, losses, liabilities and expenses in connection with or arising out of your breach or non-compliance with these Terms.",
        "You indemnify us for misrepresentation, negligence, fraud, wilful concealment, misconduct, misuse of the Services for illegal or unauthorized purposes.",
        "You indemnify us for any injuries to persons or damage to property, business, character, reputation resulting from your acts or omissions.",
        "You indemnify us for any claims by a third party for acts committed or omitted by you and any violation of applicable law.",
        "Any violation by you will constitute an unlawful and unfair business practice causing irreparable harm, and you consent to us obtaining injunctive or equitable relief as necessary.",
        "If we take legal action against you for violation of these Terms, you agree to pay all reasonable attorneys' fees and costs of such action.",
      ],
    },
    {
      title: "13. Miscellaneous",
      points: [
        "13.1 All notices under these Terms shall be in writing and delivered personally, by certified mail, by recognized courier, or by fax with confirmation.",
        "13.2 You acknowledge that you have read and understand these Terms and agree to be bound by them. This is the complete and exclusive statement of the agreement between the parties.",
        "13.3 These Terms shall be governed by the Laws of India. Any disputes shall be resolved by arbitration in New Delhi in accordance with the Arbitration and Conciliation Act, 1996. The arbitration tribunal shall consist of 1 arbitrator appointed by us. The language of arbitration shall be English. Courts in New Delhi shall have exclusive jurisdiction.",
        "13.4 Investment in Securities Market (including Mutual Funds) are subject to market risks. There is no guarantee for any returns. Past performance does not indicate future performance.",
        "13.5 Powerfiling Disclaimer: All information is proprietary, may not be copied or redistributed without prior written consent, is not warranted to be complete or accurate, and shall not be construed as an offer to buy or sell securities.",
        "13.6 If any provision of these Terms is invalid, it shall be omitted and all other provisions remain in full force and effect.",
        "13.7 A waiver of any term or condition shall not be deemed a waiver for the future or of any subsequent breach.",
        "13.8 The parties are not employees, agents, partners or joint venturers. You shall not have the right to enter into any agreement on behalf of the Company.",
        "13.9 The entire understanding between parties is contained in these Terms.",
        "13.10 The Company may at its sole discretion assign its rights and obligations to any of its affiliates or entities.",
        "13.11 Provisions intended to survive termination shall continue to survive.",
        "13.12 All costs and expenses incurred shall be paid by the party incurring such costs.",
        "13.13 Neither party shall be liable for failure or delay in performance due to causes beyond reasonable control including acts of God, fire, explosion, war, governmental actions, national emergency, strikes or labor troubles.",
        "13.14 You shall maintain records independently of the Platform and the Company reserves the right to seek copies and retain your information for compliance with applicable law.",
        "13.15 The Company reserves the right to charge fees for the Services and non-payment may result in denial of Services.",
      ],
    },
    {
      title: "13.16 Contact Us / Grievance Officer",
      points: [
        "Grievance Officer Name: Shubham Kumar Sharma",
        "Address: 96 Vipra Vihar, Sawai Gaitor, Near Shani Mandir, Malviya Nagar, Jaipur, Rajasthan PIN: 302017",
        "Email: shubhambeing12@gmail.com",
      ],
    },
    {
      title: "Refund at the Choice of the Client Without Any Reason",
      points: [
        "We will refund 100% of the amount received if you notify us within 4 hours of the purchase via email to Contact@Powerfiling.com.",
        "If you place a refund request after 4 hours from the payment, no refund will take place.",
        "No refund shall be made once the order is assigned to the network of professionals.",
        "If you do not respond to email/call/WhatsApp for more than thirty (30) days, the order shall be deemed cancelled with no refund.",
        "Refund is subject to approval from the consultant. Any dispute shall be considered an individual matter between client and consultant.",
      ],
    },
    {
      title: "Understanding Before Purchase",
      points: [
        "You understand and undertake that before purchase, you have completely understood the applicable government fees and compliance requirements.",
        "You are aware of documents required and any other infrastructure or facilities that may be required.",
        "You agree to furnish all necessary documents and required information as requested by professionals.",
        "If you are unable to provide information for a maximum period of 45 days, the services will be deemed completed, and you will be required to pay the balance amount.",
      ],
    },
    {
      title: "Refund in Case of Professional Non-Delivery",
      points: [
        "If professionals cannot deliver services due to change in law or revised regulatory norms, no refund shall be made.",
        "If you have provided all documents and necessary qualifications but professionals cannot work on your assignment, we may assign to other professionals in our network.",
        "If none of the professionals can deliver within 30 days, you may request a refund by writing to contact@Powerfiling.com.",
      ],
    },
    {
      title: "Service Delivery Timeline and Deadlines",
      points: [
        "Powerfiling will clarify the estimated time required to fulfil services to the customer.",
        "The customer is expected to cooperate with Powerfiling to enable timely service delivery.",
        "In case of delay in order fulfilment, Powerfiling shall not bear the cost of any interest or penalty imposed by other parties.",
        "Delay from regulatory/Government departments is excluded from refund requests.",
        "Any delay from regulatory authorities shall not be considered a delay from the consultant's end.",
      ],
    },
    {
      title: "Government Authority Rejections and Re-application",
      points: [
        "Consultant shall provide the right legal advice as and when required.",
        "No refund shall be entertained for rejection by government authorities due to reasons beyond professional control.",
        "If reapplying after rejection, you will pay 70% of professional fees and 100% of government fees and other expenses.",
        "Professionals will create a fresh order after client approval.",
      ],
    },
    {
      title: "Government Penalties and Fees",
      points: [
        "You understand that government authorities may levy penalties or fees on you for any reason.",
        "You shall bear all such penalties and neither the consultant nor Powerfiling shall be held responsible.",
      ],
    },
    {
      title: "Platform Usage Requirements",
      points: [
        "By purchasing services, you undertake that you are not an agent, middleman, or unregistered professional.",
        "Powerfiling.com is a legal platform designed for businesses or individuals seeking legal services.",
        "Service orders from middlemen or unregistered professionals will be marked as cancelled with no refund.",
        "Refunds shall not be entertained when documents have been shared via email or WhatsApp.",
      ],
    },
    {
      title: "Refund Method",
      points: [
        "Refunds will be processed to the original mode from which we received the fees. No third-party refunds.",
        "Eligible refunds shall be processed within a minimum of 30 days from approval by the network of professionals.",
      ],
    },
    {
      title: "14. General Terms For Making Online Payments",
      points: [
        "14.1 You shall disclose the exact business category and/or sub-category for which you will be using the payment gateway. If you use the services for any other purpose, you shall notify the Payment Gateway Service Provider and Company in writing of such change, subject to their approval.",
        "14.2 You agree to provide KYC documents and other documents as requested, including Aadhaar Card, Shops and Establishments Certificate, Utility Bills, Tax Registration, MOA, Certificate of Incorporation, PAN, Partnership Deed, Powers of Attorney, etc., as required by Regulatory Authorities including RBI, NPCI, and others.",
        "14.3 You shall indemnify the Company from losses and damages if you engage in fraudulent, illegal or doubtful payment transactions or online selling of banned items under applicable laws, including: adult goods, body parts, child pornography, copyright devices, copyrighted media, unauthorized software, counterfeit goods, altered products, drugs, endangered species, fake government IDs, hacking materials, illegal goods, offensive goods, weapons, and any other non-compliant products or services.",
        "14.4 The Company and Payment Gateway Service Provider reserve the right to limit or restrict transaction size, amount, and monthly volume at any time, and may block accounts or transactions as a security measure.",
        "14.5 You are solely responsible and liable to pay all relevant taxes pursuant to usage of the payment gateway services.",
        "14.6 The Payment Gateway Service Provider and Regulatory Authorities reserve the right to reject payments for unlawful, doubtful, erroneous transactions, chargebacks, fraud, suspicious activities, authentication issues, or other transaction-related issues.",
        "14.7 You agree to comply with all applicable rules, guidelines and instructions from the Payment Gateway Service Provider and Regulatory Authorities. If any fines or penalties are levied on the Company, you shall forthwith reimburse the Company for such amounts.",
        "14.8 You agree to provide documentary evidence as required in relation to any disputes relating to rejection or termination of transactions.",
        "14.9 You expressly consent to the Company maintaining records of your transactions and retaining such records for inspection by Payment Gateway Service Providers and Regulatory Authorities.",
        "14.10 You agree to indemnify the Company in respect of any claims, disputes, penalties, costs and expenses arising from refunds or chargebacks for payment transactions initiated by you on the Platform.",
        "14.11 You agree to comply with KYC rules and regulations and provisions of Anti-Money Laundering Laws and Anti-Bribery and Anti-Corruption laws adopted by India.",
        "14.12 The Company and Payment Gateway Service Provider reserve the right to suspend payment services until you discontinue selling banned/illegal products or conform to all applicable laws and regulations.",
      ],
    },
    {
      title: "15. Additional Terms For Financial Products",
      points: [
        "15.1 The terms in this section apply in addition to clauses 1 to 14 if you opt for purchase and redemption of financial products.",
        "15.2 We are not a resident, incorporated body of USA, Canada, or EU. Users from countries other than India understand they may be violating local laws by using our services and shall be solely responsible for compliance. Investments from residents of USA and Canada may not be permitted for certain mutual funds.",
        "15.2.1 Access to Powerfiling services is granted only to registered users after enrollment.",
        "15.2.2 You shall provide required details and documents including: valid email address and password, PAN card details and copy, mobile number, Aadhaar card details, KYC details, bank account details, address proof, photograph, and signature.",
        "15.2.3 Information shall be uploaded in soft copy form on the Platform at enrollment. Upon receipt and completion of attestation requirements, documents shall be provided to regulatory authorities/mutual fund companies.",
        "15.2.4 During registration, you will sign on the mobile screen. The signature is captured and utilized only for completing registration formalities - KYC form, account opening form and intermediary account opening. The signature does not allow the Company to undertake any transactions.",
        "15.2.5 Any discrepancy in information provided will lead to rejection of documents and account will not be opened. Documents and personally identifiable information shall be stored and transferred in accordance with the Privacy Policy.",
        "15.2.6 Any information provided, including contact information, address, tax information, or other KYC information, may be shared with regulatory authorities, government authorities, regulatory bodies, auditors, legal and tax consultants in compliance with applicable provisions.",
        "15.2.7 Your account will be activated after Company completes verification of information and documents in accordance with KYC guidelines.",
        "15.2.8 To the extent permitted, all information submitted (except personal identifiable information and KYC documentation) shall be deemed property of the Company, which is free to use any ideas, concepts, know-how or techniques provided in any manner.",
        "15.3.1 Company shall make every effort to adhere to timelines but shall not be responsible for any delay, including loss of interest, opportunity loss, or losses from movement in NAV.",
        "15.3.2 Purchase requests shall be processed only after sufficient funds are received. If mutual funds are unable to process the full quantity, they may process a lesser quantity and Company shall not be responsible.",
        "15.3.3 Powerfiling services are presently available for select mutual funds with AMCs with which Company has entered arrangements.",
        "15.3.4 Not all products are available in all geographic areas. Company and AMCs reserve the right to determine availability and eligibility.",
        "15.3.5 Company shall not be liable if transactions do not fructify or are not completed or if performance is prevented by force majeure events.",
        "15.3.6 Exit loads, stamp duties and taxes may apply to certain mutual fund schemes as mentioned in scheme related documents. Such costs will be borne by the user.",
        "15.3.7 Investments from foreign residents may not be permitted in certain mutual funds. Company shall not be liable for rejection by mutual funds.",
        "15.3.8 Units shall be allotted, redeemed or switched at the applicable NAV. Company shall not be liable for losses from incorrect NAV.",
        "15.3.9 Transactions on gazetted holidays or after cut-off time shall be processed on the next business day at applicable NAV.",
        "15.3.10 Transactions once placed cannot be cancelled but money can be withdrawn by redeeming units within prescribed timeframe.",
        "15.3.11 Directions for transactions including withdrawal, STP and switch transactions shall be considered as bona-fide orders.",
        "15.3.12 You acknowledge having read and understood mutual fund scheme documents and declare that invested amounts are from legitimate sources and not for contravention of any law.",
        "15.3.13 In case of regular schemes, Company shall disclose all commissions payable to it for competing schemes.",
        "15.3.14 Company shall not be liable for direct or indirect loss from failures or delays by AMC/Mutual Fund in delivering units or making payments.",
        "15.3.15 All orders placed through your account shall be deemed given by you and Company will not be responsible for unauthorized usage.",
        "15.3.16 Company may implement surveillance mechanisms on financial products and reserve the right to reject any order for any reason.",
        "15.4 Using KYC Data: You allow the Company to utilize your KYC information including identity, address, and signature for sending to the AMC for availing services and complying with legal and regulatory requirements. You shall inform the Company/AMC of any changes to your KYC information.",
        "15.5 User Undertaking: You acknowledge and undertake that you have read and understood the terms of the relevant offer documents, scheme information documents, and key information memorandum.",
        "15.5.1 You declare that your investment amount is derived through legitimate sources and not designed for contravention of any act, rules, regulations, or applicable laws.",
        "15.5.2 You will provide a copy of your Permanent Account Number (PAN) at the time of investment and produce the original for verification. You authorize the Company to share your PAN with the AMC/Authorized Registrar.",
        "15.5.3 You confirm you have not received any rebates or gifts induced as part of this investment.",
        "15.5.4 You confirm that the funds invested legally belong to you and authorize the mutual fund to redeem funds if KYC is not completed.",
        "15.5.5 You confirm you do not have existing investments that together with the current application will exceed INR 50,000 in a year.",
        "15.5.6 For NRIs only: You confirm you are a non-resident of Indian nationality and have remitted funds through approved banking channels.",
        "15.5.7 You confirm all details provided are true and correct.",
        "15.6 No Objection from User: You grant no objection to the Company to forward transaction data to mutual funds, transmit nomination/investment plan changes, obtain and forward your information to AMC, obtain anti-money laundering documents, and contact you regarding account operation.",
        "15.6.1 You provide express consent for the Company to override any DNC/NDNC registration for communications.",
        "15.7 Holding Pattern and User Details: Your investment holding pattern as reflected on the Platform is deemed to be your holding pattern. Any requisite data not part of forms will be extracted from first holder's account details.",
        "15.8 Account Statement: You acknowledge it is the obligation of the AMC, not the Company, to send regular communications required under SEBI regulations.",
        "15.9 Nomination: You are recommended to provide nominee details to the Company and AMC at account creation. If you do not wish to nominate, provide separate confirmation of non-nomination.",
        "15.10.1 Powerfiling services are currently free of transaction charges, but Company reserves the right to charge fees in the future with notification via email.",
        "15.10.2 Any charges/fees by the Company are in addition to those levied by mutual funds. All fees must be paid without counter claim or set off.",
        "15.11 Online Payment - Payment Gateway: Funds transfer will be done using electronic payment gateway with only internet banking offered through RBI-regulated third-party providers.",
        "15.11.1 You utilize the payment gateway at your own risk including risks from password misuse, internet fraud, mistakes and errors, technology risks, transaction limits, and authentication issues.",
        "15.11.2 You shall indemnify the Company from losses caused by breach of payment gateway terms.",
        "15.11.3 You are authorized to make transactions only from registered bank accounts. Banks may reject transactions from unregistered accounts.",
        "15.12 Transaction Verification: Transactions are subject to verification by Powerfiling and final rejection may be made by the AMC.",
        "15.13 Binding Nature: By using the Platform and clicking 'Continue/I Agree', you expressly agree to all terms and conditions.",
        "15.14 Functions of the Company: The Company does not guarantee payments, liquidity, buyback, redemption, interest, dividends, returns, or good delivery of units.",
        "15.14.1 The Company does not subscribe to units on your behalf, collect account statements, redeem/sell units, instruct mutual funds unilaterally, sign documents, collect receipts, or correspond with mutual funds except for transmitting your transactions.",
        "15.15 The Company does not make promises based on graphical representations. Data collected for prospective investment calculations is based on past investment history and shall not be construed as authoritative advice.",
        "15.16 Sums invested are not deposits with the Company and are not bank insured, endorsed, guaranteed, or result in obligations of the Company.",
        "15.17 Notices and Correspondence: Notices will be addressed to your provided address. You must inform the Company of discrepancies within 7 working days, failing which transactions and statements shall be deemed correct.",
        "15.18 Termination of Services: The Company may terminate services at any time for breach of terms, though you remain liable for obligations incurred prior to termination.",
        "15.19 Disputes: In case of disputes regarding transaction accuracy, the Company's transaction logs shall be the only source of data for verification.",
      ],
    },
  ];

  return (
    <>
      <Navbar />

      <main className="bg-slate-50 min-h-screen">

        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-14 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              Legal
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Terms & Conditions</h1>
            <p className="text-slate-300 text-sm">Last Updated: June 3, 2026</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">

          {/* Overview Sections */}
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4">{section.title}</h2>
              <p className="text-slate-700 text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}

          {/* Detailed Sections */}
          {detailedSections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <h2 className="text-lg font-bold text-slate-900 pb-3 mb-5 border-b border-slate-100">
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.points.map((point, i) => (
                  <li key={i} className="flex gap-3 text-slate-700 text-sm leading-relaxed">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Section */}
          {/* <div className="bg-blue-50 rounded-2xl border border-blue-200 p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Contact Us</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              If you have any comments, questions regarding these Terms, or wish to report any violation, you may contact us at <span className="font-semibold">Support@Powerfiling.In</span>
            </p>
          </div> */}

        </div>
      </main>

      <Footer />
    </>
  )
}

export default TermsAndConditions
