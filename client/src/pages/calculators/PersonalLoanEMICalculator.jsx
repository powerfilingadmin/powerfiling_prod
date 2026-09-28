import { Helmet } from "react-helmet-async";
import EMICalculator from "./EMICalculator";

const PersonalLoanEMICalculator = () => {
  return (
    <>
      <Helmet>
        <title>Personal Loan EMI Calculator | Monthly EMI & Interest | LedgerLine</title>
        <meta name="description" content="Calculate your personal loan EMI, total interest and repayment schedule instantly. Covers all major banks and NBFCs in India. No collateral loan EMI estimator." />
        <meta name="keywords" content="personal loan EMI calculator, personal loan calculator India, personal loan interest calculator, loan EMI calculator, unsecured loan EMI, personal finance calculator, ITR filing, income tax filing online" />
        <meta property="og:title" content="Personal Loan EMI Calculator | LedgerLine" />
        <meta property="og:description" content="Calculate monthly EMI and total interest for your personal loan instantly." />
        <meta property="og:url" content="https://powerfiling.com/calculators/personal-loan-emi" />
        <link rel="canonical" href="https://powerfiling.com/calculators/personal-loan-emi" />
      </Helmet>
      <EMICalculator
        title="Personal Loan EMI Calculator"
        description="Calculate your monthly EMI and total interest payable for your personal loan"
        defaultPrincipal={500000}
        defaultRate={12}
        maxPrincipal={2500000}
        minRate="10"
        maxRate="24"
        maxTenure={5}
      />
    </>
  );
};

export default PersonalLoanEMICalculator;
