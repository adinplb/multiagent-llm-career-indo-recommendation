import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import ConsentPage from "./pages/ConsentPage.jsx";
import AnalyzePage from "./pages/AnalyzePage.jsx";
import ResultPage from "./pages/ResultPage.jsx";
import OverviewPage from "./pages/OverviewPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/consent" element={<ConsentPage />} />
      <Route path="/analyze" element={<AnalyzePage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/overview" element={<OverviewPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}
