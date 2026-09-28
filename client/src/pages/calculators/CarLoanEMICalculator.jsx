import { Helmet } from "react-helmet-async";
import EMICalculator from "./EMICalculator";

const CarLoanEMICalculator = () => {
  return (
    <>
      <Helmet>
        <title>Car Loan EMI Calculator | Monthly EMI & Interest | LedgerLine</title>
        <meta name="description" content="Calculate your car loan EMI, total interest payable and repayment schedule instantly. Supports new and used car loan rates from all major banks in India." />
        <meta name="keywords" content="car loan EMI calculator, auto loan EMI calculator, vehicle loan calculator, car loan interest calculator India, car loan monthly payment, car finance calculator, ITR filing, income tax filing online" />
        <meta property="og:title" content="Car Loan EMI Calculator | LedgerLine" />
        <meta property="og:description" content="Calculate monthly EMI and total interest for your car loan instantly." />
        <meta property="og:url" content="https://powerfiling.com/calculators/car-loan-emi" />
        <link rel="canonical" href="https://powerfiling.com/calculators/car-loan-emi" />
      </Helmet>
      <EMICalculator
        title="Car Loan EMI Calculator"
        description="Calculate your monthly EMI and total interest payable for your car loan"
        defaultPrincipal={1000000}
        defaultRate={9.5}
        maxPrincipal={5000000}
        minRate="7"
        maxRate="15"
        maxTenure={7}
      />
    </>
  );
};

export default CarLoanEMICalculator;
