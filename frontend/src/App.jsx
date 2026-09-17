import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { InterviewProvider } from "./context/InterviewContext";
import Home from "./pages/Home";
import Setup from "./pages/Setup";
import MatchResult from "./pages/MatchResult";
import InterviewLobby from "./pages/InterviewLobby";
import Interview from "./pages/Interview";
import Feedback from "./pages/Feedback";
import FinalReport from "./pages/FinalReport";
import Progress from "./pages/Progress";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <InterviewProvider>
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
          <Navbar />
          <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Routes>
              <Route path="/"               element={<Home />} />
              <Route path="/setup"          element={<Setup />} />
              <Route path="/match-result"   element={<MatchResult />} />
              <Route path="/interview-lobby" element={<InterviewLobby />} />
              <Route path="/interview"      element={<Interview />} />
              <Route path="/feedback"       element={<Feedback />} />
              <Route path="/final-report"   element={<FinalReport />} />
              <Route path="/progress"       element={<Progress />} />
              <Route path="*"              element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </InterviewProvider>
    </BrowserRouter>
  );
}
