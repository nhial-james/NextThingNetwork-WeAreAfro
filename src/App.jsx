import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Step1SelectPlan from './pages/Step1_SelectPlan';
import Step2EnterPhone from './pages/Step2_EnterPhone';
import Step3ConfirmPayment from './pages/Step3_ConfirmPayment';
import Step4VoucherReceived from './pages/Step4_VoucherReceived';
import Step5Connect from './pages/Step5_Connect';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Purchase flow */}
        <Route path="/buy" element={<Step1SelectPlan />} />
        <Route path="/buy/phone" element={<Step2EnterPhone />} />
        <Route path="/buy/payment" element={<Step3ConfirmPayment />} />
        <Route path="/buy/voucher" element={<Step4VoucherReceived />} />

        {/* Connect with voucher */}
        <Route path="/connect" element={<Step5Connect />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
